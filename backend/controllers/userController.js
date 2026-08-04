const User = require('../models/User');
const AuditTrail = require('../models/AuditTrail');
const mongoSanitize = require('mongo-sanitize');

// @desc    Get all users with filtering, sorting, and pagination
// @route   GET /api/users
// @access  Private/Admin
exports.getUsers = async (req, res, next) => {
  try {
    
    const {
      role,
      status,
      isActive,
      search,
      sort = '-createdAt',
      page = 1,
      limit = 10
    } = req.query;

    // Build query with sanitized inputs
    const query = {};
    
    // Validate and sanitize role
    const validRoles = ['student', 'trainer', 'admin'];
    if (role && validRoles.includes(role)) {
      query.role = role;
    }
    
    // Validate and sanitize status
    const validStatuses = ['active', 'inactive', 'suspended'];
    if (status && validStatuses.includes(status)) {
      query.status = status;
    }
    
    if (isActive) {
      query.isActive = isActive === 'true';
    }
    
    // Sanitize search input and escape regex special characters
    if (search) {
      const sanitizedSearch = mongoSanitize(search);
      const escapedSearch = String(sanitizedSearch).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      query.$or = [
        { name: { $regex: escapedSearch, $options: 'i' } },
        { email: { $regex: escapedSearch, $options: 'i' } }
      ];
    }

    // Validate sort parameter
    const validSortFields = ['createdAt', '-createdAt', 'name', '-name', 'email', '-email', 'role', '-role'];
    const sanitizedSort = validSortFields.includes(sort) ? sort : '-createdAt';

    // Execute query with pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const users = await User.find(query)
      .select('-password')
      .sort(sanitizedSort)
      .limit(parseInt(limit))
      .skip(skip);

    const total = await User.countDocuments(query);

    res.status(200).json({
      success: true,
      count: users.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit)),
      data: users
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single user
// @route   GET /api/users/:id
// @access  Private/Admin
exports.getUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create user
// @route   POST /api/users
// @access  Private/Admin
exports.createUser = async (req, res, next) => {
  try {
    // Sanitize input to prevent NoSQL injection
    const sanitizedBody = mongoSanitize(req.body);
    
    const user = await User.create(sanitizedBody);

    // Log action
    await AuditTrail.create({
      user: req.user._id,
      action: 'CREATE_USER',
      targetType: 'User',
      targetId: user._id,
      details: `Created user: ${user.email} with role: ${user.role}`,
      ipAddress: req.ip
    });

    res.status(201).json({
      success: true,
      data: user
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update user
// @route   PUT /api/users/:id
// @access  Private/Admin
exports.updateUser = async (req, res, next) => {
  try {
    // Sanitize input to prevent NoSQL injection
    const sanitizedBody = mongoSanitize(req.body);
    
    // Remove sensitive fields that shouldn't be updated directly
    // Password should be changed via reset-password endpoint
    delete sanitizedBody.password;
    
    const user = await User.findByIdAndUpdate(req.params.id, sanitizedBody, {
      new: true,
      runValidators: true
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Log action (only log field names for privacy, not values)
    await AuditTrail.create({
      user: req.user._id,
      action: 'UPDATE_USER',
      targetType: 'User',
      targetId: user._id,
      details: `Updated user: ${user.email}`,
      metadata: { updatedFields: Object.keys(sanitizedBody) },
      ipAddress: req.ip
    });

    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete user
// @route   DELETE /api/users/:id
// @access  Private/Admin
exports.deleteUser = async (req, res, next) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Log action
    await AuditTrail.create({
      user: req.user._id,
      action: 'DELETE_USER',
      targetType: 'User',
      targetId: req.params.id,
      details: `Deleted user: ${user.email}`,
      ipAddress: req.ip
    });

    res.status(200).json({
      success: true,
      message: 'User deleted successfully',
      data: {}
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Suspend user
// @route   PUT /api/users/:id/suspend
// @access  Private/Admin
exports.suspendUser = async (req, res, next) => {
  try {
    const { reason } = req.body;
    
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { status: 'suspended', isActive: false },
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Log action
    await AuditTrail.create({
      user: req.user._id,
      action: 'SUSPEND_USER',
      targetType: 'User',
      targetId: user._id,
      details: `Suspended user: ${user.email}. Reason: ${reason || 'Not provided'}`,
      metadata: { reason },
      ipAddress: req.ip
    });

    res.status(200).json({
      success: true,
      message: 'User suspended successfully',
      data: user
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Activate/unsuspend user
// @route   PUT /api/users/:id/activate
// @access  Private/Admin
exports.activateUser = async (req, res, next) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { status: 'active', isActive: true },
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Log action
    await AuditTrail.create({
      user: req.user._id,
      action: 'ACTIVATE_USER',
      targetType: 'User',
      targetId: user._id,
      details: `Activated user: ${user.email}`,
      ipAddress: req.ip
    });

    res.status(200).json({
      success: true,
      message: 'User activated successfully',
      data: user
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get user activity logs
// @route   GET /api/users/:id/activity
// @access  Private/Admin
exports.getUserActivity = async (req, res, next) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const activities = await AuditTrail.find({ user: req.params.id })
      .sort('-createdAt')
      .limit(parseInt(limit))
      .skip(skip)
      .populate('user', 'name email');

    const total = await AuditTrail.countDocuments({ user: req.params.id });

    res.status(200).json({
      success: true,
      count: activities.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit)),
      data: activities
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Reset user password
// @route   POST /api/users/:id/reset-password
// @access  Private/Admin
exports.resetUserPassword = async (req, res, next) => {
  try {
    const { newPassword } = req.body;

    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters'
      });
    }

    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    user.password = newPassword;
    await user.save();

    // Log action
    await AuditTrail.create({
      user: req.user._id,
      action: 'RESET_PASSWORD',
      targetType: 'User',
      targetId: user._id,
      details: `Reset password for user: ${user.email}`,
      ipAddress: req.ip
    });

    res.status(200).json({
      success: true,
      message: 'Password reset successfully'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Bulk update users
// @route   POST /api/users/bulk-update
// @access  Private/Admin
exports.bulkUpdateUsers = async (req, res, next) => {
  try {
    const { userIds, updates } = req.body;

    if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Please provide an array of user IDs'
      });
    }

    if (!updates || typeof updates !== 'object') {
      return res.status(400).json({
        success: false,
        message: 'Please provide updates object'
      });
    }

    // Sanitize updates object to prevent NoSQL injection
    const sanitizedUpdates = mongoSanitize(updates);
    
    // Remove sensitive fields from bulk updates
    delete sanitizedUpdates.password;
    delete sanitizedUpdates.email;
    delete sanitizedUpdates._id;

    const result = await User.updateMany(
      { _id: { $in: userIds } },
      { $set: sanitizedUpdates },
      { runValidators: true }
    );

    // Log action (only log field names for privacy, not values)
    await AuditTrail.create({
      user: req.user._id,
      action: 'BULK_UPDATE_USERS',
      details: `Bulk updated ${result.modifiedCount} users`,
      metadata: { 
        userCount: userIds.length, 
        updatedFields: Object.keys(sanitizedUpdates), 
        modifiedCount: result.modifiedCount 
      },
      ipAddress: req.ip
    });

    res.status(200).json({
      success: true,
      message: `Successfully updated ${result.modifiedCount} users`,
      data: {
        matchedCount: result.matchedCount,
        modifiedCount: result.modifiedCount
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Bulk delete users
// @route   POST /api/users/bulk-delete
// @access  Private/Admin
exports.bulkDeleteUsers = async (req, res, next) => {
  try {
    const { userIds } = req.body;

    if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Please provide an array of user IDs'
      });
    }

    // Prevent deleting admin users in bulk (safety measure)
    const adminCount = await User.countDocuments({ 
      _id: { $in: userIds }, 
      role: 'admin' 
    });

    if (adminCount > 0) {
      return res.status(403).json({
        success: false,
        message: 'Cannot bulk delete admin users for security reasons'
      });
    }

    const result = await User.deleteMany({ _id: { $in: userIds } });

    // Log action
    await AuditTrail.create({
      user: req.user._id,
      action: 'BULK_DELETE_USERS',
      details: `Bulk deleted ${result.deletedCount} users`,
      metadata: { userIds, deletedCount: result.deletedCount },
      ipAddress: req.ip
    });

    res.status(200).json({
      success: true,
      message: `Successfully deleted ${result.deletedCount} users`,
      data: {
        deletedCount: result.deletedCount
      }
    });
  } catch (error) {
    next(error);
  }
};
