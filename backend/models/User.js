const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide a name'],
    trim: true,
    maxlength: [50, 'Name cannot be more than 50 characters']
  },
  email: {
    type: String,
    required: [true, 'Please provide an email'],
    unique: true,
    lowercase: true,
    match: [
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
      'Please provide a valid email'
    ]
  },
  password: {
    type: String,
    required: [true, 'Please provide a password'],
    minlength: [10, 'Password must be at least 10 characters'],
    select: false
  },
  role: {
    type: String,
    enum: ['individual_client', 'organization_client', 'trainer', 'consultant', 'project_manager', 'technical_reviewer', 'finance', 'admin', 'super_admin'],
    default: 'individual_client'
  },
  roles: [{ type: String, enum: ['individual_client','organization_client','trainer','consultant','project_manager','technical_reviewer','finance','admin','super_admin'] }],
  phone: {
    type: String,
    trim: true
  },
  avatar: {
    type: String,
    default: '/uploads/avatars/default.png'
  },
  dateOfBirth: {
    type: Date
  },
  country: {
    type: String,
    trim: true
  },
  language: {
    type: String,
    enum: ['en', 'ar', 'fr'],
    default: 'en'
  },
  bio: {
    type: String,
    maxlength: [500, 'Bio cannot be more than 500 characters']
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  isActive: {
    type: Boolean,
    default: true
  },
    status: {
    type: String,
    enum: ['active', 'inactive', 'suspended'],
    default: 'active'
  },

  resetPasswordToken: String,
  resetPasswordExpire: Date,
  emailVerificationToken: String,
  emailVerificationExpire: Date,
  lastLogin: { type: Date },
  tokenVersion: { type: Number, default: 0, select: true },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Encrypt password before saving
UserSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    return next();
  }
  
  const rounds = parseInt(process.env.BCRYPT_ROUNDS, 10);
  const salt = await bcrypt.genSalt(isNaN(rounds) ? 10 : rounds);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Update updatedAt timestamp
UserSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Compare password method
UserSchema.methods.comparePassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Generate JWT token
UserSchema.methods.generateAuthToken = function() {
  return jwt.sign(
    { id: this._id, role: this.role, tokenVersion: this.tokenVersion || 0 },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRE }
  );
};

// Generate and hash password reset token
UserSchema.methods.getResetPasswordToken = function() {
  const crypto = require('crypto');
  const resetToken = crypto.randomBytes(20).toString('hex');
  
  this.resetPasswordToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');
  
  this.resetPasswordExpire = Date.now() + 10 * 60 * 1000; // 10 minutes
  
  return resetToken;
};

module.exports = mongoose.model('User', UserSchema);
