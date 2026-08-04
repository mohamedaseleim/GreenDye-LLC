const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
  getContentSettings,
  updateHomeContent,
  updateAboutContent,
  updateContactContent,
} = require('../controllers/contentSettingsController');
const { getOrCreateSettings } = require('../utils/contentSettingsHelper');
const {
  validateHomeContent,
  validateAboutContent,
  validateContactContent,
} = require('../middleware/contentSettingsValidation');

// Public route to get content settings
router.get('/public', async (req, res) => {
  try {
    const settings = await getOrCreateSettings();

    res.status(200).json({
      success: true,
      data: settings,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching content settings',
      error: error.message,
    });
  }
});

// Protect all routes below and authorize only admin
router.use(protect);
router.use(authorize('admin'));

// Get all content settings
router.get('/', getContentSettings);

// Update specific page content
router.put('/home', validateHomeContent, updateHomeContent);
router.put('/about', validateAboutContent, updateAboutContent);
router.put('/contact', validateContactContent, updateContactContent);

module.exports = router;
