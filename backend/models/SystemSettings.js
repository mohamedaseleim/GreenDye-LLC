const mongoose = require('mongoose');

const SystemSettingsSchema = new mongoose.Schema({
  // General Site Settings
  general: {
    siteName: {
      type: String,
      default: 'GreenDye Academy',
      trim: true
    },
    siteDescription: {
      type: String,
      default: 'A comprehensive e-learning platform for GreenDye Academy',
      trim: true
    },
    siteLogo: {
      type: String,
      default: '/uploads/logo.png'
    },
    favicon: {
      type: String,
      default: '/uploads/favicon.ico'
    },
    contactEmail: {
      type: String,
      default: 'support@greendye-academy.com',
      trim: true
    },
    contactPhone: {
      type: String,
      default: '',
      trim: true
    },
    contactAddress: {
      type: String,
      default: '',
      trim: true
    },
    socialMedia: {
      facebook: { type: String, default: '' },
      twitter: { type: String, default: '' },
      linkedin: { type: String, default: '' },
      instagram: { type: String, default: '' },
      youtube: { type: String, default: '' }
    }
  },

  // Email Template Settings
  emailTemplates: {
    welcome: {
      subject: {
        type: String,
        default: 'Welcome to {{siteName}}'
      },
      body: {
        type: String,
        default: 'Hello {{userName}}, welcome to {{siteName}}!'
      }
    },
    passwordReset: {
      subject: {
        type: String,
        default: 'Password Reset Request'
      },
      body: {
        type: String,
        default: 'Hi {{userName}}, click here to reset your password: {{resetLink}}'
      }
    },
    courseEnrollment: {
      subject: {
        type: String,
        default: 'Course Enrollment Confirmation'
      },
      body: {
        type: String,
        default: 'You have been enrolled in {{courseName}}'
      }
    },
    certificateIssued: {
      subject: {
        type: String,
        default: 'Certificate Issued'
      },
      body: {
        type: String,
        default: 'Congratulations! Your certificate for {{courseName}} is ready.'
      }
    }
  },

  // Notification Settings
  notifications: {
    emailEnabled: {
      type: Boolean,
      default: true
    },
    pushEnabled: {
      type: Boolean,
      default: true
    },
    smsEnabled: {
      type: Boolean,
      default: false
    },
    defaultPreferences: {
      courseUpdates: { type: Boolean, default: true },
      announcements: { type: Boolean, default: true },
      promotions: { type: Boolean, default: false },
      newsletter: { type: Boolean, default: true }
    }
  },

  // Currency and Language Settings
  localization: {
    defaultLanguage: {
      type: String,
      enum: ['en', 'ar', 'fr'],
      default: 'en'
    },
    availableLanguages: {
      type: [String],
      default: ['en', 'ar', 'fr']
    },
    defaultCurrency: {
      type: String,
      enum: ['USD', 'EUR', 'EGP', 'SAR', 'NGN'],
      default: 'USD'
    },
    availableCurrencies: {
      type: [String],
      default: ['USD', 'EUR', 'EGP', 'SAR', 'NGN']
    },
    timezone: {
      type: String,
      default: 'UTC'
    },
    dateFormat: {
      type: String,
      enum: ['MM/DD/YYYY', 'DD/MM/YYYY', 'YYYY-MM-DD'],
      default: 'MM/DD/YYYY'
    }
  },

  // API Key Management
  apiKeys: [{
    name: {
      type: String,
      required: true,
      trim: true
    },
    key: {
      type: String,
      required: true,
      unique: true
    },
    description: {
      type: String,
      trim: true
    },
    isActive: {
      type: Boolean,
      default: true
    },
    permissions: {
      type: [String],
      default: ['read']
    },
    lastUsed: {
      type: Date
    },
    createdAt: {
      type: Date,
      default: Date.now
    },
    expiresAt: {
      type: Date
    }
  }],

  // Metadata
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Ensure only one settings document exists (singleton pattern)
SystemSettingsSchema.statics.getSettings = async function() {
  let settings = await this.findOne();
  if (!settings) {
    settings = await this.create({});
  }
  return settings;
};

SystemSettingsSchema.statics.updateSettings = async function(updates, userId) {
  const settings = await this.getSettings();
  
  // Deep merge helper function with improved edge case handling
  const deepMerge = (target, source) => {
    // Handle null or undefined target
    if (!target) {
      target = {};
    }
    
    const result = { ...target };
    
    for (const key in source) {
      if (Object.prototype.hasOwnProperty.call(source, key)) {
        const sourceValue = source[key];
        
        // Handle null and undefined explicitly
        if (sourceValue === null || sourceValue === undefined) {
          result[key] = sourceValue;
        } else if (typeof sourceValue === 'object' && !Array.isArray(sourceValue)) {
          // Recursively merge nested objects
          result[key] = deepMerge(result[key] || {}, sourceValue);
        } else {
          // Directly assign primitive values and arrays
          result[key] = sourceValue;
        }
      }
    }
    return result;
  };
  
  // Deep merge updates
  if (updates.general) {
    settings.general = deepMerge(settings.general.toObject(), updates.general);
  }
  if (updates.emailTemplates) {
    settings.emailTemplates = deepMerge(settings.emailTemplates.toObject(), updates.emailTemplates);
  }
  if (updates.notifications) {
    settings.notifications = deepMerge(settings.notifications.toObject(), updates.notifications);
  }
  if (updates.localization) {
    settings.localization = deepMerge(settings.localization.toObject(), updates.localization);
  }
  
  settings.updatedBy = userId;
  settings.updatedAt = Date.now();
  
  await settings.save();
  return settings;
};

module.exports = mongoose.model('SystemSettings', SystemSettingsSchema);
