const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const bcrypt = require('bcryptjs');

const IT_ADMIN_PASSWORDS = {
  'sunil.marand@injala.com': 'Sunil@123',
  'siddhant.chavadiya@injala.com': 'Siddhant@123',
  'dhruv.vekariya@injala.com': 'Dhruv@123',
  'jignesh.radadiya@injala.com': 'Jignesh@123',
};
const IT_ADMIN_WHITELIST = new Set(Object.keys(IT_ADMIN_PASSWORDS));
const EMPLOYEE_PASSWORDS = {
  'employee1@injala.com': 'Employee@1',
  'employee2@injala.com': 'Employee@2',
};
const EMPLOYEE_WHITELIST = new Set(Object.keys(EMPLOYEE_PASSWORDS));

// Utility: get name from email
const nameFromEmail = (email) => {
  let user = email.split('@')[0] || '';
  return user.charAt(0).toUpperCase() + user.slice(1);
};

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const lowerEmail = String(email).trim().toLowerCase();
    const isAdminEmail = IT_ADMIN_WHITELIST.has(lowerEmail);
    const isEmployeePwEmail = EMPLOYEE_WHITELIST.has(lowerEmail);
    let user = await User.findOne({ email: lowerEmail });

    if (!user) {
      if (isAdminEmail) {
        const hashedPassword = await bcrypt.hash(IT_ADMIN_PASSWORDS[lowerEmail], 10);
        user = new User({
          email: lowerEmail,
          name: nameFromEmail(lowerEmail),
          role: 'IT Admin',
          hashedPassword
        });
        await user.save();
      } else if (isEmployeePwEmail) {
        const hashedPassword = await bcrypt.hash(EMPLOYEE_PASSWORDS[lowerEmail], 10);
        user = new User({
          email: lowerEmail,
          name: nameFromEmail(lowerEmail),
          role: 'Employee',
          hashedPassword
        });
        await user.save();
      } else {
        user = new User({
          email: lowerEmail,
          name: nameFromEmail(lowerEmail),
          role: 'Employee'
        });
        await user.save();
      }
    } else {
      user.lastLogin = new Date();
      if (isAdminEmail && !user.hashedPassword) {
        user.hashedPassword = await bcrypt.hash(IT_ADMIN_PASSWORDS[lowerEmail], 10);
        user.role = 'IT Admin';
      }
      if (isEmployeePwEmail && !user.hashedPassword) {
        user.hashedPassword = await bcrypt.hash(EMPLOYEE_PASSWORDS[lowerEmail], 10);
        user.role = 'Employee';
      }
      await user.save();
    }

    // Authentication flows
    if (isAdminEmail) {
      if (!password) return res.status(400).json({ message: 'Password is required for IT Admin login' });
      const valid = await user.comparePassword(password);
      if (!valid) return res.status(401).json({ message: 'Invalid password' });
    } else if (isEmployeePwEmail) {
      if (!password) return res.status(400).json({ message: 'Password required for this employee' });
      const valid = await user.comparePassword(password);
      if (!valid) return res.status(401).json({ message: 'Invalid password' });
    }
    // All other employees: simulation/no password
    const token = jwt.sign(
      { userId: user._id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );
    res.json({ token, user: { id: user._id, email: user.email, name: user.name, role: user.role, department: user.department } });
  } catch (error) {
    res.status(500).json({ message: 'Login error', error: error.message });
  }
});

router.get('/me', require('../middleware/auth').auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-hashedPassword');
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching user', error: error.message });
  }
});

module.exports = router;

