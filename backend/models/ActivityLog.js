const mongoose = require('mongoose');

const ActivityLogSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  email: {
    type: String
  },
  action: {
    type: String,
    required: true
  },
  actionType: {
    type: String,
    enum: ['login', 'logout', 'create', 'read', 'update', 'delete', 'access', 'download', 'upload', 'payment', 'enrollment', 'other'],
    default: 'other'
  },
  resourceType: {
    type: String
  },
  resourceId: {
    type: mongoose.Schema.Types.ObjectId
  },
  ipAddress: {
    type: String
  },
  userAgent: {
    type: String
  },
  status: {
    type: String,
    enum: ['success', 'failure', 'pending'],
    default: 'success'
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed
  },
  timestamp: {
    type: Date,
    default: Date.now,
    index: true
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 7776000 // Auto-delete after 90 days
  }
});

// Indexes for efficient queries
ActivityLogSchema.index({ user: 1, timestamp: -1 });
ActivityLogSchema.index({ email: 1, timestamp: -1 });
ActivityLogSchema.index({ ipAddress: 1, timestamp: -1 });
ActivityLogSchema.index({ actionType: 1, timestamp: -1 });
ActivityLogSchema.index({ status: 1, timestamp: -1 });
ActivityLogSchema.index({ createdAt: 1 }, { expireAfterSeconds: 7776000 });

module.exports = mongoose.model('ActivityLog', ActivityLogSchema);
