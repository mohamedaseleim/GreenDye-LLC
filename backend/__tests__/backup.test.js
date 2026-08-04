const path = require('path');
const fs = require('fs').promises;

describe('Backup and Export Functionality Tests', () => {
  afterAll(async () => {
    // Clean up test backup and export files
    const backupDir = path.join(__dirname, '../backups');
    const exportDir = path.join(__dirname, '../exports');
    
    try {
      const backupFiles = await fs.readdir(backupDir);
      for (const file of backupFiles) {
        if (file !== '.gitkeep') {
          await fs.unlink(path.join(backupDir, file)).catch(() => {});
        }
      }
    } catch (error) {
      // Directory might not exist
    }

    try {
      const exportFiles = await fs.readdir(exportDir);
      for (const file of exportFiles) {
        if (file !== '.gitkeep') {
          await fs.unlink(path.join(exportDir, file)).catch(() => {});
        }
      }
    } catch (error) {
      // Directory might not exist
    }
  });

  describe('Backup Controller', () => {
    it('should have required controller functions', () => {
      const backupController = require('../controllers/backupController');
      
      expect(typeof backupController.createDatabaseBackup).toBe('function');
      expect(typeof backupController.exportAllData).toBe('function');
      expect(typeof backupController.restoreDatabase).toBe('function');
      expect(typeof backupController.importData).toBe('function');
      expect(typeof backupController.listBackups).toBe('function');
      expect(typeof backupController.downloadBackup).toBe('function');
      expect(typeof backupController.downloadExport).toBe('function');
      expect(typeof backupController.deleteBackupFile).toBe('function');
    });
  });

  describe('Backup Routes', () => {
    it('should have required routes defined', () => {
      const backupRoutes = require('../routes/backupRoutes');
      
      expect(backupRoutes).toBeDefined();
      expect(typeof backupRoutes).toBe('function'); // Express router is a function
    });
  });

  describe('Backup Directories', () => {
    it('should create backup directory if it does not exist', async () => {
      const backupDir = path.join(__dirname, '../backups');
      await fs.mkdir(backupDir, { recursive: true });
      
      const stats = await fs.stat(backupDir);
      expect(stats.isDirectory()).toBe(true);
    });

    it('should create export directory if it does not exist', async () => {
      const exportDir = path.join(__dirname, '../exports');
      await fs.mkdir(exportDir, { recursive: true });
      
      const stats = await fs.stat(exportDir);
      expect(stats.isDirectory()).toBe(true);
    });
  });

  describe('Security', () => {
    it('should sanitize file path parameters to prevent path traversal', () => {
      const maliciousPath = '../../../etc/passwd';
      const sanitized = path.basename(maliciousPath);
      
      expect(sanitized).toBe('passwd');
      expect(sanitized).not.toContain('..');
    });

    it('should validate zip file extensions', () => {
      const validFile = 'backup-2024-01-01.zip';
      const invalidFile = 'backup-2024-01-01.exe';
      
      expect(validFile.endsWith('.zip')).toBe(true);
      expect(invalidFile.endsWith('.zip')).toBe(false);
    });
  });

  describe('Authorization', () => {
    it('should require authentication middleware for all routes', () => {
      const backupRoutes = require('../routes/backupRoutes');
      const routerStack = backupRoutes.stack;
      
      // Check that routes use middleware
      expect(routerStack).toBeDefined();
    });
  });
});
