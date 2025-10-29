const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { auth, requireRole } = require('../middleware/auth');

router.use(auth);

// Get all users (admin only)
router.get('/', requireRole('IT Admin'), async (req, res) => {
  try {
    const { role } = req.query;
    const filter = { isActive: true };
    if (role) {
      filter.role = role;
    }
    const users = await User.find(filter)
      .select('name email role department createdAt')
      .sort({ name: 1 });

    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching users', error: error.message });
  }
});

// Update user role (senior admin only)
// Remove Senior Admin flows: Only IT Admins can set roles, and only to IT Admin or Employee
router.patch('/:id/role', requireRole('IT Admin'), async (req, res) => {
  try {
    const { role } = req.body;
    
    if (!['Employee', 'IT Admin'].includes(role)) {
      return res.status(400).json({ message: 'Invalid role' });
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Error updating user role', error: error.message });
  }
});

// Get dashboard stats (admin)
router.get('/stats/dashboard', requireRole('IT Admin'), async (req, res) => {
  try {
    const Ticket = require('../models/Ticket');
    
    let query = {};
    if (req.user.role === 'IT Admin') {
      query.assignedTo = req.user._id;
    }

    const totalTickets = await Ticket.countDocuments(query);
    const openTickets = await Ticket.countDocuments({ ...query, status: { $ne: 'Completed' } });
    
    const ticketsByStatus = await Ticket.aggregate([
      { $match: query },
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    const ticketsByPriority = await Ticket.aggregate([
      { $match: query },
      { $group: { _id: '$priority', count: { $sum: 1 } } }
    ]);

    res.json({
      totalTickets,
      openTickets,
      ticketsByStatus,
      ticketsByPriority
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching stats', error: error.message });
  }
});

module.exports = router;

