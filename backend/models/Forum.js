const mongoose = require('mongoose');

const ReplySchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  content: {
    type: String,
    required: true,
    maxlength: 5000
  },
  likes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  isEdited: {
    type: Boolean,
    default: false
  },
  editedAt: {
    type: Date
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const ForumPostSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  content: {
    type: String,
    required: true,
    maxlength: 10000
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course'
  },
  lesson: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Lesson'
  },
  category: {
    type: String,
    enum: ['general', 'question', 'discussion', 'announcement', 'help', 'feedback'],
    default: 'general'
  },
  tags: [{
    type: String,
    trim: true
  }],
  replies: [ReplySchema],
  views: {
    type: Number,
    default: 0
  },
  likes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  isPinned: {
    type: Boolean,
    default: false
  },
  isClosed: {
    type: Boolean,
    default: false
  },
  isResolved: {
    type: Boolean,
    default: false
  },
  resolvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  resolvedAt: {
    type: Date
  },
  lastActivityAt: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'approved',
    index: true
  },
  moderatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  moderatedAt: {
    type: Date
  },
  moderationReason: {
    type: String,
    maxlength: 500
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

// Indexes for efficient querying
ForumPostSchema.index({ course: 1, createdAt: -1 });
ForumPostSchema.index({ author: 1, createdAt: -1 });
ForumPostSchema.index({ category: 1, createdAt: -1 });
ForumPostSchema.index({ isPinned: -1, lastActivityAt: -1 });
ForumPostSchema.index({ status: 1, createdAt: -1 });

// Update lastActivityAt on new replies
ForumPostSchema.pre('save', function(next) {
  if (this.isModified('replies')) {
    this.lastActivityAt = Date.now();
  }
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('ForumPost', ForumPostSchema);
