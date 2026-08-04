const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
  getSettings,
  updateGeneralSettings,
  updateEmailTemplates,
  updateNotificationSettings,
  updateLocalizationSettings,
  getApiKeys,
  createApiKey,
  updateApiKey,
  deleteApiKey,
  regenerateApiKey,
  testEmailTemplate,
  getPublicSettings
} = require('../controllers/systemSettingsController');

// Public route
router.get('/public', getPublicSettings);

// Admin-only routes
router.use(protect);
router.use(authorize('admin'));

// Main settings route
router.get('/', getSettings);

// General settings
router.put('/general', updateGeneralSettings);

// Email templates
router.put('/email-templates', updateEmailTemplates);
router.post('/email-templates/test', testEmailTemplate);

// Notification settings
router.put('/notifications', updateNotificationSettings);

// Localization settings
router.put('/localization', updateLocalizationSettings);

// API key management
router.route('/api-keys')
  .get(getApiKeys)
  .post(createApiKey);

router.route('/api-keys/:keyId')
  .put(updateApiKey)
  .delete(deleteApiKey);

router.post('/api-keys/:keyId/regenerate', regenerateApiKey);

module.exports = router;
