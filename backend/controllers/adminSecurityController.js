const FailedLoginAttempt = require('../models/FailedLoginAttempt');
const SecurityAlert = require('../models/SecurityAlert');
const IPBlacklist = require('../models/IPBlacklist');
const ActivityLog = require('../models/ActivityLog');
const {
  getRecentActivity,
  getSecurityAlerts,
  getFailedLoginAttempts,
  analyzeSecurityPatterns
} = require('../services/securityService');
const logger = require('../utils/logger');

// @desc    Get real-time activity monitoring dashboard
// @route   GET /api/admin/security/activity
// @access  Private/Admin
exports.getActivityMonitoring = async (req, res, next) => {
  try {
    const {
      limit = 50,
      user,
      actionType,
      status,
      ipAddress,
      startDate,
      endDate
    } = req.query;

    const activities = await getRecentActivity(parseInt(limit), {
      user,
      actionType,
      status,
      ipAddress,
      startDate,
      endDate
    });

    // Get activity statistics
    const stats = await ActivityLog.aggregate([
      {
        $match: {
          timestamp: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
        }
      },
      {
        $group: {
          _id: '$actionType',
          count: { $sum: 1 }
        }
      }
    ]);

    res.status(200).json({
      success: true,
      count: activities.length,
      data: {
        activities,
        stats: stats.reduce((acc, item) => {
          acc[item._id] = item.count;
          return acc;
        }, {})
      }
    });
  } catch (error) {
    logger.error('Error getting activity monitoring:', error);
    next(error);
  }
};

// @desc    Get failed login attempts
// @route   GET /api/admin/security/failed-logins
// @access  Private/Admin
exports.getFailedLogins = async (req, res, next) => {
  try {
    const { email, ipAddress, startDate, endDate, limit = 100 } = req.query;

    const attempts = await getFailedLoginAttempts({
      email,
      ipAddress,
      startDate,
      endDate
    });

    // Group by IP to show top offenders
    const ipStats = await FailedLoginAttempt.aggregate([
      {
        $match: {
          attemptedAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
        }
      },
      {
        $group: {
          _id: '$ipAddress',
          count: { $sum: 1 },
          emails: { $addToSet: '$email' },
          lastAttempt: { $max: '$attemptedAt' }
        }
      },
      { $sort: { count: -1 } },
      { $limit: 20 }
    ]);

    res.status(200).json({
      success: true,
      count: attempts.length,
      data: {
        attempts: attempts.slice(0, parseInt(limit)),
        topOffendingIPs: ipStats
      }
    });
  } catch (error) {
    logger.error('Error getting failed login attempts:', error);
    next(error);
  }
};

// @desc    Get security alerts dashboard
// @route   GET /api/admin/security/alerts
// @access  Private/Admin
exports.getSecurityAlertsData = async (req, res, next) => {
  try {
    const { status, severity, type, startDate, endDate } = req.query;

    const alerts = await getSecurityAlerts({
      status: status || 'open',
      severity,
      type,
      startDate,
      endDate
    });

    // Get alert statistics
    const alertStats = await SecurityAlert.aggregate([
      { $match: { status: { $in: ['open', 'investigating'] } } },
      {
        $group: {
          _id: '$severity',
          count: { $sum: 1 }
        }
      }
    ]);

    const recentCritical = await SecurityAlert.find({
      severity: 'critical',
      status: { $in: ['open', 'investigating'] }
    })
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('user', 'name email');

    res.status(200).json({
      success: true,
      count: alerts.length,
      data: {
        alerts,
        stats: alertStats.reduce((acc, item) => {
          acc[item._id] = item.count;
          return acc;
        }, {}),
        criticalAlerts: recentCritical
      }
    });
  } catch (error) {
    logger.error('Error getting security alerts:', error);
    next(error);
  }
};

// @desc    Update security alert status
// @route   PUT /api/admin/security/alerts/:id
// @access  Private/Admin
exports.updateSecurityAlert = async (req, res, next) => {
  try {
    const { status, notes } = req.body;

    const alert = await SecurityAlert.findById(req.params.id);

    if (!alert) {
      return res.status(404).json({
        success: false,
        message: 'Security alert not found'
      });
    }

    if (status) alert.status = status;
    if (notes) alert.notes = notes;

    if (status === 'resolved' || status === 'false_positive') {
      alert.resolvedBy = req.user._id;
      alert.resolvedAt = Date.now();
    }

    await alert.save();

    res.status(200).json({
      success: true,
      data: alert
    });
  } catch (error) {
    logger.error('Error updating security alert:', error);
    next(error);
  }
};

// @desc    Get IP blacklist
// @route   GET /api/admin/security/blacklist
// @access  Private/Admin
exports.getIPBlacklist = async (req, res, next) => {
  try {
    const { isActive, page = 1, limit = 50 } = req.query;

    const query = {};
    if (isActive !== undefined) {
      // Ensure boolean value to prevent injection
      query.isActive = isActive === 'true' || isActive === true;
    }

    const blacklist = await IPBlacklist.find(query)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit))
      .populate('addedBy', 'name email');

    const total = await IPBlacklist.countDocuments(query);

    res.status(200).json({
      success: true,
      count: blacklist.length,
      total,
      data: blacklist
    });
  } catch (error) {
    logger.error('Error getting IP blacklist:', error);
    next(error);
  }
};

// @desc    Add IP to blacklist
// @route   POST /api/admin/security/blacklist
// @access  Private/Admin
exports.addIPToBlacklist = async (req, res, next) => {
  try {
    const { ipAddress, reason, description, expiresAt } = req.body;

    if (!ipAddress || !reason) {
      return res.status(400).json({
        success: false,
        message: 'Please provide IP address and reason'
      });
    }

    // Validate IP address format (basic validation)
    const ipRegex = /^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$/;
    if (!ipRegex.test(ipAddress)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid IP address format'
      });
    }

    // Check if IP already exists - use string matching to prevent injection
    const existing = await IPBlacklist.findOne({ ipAddress: String(ipAddress) });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'This IP address is already blacklisted'
      });
    }

    const blacklistEntry = await IPBlacklist.create({
      ipAddress,
      reason,
      description,
      addedBy: req.user._id,
      isActive: true,
      expiresAt: expiresAt ? new Date(expiresAt) : null
    });

    // Create security alert
    await SecurityAlert.create({
      type: 'suspicious_ip',
      severity: 'medium',
      ipAddress,
      description: `IP ${ipAddress} manually added to blacklist by admin. Reason: ${reason}`,
      metadata: {
        blacklistId: blacklistEntry._id,
        addedBy: req.user._id,
        addedByName: req.user.name
      }
    });

    res.status(201).json({
      success: true,
      data: blacklistEntry
    });
  } catch (error) {
    logger.error('Error adding IP to blacklist:', error);
    next(error);
  }
};

// @desc    Remove IP from blacklist
// @route   DELETE /api/admin/security/blacklist/:id
// @access  Private/Admin
exports.removeIPFromBlacklist = async (req, res, next) => {
  try {
    const blacklistEntry = await IPBlacklist.findById(req.params.id);

    if (!blacklistEntry) {
      return res.status(404).json({
        success: false,
        message: 'Blacklist entry not found'
      });
    }

    blacklistEntry.isActive = false;
    await blacklistEntry.save();

    res.status(200).json({
      success: true,
      message: 'IP removed from blacklist',
      data: blacklistEntry
    });
  } catch (error) {
    logger.error('Error removing IP from blacklist:', error);
    next(error);
  }
};

// @desc    Get security dashboard overview
// @route   GET /api/admin/security/dashboard
// @access  Private/Admin
exports.getSecurityDashboard = async (req, res, next) => {
  try {
    const patterns = await analyzeSecurityPatterns();

    // Get recent activities (last 20)
    const recentActivities = await ActivityLog.find()
      .sort({ timestamp: -1 })
      .limit(20)
      .populate('user', 'name email role');

    // Get open security alerts count by severity
    const openAlerts = await SecurityAlert.aggregate([
      { $match: { status: { $in: ['open', 'investigating'] } } },
      { $group: { _id: '$severity', count: { $sum: 1 } } }
    ]);

    // Get recent failed login trends (last 7 days)
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const loginTrends = await FailedLoginAttempt.aggregate([
      { $match: { attemptedAt: { $gte: sevenDaysAgo } } },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$attemptedAt' }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    res.status(200).json({
      success: true,
      data: {
        overview: patterns,
        recentActivities,
        openAlerts: openAlerts.reduce((acc, item) => {
          acc[item._id] = item.count;
          return acc;
        }, {}),
        loginTrends
      }
    });
  } catch (error) {
    logger.error('Error getting security dashboard:', error);
    next(error);
  }
};

// @desc    Get activity statistics
// @route   GET /api/admin/security/activity/stats
// @access  Private/Admin
exports.getActivityStats = async (req, res, next) => {
  try {
    const { period = '24h' } = req.query;

    let timeframe;
    switch (period) {
      case '1h':
        timeframe = new Date(Date.now() - 60 * 60 * 1000);
        break;
      case '24h':
        timeframe = new Date(Date.now() - 24 * 60 * 60 * 1000);
        break;
      case '7d':
        timeframe = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30d':
        timeframe = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        break;
      default:
        timeframe = new Date(Date.now() - 24 * 60 * 60 * 1000);
    }

    // Activity by type
    const activityByType = await ActivityLog.aggregate([
      { $match: { timestamp: { $gte: timeframe } } },
      { $group: { _id: '$actionType', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    // Activity by status
    const activityByStatus = await ActivityLog.aggregate([
      { $match: { timestamp: { $gte: timeframe } } },
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    // Most active users
    const mostActiveUsers = await ActivityLog.aggregate([
      { $match: { timestamp: { $gte: timeframe }, user: { $exists: true } } },
      { $group: { _id: '$user', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'userInfo'
        }
      },
      { $unwind: '$userInfo' },
      {
        $project: {
          user: {
            _id: '$userInfo._id',
            name: '$userInfo.name',
            email: '$userInfo.email',
            role: '$userInfo.role'
          },
          count: 1
        }
      }
    ]);

    // Most active IPs
    const mostActiveIPs = await ActivityLog.aggregate([
      { $match: { timestamp: { $gte: timeframe }, ipAddress: { $exists: true } } },
      { $group: { _id: '$ipAddress', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);

    res.status(200).json({
      success: true,
      data: {
        period,
        activityByType,
        activityByStatus,
        mostActiveUsers,
        mostActiveIPs
      }
    });
  } catch (error) {
    logger.error('Error getting activity stats:', error);
    next(error);
  }
};
