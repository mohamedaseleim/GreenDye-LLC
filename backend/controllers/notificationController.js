const logger = require('../utils/logger');
const Notification = require('../models/Notification');
const NotificationPreferences = require('../models/NotificationPreferences');
const nodemailer = require('nodemailer');
const mjml = require('mjml');
const admin = require('firebase-admin');

// Initialize Firebase Admin for push notifications
const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT ? JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT) : null;
if (serviceAccount && !admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

// Create email transporter
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD
  }
});

// @desc    Get user notifications
// @route   GET /api/notifications
// @access  Private
exports.getNotifications = async (req, res, _next) => {
  try {
    const { page = 1, limit = 20, unreadOnly = false } = req.query;

    const query = { user: req.user.id };
    if (unreadOnly === 'true') {
      query.isRead = false;
    }

    const notifications = await Notification.find(query)
      .sort('-createdAt')
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const count = await Notification.countDocuments(query);
    const unreadCount = await Notification.countDocuments({
      user: req.user.id,
      isRead: false
    });

    res.status(200).json({
      success: true,
      count: notifications.length,
      total: count,
      unreadCount,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      data: notifications
    });
  } catch (error) {
    logger.error('Get notifications error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching notifications',
      error: error.message
    });
  }
};

// @desc    Mark notification as read
// @route   PUT /api/notifications/:id/read
// @access  Private
exports.markAsRead = async (req, res, _next) => {
  try {
    const notification = await Notification.findById(req.params.id);

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found'
      });
    }

    // Verify notification belongs to user
    if (notification.user.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this notification'
      });
    }

    notification.isRead = true;
    notification.readAt = Date.now();
    await notification.save();

    res.status(200).json({
      success: true,
      data: notification
    });
  } catch (error) {
    logger.error('Mark as read error:', error);
    res.status(500).json({
      success: false,
      message: 'Error marking notification as read',
      error: error.message
    });
  }
};

// @desc    Mark all notifications as read
// @route   PUT /api/notifications/read-all
// @access  Private
exports.markAllAsRead = async (req, res, _next) => {
  try {
    await Notification.updateMany(
      { user: req.user.id, isRead: false },
      { isRead: true, readAt: Date.now() }
    );

    res.status(200).json({
      success: true,
      message: 'All notifications marked as read'
    });
  } catch (error) {
    logger.error('Mark all as read error:', error);
    res.status(500).json({
      success: false,
      message: 'Error marking all notifications as read',
      error: error.message
    });
  }
};

// @desc    Delete notification
// @route   DELETE /api/notifications/:id
// @access  Private
exports.deleteNotification = async (req, res, _next) => {
  try {
    const notification = await Notification.findById(req.params.id);

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found'
      });
    }

    // Verify notification belongs to user
    if (notification.user.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this notification'
      });
    }

    await notification.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Notification deleted successfully'
    });
  } catch (error) {
    logger.error('Delete notification error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting notification',
      error: error.message
    });
  }
};

// @desc    Delete all read notifications
// @route   DELETE /api/notifications/read
// @access  Private
exports.deleteAllRead = async (req, res, _next) => {
  try {
    await Notification.deleteMany({
      user: req.user.id,
      isRead: true
    });

    res.status(200).json({
      success: true,
      message: 'All read notifications deleted successfully'
    });
  } catch (error) {
    logger.error('Delete all read error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting notifications',
      error: error.message
    });
  }
};

// @desc    Create and send notification
// @route   POST /api/notifications
// @access  Private (Admin only)
exports.createNotification = async (req, res, _next) => {
  try {
    const {
      userId,
      type,
      title,
      message,
      data,
      link,
      priority,
      sendEmail,
      sendPush
    } = req.body;

    const notification = await Notification.create({
      user: userId,
      type,
      title,
      message,
      data,
      link,
      priority
    });

    // Send email notification if requested
    if (sendEmail) {
      await sendEmailNotification(notification);
    }

    // Send push notification if requested
    if (sendPush) {
      await sendPushNotification(notification);
    }

    res.status(201).json({
      success: true,
      data: notification
    });
  } catch (error) {
    logger.error('Create notification error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating notification',
      error: error.message
    });
  }
};

// Helper function to send email notification
async function sendEmailNotification(notification) {
  try {
    const user = await require('../models/User').findById(notification.user);
    if (!user || !user.email) return;

    let preferences = await NotificationPreferences.findOne({ user: user._id });
    if (!preferences) {
      preferences = await NotificationPreferences.create({ user: user._id });
    }
    if (!preferences.emailEnabled) return;

    const language = preferences.preferredLanguage || user.preferredLanguage || 'en';
    const emailTitle = notification.title.get(language) || notification.title.get('en');
    const emailMessage = notification.message.get(language) || notification.message.get('en');
    const buttonText = language === 'ar' ? 'عرض التفاصيل' : 'View Details';

    const linkButton = notification.link
      ? `<mj-button background-color="#2e7d32" color="#ffffff" href="${notification.link}">${buttonText}</mj-button>`
      : '';

    const mjmlTemplate = `
      <mjml>
        <mj-body>
          <mj-section>
            <mj-column>
              <mj-text font-size="20px" color="#2e7d32">${emailTitle}</mj-text>
              <mj-text>${emailMessage}</mj-text>
              ${linkButton}
              <mj-divider border-color="#eeeeee"></mj-divider>
              <mj-text font-size="12px" color="#666666">This is an automated message from GreenDye Academy. Please do not reply.</mj-text>
            </mj-column>
          </mj-section>
        </mj-body>
      </mjml>
    `;
    const htmlOutput = mjml(mjmlTemplate).html;

    const mailOptions = {
      from: `"GreenDye Academy" <${process.env.SMTP_USER}>`,
      to: user.email,
      subject: emailTitle,
      html: htmlOutput
    };

    await transporter.sendMail(mailOptions);
    notification.emailSent = true;
    notification.emailSentAt = Date.now();
    await notification.save();
  } catch (error) {
    logger.error('Send email notification error:', error);
  }
}

// Helper function to send push notification
async function sendPushNotification(notification) {
  try {
    const user = await require('../models/User').findById(notification.user);
    if (!user) return;
    let preferences = await NotificationPreferences.findOne({ user: user._id });
    if (!preferences) {
      preferences = await NotificationPreferences.create({ user: user._id });
    }
    if (!preferences.pushEnabled) return;
    const language = preferences.preferredLanguage || user.preferredLanguage || 'en';
    const title = notification.title.get(language) || notification.title.get('en');
    const body = notification.message.get(language) || notification.message.get('en');
    const tokens = preferences.fcmTokens || [];
    if (tokens.length === 0) {
      return;
    }
    const message = {
      notification: { title, body },
      data: {
        notificationId: notification._id.toString(),
        type: notification.type || ''
      },
      tokens
    };
    const response = await admin.messaging().sendMulticast(message);
    const invalidTokens = [];
    response.responses.forEach((resp, idx) => {
      if (!resp.success) {
        invalidTokens.push(tokens[idx]);
      }
    });
    if (invalidTokens.length > 0) {
      preferences.fcmTokens = preferences.fcmTokens.filter(token => !invalidTokens.includes(token));
      await preferences.save();
    }
    notification.pushSent = true;
    notification.pushSentAt = Date.now();
    await notification.save();
  } catch (error) {
    logger.error('Send push notification error:', error);
  }
}

// Utility function to create notification (used by other controllers)
exports.createNotificationUtil = async (userId, type, titleObj, messageObj, data = {}, link = null) => {
  try {
    await Notification.create({
      user: userId,
      type,
      title: titleObj,
      message: messageObj,
      data,
      link
    });
  } catch (error) {
    logger.error('Create notification util error:', error);
  }
};
