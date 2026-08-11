const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
  createDatabaseBackup,
  exportAllData,
  restoreDatabase,
  importData,
  listBackups,
  downloadBackup,
  downloadExport,
  deleteBackupFile
} = require('../controllers/backupController');

// All routes require admin authorization
router.use(protect);

// Create database backup
router.post('/database', authorize('admin', 'super_admin'), createDatabaseBackup);

// Export all data (GDPR compliance)
router.post('/export', authorize('admin', 'super_admin'), exportAllData);

// Restore database from backup
router.post('/restore', authorize('super_admin'), restoreDatabase);

// Import data from export
router.post('/import', authorize('super_admin'), importData);

// List available backups and exports
router.get('/list', authorize('admin', 'super_admin'), listBackups);

// Download backup file
router.get('/download/:filename', authorize('super_admin'), downloadBackup);

// Download export file
router.get('/download-export/:filename', authorize('super_admin'), downloadExport);

// Delete backup or export file
router.delete('/:type/:filename', authorize('super_admin'), deleteBackupFile);

module.exports = router;
