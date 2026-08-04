const mongoose = require('mongoose');

const AnnouncementSchema = new mongoose.Schema({
  title: {
    type: Map,
    of: String,
    required: true
  },
  content: {
    type: Map,
    of: String,
    required: true
  },
  type: {
    type: String,
    enum: ['info', 'warning', 'success', 'error', 'maintenance'],
    default: 'info'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium',
    index: true
  },
  targetAudience: {
    type: [String],
    enum: ['all', 'student', 'trainer', 'admin'],
    default: ['all']
  },
  status: {
    type: String,
    enum: ['draft', 'active', 'scheduled', 'expired'],
    default: 'draft',
    index: true
  },
  startDate: {
    type: Date,
    required: true,
    index: true
  },
  endDate: {
    type: Date,
    index: true
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  dismissible: {
    type: Boolean,
    default: true
  },
  showOnPages: {
    type: [String],
    default: ['all']
  },
  icon: {
    type: String
  },
  link: {
    url: String,
    text: {
      type: Map,
      of: String
    }
  },
  viewCount: {
    type: Number,
    default: 0
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

// Update timestamp on save
AnnouncementSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  
  // Auto-update status based on dates
  const now = Date.now();
  if (this.status === 'scheduled' && this.startDate <= now) {
    this.status = 'active';
  }
  if (this.status === 'active' && this.endDate && this.endDate <= now) {
    this.status = 'expired';
  }
  
  next();
});

// Indexes
AnnouncementSchema.index({ status: 1, startDate: 1, endDate: 1 });
AnnouncementSchema.index({ targetAudience: 1 });

module.exports = mongoose.model('Announcement', AnnouncementSchema);
