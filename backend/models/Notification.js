const mongoose = require('mongoose');

const NotificationSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: [
      'enrollment',
      'course_update',
      'new_lesson',
      'quiz_result',
      'certificate_issued',
      'course_completed',
      'payment_success',
      'payment_failed',
      'forum_reply',
      'forum_mention',
      'announcement',
      'reminder',
      'promotion'
    ],
    required: true
  },
  title: {
    type: Map,
    of: String,
    required: true
  },
  message: {
    type: Map,
    of: String,
    required: true
  },
  data: {
    type: mongoose.Schema.Types.Mixed
  },
  link: {
    type: String
  },
  isRead: {
    type: Boolean,
    default: false
  },
  readAt: {
    type: Date
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  emailSent: {
    type: Boolean,
    default: false
  },
  emailSentAt: {
    type: Date
  },
  pushSent: {
    type: Boolean,
    default: false
  },
  pushSentAt: {
    type: Date
  },
  expiresAt: {
    type: Date,
    default: () => new Date(Date.now() + 90 * 24 * 60 * 60 * 1000) // 90 days
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Indexes for efficient querying
NotificationSchema.index({ user: 1, createdAt: -1 });
NotificationSchema.index({ user: 1, isRead: 1 });
NotificationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 }); // TTL index

module.exports = mongoose.model('Notification', NotificationSchema);
