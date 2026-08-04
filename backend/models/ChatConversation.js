const mongoose = require('mongoose');

const chatConversationSchema = new mongoose.Schema({
  participants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }],
  status: {
    type: String,
    enum: ['open', 'pending', 'resolved', 'closed'],
    default: 'open',
  },
  channel: {
    type: String,
    enum: ['support', 'course', 'billing', 'tech'],
    default: 'support',
  },
  lastMessageAt: {
    type: Date,
    default: Date.now,
  },
  assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  meta: {
    courseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Course' },
    priority: { type: String, enum: ['low', 'medium', 'high'], default: 'medium' },
    tags: [String],
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('ChatConversation', chatConversationSchema);
