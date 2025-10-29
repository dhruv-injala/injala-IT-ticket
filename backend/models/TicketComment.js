const mongoose = require('mongoose');

const ticketCommentSchema = new mongoose.Schema({
  ticket: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Ticket',
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  comment: {
    type: String,
    required: true
  },
  isInternal: {
    type: Boolean,
    default: false // true = internal note (only IT can see), false = visible to employee
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('TicketComment', ticketCommentSchema);

