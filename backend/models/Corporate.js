const mongoose = require('mongoose');

const OrganizationSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide organization name'],
    trim: true
  },
  slug: {
    type: String,
    unique: true,
    lowercase: true
  },
  description: {
    type: String
  },
  logo: {
    type: String,
    default: '/uploads/organizations/default-logo.png'
  },
  industry: {
    type: String,
    enum: ['technology', 'healthcare', 'finance', 'education', 'manufacturing', 'retail', 'other']
  },
  size: {
    type: String,
    enum: ['1-10', '11-50', '51-200', '201-500', '501-1000', '1000+']
  },
  contactInfo: {
    email: String,
    phone: String,
    address: String,
    website: String
  },
  admin: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  members: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    role: {
      type: String,
      enum: ['admin', 'manager', 'member'],
      default: 'member'
    },
    department: String,
    joinedAt: {
      type: Date,
      default: Date.now
    }
  }],
  subscription: {
    plan: {
      type: String,
      enum: ['basic', 'professional', 'enterprise'],
      default: 'basic'
    },
    maxUsers: {
      type: Number,
      default: 10
    },
    startDate: {
      type: Date,
      default: Date.now
    },
    endDate: Date,
    status: {
      type: String,
      enum: ['active', 'suspended', 'cancelled'],
      default: 'active'
    }
  },
  settings: {
    allowSelfEnrollment: {
      type: Boolean,
      default: false
    },
    requireApproval: {
      type: Boolean,
      default: true
    },
    customBranding: {
      type: Boolean,
      default: false
    }
  },
  isActive: {
    type: Boolean,
    default: true
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

const TeamEnrollmentSchema = new mongoose.Schema({
  organization: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Organization',
    required: true
  },
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true
  },
  members: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    enrolledAt: {
      type: Date,
      default: Date.now
    },
    status: {
      type: String,
      enum: ['enrolled', 'in_progress', 'completed', 'dropped'],
      default: 'enrolled'
    },
    progress: {
      type: Number,
      default: 0,
      min: 0,
      max: 100
    }
  }],
  purchaseInfo: {
    quantity: Number,
    pricePerSeat: Number,
    totalAmount: Number,
    // Added currency field for multi‑currency support
    currency: {
      type: String,
      default: 'USD'
    },
    paymentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Payment'
    }
  },
  manager: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  deadline: Date,
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Pre-save middleware to create slug
OrganizationSchema.pre('save', function(next) {
  if (!this.slug && this.name) {
    this.slug = this.name
      .toLowerCase()
      .replace(/[^\w ]+/g, '')
      .replace(/ +/g, '-');
  }
  this.updatedAt = Date.now();
  next();
});

// Indexes
OrganizationSchema.index({ slug: 1 });
OrganizationSchema.index({ admin: 1 });
TeamEnrollmentSchema.index({ organization: 1, course: 1 });
TeamEnrollmentSchema.index({ 'members.user': 1 });

const Organization = mongoose.model('Organization', OrganizationSchema);
const TeamEnrollment = mongoose.model('TeamEnrollment', TeamEnrollmentSchema);

module.exports = { Organization, TeamEnrollment };
