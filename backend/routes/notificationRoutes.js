const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
  getNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  deleteAllRead,
  createNotification
} = require('../controllers/notificationController');

const {
  getNotificationPreferences,
  updateNotificationPreferences,
} = require('../controllers/notificationPreferencesController');

// Notification preferences routes
router.get('/preferences', protect, getNotificationPreferences);
router.put('/preferences', protect, updateNotificationPreferences);

// Notification routes
router.get('/', protect, getNotifications);
router.put('/read-all', protect, markAllAsRead);
router.put('/:id/read', protect, markAsRead);
router.delete('/read', protect, deleteAllRead);
router.delete('/:id', protect, deleteNotification);
router.post('/', protect, authorize('admin'), createNotification);

module.exports = router;
