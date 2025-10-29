const jwt = require('jsonwebtoken');
const User = require('../models/User');

const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({ message: 'No authentication token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId);

    if (!user || !user.isActive) {
      return res.status(401).json({ message: 'User not found or inactive' });
    }

    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Invalid token' });
  }
};

// Middleware to check user roles
const requireRole = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Insufficient permissions' });
    }

    next();
  };
};

// Middleware to log actions for audit trail
const auditLog = (action, description) => {
  return async (req, res, next) => {
    next();

    try {
      const AuditLog = require('../models/AuditLog');
      const ipAddress = req.ip || req.connection.remoteAddress;

      await AuditLog.create({
        ticket: req.params.id || req.body.ticket || null,
        user: req.user._id,
        action: action,
        description: description,
        ipAddress: ipAddress
      });
    } catch (error) {
      console.error('Audit log error:', error);
    }
  };
};

module.exports = { auth, requireRole, auditLog };

