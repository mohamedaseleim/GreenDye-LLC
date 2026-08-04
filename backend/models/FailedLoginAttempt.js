const mongoose = require('mongoose');

const FailedLoginAttemptSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    lowercase: true
  },
  ipAddress: {
    type: String,
    required: true
  },
  userAgent: {
    type: String
  },
  reason: {
    type: String,
    enum: ['invalid_credentials', 'account_disabled', 'account_suspended', 'user_not_found'],
    default: 'invalid_credentials'
  },
  attemptedAt: {
    type: Date,
    default: Date.now
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 2592000 // Auto-delete after 30 days
  }
});

// Index for efficient queries
FailedLoginAttemptSchema.index({ email: 1, attemptedAt: -1 });
FailedLoginAttemptSchema.index({ ipAddress: 1, attemptedAt: -1 });
FailedLoginAttemptSchema.index({ createdAt: 1 }, { expireAfterSeconds: 2592000 });

module.exports = mongoose.model('FailedLoginAttempt', FailedLoginAttemptSchema);
