const systemSettingsController = require('../../controllers/systemSettingsController');
const SystemSettings = require('../../models/SystemSettings');
const mongoose = require('mongoose');

// Mock the SystemSettings model
jest.mock('../../models/SystemSettings');

describe('SystemSettings Controller', () => {
  let req, res;
  
  beforeEach(() => {
    req = {
      user: { _id: new mongoose.Types.ObjectId() },
      body: {},
      params: {}
    };
    
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    
    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  describe('updateGeneralSettings', () => {
    it('should reject invalid email format', async () => {
      req.body = {
        contactEmail: 'invalid-email'
      };
      
      await systemSettingsController.updateGeneralSettings(req, res, (err) => {
        expect(err).toBeDefined();
        expect(err.message).toContain('Invalid email format');
      });
    });

    it('should accept valid email format', async () => {
      const mockSettings = {
        general: {
          contactEmail: 'valid@example.com'
        }
      };
      
      SystemSettings.updateSettings = jest.fn().mockResolvedValue(mockSettings);
      
      req.body = {
        contactEmail: 'valid@example.com'
      };
      
      await systemSettingsController.updateGeneralSettings(req, res, jest.fn());
      
      expect(SystemSettings.updateSettings).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: mockSettings.general,
        message: 'General settings updated successfully'
      });
    });

    it('should reject invalid social media URL', async () => {
      req.body = {
        socialMedia: {
          facebook: 'not a valid url'
        }
      };
      
      await systemSettingsController.updateGeneralSettings(req, res, (err) => {
        expect(err).toBeDefined();
        expect(err.message).toContain('Invalid URL format');
      });
    });

    it('should accept valid social media URLs', async () => {
      const mockSettings = {
        general: {
          socialMedia: {
            facebook: 'https://facebook.com/test'
          }
        }
      };
      
      SystemSettings.updateSettings = jest.fn().mockResolvedValue(mockSettings);
      
      req.body = {
        socialMedia: {
          facebook: 'https://facebook.com/test',
          twitter: 'https://twitter.com/test'
        }
      };
      
      await systemSettingsController.updateGeneralSettings(req, res, jest.fn());
      
      expect(SystemSettings.updateSettings).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
    });

    it('should allow empty social media URLs', async () => {
      const mockSettings = {
        general: {
          socialMedia: {
            facebook: ''
          }
        }
      };
      
      SystemSettings.updateSettings = jest.fn().mockResolvedValue(mockSettings);
      
      req.body = {
        socialMedia: {
          facebook: '',
          twitter: ''
        }
      };
      
      await systemSettingsController.updateGeneralSettings(req, res, jest.fn());
      
      expect(SystemSettings.updateSettings).toHaveBeenCalled();
    });
  });

  describe('updateEmailTemplates', () => {
    it('should reject invalid template type', async () => {
      req.body = {
        invalidTemplate: {
          subject: 'Test',
          body: 'Test body'
        }
      };
      
      await systemSettingsController.updateEmailTemplates(req, res, (err) => {
        expect(err).toBeDefined();
        expect(err.message).toContain('Invalid email template type');
      });
    });

    it('should accept valid template types', async () => {
      const mockSettings = {
        emailTemplates: {
          welcome: {
            subject: 'Welcome',
            body: 'Welcome to our platform'
          }
        }
      };
      
      SystemSettings.updateSettings = jest.fn().mockResolvedValue(mockSettings);
      
      req.body = {
        welcome: {
          subject: 'Welcome',
          body: 'Welcome to our platform'
        }
      };
      
      await systemSettingsController.updateEmailTemplates(req, res, jest.fn());
      
      expect(SystemSettings.updateSettings).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
    });

    it('should reject non-string template subject', async () => {
      req.body = {
        welcome: {
          subject: 123,
          body: 'Test body'
        }
      };
      
      await systemSettingsController.updateEmailTemplates(req, res, (err) => {
        expect(err).toBeDefined();
        expect(err.message).toContain('subject must be a string');
      });
    });

    it('should reject non-string template body', async () => {
      req.body = {
        welcome: {
          subject: 'Test',
          body: ['not', 'a', 'string']
        }
      };
      
      await systemSettingsController.updateEmailTemplates(req, res, (err) => {
        expect(err).toBeDefined();
        expect(err.message).toContain('body must be a string');
      });
    });
  });

  describe('updateLocalizationSettings', () => {
    it('should reject invalid language', async () => {
      req.body = {
        defaultLanguage: 'invalid'
      };
      
      await systemSettingsController.updateLocalizationSettings(req, res, (err) => {
        expect(err).toBeDefined();
        expect(err.message).toContain('Invalid language');
      });
    });

    it('should accept valid language', async () => {
      const mockSettings = {
        localization: {
          defaultLanguage: 'ar'
        }
      };
      
      SystemSettings.updateSettings = jest.fn().mockResolvedValue(mockSettings);
      
      req.body = {
        defaultLanguage: 'ar'
      };
      
      await systemSettingsController.updateLocalizationSettings(req, res, jest.fn());
      
      expect(SystemSettings.updateSettings).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
    });

    it('should reject invalid currency', async () => {
      req.body = {
        defaultCurrency: 'INVALID'
      };
      
      await systemSettingsController.updateLocalizationSettings(req, res, (err) => {
        expect(err).toBeDefined();
        expect(err.message).toContain('Invalid currency');
      });
    });

    it('should reject invalid date format', async () => {
      req.body = {
        dateFormat: 'INVALID'
      };
      
      await systemSettingsController.updateLocalizationSettings(req, res, (err) => {
        expect(err).toBeDefined();
        expect(err.message).toContain('Invalid date format');
      });
    });

    it('should reject non-array availableLanguages', async () => {
      req.body = {
        availableLanguages: 'not-an-array'
      };
      
      await systemSettingsController.updateLocalizationSettings(req, res, (err) => {
        expect(err).toBeDefined();
        expect(err.message).toContain('must be an array');
      });
    });

    it('should reject invalid language in availableLanguages array', async () => {
      req.body = {
        availableLanguages: ['en', 'invalid', 'ar']
      };
      
      await systemSettingsController.updateLocalizationSettings(req, res, (err) => {
        expect(err).toBeDefined();
        expect(err.message).toContain('Invalid languages');
      });
    });
  });

  describe('getPublicSettings', () => {
    it('should return public settings including contactAddress', async () => {
      const mockSettings = {
        general: {
          siteName: 'Test Site',
          siteDescription: 'Test Description',
          siteLogo: '/logo.png',
          favicon: '/favicon.ico',
          contactEmail: 'test@example.com',
          contactPhone: '123-456-7890',
          contactAddress: '123 Test St',
          socialMedia: {
            facebook: 'https://facebook.com/test'
          }
        },
        localization: {
          defaultLanguage: 'en',
          defaultCurrency: 'USD'
        }
      };
      
      SystemSettings.getSettings = jest.fn().mockResolvedValue(mockSettings);
      
      await systemSettingsController.getPublicSettings(req, res, jest.fn());
      
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: {
          general: expect.objectContaining({
            contactAddress: '123 Test St'
          }),
          localization: mockSettings.localization
        }
      });
    });
  });
});
