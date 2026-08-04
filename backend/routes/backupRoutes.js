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
router.use(protect, authorize('admin'));

// Create database backup
router.post('/database', createDatabaseBackup);

// Export all data (GDPR compliance)
router.post('/export', exportAllData);

// Restore database from backup
router.post('/restore', restoreDatabase);

// Import data from export
router.post('/import', importData);

// List available backups and exports
router.get('/list', listBackups);

// Download backup file
router.get('/download/:filename', downloadBackup);

// Download export file
router.get('/download-export/:filename', downloadExport);

// Delete backup or export file
router.delete('/:type/:filename', deleteBackupFile);

module.exports = router;
