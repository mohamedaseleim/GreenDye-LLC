const asyncHandler = require('express-async-handler');
const { spawn } = require('child_process');
const fs = require('fs').promises;
const path = require('path');
const archiver = require('archiver');
const extract = require('extract-zip');
const mongoose = require('mongoose');

// Helper function to spawn a process and return a promise
const spawnPromise = (command, args) => {
  return new Promise((resolve, reject) => {
    const process = spawn(command, args);
    let stdout = '';
    let stderr = '';

    process.stdout.on('data', (data) => {
      stdout += data.toString();
    });

    process.stderr.on('data', (data) => {
      stderr += data.toString();
    });

    process.on('close', (code) => {
      if (code === 0) {
        resolve(stdout);
      } else {
        reject(new Error(`Process exited with code ${code}: ${stderr}`));
      }
    });

    process.on('error', (error) => {
      reject(error);
    });
  });
};

// Get all model names for data export
const getAllModelNames = () => {
  return Object.keys(mongoose.models);
};

// @desc    Create database backup
// @route   POST /api/admin/backup/database
// @access  Admin
const createDatabaseBackup = asyncHandler(async (req, res) => {
  const backupDir = path.join(__dirname, '../backups');
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupName = `backup-${timestamp}`;
  const backupPath = path.join(backupDir, backupName);

  try {
    // Ensure backup directory exists
    await fs.mkdir(backupDir, { recursive: true });

    // Get MongoDB connection URI
    const mongoUri = process.env.MONGODB_URI;
    
    // Execute mongodump command with spawn for security
    await spawnPromise('mongodump', [
      `--uri=${mongoUri}`,
      `--out=${backupPath}`
    ]);

    // Create a ZIP archive of the backup
    const zipPath = `${backupPath}.zip`;
    const output = require('fs').createWriteStream(zipPath);
    const archive = archiver('zip', { zlib: { level: 9 } });

    await new Promise((resolve, reject) => {
      output.on('close', resolve);
      archive.on('error', reject);
      archive.pipe(output);
      archive.directory(backupPath, false);
      archive.finalize();
    });

    // Remove the uncompressed backup directory
    await fs.rm(backupPath, { recursive: true, force: true });

    res.status(200).json({
      success: true,
      message: 'Database backup created successfully',
      data: {
        filename: `${backupName}.zip`,
        path: `/api/admin/backup/download/${backupName}.zip`,
        size: (await fs.stat(zipPath)).size,
        timestamp: new Date()
      }
    });
  } catch (error) {
    console.error('Backup error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create database backup',
      error: error.message
    });
  }
});

// @desc    Export all data (GDPR compliance)
// @route   POST /api/admin/backup/export
// @access  Admin
const exportAllData = asyncHandler(async (req, res) => {
  const exportDir = path.join(__dirname, '../exports');
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const exportName = `export-${timestamp}`;
  const exportPath = path.join(exportDir, exportName);

  try {
    // Ensure export directory exists
    await fs.mkdir(exportPath, { recursive: true });

    // Get all models
    const modelNames = getAllModelNames();
    const exportData = {};

    // Export data from each model
    for (const modelName of modelNames) {
      const Model = mongoose.model(modelName);
      const data = await Model.find({}).lean();
      exportData[modelName] = data;
      
      // Save individual collection as JSON
      await fs.writeFile(
        path.join(exportPath, `${modelName}.json`),
        JSON.stringify(data, null, 2)
      );
    }

    // Save combined export as JSON
    await fs.writeFile(
      path.join(exportPath, 'complete-export.json'),
      JSON.stringify(exportData, null, 2)
    );

    // Create metadata file
    const metadata = {
      exportDate: new Date().toISOString(),
      modelCount: modelNames.length,
      models: modelNames,
      totalRecords: Object.values(exportData).reduce((sum, arr) => sum + arr.length, 0)
    };
    await fs.writeFile(
      path.join(exportPath, 'metadata.json'),
      JSON.stringify(metadata, null, 2)
    );

    // Create a ZIP archive
    const zipPath = `${exportPath}.zip`;
    const output = require('fs').createWriteStream(zipPath);
    const archive = archiver('zip', { zlib: { level: 9 } });

    await new Promise((resolve, reject) => {
      output.on('close', resolve);
      archive.on('error', reject);
      archive.pipe(output);
      archive.directory(exportPath, false);
      archive.finalize();
    });

    // Remove the uncompressed export directory
    await fs.rm(exportPath, { recursive: true, force: true });

    res.status(200).json({
      success: true,
      message: 'Data export completed successfully',
      data: {
        filename: `${exportName}.zip`,
        path: `/api/admin/backup/download-export/${exportName}.zip`,
        size: (await fs.stat(zipPath)).size,
        timestamp: new Date(),
        metadata
      }
    });
  } catch (error) {
    console.error('Export error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to export data',
      error: error.message
    });
  }
});

// @desc    Restore database from backup
// @route   POST /api/admin/backup/restore
// @access  Admin
const restoreDatabase = asyncHandler(async (req, res) => {
  const { filename } = req.body;

  if (!filename) {
    res.status(400);
    throw new Error('Backup filename is required');
  }
  
  // Sanitize filename to prevent path traversal
  const sanitizedFilename = path.basename(filename);

  const backupDir = path.join(__dirname, '../backups');
  const backupPath = path.join(backupDir, sanitizedFilename);
  const extractPath = path.join(backupDir, `extract-${Date.now()}`);
  
  // Verify file is within backup directory
  if (!backupPath.startsWith(backupDir)) {
    res.status(403);
    throw new Error('Access denied');
  }

  try {
    // Verify backup file exists
    await fs.access(backupPath);

    // Extract the backup
    await extract(backupPath, { dir: extractPath });

    // Find the database directory in the extracted files
    const files = await fs.readdir(extractPath);
    const dbDir = path.join(extractPath, files[0] || '');

    // Get MongoDB connection URI
    const mongoUri = process.env.MONGODB_URI;

    // Execute mongorestore command with spawn for security
    await spawnPromise('mongorestore', [
      `--uri=${mongoUri}`,
      '--drop',
      dbDir
    ]);

    // Clean up extracted files
    await fs.rm(extractPath, { recursive: true, force: true });

    res.status(200).json({
      success: true,
      message: 'Database restored successfully',
      data: {
        filename: sanitizedFilename,
        timestamp: new Date()
      }
    });
  } catch (error) {
    console.error('Restore error:', error);
    
    // Clean up on error
    try {
      await fs.rm(extractPath, { recursive: true, force: true });
    } catch (cleanupError) {
      console.error('Cleanup error:', cleanupError);
    }

    res.status(500).json({
      success: false,
      message: 'Failed to restore database',
      error: error.message
    });
  }
});

// @desc    Import data from export
// @route   POST /api/admin/backup/import
// @access  Admin
const importData = asyncHandler(async (req, res) => {
  const { filename, mode = 'merge' } = req.body;

  if (!filename) {
    res.status(400);
    throw new Error('Export filename is required');
  }
  
  // Sanitize filename to prevent path traversal
  const sanitizedFilename = path.basename(filename);

  const exportDir = path.join(__dirname, '../exports');
  const exportPath = path.join(exportDir, sanitizedFilename);
  const extractPath = path.join(exportDir, `extract-${Date.now()}`);
  
  // Verify file is within export directory
  if (!exportPath.startsWith(exportDir)) {
    res.status(403);
    throw new Error('Access denied');
  }

  try {
    // Verify export file exists
    await fs.access(exportPath);

    // Extract the export
    await extract(exportPath, { dir: extractPath });

    // Read metadata
    const metadataPath = path.join(extractPath, 'metadata.json');
    const metadata = JSON.parse(await fs.readFile(metadataPath, 'utf-8'));

    const importResults = {};

    // Import data for each model
    for (const modelName of metadata.models) {
      try {
        const Model = mongoose.model(modelName);
        const dataPath = path.join(extractPath, `${modelName}.json`);
        const data = JSON.parse(await fs.readFile(dataPath, 'utf-8'));

        if (mode === 'replace') {
          // Delete all existing records
          await Model.deleteMany({});
          
          // Insert new records
          if (data.length > 0) {
            await Model.insertMany(data);
          }
          
          importResults[modelName] = {
            success: true,
            count: data.length,
            inserted: data.length,
            skipped: 0
          };
        } else {
          // Merge mode: upsert records individually to handle duplicates
          let inserted = 0;
          let skipped = 0;
          
          for (const record of data) {
            try {
              // Use updateOne with upsert for merge mode
              const { _id, ...updateData } = record;
              if (_id) {
                await Model.updateOne(
                  { _id },
                  { $set: updateData },
                  { upsert: true }
                );
                inserted++;
              } else {
                // If no _id, create new record
                await Model.create(record);
                inserted++;
              }
            } catch (recordError) {
              // Skip records that fail (e.g., duplicates, validation errors)
              skipped++;
            }
          }
          
          importResults[modelName] = {
            success: true,
            count: data.length,
            inserted,
            skipped
          };
        }
      } catch (modelError) {
        importResults[modelName] = {
          success: false,
          error: modelError.message
        };
      }
    }

    // Clean up extracted files
    await fs.rm(extractPath, { recursive: true, force: true });

    const successCount = Object.values(importResults).filter(r => r.success).length;
    const failureCount = Object.values(importResults).filter(r => !r.success).length;

    res.status(200).json({
      success: true,
      message: `Data import completed: ${successCount} collections successful, ${failureCount} failed`,
      data: {
        filename: sanitizedFilename,
        mode,
        timestamp: new Date(),
        results: importResults
      }
    });
  } catch (error) {
    console.error('Import error:', error);
    
    // Clean up on error
    try {
      await fs.rm(extractPath, { recursive: true, force: true });
    } catch (cleanupError) {
      console.error('Cleanup error:', cleanupError);
    }

    res.status(500).json({
      success: false,
      message: 'Failed to import data',
      error: error.message
    });
  }
});

// @desc    List available backups
// @route   GET /api/admin/backup/list
// @access  Admin
const listBackups = asyncHandler(async (req, res) => {
  const backupDir = path.join(__dirname, '../backups');
  const exportDir = path.join(__dirname, '../exports');

  try {
    // Ensure directories exist
    await fs.mkdir(backupDir, { recursive: true });
    await fs.mkdir(exportDir, { recursive: true });

    // List backup files
    const backupFiles = await fs.readdir(backupDir);
    const backups = await Promise.all(
      backupFiles
        .filter(file => file.endsWith('.zip'))
        .map(async (file) => {
          const filePath = path.join(backupDir, file);
          const stats = await fs.stat(filePath);
          return {
            filename: file,
            type: 'backup',
            size: stats.size,
            created: stats.birthtime,
            path: `/api/admin/backup/download/${file}`
          };
        })
    );

    // List export files
    const exportFiles = await fs.readdir(exportDir);
    const exports = await Promise.all(
      exportFiles
        .filter(file => file.endsWith('.zip'))
        .map(async (file) => {
          const filePath = path.join(exportDir, file);
          const stats = await fs.stat(filePath);
          return {
            filename: file,
            type: 'export',
            size: stats.size,
            created: stats.birthtime,
            path: `/api/admin/backup/download-export/${file}`
          };
        })
    );

    res.status(200).json({
      success: true,
      data: {
        backups: backups.sort((a, b) => b.created - a.created),
        exports: exports.sort((a, b) => b.created - a.created)
      }
    });
  } catch (error) {
    console.error('List backups error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to list backups',
      error: error.message
    });
  }
});

// @desc    Download backup file
// @route   GET /api/admin/backup/download/:filename
// @access  Admin
const downloadBackup = asyncHandler(async (req, res) => {
  const { filename } = req.params;
  
  // Sanitize filename to prevent path traversal
  const sanitizedFilename = path.basename(filename);
  
  const backupDir = path.join(__dirname, '../backups');
  const filePath = path.join(backupDir, sanitizedFilename);
  
  // Verify file is within backup directory
  if (!filePath.startsWith(backupDir)) {
    res.status(403);
    throw new Error('Access denied');
  }

  try {
    // Verify file exists
    await fs.access(filePath);

    res.download(filePath, sanitizedFilename);
  } catch (error) {
    res.status(404).json({
      success: false,
      message: 'Backup file not found'
    });
  }
});

// @desc    Download export file
// @route   GET /api/admin/backup/download-export/:filename
// @access  Admin
const downloadExport = asyncHandler(async (req, res) => {
  const { filename } = req.params;
  
  // Sanitize filename to prevent path traversal
  const sanitizedFilename = path.basename(filename);
  
  const exportDir = path.join(__dirname, '../exports');
  const filePath = path.join(exportDir, sanitizedFilename);
  
  // Verify file is within export directory
  if (!filePath.startsWith(exportDir)) {
    res.status(403);
    throw new Error('Access denied');
  }

  try {
    // Verify file exists
    await fs.access(filePath);

    res.download(filePath, sanitizedFilename);
  } catch (error) {
    res.status(404).json({
      success: false,
      message: 'Export file not found'
    });
  }
});

// @desc    Delete backup or export file
// @route   DELETE /api/admin/backup/:type/:filename
// @access  Admin
const deleteBackupFile = asyncHandler(async (req, res) => {
  const { type, filename } = req.params;
  
  if (type !== 'backup' && type !== 'export') {
    res.status(400);
    throw new Error('Invalid type. Must be "backup" or "export"');
  }
  
  // Sanitize filename to prevent path traversal
  const sanitizedFilename = path.basename(filename);

  const baseDir = type === 'backup' 
    ? path.join(__dirname, '../backups')
    : path.join(__dirname, '../exports');
  const filePath = path.join(baseDir, sanitizedFilename);
  
  // Verify file is within the appropriate directory
  if (!filePath.startsWith(baseDir)) {
    res.status(403);
    throw new Error('Access denied');
  }

  try {
    // Verify file exists
    await fs.access(filePath);

    // Delete the file
    await fs.unlink(filePath);

    res.status(200).json({
      success: true,
      message: `${type} file deleted successfully`,
      data: { filename: sanitizedFilename }
    });
  } catch (error) {
    res.status(404).json({
      success: false,
      message: `${type} file not found`
    });
  }
});

module.exports = {
  createDatabaseBackup,
  exportAllData,
  restoreDatabase,
  importData,
  listBackups,
  downloadBackup,
  downloadExport,
  deleteBackupFile
};
