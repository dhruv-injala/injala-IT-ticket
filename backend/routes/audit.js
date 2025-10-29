const express = require('express');
const router = express.Router();
const AuditLog = require('../models/AuditLog');
const { auth, requireRole } = require('../middleware/auth');

router.use(auth);

// Get audit logs (with filters)
router.get('/', requireRole('IT Admin'), async (req, res) => {
  try {
    const { ticket, user, action, startDate, endDate, limit = 100 } = req.query;

    let query = {};
    if (ticket) query.ticket = ticket;
    if (user) query.user = user;
    if (action) query.action = action;
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    const logs = await AuditLog.find(query)
      .populate('user', 'name email')
      .populate('ticket', 'title')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit));

    res.json(logs);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching audit logs', error: error.message });
  }
});

// Get audit logs for specific ticket
router.get('/ticket/:ticketId', requireRole('IT Admin'), async (req, res) => {
  try {
    const logs = await AuditLog.find({ ticket: req.params.ticketId })
      .populate('user', 'name email')
      .sort({ createdAt: -1 });

    res.json(logs);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching audit logs', error: error.message });
  }
});

module.exports = router;

