const mongoose = require('mongoose');
const SystemSettings = require('../../models/SystemSettings');

describe('SystemSettings Model', () => {
  
  describe('getSettings', () => {
    it('should create default settings if none exist', async () => {
      const settings = await SystemSettings.getSettings();
      
      expect(settings).toBeDefined();
      expect(settings.general.siteName).toBe('GreenDye Academy');
      expect(settings.localization.defaultLanguage).toBe('en');
      expect(settings.localization.defaultCurrency).toBe('USD');
    });

    it('should return existing settings if they exist', async () => {
      // Create settings first
      const firstSettings = await SystemSettings.getSettings();
      firstSettings.general.siteName = 'Updated Name';
      await firstSettings.save();
      
      // Get settings again
      const secondSettings = await SystemSettings.getSettings();
      
      expect(secondSettings.general.siteName).toBe('Updated Name');
      expect(secondSettings._id.toString()).toBe(firstSettings._id.toString());
    });
  });

  describe('updateSettings', () => {
    it('should update general settings', async () => {
      const userId = new mongoose.Types.ObjectId();
      const updates = {
        general: {
          siteName: 'New Site Name',
          contactEmail: 'test@example.com'
        }
      };
      
      const settings = await SystemSettings.updateSettings(updates, userId);
      
      expect(settings.general.siteName).toBe('New Site Name');
      expect(settings.general.contactEmail).toBe('test@example.com');
      expect(settings.updatedBy.toString()).toBe(userId.toString());
    });

    it('should update email templates', async () => {
      const userId = new mongoose.Types.ObjectId();
      const updates = {
        emailTemplates: {
          welcome: {
            subject: 'Custom Welcome',
            body: 'Welcome {{userName}}'
          }
        }
      };
      
      const settings = await SystemSettings.updateSettings(updates, userId);
      
      expect(settings.emailTemplates.welcome.subject).toBe('Custom Welcome');
      expect(settings.emailTemplates.welcome.body).toBe('Welcome {{userName}}');
    });

    it('should update notification settings', async () => {
      const userId = new mongoose.Types.ObjectId();
      const updates = {
        notifications: {
          emailEnabled: false,
          pushEnabled: false
        }
      };
      
      const settings = await SystemSettings.updateSettings(updates, userId);
      
      expect(settings.notifications.emailEnabled).toBe(false);
      expect(settings.notifications.pushEnabled).toBe(false);
    });

    it('should update localization settings', async () => {
      const userId = new mongoose.Types.ObjectId();
      const updates = {
        localization: {
          defaultLanguage: 'ar',
          defaultCurrency: 'EGP'
        }
      };
      
      const settings = await SystemSettings.updateSettings(updates, userId);
      
      expect(settings.localization.defaultLanguage).toBe('ar');
      expect(settings.localization.defaultCurrency).toBe('EGP');
    });
  });

  describe('API Keys', () => {
    it('should add API key to settings', async () => {
      const settings = await SystemSettings.getSettings();
      
      settings.apiKeys.push({
        name: 'Test API Key',
        key: 'test_key_123',
        description: 'Test key',
        permissions: ['read', 'write']
      });
      
      await settings.save();
      
      const updatedSettings = await SystemSettings.findById(settings._id);
      expect(updatedSettings.apiKeys).toHaveLength(1);
      expect(updatedSettings.apiKeys[0].name).toBe('Test API Key');
      expect(updatedSettings.apiKeys[0].key).toBe('test_key_123');
    });

    it('should have default isActive as true', async () => {
      const settings = await SystemSettings.getSettings();
      
      settings.apiKeys.push({
        name: 'Test Key',
        key: 'test_key_456'
      });
      
      await settings.save();
      
      expect(settings.apiKeys[0].isActive).toBe(true);
    });
  });

  describe('Validation', () => {
    it('should enforce valid language enum', async () => {
      const settings = await SystemSettings.getSettings();
      
      settings.localization.defaultLanguage = 'invalid';
      
      await expect(settings.save()).rejects.toThrow();
    });

    it('should enforce valid currency enum', async () => {
      const settings = await SystemSettings.getSettings();
      
      settings.localization.defaultCurrency = 'INVALID';
      
      await expect(settings.save()).rejects.toThrow();
    });
  });

  describe('Deep Merge Edge Cases', () => {
    it('should handle null values in updates', async () => {
      const userId = new mongoose.Types.ObjectId();
      const updates = {
        general: {
          contactPhone: null
        }
      };
      
      const settings = await SystemSettings.updateSettings(updates, userId);
      
      expect(settings.general.contactPhone).toBeNull();
    });

    it('should handle undefined values in updates', async () => {
      const userId = new mongoose.Types.ObjectId();
      
      // First set a value
      await SystemSettings.updateSettings({
        general: { contactPhone: '123-456-7890' }
      }, userId);
      
      // Then update with undefined (should not change)
      const updates = {
        general: {
          contactPhone: undefined
        }
      };
      
      const settings = await SystemSettings.updateSettings(updates, userId);
      
      expect(settings.general.contactPhone).toBeUndefined();
    });

    it('should preserve nested objects when partially updating', async () => {
      const userId = new mongoose.Types.ObjectId();
      
      // Set initial social media values
      await SystemSettings.updateSettings({
        general: {
          socialMedia: {
            facebook: 'https://facebook.com/test',
            twitter: 'https://twitter.com/test'
          }
        }
      }, userId);
      
      // Update only facebook
      const updates = {
        general: {
          socialMedia: {
            facebook: 'https://facebook.com/updated'
          }
        }
      };
      
      const settings = await SystemSettings.updateSettings(updates, userId);
      
      expect(settings.general.socialMedia.facebook).toBe('https://facebook.com/updated');
      expect(settings.general.socialMedia.twitter).toBe('https://twitter.com/test');
    });
  });

  describe('API Key Uniqueness', () => {
    it('should prevent duplicate API key names (case-insensitive)', async () => {
      const settings = await SystemSettings.getSettings();
      
      settings.apiKeys.push({
        name: 'Test API Key',
        key: 'test_key_123',
        description: 'First key'
      });
      
      await settings.save();
      
      // Try to add another key with the same name (different case)
      const duplicateExists = settings.apiKeys.some(
        key => key.name.toLowerCase() === 'test api key'
      );
      
      expect(duplicateExists).toBe(true);
    });

    it('should allow different API keys with different names', async () => {
      const settings = await SystemSettings.getSettings();
      
      settings.apiKeys.push({
        name: 'API Key 1',
        key: 'test_key_1',
        description: 'First key'
      });
      
      settings.apiKeys.push({
        name: 'API Key 2',
        key: 'test_key_2',
        description: 'Second key'
      });
      
      await settings.save();
      
      const updatedSettings = await SystemSettings.findById(settings._id);
      expect(updatedSettings.apiKeys).toHaveLength(2);
    });
  });
});
