const IPBlacklist = require('../models/IPBlacklist');
const SecurityAlert = require('../models/SecurityAlert');
const logger = require('../utils/logger');

/**
 * Middleware to check if IP is blacklisted
 */
exports.checkIPBlacklist = async (req, res, next) => {
  try {
    // Get IP address from request
    const ipAddress = req.ip || req.connection.remoteAddress || req.headers['x-forwarded-for']?.split(',')[0]?.trim();
    
    if (!ipAddress) {
      return next();
    }

    // Check if IP is blacklisted and active
    const blacklistedIP = await IPBlacklist.findOne({
      ipAddress,
      isActive: true,
      $or: [
        { expiresAt: { $exists: false } },
        { expiresAt: null },
        { expiresAt: { $gt: new Date() } }
      ]
    });

    if (blacklistedIP) {
      // Log security alert
      await SecurityAlert.create({
        type: 'blacklisted_ip_attempt',
        severity: 'high',
        ipAddress,
        userAgent: req.headers['user-agent'],
        description: `Blacklisted IP ${ipAddress} attempted to access the system. Reason: ${blacklistedIP.reason}`,
        metadata: {
          blacklistId: blacklistedIP._id,
          path: req.path,
          method: req.method,
          blacklistReason: blacklistedIP.reason
        }
      });

      logger.warn(`Blacklisted IP attempt: ${ipAddress}`);

      return res.status(403).json({
        success: false,
        message: 'Access denied. Your IP address has been blocked.'
      });
    }

    next();
  } catch (error) {
    logger.error('Error checking IP blacklist:', error);
    // Don't block the request on error, but log it
    next();
  }
};

/**
 * Get IP address from request
 */
exports.getClientIP = (req) => {
  return req.ip || 
         req.connection.remoteAddress || 
         req.headers['x-forwarded-for']?.split(',')[0]?.trim() ||
         req.headers['x-real-ip'] ||
         'unknown';
};

/**
 * Get user agent from request
 */
exports.getUserAgent = (req) => {
  return req.headers['user-agent'] || 'unknown';
};
