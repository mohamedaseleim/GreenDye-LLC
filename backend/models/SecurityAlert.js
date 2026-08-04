const mongoose = require('mongoose');

const SecurityAlertSchema = new mongoose.Schema({
  type: {
    type: String,
    required: true,
    enum: [
      'multiple_failed_logins',
      'suspicious_ip',
      'unusual_activity',
      'account_breach_attempt',
      'privilege_escalation_attempt',
      'mass_data_access',
      'blacklisted_ip_attempt'
    ]
  },
  severity: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    default: 'medium'
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  email: {
    type: String
  },
  ipAddress: {
    type: String,
    required: true
  },
  userAgent: {
    type: String
  },
  description: {
    type: String,
    required: true
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed
  },
  status: {
    type: String,
    enum: ['open', 'investigating', 'resolved', 'false_positive'],
    default: 'open'
  },
  resolvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  resolvedAt: {
    type: Date
  },
  notes: {
    type: String
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Indexes
SecurityAlertSchema.index({ type: 1, status: 1, createdAt: -1 });
SecurityAlertSchema.index({ ipAddress: 1, createdAt: -1 });
SecurityAlertSchema.index({ user: 1, createdAt: -1 });
SecurityAlertSchema.index({ severity: 1, status: 1 });

module.exports = mongoose.model('SecurityAlert', SecurityAlertSchema);
