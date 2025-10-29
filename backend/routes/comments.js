const express = require('express');
const router = express.Router();
const TicketComment = require('../models/TicketComment');
const Ticket = require('../models/Ticket');
const Notification = require('../models/Notification');
const AuditLog = require('../models/AuditLog');
const { auth } = require('../middleware/auth');

router.use(auth);

// Get comments for a ticket
router.get('/ticket/:ticketId', async (req, res) => {
  try {
    const comments = await TicketComment.find({ ticket: req.params.ticketId })
      .populate('user', 'name email')
      .sort({ createdAt: -1 });

    res.json(comments);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching comments', error: error.message });
  }
});

// Add comment
router.post('/', async (req, res) => {
  try {
    const { ticket, comment, isInternal } = req.body;

    const ticketComment = new TicketComment({
      ticket,
      user: req.user._id,
      comment,
      isInternal: isInternal || false
    });

    await ticketComment.save();

    // Get ticket details
    const ticketDoc = await Ticket.findById(ticket).populate('createdBy assignedTo');

    // Create notification for ticket creator and assignee
    const notifyUsers = new Set();
    if (ticketDoc.createdBy) notifyUsers.add(ticketDoc.createdBy._id.toString());
    if (ticketDoc.assignedTo) notifyUsers.add(ticketDoc.assignedTo._id.toString());
    notifyUsers.delete(req.user._id.toString()); // Don't notify self

    for (const userId of notifyUsers) {
      await Notification.create({
        user: userId,
        type: 'ticket_commented',
        title: 'New Comment on Ticket',
        message: `${req.user.name} commented on ticket "${ticketDoc.title}"`,
        ticket: ticket
      });
      req.app.get('io').to(userId).emit('notification', {
        type: 'ticket_commented',
        message: `${req.user.name} commented on your ticket`
      });
    }

    // Create audit log
    await AuditLog.create({
      user: req.user._id,
      ticket: ticket,
      action: 'ADD_COMMENT',
      description: 'Comment added to ticket'
    });

    // Emit socket event
    req.app.get('io').emit('comment:added', { ticket, comment: ticketComment });

    res.status(201).json(ticketComment);
  } catch (error) {
    res.status(500).json({ message: 'Error adding comment', error: error.message });
  }
});

module.exports = router;

