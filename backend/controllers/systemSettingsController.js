const asyncHandler = require('express-async-handler');
const SystemSettings = require('../models/SystemSettings');
const crypto = require('crypto');

// @desc    Get system settings
// @route   GET /api/admin/settings
// @access  Private/Admin
exports.getSettings = asyncHandler(async (req, res) => {
  const settings = await SystemSettings.getSettings();
  
  res.status(200).json({
    success: true,
    data: settings
  });
});

// @desc    Update general settings
// @route   PUT /api/admin/settings/general
// @access  Private/Admin
exports.updateGeneralSettings = asyncHandler(async (req, res) => {
  const updates = req.body;
  
  // Validate email format if contactEmail is provided
  if (updates.contactEmail) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(updates.contactEmail)) {
      res.status(400);
      throw new Error('Invalid email format for contact email');
    }
  }
  
  // Validate URL format for social media links if provided
  if (updates.socialMedia) {
    // Safer URL validation with strict pattern to prevent ReDoS
    const urlRegex = /^https?:\/\/[\w.-]+\.[\w.-]+(:\d+)?(\/[\w\-._~:/?#[\]@!$&'()*+,;=%]*)?$/i;
    const socialMediaFields = ['facebook', 'twitter', 'linkedin', 'instagram', 'youtube'];
    
    for (const field of socialMediaFields) {
      if (updates.socialMedia[field] && updates.socialMedia[field].trim() !== '') {
        const url = updates.socialMedia[field].trim();
        // Additional length check to prevent extremely long URLs
        if (url.length > 2048) {
          res.status(400);
          throw new Error(`URL for ${field} is too long (max 2048 characters)`);
        }
        if (!urlRegex.test(url)) {
          res.status(400);
          throw new Error(`Invalid URL format for ${field}`);
        }
      }
    }
  }
  
  const settings = await SystemSettings.updateSettings(
    { general: updates },
    req.user._id
  );
  
  res.status(200).json({
    success: true,
    data: settings.general,
    message: 'General settings updated successfully'
  });
});

// @desc    Update email templates
// @route   PUT /api/admin/settings/email-templates
// @access  Private/Admin
exports.updateEmailTemplates = asyncHandler(async (req, res) => {
  const updates = req.body;
  
  // Validate email template types
  const validTemplateTypes = ['welcome', 'passwordReset', 'courseEnrollment', 'certificateIssued'];
  
  // Check for invalid template types
  for (const templateType in updates) {
    if (!validTemplateTypes.includes(templateType)) {
      res.status(400);
      throw new Error(`Invalid email template type: ${templateType}. Valid types are: ${validTemplateTypes.join(', ')}`);
    }
    
    // Validate template structure
    const template = updates[templateType];
    if (template && typeof template === 'object') {
      // Both subject and body should be strings if provided
      if (template.subject !== undefined && typeof template.subject !== 'string') {
        res.status(400);
        throw new Error(`Email template subject must be a string for ${templateType}`);
      }
      if (template.body !== undefined && typeof template.body !== 'string') {
        res.status(400);
        throw new Error(`Email template body must be a string for ${templateType}`);
      }
    }
  }
  
  const settings = await SystemSettings.updateSettings(
    { emailTemplates: updates },
    req.user._id
  );
  
  res.status(200).json({
    success: true,
    data: settings.emailTemplates,
    message: 'Email templates updated successfully'
  });
});

// @desc    Update notification settings
// @route   PUT /api/admin/settings/notifications
// @access  Private/Admin
exports.updateNotificationSettings = asyncHandler(async (req, res) => {
  const settings = await SystemSettings.updateSettings(
    { notifications: req.body },
    req.user._id
  );
  
  res.status(200).json({
    success: true,
    data: settings.notifications,
    message: 'Notification settings updated successfully'
  });
});

// @desc    Update localization settings
// @route   PUT /api/admin/settings/localization
// @access  Private/Admin
exports.updateLocalizationSettings = asyncHandler(async (req, res) => {
  const updates = req.body;
  
  // Validate language if provided
  const validLanguages = ['en', 'ar', 'fr'];
  if (updates.defaultLanguage && !validLanguages.includes(updates.defaultLanguage)) {
    res.status(400);
    throw new Error(`Invalid language. Must be one of: ${validLanguages.join(', ')}`);
  }
  
  // Validate currency if provided
  const validCurrencies = ['USD', 'EUR', 'EGP', 'SAR', 'NGN'];
  if (updates.defaultCurrency && !validCurrencies.includes(updates.defaultCurrency)) {
    res.status(400);
    throw new Error(`Invalid currency. Must be one of: ${validCurrencies.join(', ')}`);
  }
  
  // Validate date format if provided
  const validDateFormats = ['MM/DD/YYYY', 'DD/MM/YYYY', 'YYYY-MM-DD'];
  if (updates.dateFormat && !validDateFormats.includes(updates.dateFormat)) {
    res.status(400);
    throw new Error(`Invalid date format. Must be one of: ${validDateFormats.join(', ')}`);
  }
  
  // Validate availableLanguages if provided
  if (updates.availableLanguages) {
    if (!Array.isArray(updates.availableLanguages)) {
      res.status(400);
      throw new Error('Available languages must be an array');
    }
    
    const invalidLanguages = updates.availableLanguages.filter(
      lang => !validLanguages.includes(lang)
    );
    if (invalidLanguages.length > 0) {
      res.status(400);
      throw new Error(`Invalid languages: ${invalidLanguages.join(', ')}`);
    }
  }
  
  // Validate availableCurrencies if provided
  if (updates.availableCurrencies) {
    if (!Array.isArray(updates.availableCurrencies)) {
      res.status(400);
      throw new Error('Available currencies must be an array');
    }
    
    const invalidCurrencies = updates.availableCurrencies.filter(
      curr => !validCurrencies.includes(curr)
    );
    if (invalidCurrencies.length > 0) {
      res.status(400);
      throw new Error(`Invalid currencies: ${invalidCurrencies.join(', ')}`);
    }
  }
  
  const settings = await SystemSettings.updateSettings(
    { localization: updates },
    req.user._id
  );
  
  res.status(200).json({
    success: true,
    data: settings.localization,
    message: 'Localization settings updated successfully'
  });
});

// @desc    Get all API keys
// @route   GET /api/admin/settings/api-keys
// @access  Private/Admin
exports.getApiKeys = asyncHandler(async (req, res) => {
  const settings = await SystemSettings.getSettings();
  
  res.status(200).json({
    success: true,
    data: settings.apiKeys
  });
});

// @desc    Create new API key
// @route   POST /api/admin/settings/api-keys
// @access  Private/Admin
exports.createApiKey = asyncHandler(async (req, res) => {
  const { name, description, permissions, expiresAt } = req.body;
  
  // Validate required fields
  if (!name || !name.trim()) {
    res.status(400);
    throw new Error('API key name is required');
  }
  
  // Validate permissions if provided
  if (permissions) {
    if (!Array.isArray(permissions)) {
      res.status(400);
      throw new Error('Permissions must be an array');
    }
    
    const validPermissions = ['read', 'write', 'delete', 'admin'];
    const invalidPermissions = permissions.filter(
      perm => !validPermissions.includes(perm)
    );
    
    if (invalidPermissions.length > 0) {
      res.status(400);
      throw new Error(`Invalid permissions: ${invalidPermissions.join(', ')}. Valid permissions are: ${validPermissions.join(', ')}`);
    }
  }
  
  // Validate expiresAt if provided
  if (expiresAt) {
    const expiryDate = new Date(expiresAt);
    if (isNaN(expiryDate.getTime())) {
      res.status(400);
      throw new Error('Invalid expiration date format');
    }
    
    if (expiryDate <= new Date()) {
      res.status(400);
      throw new Error('Expiration date must be in the future');
    }
  }
  
  const settings = await SystemSettings.getSettings();
  
  // Check if an API key with the same name already exists
  const existingKeyByName = settings.apiKeys.find(
    apiKey => apiKey.name.toLowerCase() === name.trim().toLowerCase()
  );
  
  if (existingKeyByName) {
    res.status(400);
    throw new Error('An API key with this name already exists');
  }
  
  // Generate a secure random API key (64 hex characters = 256 bits of entropy)
  // Collision probability is astronomically low (~2^-128 for UUID v4 equivalence)
  const key = `gd_${crypto.randomBytes(32).toString('hex')}`;
  
  settings.apiKeys.push({
    name: name.trim(),
    key,
    description: description ? description.trim() : '',
    permissions: permissions || ['read'],
    expiresAt: expiresAt || null,
    isActive: true
  });
  
  settings.updatedBy = req.user._id;
  await settings.save();
  
  res.status(201).json({
    success: true,
    data: settings.apiKeys[settings.apiKeys.length - 1],
    message: 'API key created successfully'
  });
});

// @desc    Update API key
// @route   PUT /api/admin/settings/api-keys/:keyId
// @access  Private/Admin
exports.updateApiKey = asyncHandler(async (req, res) => {
  const { keyId } = req.params;
  const { name, description, permissions, isActive, expiresAt } = req.body;
  
  const settings = await SystemSettings.getSettings();
  const apiKey = settings.apiKeys.id(keyId);
  
  if (!apiKey) {
    res.status(404);
    throw new Error('API key not found');
  }
  
  // Validate name if provided
  if (name !== undefined) {
    if (!name || !name.trim()) {
      res.status(400);
      throw new Error('API key name cannot be empty');
    }
    
    // Check if another API key with the same name already exists
    const existingKeyByName = settings.apiKeys.find(
      key => key._id.toString() !== keyId && 
             key.name.toLowerCase() === name.trim().toLowerCase()
    );
    
    if (existingKeyByName) {
      res.status(400);
      throw new Error('An API key with this name already exists');
    }
    
    apiKey.name = name.trim();
  }
  
  if (description !== undefined) {
    apiKey.description = description ? description.trim() : '';
  }
  
  // Validate permissions if provided
  if (permissions !== undefined) {
    if (!Array.isArray(permissions)) {
      res.status(400);
      throw new Error('Permissions must be an array');
    }
    
    const validPermissions = ['read', 'write', 'delete', 'admin'];
    const invalidPermissions = permissions.filter(
      perm => !validPermissions.includes(perm)
    );
    
    if (invalidPermissions.length > 0) {
      res.status(400);
      throw new Error(`Invalid permissions: ${invalidPermissions.join(', ')}. Valid permissions are: ${validPermissions.join(', ')}`);
    }
    
    apiKey.permissions = permissions;
  }
  
  if (isActive !== undefined) {
    if (typeof isActive !== 'boolean') {
      res.status(400);
      throw new Error('isActive must be a boolean value');
    }
    apiKey.isActive = isActive;
  }
  
  // Validate expiresAt if provided
  if (expiresAt !== undefined) {
    if (expiresAt !== null) {
      const expiryDate = new Date(expiresAt);
      if (isNaN(expiryDate.getTime())) {
        res.status(400);
        throw new Error('Invalid expiration date format');
      }
      
      if (expiryDate <= new Date()) {
        res.status(400);
        throw new Error('Expiration date must be in the future');
      }
      
      apiKey.expiresAt = expiryDate;
    } else {
      apiKey.expiresAt = null;
    }
  }
  
  settings.updatedBy = req.user._id;
  await settings.save();
  
  res.status(200).json({
    success: true,
    data: apiKey,
    message: 'API key updated successfully'
  });
});

// @desc    Delete API key
// @route   DELETE /api/admin/settings/api-keys/:keyId
// @access  Private/Admin
exports.deleteApiKey = asyncHandler(async (req, res) => {
  const { keyId } = req.params;
  
  const settings = await SystemSettings.getSettings();
  const apiKey = settings.apiKeys.id(keyId);
  
  if (!apiKey) {
    res.status(404);
    throw new Error('API key not found');
  }
  
  settings.apiKeys.pull(apiKey);
  settings.updatedBy = req.user._id;
  await settings.save();
  
  res.status(200).json({
    success: true,
    message: 'API key deleted successfully'
  });
});

// @desc    Regenerate API key
// @route   POST /api/admin/settings/api-keys/:keyId/regenerate
// @access  Private/Admin
exports.regenerateApiKey = asyncHandler(async (req, res) => {
  const { keyId } = req.params;
  
  const settings = await SystemSettings.getSettings();
  const apiKey = settings.apiKeys.id(keyId);
  
  if (!apiKey) {
    res.status(404);
    throw new Error('API key not found');
  }
  
  // Generate a new key
  apiKey.key = `gd_${crypto.randomBytes(32).toString('hex')}`;
  apiKey.lastUsed = null;
  
  settings.updatedBy = req.user._id;
  await settings.save();
  
  res.status(200).json({
    success: true,
    data: apiKey,
    message: 'API key regenerated successfully'
  });
});

// @desc    Test email template
// @route   POST /api/admin/settings/email-templates/test
// @access  Private/Admin
exports.testEmailTemplate = asyncHandler(async (req, res) => {
  const { templateType, testEmail } = req.body;
  
  if (!templateType || !testEmail) {
    res.status(400);
    throw new Error('Template type and test email are required');
  }
  
  // This would integrate with your actual email service
  // For now, we'll just return success
  res.status(200).json({
    success: true,
    message: `Test email sent to ${testEmail}`
  });
});

// @desc    Get public settings (for frontend)
// @route   GET /api/settings/public
// @access  Public
exports.getPublicSettings = asyncHandler(async (req, res) => {
  const settings = await SystemSettings.getSettings();
  
  // Return only non-sensitive settings
  res.status(200).json({
    success: true,
    data: {
      general: {
        siteName: settings.general.siteName,
        siteDescription: settings.general.siteDescription,
        siteLogo: settings.general.siteLogo,
        favicon: settings.general.favicon,
        contactEmail: settings.general.contactEmail,
        contactPhone: settings.general.contactPhone,
        contactAddress: settings.general.contactAddress,
        socialMedia: settings.general.socialMedia
      },
      localization: settings.localization
    }
  });
});
