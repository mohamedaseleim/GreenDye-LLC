const logger = require('../utils/logger');
const { getOrCreateSettings } = require('../utils/contentSettingsHelper');

// @desc    Get all content settings
// @route   GET /api/admin/content-settings
// @access  Private/Admin
exports.getContentSettings = async (req, res) => {
  try {
    const settings = await getOrCreateSettings();

    res.status(200).json({
      success: true,
      data: settings,
    });
  } catch (error) {
    logger.error('Error fetching content settings:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching content settings',
      error: error.message,
    });
  }
};

// @desc    Update home page content
// @route   PUT /api/admin/content-settings/home
// @access  Private/Admin
exports.updateHomeContent = async (req, res) => {
  try {
    const { heroTitle, heroSubtitle, features } = req.body;

    const settings = await getOrCreateSettings();

    // Update home page content
    // Input is already sanitized by express-validator middleware
    if (heroTitle) {
      settings.homePage.heroTitle = {
        ...settings.homePage.heroTitle,
        ...heroTitle,
      };
    }

    if (heroSubtitle) {
      settings.homePage.heroSubtitle = {
        ...settings.homePage.heroSubtitle,
        ...heroSubtitle,
      };
    }

    if (features) {
      settings.homePage.features = features;
    }

    await settings.save();

    logger.info(`Home page content updated by admin ${req.user.id}`);

    res.status(200).json({
      success: true,
      data: settings.homePage,
      message: 'Home page content updated successfully',
    });
  } catch (error) {
    logger.error('Error updating home page content:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating home page content',
      error: error.message,
    });
  }
};

// @desc    Update about page content
// @route   PUT /api/admin/content-settings/about
// @access  Private/Admin
exports.updateAboutContent = async (req, res) => {
  try {
    const { mission, vision, features } = req.body;

    const settings = await getOrCreateSettings();

    // Update about page content
    // Input is already sanitized by express-validator middleware
    if (mission) {
      settings.aboutPage.mission = {
        ...settings.aboutPage.mission,
        ...mission,
      };
    }

    if (vision) {
      settings.aboutPage.vision = {
        ...settings.aboutPage.vision,
        ...vision,
      };
    }

    if (features) {
      settings.aboutPage.features = features;
    }

    await settings.save();

    logger.info(`About page content updated by admin ${req.user.id}`);

    res.status(200).json({
      success: true,
      data: settings.aboutPage,
      message: 'About page content updated successfully',
    });
  } catch (error) {
    logger.error('Error updating about page content:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating about page content',
      error: error.message,
    });
  }
};

// @desc    Update contact page content
// @route   PUT /api/admin/content-settings/contact
// @access  Private/Admin
exports.updateContactContent = async (req, res) => {
  try {
    const { email, phone, address, officeHours, socialMedia } = req.body;

    const settings = await getOrCreateSettings();

    // Update contact page content
    // Input is already sanitized by express-validator middleware
    if (email) settings.contactPage.email = email;
    if (phone) settings.contactPage.phone = phone;
    if (address) settings.contactPage.address = address;

    if (officeHours) {
      settings.contactPage.officeHours = {
        ...settings.contactPage.officeHours,
        ...officeHours,
      };
    }

    if (socialMedia) {
      settings.socialMedia = {
        ...settings.socialMedia,
        ...socialMedia,
      };
    }

    await settings.save();

    logger.info(`Contact page content updated by admin ${req.user.id}`);

    res.status(200).json({
      success: true,
      data: {
        contactPage: settings.contactPage,
        socialMedia: settings.socialMedia,
      },
      message: 'Contact page content updated successfully',
    });
  } catch (error) {
    logger.error('Error updating contact page content:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating contact page content',
      error: error.message,
    });
  }
};
