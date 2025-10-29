const express = require('express');
const router = express.Router();
const Ticket = require('../models/Ticket');
const TicketComment = require('../models/TicketComment');
const TicketAttachment = require('../models/TicketAttachment');
const Notification = require('../models/Notification');
const AuditLog = require('../models/AuditLog');
const { auth, requireRole } = require('../middleware/auth');

// All routes require authentication
router.use(auth);

// Get all tickets with filters
router.get('/', async (req, res) => {
  try {
  const { status, priority, assignedTo, createdBy, search } = req.query;
    let query = {};

    // Role-based filtering
    if (req.user.role === 'Employee') {
      // Employees see only their own tickets
      query.createdBy = req.user._id;
    } else if (req.user.role === 'IT Admin') {
      // IT Admins see all tickets in the system
      // no additional filter
    }

    if (status) query.status = status;
    if (priority) query.priority = priority;
    if (assignedTo) query.assignedTo = assignedTo;
    if (createdBy) query.createdBy = createdBy;
    if (search) {
      query.$or = [
        { ticketCode: { $regex: search, $options: 'i' } },
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    const tickets = await Ticket.find(query)
      .populate('createdBy', 'name email')
      .populate('assignedTo', 'name email')
      .sort({ createdAt: -1 });

    // Get counts for dashboard
    const counts = {
      total: tickets.length,
      new: tickets.filter(t => t.status === 'New').length,
      assigned: tickets.filter(t => t.status === 'Assigned').length,
      inProgress: tickets.filter(t => t.status === 'In Progress').length,
      done: tickets.filter(t => t.status === 'Done').length,
      completed: tickets.filter(t => t.status === 'Completed').length
    };

    res.json({ tickets, counts });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching tickets', error: error.message });
  }
});

// Get single ticket
router.get('/:id', async (req, res) => {
  try {
    const ticket = await Ticket.findById(req.params.id)
      .populate('createdBy', 'name email')
      .populate('assignedTo', 'name email');

    if (!ticket) {
      return res.status(404).json({ message: 'Ticket not found' });
    }

    // Check access
    if (req.user.role === 'Employee' && ticket.createdBy._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Get comments and attachments
    const comments = await TicketComment.find({ ticket: ticket._id })
      .populate('user', 'name email');
    
    const attachments = await TicketAttachment.find({ ticket: ticket._id })
      .populate('uploadedBy', 'name');

    res.json({ ticket, comments, attachments });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching ticket', error: error.message });
  }
});

// Create ticket
router.post('/', async (req, res) => {
  try {
    const { title, description, priority } = req.body;

    let ticketCounter = 0;

    // Generate unique ticket code
    const generateTicketCode = () => {
      const prefix = 'TKT-';
      ticketCounter++;
      const sequence = ticketCounter.toString().padStart(3, '0');
      return `${prefix}${sequence}`;
    };
    

    let ticketCode = generateTicketCode();
    // Ensure uniqueness
    while (await Ticket.findOne({ ticketCode })) {
      ticketCode = generateTicketCode();
    }

    const ticket = new Ticket({
      ticketCode,
      title,
      description,
      priority: priority || 'Low',
      createdBy: req.user._id,
      status: 'New'
    });

    await ticket.save();

    // Create audit log
    await AuditLog.create({
      user: req.user._id,
      ticket: ticket._id,
      action: 'CREATE_TICKET',
      description: `Ticket "${title}" created`,
      newValue: ticket
    });

    // Emit socket event
    req.app.get('io').emit('ticket:created', ticket);

    res.status(201).json(ticket);
  } catch (error) {
    res.status(500).json({ message: 'Error creating ticket', error: error.message });
  }
});

// Update ticket
router.put('/:id', requireRole('IT Admin'), async (req, res) => {
  try {
    const ticket = await Ticket.findById(req.params.id);
    if (!ticket) {
      return res.status(404).json({ message: 'Ticket not found' });
    }

    const oldValue = { ...ticket.toObject() };

    const { title, description, priority, status, assignedTo } = req.body;

    if (title) ticket.title = title;
    if (description) ticket.description = description;
    if (priority) ticket.priority = priority;
    if (status) ticket.status = status;
    if (assignedTo !== undefined) {
      // Validate target assignee is an IT Admin
      if (assignedTo) {
        const User = require('../models/User');
        const assignee = await User.findById(assignedTo);
        if (!assignee || assignee.role !== 'IT Admin') {
          return res.status(400).json({ message: 'assignedTo must be a valid IT Admin user' });
        }
      }
      ticket.assignedTo = assignedTo || null;
      if (assignedTo && ticket.status === 'New') {
        ticket.status = 'Assigned';
      }
    }

    await ticket.save();

    // Create audit log
    await AuditLog.create({
      user: req.user._id,
      ticket: ticket._id,
      action: 'UPDATE_TICKET',
      description: `Ticket "${ticket.title}" updated`,
      oldValue: oldValue,
      newValue: ticket.toObject()
    });

    // Create notification if assigned
    if (assignedTo && assignedTo.toString() !== oldValue.assignedTo?.toString()) {
      await Notification.create({
        user: assignedTo,
        type: 'ticket_assigned',
        title: 'New Ticket Assigned',
        message: `You have been assigned to ticket "${ticket.title}"`,
        ticket: ticket._id
      });
      req.app.get('io').to(assignedTo.toString()).emit('notification', {
        type: 'ticket_assigned',
        ticket: ticket
      });
      // Audit assignment change
      await AuditLog.create({
        user: req.user._id,
        ticket: ticket._id,
        action: 'ASSIGN_TICKET',
        description: `Ticket assigned to user ${assignedTo}`,
        oldValue: { assignedTo: oldValue.assignedTo },
        newValue: { assignedTo }
      });
    }

    // Emit socket event
    req.app.get('io').emit('ticket:updated', ticket);

    res.json(ticket);
  } catch (error) {
    res.status(500).json({ message: 'Error updating ticket', error: error.message });
  }
});

// Reassign ticket
router.patch('/:id/reassign', requireRole('IT Admin'), async (req, res) => {
  try {
    const { assignedTo } = req.body;
    const ticket = await Ticket.findById(req.params.id);

    if (!ticket) {
      return res.status(404).json({ message: 'Ticket not found' });
    }

    // Validate target assignee is an IT Admin
    if (assignedTo) {
      const User = require('../models/User');
      const assignee = await User.findById(assignedTo);
      if (!assignee || assignee.role !== 'IT Admin') {
        return res.status(400).json({ message: 'assignedTo must be a valid IT Admin user' });
      }
    }

    const oldAssignee = ticket.assignedTo;
    ticket.assignedTo = assignedTo || null;
    ticket.status = 'Assigned';
    await ticket.save();

    // Create notification
    if (assignedTo) {
      await Notification.create({
        user: assignedTo,
        type: 'ticket_assigned',
        title: 'Ticket Reassigned',
        message: `Ticket "${ticket.title}" has been reassigned to you`,
        ticket: ticket._id
      });
      req.app.get('io').to(assignedTo.toString()).emit('notification', {
        type: 'ticket_assigned',
        ticket: ticket
      });
    }

    // Audit reassignment
    await AuditLog.create({
      user: req.user._id,
      ticket: ticket._id,
      action: 'REASSIGN_TICKET',
      description: `Ticket reassigned to user ${assignedTo || 'Unassigned'}`,
      oldValue: { assignedTo: oldAssignee },
      newValue: { assignedTo }
    });

    res.json(ticket);
  } catch (error) {
    res.status(500).json({ message: 'Error reassigning ticket', error: error.message });
  }
});

module.exports = router;

