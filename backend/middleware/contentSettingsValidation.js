const { body, validationResult } = require('express-validator');

/**
 * Validation middleware for content settings
 */

// Helper to check validation result
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array(),
    });
  }
  next();
};

// Validate multilingual text fields
const validateMultilingualField = (field) => [
  body(`${field}.en`)
    .optional()
    .trim()
    .escape()
    .isLength({ min: 1, max: 1000 })
    .withMessage(`${field} in English must be between 1 and 1000 characters`),
  body(`${field}.ar`)
    .optional()
    .trim()
    .escape()
    .isLength({ min: 1, max: 1000 })
    .withMessage(`${field} in Arabic must be between 1 and 1000 characters`),
  body(`${field}.fr`)
    .optional()
    .trim()
    .escape()
    .isLength({ min: 1, max: 1000 })
    .withMessage(`${field} in French must be between 1 and 1000 characters`),
];

// Validate feature object
const validateFeature = (location) => [
  body(`${location}.*.icon`)
    .optional()
    .trim()
    .escape()
    .isLength({ min: 1, max: 50 })
    .withMessage('Feature icon must be between 1 and 50 characters'),
  body(`${location}.*.title`)
    .optional()
    .trim()
    .escape()
    .isLength({ min: 1, max: 200 })
    .withMessage('Feature title must be between 1 and 200 characters'),
  body(`${location}.*.description`)
    .optional()
    .trim()
    .escape()
    .isLength({ min: 1, max: 500 })
    .withMessage('Feature description must be between 1 and 500 characters'),
];

// Validate home page content
const validateHomeContent = [
  ...validateMultilingualField('heroTitle'),
  ...validateMultilingualField('heroSubtitle'),
  ...validateFeature('features'),
  handleValidationErrors,
];

// Validate about page content
const validateAboutContent = [
  ...validateMultilingualField('mission'),
  ...validateMultilingualField('vision'),
  ...validateFeature('features'),
  handleValidationErrors,
];

// Validate contact page content
const validateContactContent = [
  body('email')
    .optional()
    .trim()
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
  body('phone')
    .optional()
    .trim()
    .escape()
    .matches(/^[\d\s+\-()]+$/)
    .withMessage('Please provide a valid phone number'),
  body('address')
    .optional()
    .trim()
    .escape()
    .isLength({ min: 1, max: 500 })
    .withMessage('Address must be between 1 and 500 characters'),
  ...validateMultilingualField('officeHours'),
  body('socialMedia.facebook')
    .optional()
    .trim()
    .custom((value) => {
      if (value && value !== '') {
        return /^https?:\/\/(www\.)?facebook\.com\/.+/.test(value);
      }
      return true;
    })
    .withMessage('Please provide a valid Facebook URL'),
  body('socialMedia.twitter')
    .optional()
    .trim()
    .custom((value) => {
      if (value && value !== '') {
        return /^https?:\/\/(www\.)?(twitter\.com|x\.com)\/.+/.test(value);
      }
      return true;
    })
    .withMessage('Please provide a valid Twitter/X URL'),
  body('socialMedia.linkedin')
    .optional()
    .trim()
    .custom((value) => {
      if (value && value !== '') {
        return /^https?:\/\/(www\.)?linkedin\.com\/.+/.test(value);
      }
      return true;
    })
    .withMessage('Please provide a valid LinkedIn URL'),
  body('socialMedia.instagram')
    .optional()
    .trim()
    .custom((value) => {
      if (value && value !== '') {
        return /^https?:\/\/(www\.)?instagram\.com\/.+/.test(value);
      }
      return true;
    })
    .withMessage('Please provide a valid Instagram URL'),
  body('socialMedia.youtube')
    .optional()
    .trim()
    .custom((value) => {
      if (value && value !== '') {
        return /^https?:\/\/(www\.)?youtube\.com\/.+/.test(value);
      }
      return true;
    })
    .withMessage('Please provide a valid YouTube URL'),
  handleValidationErrors,
];

module.exports = {
  validateHomeContent,
  validateAboutContent,
  validateContactContent,
};
