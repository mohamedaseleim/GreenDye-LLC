const mongoose = require('mongoose');

const AnalyticsSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course'
  },
  lesson: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Lesson'
  },
  eventType: {
    type: String,
    enum: [
      'course_view',
      'course_enroll',
      'lesson_start',
      'lesson_complete',
      'quiz_attempt',
      'quiz_complete',
      'video_play',
      'video_pause',
      'video_complete',
      'certificate_earn',
      'course_complete',
      'page_view',
      'search',
      'login',
      'logout'
    ],
    required: true
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed
  },
  duration: {
    type: Number, // in seconds
    default: 0
  },
  score: {
    type: Number
  },
  ipAddress: {
    type: String
  },
  userAgent: {
    type: String
  },
  deviceType: {
    type: String,
    enum: ['desktop', 'mobile', 'tablet', 'unknown'],
    default: 'unknown'
  },
  browser: {
    type: String
  },
  os: {
    type: String
  },
  country: {
    type: String
  },
  region: {
    type: String
  },
  city: {
    type: String
  },
  language: {
    type: String
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
});

// Indexes for efficient querying
AnalyticsSchema.index({ user: 1, timestamp: -1 });
AnalyticsSchema.index({ course: 1, timestamp: -1 });
AnalyticsSchema.index({ eventType: 1, timestamp: -1 });
AnalyticsSchema.index({ timestamp: -1 });

module.exports = mongoose.model('Analytics', AnalyticsSchema);
