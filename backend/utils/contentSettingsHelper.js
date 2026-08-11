const ContentSettings = require('../models/ContentSettings');

/**
 * Get or create content settings
 * Implements singleton pattern - ensures only one ContentSettings document exists
 * Uses atomic operation to prevent race conditions
 * @returns {Promise<ContentSettings>} The content settings document
 */
const getOrCreateSettings = async () => {
  // Use findOneAndUpdate with upsert to ensure atomicity
  const settings = await ContentSettings.findOneAndUpdate(
    {},
    { $setOnInsert: {} },
    { 
      new: true, 
      upsert: true,
      runValidators: true,
    }
  );
  
  return settings;
};

module.exports = {
  getOrCreateSettings,
};
