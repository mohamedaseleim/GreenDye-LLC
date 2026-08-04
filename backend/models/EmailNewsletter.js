const mongoose = require('mongoose');

const EmailNewsletterSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please provide a newsletter title'],
    trim: true,
    maxlength: [200, 'Newsletter title cannot be more than 200 characters']
  },
  subject: {
    type: String,
    required: [true, 'Please provide an email subject'],
    trim: true,
    maxlength: [300, 'Subject cannot be more than 300 characters']
  },
  content: {
    type: String,
    required: [true, 'Please provide newsletter content']
  },
  status: {
    type: String,
    enum: ['draft', 'published', 'archived'],
    default: 'draft'
  },
  publishedAt: {
    type: Date
  },
  totalSubscribers: {
    type: Number,
    default: 0
  },
  sentCount: {
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
EmailNewsletterSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Indexes for efficient querying
EmailNewsletterSchema.index({ status: 1, createdAt: -1 });
EmailNewsletterSchema.index({ createdBy: 1 });
EmailNewsletterSchema.index({ publishedAt: -1 });

module.exports = mongoose.model('EmailNewsletter', EmailNewsletterSchema);
