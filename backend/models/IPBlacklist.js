const mongoose = require('mongoose');

const IPBlacklistSchema = new mongoose.Schema({
  ipAddress: {
    type: String,
    required: true,
    unique: true
  },
  reason: {
    type: String,
    required: true,
    enum: [
      'multiple_failed_logins',
      'suspicious_activity',
      'manual_block',
      'automated_threat_detection',
      'spam',
      'ddos_attack',
      'brute_force'
    ]
  },
  description: {
    type: String
  },
  addedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  expiresAt: {
    type: Date
  },
  metadata: {
    failedAttempts: Number,
    alertIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'SecurityAlert' }],
    affectedUsers: [String]
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Indexes
IPBlacklistSchema.index({ ipAddress: 1, isActive: 1 });
IPBlacklistSchema.index({ isActive: 1, expiresAt: 1 });

// Pre-save middleware to update updatedAt
IPBlacklistSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('IPBlacklist', IPBlacklistSchema);
