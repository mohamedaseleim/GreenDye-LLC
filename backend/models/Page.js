const mongoose = require('mongoose');

const PageSchema = new mongoose.Schema({
  slug: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    index: true
  },
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
  metaDescription: {
    type: Map,
    of: String
  },
  metaKeywords: {
    type: [String],
    default: []
  },
  status: {
    type: String,
    enum: ['draft', 'published', 'archived'],
    default: 'draft',
    index: true
  },
  publishedAt: {
    type: Date
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  lastEditedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  template: {
    type: String,
    enum: ['default', 'hero', 'about', 'contact', 'faq', 'terms', 'privacy'],
    default: 'default'
  },
  sections: [{
    type: {
      type: String,
      enum: ['hero', 'features', 'testimonials', 'faq', 'contact', 'text', 'media'],
      required: true
    },
    order: Number,
    content: {
      type: Map,
      of: mongoose.Schema.Types.Mixed
    },
    visible: {
      type: Boolean,
      default: true
    }
  }],
  seo: {
    canonical: String,
    ogImage: String,
    ogTitle: {
      type: Map,
      of: String
    },
    ogDescription: {
      type: Map,
      of: String
    }
  },
  isActive: {
    type: Boolean,
    default: true,
    index: true
  },
  showInHeader: {
    type: Boolean,
    default: false
  },
  showInFooter: {
    type: Boolean,
    default: false
  },
  menuOrder: {
    type: Number,
    default: 0
  },
  version: {
    type: Number,
    default: 1
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Update timestamp and publish date on save
PageSchema.pre('save', function(next) {
  if (this.status === 'published' && !this.publishedAt) {
    this.publishedAt = Date.now();
  }
  next();
});

// Indexes
PageSchema.index({ slug: 1, status: 1 });
PageSchema.index({ author: 1 });

module.exports = mongoose.model('Page', PageSchema);
