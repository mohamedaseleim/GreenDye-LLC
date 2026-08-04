const mongoose = require('mongoose');

const EmailCampaignSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide a campaign name'],
    trim: true,
    maxlength: [200, 'Campaign name cannot be more than 200 characters']
  },
  subject: {
    type: String,
    required: [true, 'Please provide an email subject'],
    trim: true,
    maxlength: [300, 'Subject cannot be more than 300 characters']
  },
  content: {
    type: String,
    required: [true, 'Please provide email content']
  },
  recipientType: {
    type: String,
    enum: ['all', 'students', 'trainers', 'admins', 'custom'],
    default: 'all',
    required: true
  },
  customRecipients: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  status: {
    type: String,
    enum: ['draft', 'scheduled', 'sending', 'sent', 'failed'],
    default: 'draft'
  },
  scheduledAt: {
    type: Date
  },
  sentAt: {
    type: Date
  },
  totalRecipients: {
    type: Number,
    default: 0
  },
  successfulSends: {
    type: Number,
    default: 0
  },
  failedSends: {
    type: Number,
    default: 0
  },
  openRate: {
    type: Number,
    default: 0
  },
  clickRate: {
    type: Number,
    default: 0
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
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

// Update updatedAt timestamp
EmailCampaignSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Indexes for efficient querying
EmailCampaignSchema.index({ status: 1, createdAt: -1 });
EmailCampaignSchema.index({ createdBy: 1 });
EmailCampaignSchema.index({ scheduledAt: 1 });

module.exports = mongoose.model('EmailCampaign', EmailCampaignSchema);
