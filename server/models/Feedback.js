// models/Feedback.js
const mongoose = require('mongoose');

const replySchema = new mongoose.Schema({
  message: {
    type: String,
    required: true
  },
  date: {
    type: Date,
    default: Date.now
  },
  sender: {
    type: String,
    enum: ['customer', 'admin'],
    default: 'customer'
  }
});

const feedbackSchema = new mongoose.Schema({
  username: String,
  title: {
    type: String,
    required: true
  },
  detail: {
    type: String,
    required: true
  },
  attachment_url: String,
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  feedbackDate: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['pending', 'resolved'],
    default: 'pending'
  },
  isReadAdmin: { type: Boolean, default: true },
  isReadCustomer: { type: Boolean, default: true },
  replies: [replySchema]
});

module.exports = mongoose.model('Feedback', feedbackSchema);