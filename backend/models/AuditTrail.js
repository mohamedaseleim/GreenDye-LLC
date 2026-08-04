const mongoose = require('mongoose');

const AuditTrailSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  action: {
    type: String,
    required: true,
    index: true
  },
  resourceType: {
    type: String,
    index: true
  },
  resourceId: {
    type: mongoose.Schema.Types.ObjectId,
    index: true
  },
  targetType: {
    type: String
  },
  targetId: {
    type: mongoose.Schema.Types.ObjectId
  },
  details: {
    type: String
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed
  },
  ipAddress: {
    type: String
  },
  timestamp: {
    type: Date,
    default: Date.now,
    index: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Compound indexes for efficient querying
AuditTrailSchema.index({ user: 1, timestamp: -1 });
AuditTrailSchema.index({ resourceType: 1, resourceId: 1 });
AuditTrailSchema.index({ action: 1, timestamp: -1 });
AuditTrailSchema.index({ resourceType: 1, resourceId: 1, timestamp: -1 });

module.exports = mongoose.model('AuditTrail', AuditTrailSchema);
