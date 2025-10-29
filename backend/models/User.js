const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  name: {
    type: String,
    required: true
  },
  azureId: {
    type: String,
    unique: true,
    sparse: true
  },
  role: {
    type: String,
    enum: ['Employee', 'IT Admin'],
    default: 'Employee'
  },
  department: {
    type: String,
    default: ''
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastLogin: {
    type: Date
  },
  hashedPassword: {
    type: String,
    default: null // null for Employees
  }
}, {
  timestamps: true
});

userSchema.methods.comparePassword = function(password) {
  return bcrypt.compare(password, this.hashedPassword);
};

module.exports = mongoose.model('User', userSchema);

