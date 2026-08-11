const NotificationPreferences = require('../models/NotificationPreferences');

// Get notification preferences for the authenticated user
exports.getNotificationPreferences = async (req, res, next) => {
  try {
    const userId = req.user._id;
    let preferences = await NotificationPreferences.findOne({ user: userId });
    if (!preferences) {
      // Create default preferences for new user
      preferences = await NotificationPreferences.create({ user: userId });
    }
    return res.json({ success: true, data: preferences });
  } catch (error) {
    return next(error);
  }
};

// Update notification preferences for the authenticated user
exports.updateNotificationPreferences = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const update = req.body;

    // Upsert ensures a document is created if not found
    const preferences = await NotificationPreferences.findOneAndUpdate(
      { user: userId },
      update,
      { new: true, upsert: true }
    );

    return res.json({ success: true, data: preferences });
  } catch (error) {
    return next(error);
  }
};
