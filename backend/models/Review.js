const mongoose = require('mongoose');

const ReviewSchema = new mongoose.Schema({
  enrollment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Enrollment',
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true
  },
  rating: {
    type: Number,
    required: true,
    min: 0,
    max: 5
  },
  reviewText: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'flagged'],
    default: 'pending'
  },
  flags: [{
    reason: {
      type: String,
      enum: ['spam', 'inappropriate', 'offensive', 'fake', 'other']
    },
    description: String,
    flaggedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    flaggedAt: {
      type: Date,
      default: Date.now
    }
  }],
  moderationHistory: [{
    action: {
      type: String,
      enum: ['approved', 'rejected', 'flagged', 'unflagged']
    },
    reason: String,
    moderatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    moderatedAt: {
      type: Date,
      default: Date.now
    }
  }],
  adminResponse: {
    text: String,
    respondedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    respondedAt: Date
  },
  isVisible: {
    type: Boolean,
    default: false
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

// Create indexes for efficient querying
ReviewSchema.index({ course: 1 });
ReviewSchema.index({ user: 1 });
ReviewSchema.index({ status: 1 });
// Unique index ensures one review per enrollment
// This constraint is also validated at the application level in enrollmentController
ReviewSchema.index({ enrollment: 1 }, { unique: true });

// Update updatedAt on save
ReviewSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Review', ReviewSchema);
