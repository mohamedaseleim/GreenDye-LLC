const mongoose = require('mongoose');

const MediaSchema = new mongoose.Schema({
  filename: {
    type: String,
    required: true
  },
  originalName: {
    type: String,
    required: true
  },
  mimeType: {
    type: String,
    required: true
  },
  size: {
    type: Number,
    required: true
  },
  path: {
    type: String,
    required: true
  },
  url: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['image', 'video', 'document', 'other'],
    required: true
  },
  category: {
    type: String,
    enum: ['course', 'page', 'certificate', 'avatar', 'general'],
    default: 'general',
    index: true
  },
  title: {
    type: Map,
    of: String
  },
  description: {
    type: Map,
    of: String
  },
  altText: {
    type: Map,
    of: String
  },
  tags: {
    type: [String],
    default: []
  },
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  usageCount: {
    type: Number,
    default: 0
  },
  metadata: {
    width: Number,
    height: Number,
    duration: Number, // for videos
    format: String
  },
  isPublic: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now,
    index: true
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update timestamp on save
MediaSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Indexes
MediaSchema.index({ type: 1, category: 1 });
MediaSchema.index({ uploadedBy: 1 });
MediaSchema.index({ tags: 1 });

module.exports = mongoose.model('Media', MediaSchema);
