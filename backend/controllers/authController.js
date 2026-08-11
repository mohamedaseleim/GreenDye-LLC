const User = require('../models/User');
const crypto = require('crypto');
const logger = require('../utils/logger');
const { logFailedLogin } = require('../services/securityService');
const { logActivity } = require('../services/securityService');
const { getClientIP, getUserAgent } = require('../middleware/security');
const { sendEmail, createEmailTemplate } = require('../services/emailService');
const { escapeHtml } = require('../utils/html');

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res, next) => {
  try {
    const { name, email, password, phone, country, language } = req.body;

    // Validate required fields
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide name, email and password'
      });
    }

    // Validate email format (basic check)
    if (!email.includes('@') || !email.includes('.') || email.indexOf('@') === 0 || email.lastIndexOf('.') === email.length - 1) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid email address'
      });
    }

    // Validate password length
    if (password.length < 10) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 10 characters long'
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User already exists with this email'
      });
    }

    const emailVerificationToken = crypto.randomBytes(32).toString('hex');
    const emailVerificationHash = crypto.createHash('sha256').update(emailVerificationToken).digest('hex');

    // Create a client account. Privileged roles are assigned only by administrators.
    const user = await User.create({
      name,
      email,
      password,
      role: 'individual_client',
      roles: ['individual_client'],
      phone,
      country,
      language: language || 'en',
      emailVerificationToken: emailVerificationHash,
      emailVerificationExpire: Date.now() + 24 * 60 * 60 * 1000
    });

    const verificationUrl = `${process.env.FRONTEND_URL}/verify-email/${emailVerificationToken}`;
    const mail = await sendEmail({
      to: user.email,
      subject: 'Verify your GreenDye for Training and Consultancy account',
      html: createEmailTemplate(`<p>Hello ${escapeHtml(user.name)},</p><p>Please verify your email address to activate trusted account features.</p><p><a class="button" href="${verificationUrl}">Verify email</a></p>`, { title: 'Verify your email' }),
      text: `Verify your email: ${verificationUrl}`
    });
    if (!mail.success) logger.error(`Verification email failed for ${user.email}: ${mail.error}`);

    sendTokenResponse(user, 201, res);
  } catch (error) {
    next(error);
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const ipAddress = getClientIP(req);
    const userAgent = getUserAgent(req);

    // Validate email & password
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password'
      });
    }

    // Check for user
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      // Log failed login attempt - user not found
      await logFailedLogin(email, ipAddress, userAgent, 'user_not_found');
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Check if password matches
    const isMatch = await user.comparePassword(password);

    if (!isMatch) {
      // Log failed login attempt - invalid credentials
      await logFailedLogin(email, ipAddress, userAgent, 'invalid_credentials');
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Check if account is disabled
    if (!user.isActive || user.status !== 'active') {
      // Log failed login attempt - account disabled
      await logFailedLogin(email, ipAddress, userAgent, user.status === 'suspended' ? 'account_suspended' : 'account_disabled');
      return res.status(401).json({
        success: false,
        message: 'Your account has been disabled. Please contact support.'
      });
    }

    // Update last login
    user.lastLogin = Date.now();
    await user.save();

    // Log successful login activity
    await logActivity({
      user: user._id,
      email: user.email,
      action: 'User logged in successfully',
      actionType: 'login',
      ipAddress,
      userAgent,
      status: 'success'
    });

    sendTokenResponse(user, 200, res);
  } catch (error) {
    next(error);
  }
};

// @desc    Logout user
// @route   GET /api/auth/logout
// @access  Private
exports.logout = async (req, res, next) => {
  try {
    req.user.tokenVersion = (req.user.tokenVersion || 0) + 1;
    await req.user.save({ validateBeforeSave: false });
    res.cookie('token', 'none', { expires: new Date(Date.now() + 1000), httpOnly: true, sameSite: 'lax', secure: process.env.NODE_ENV === 'production', path: '/' });
    res.status(200).json({ success: true, data: {}, message: 'Session revoked successfully' });
  } catch (error) { next(error); }
};

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);

    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
exports.updateProfile = async (req, res, next) => {
  try {
    const fieldsToUpdate = {
      name: req.body.name,
      phone: req.body.phone,
      country: req.body.country,
      language: req.body.language,
      bio: req.body.bio,
      dateOfBirth: req.body.dateOfBirth
    };

    const user = await User.findByIdAndUpdate(req.user.id, fieldsToUpdate, {
      new: true,
      runValidators: true
    });

    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update password
// @route   PUT /api/auth/password
// @access  Private
exports.updatePassword = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select('+password');

    // Check current password
    if (!(await user.comparePassword(req.body.currentPassword))) {
      return res.status(401).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }

    user.password = req.body.newPassword;
    user.tokenVersion = (user.tokenVersion || 0) + 1;
    await user.save();

    sendTokenResponse(user, 200, res);
  } catch (error) {
    next(error);
  }
};

// @desc    Forgot password
// @route   POST /api/auth/forgot-password
// @access  Public
exports.forgotPassword = async (req, res, next) => {
  let user;
  try {
    const generic = { success: true, message: 'If an account exists, password reset instructions have been sent.' };
    user = await User.findOne({ email: String(req.body.email || '').toLowerCase().trim() });
    if (!user) return res.status(200).json(generic);

    const resetToken = user.getResetPasswordToken();
    await user.save({ validateBeforeSave: false });
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;
    const result = await sendEmail({
      to: user.email,
      subject: 'Reset your GreenDye for Training and Consultancy password',
      html: createEmailTemplate(`<p>Hello ${escapeHtml(user.name)},</p><p>A password reset was requested for your account. This link expires in 10 minutes.</p><p><a class="button" href="${resetUrl}">Reset password</a></p><p>If you did not request this, ignore this email.</p>`, { title: 'Reset your password' }),
      text: `Reset your password within 10 minutes: ${resetUrl}`
    });
    if (!result.success) {
      user.resetPasswordToken = undefined;
      user.resetPasswordExpire = undefined;
      await user.save({ validateBeforeSave: false });
      const error = new Error('Password reset email could not be sent');
      error.statusCode = 503;
      throw error;
    }
    return res.status(200).json(generic);
  } catch (error) {
    if (user && user.resetPasswordToken) {
      user.resetPasswordToken = undefined;
      user.resetPasswordExpire = undefined;
      await user.save({ validateBeforeSave: false });
    }
    next(error);
  }
};

// @desc    Reset password
// @route   PUT /api/auth/reset-password/:resetToken
// @access  Public
exports.resetPassword = async (req, res, next) => {
  try {
    // Get hashed token
    const resetPasswordToken = crypto
      .createHash('sha256')
      .update(req.params.resetToken)
      .digest('hex');

    const user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpire: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired token'
      });
    }

    // Set new password
    user.password = req.body.password;
    user.tokenVersion = (user.tokenVersion || 0) + 1;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    sendTokenResponse(user, 200, res);
  } catch (error) {
    next(error);
  }
};

// @desc    Verify email
// @route   GET /api/auth/verify-email/:token
// @access  Public
exports.verifyEmail = async (req, res, next) => {
  try {
    const tokenHash = crypto.createHash('sha256').update(req.params.token).digest('hex');
    const user = await User.findOne({ emailVerificationToken: tokenHash, emailVerificationExpire: { $gt: Date.now() } });
    if (!user) return res.status(400).json({ success: false, message: 'Invalid or expired verification token' });
    user.isVerified = true;
    user.emailVerificationToken = undefined;
    user.emailVerificationExpire = undefined;
    await user.save({ validateBeforeSave: false });
    res.status(200).json({ success: true, message: 'Email verified successfully' });
  } catch (error) { next(error); }
};

exports.resendVerification = async (req, res, next) => {
  try {
    const generic={success:true,message:'If an eligible account exists, a verification email has been sent.'};
    const user=await User.findOne({email:String(req.body.email||'').toLowerCase().trim()});
    if(!user||user.isVerified)return res.status(200).json(generic);
    const token=crypto.randomBytes(32).toString('hex');
    user.emailVerificationToken=crypto.createHash('sha256').update(token).digest('hex');
    user.emailVerificationExpire=Date.now()+24*60*60*1000;
    await user.save({validateBeforeSave:false});
    const url=`${process.env.FRONTEND_URL}/verify-email/${token}`;
    const result=await sendEmail({to:user.email,subject:'Verify your GreenDye for Training and Consultancy account',html:createEmailTemplate(`<p>Hello ${escapeHtml(user.name)},</p><p><a class="button" href="${url}">Verify email</a></p>`,{title:'Verify your email'}),text:`Verify your email: ${url}`});
    if(!result.success){user.emailVerificationToken=undefined;user.emailVerificationExpire=undefined;await user.save({validateBeforeSave:false});const e=new Error('Verification email could not be sent');e.statusCode=503;throw e;}
    res.status(200).json(generic);
  } catch(error){next(error)}
};

// Helper function to get token from model, create cookie and send response
const sendTokenResponse = (user, statusCode, res) => {
  // Create token
  const token = user.generateAuthToken();

    res
    .status(statusCode)
    .json({
      success: true,
      data: {
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          language: user.language,
          avatar: user.avatar
        }
      }
    });
};
