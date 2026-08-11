# Backup & Export Tools Documentation

## Overview

The Backup & Export Tools feature provides administrators with comprehensive data management capabilities, including database backups, data exports for GDPR compliance, and restore/import functionality.

## Features

### 1. Database Backup
Creates a complete backup of the MongoDB database using `mongodump`.

- **Endpoint**: `POST /api/admin/backup/database`
- **Access**: Admin only
- **Requirements**: MongoDB tools (`mongodump`) must be installed on the server
- **Output**: ZIP file containing the complete database backup

**Usage**:
```bash
curl -X POST http://localhost:5000/api/admin/backup/database \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

### 2. Export All Data (GDPR Compliance)
Exports all data from all collections as JSON files.

- **Endpoint**: `POST /api/admin/backup/export`
- **Access**: Admin only
- **Output**: ZIP file containing:
  - Individual JSON files for each collection
  - `complete-export.json` with all data combined
  - `metadata.json` with export information

**Usage**:
```bash
curl -X POST http://localhost:5000/api/admin/backup/export \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

### 3. Restore Database
Restores the database from a backup file using `mongorestore`.

- **Endpoint**: `POST /api/admin/backup/restore`
- **Access**: Admin only
- **Requirements**: MongoDB tools (`mongorestore`) must be installed on the server
- **Warning**: This will replace all current database data

**Usage**:
```bash
curl -X POST http://localhost:5000/api/admin/backup/restore \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"filename": "backup-2024-01-01.zip"}'
```

### 4. Import Data
Imports data from an export file.

- **Endpoint**: `POST /api/admin/backup/import`
- **Access**: Admin only
- **Modes**:
  - `merge`: Adds data to existing records (default)
  - `replace`: Deletes existing data before importing

**Usage**:
```bash
curl -X POST http://localhost:5000/api/admin/backup/import \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"filename": "export-2024-01-01.zip", "mode": "merge"}'
```

### 5. List Backups and Exports
Lists all available backup and export files.

- **Endpoint**: `GET /api/admin/backup/list`
- **Access**: Admin only

**Usage**:
```bash
curl -X GET http://localhost:5000/api/admin/backup/list \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

### 6. Download Backup
Downloads a backup file.

- **Endpoint**: `GET /api/admin/backup/download/:filename`
- **Access**: Admin only

**Usage**:
```bash
curl -X GET http://localhost:5000/api/admin/backup/download/backup-2024-01-01.zip \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -o backup.zip
```

### 7. Download Export
Downloads an export file.

- **Endpoint**: `GET /api/admin/backup/download-export/:filename`
- **Access**: Admin only

**Usage**:
```bash
curl -X GET http://localhost:5000/api/admin/backup/download-export/export-2024-01-01.zip \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -o export.zip
```

### 8. Delete Backup or Export
Deletes a backup or export file.

- **Endpoint**: `DELETE /api/admin/backup/:type/:filename`
- **Access**: Admin only
- **Types**: `backup` or `export`

**Usage**:
```bash
curl -X DELETE http://localhost:5000/api/admin/backup/backup/backup-2024-01-01.zip \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

## Admin UI

The admin UI is accessible at `/admin/backup` and provides:

- **Quick Actions**:
  - Create Database Backup button
  - Export All Data button

- **Backups Table**:
  - Lists all database backups
  - Download, restore, and delete options for each backup

- **Exports Table**:
  - Lists all data exports
  - Download, import, and delete options for each export

## Security Features

1. **Authentication**: All endpoints require admin authentication
2. **Path Traversal Protection**: Filenames are sanitized using `path.basename()`
3. **Directory Validation**: File paths are verified to be within the appropriate directory
4. **Access Control**: Only admins can access backup/export functionality

## File Storage

- **Backups**: Stored in `backend/backups/`
- **Exports**: Stored in `backend/exports/`
- Both directories are excluded from version control via `.gitignore`

## GDPR Compliance

The export functionality supports GDPR compliance by:

1. **Data Portability**: Exports all user data in a machine-readable format (JSON)
2. **Complete Export**: Includes all collections and documents
3. **Metadata**: Provides export date, model count, and total records
4. **Individual Collections**: Each collection is exported separately for granular access

## Server Requirements

### For Database Backup/Restore:
- MongoDB tools must be installed:
  - `mongodump` for backups
  - `mongorestore` for restores

Install on Ubuntu:
```bash
sudo apt-get install -y mongodb-org-tools
```

### For Data Export/Import:
- No additional tools required (uses native Node.js and Mongoose)

## Best Practices

1. **Regular Backups**: Schedule regular database backups (e.g., daily, weekly)
2. **Test Restores**: Periodically test restore procedures to ensure backups are valid
3. **Secure Storage**: Keep backup files in secure, encrypted storage
4. **Off-site Copies**: Maintain off-site copies of critical backups
5. **Retention Policy**: Implement a backup retention policy to manage storage
6. **GDPR Requests**: Use data export for responding to GDPR data portability requests

## Troubleshooting

### "mongodump: command not found"
- MongoDB tools are not installed. Install them using your package manager.

### "Failed to create backup"
- Check MongoDB connection string in environment variables
- Verify MongoDB server is running and accessible
- Check disk space for backup directory

### "Failed to export data"
- Check disk space for export directory
- Verify database connection is established
- Check application logs for specific error messages

### Restore/Import Issues
- Ensure the file exists in the appropriate directory
- Verify the file is a valid ZIP archive
- Check that the ZIP contains the expected structure

## File Structure

### Database Backup ZIP:
```
backup-2024-01-01.zip
├── greendye/           # Database name
│   ├── users.bson
│   ├── users.metadata.json
│   ├── courses.bson
│   ├── courses.metadata.json
│   └── ...
```

### Data Export ZIP:
```
export-2024-01-01.zip
├── User.json           # Individual collection
├── Course.json
├── ...
├── complete-export.json  # All data combined
└── metadata.json       # Export information
```

## Environment Variables

No additional environment variables are required. The feature uses the existing `MONGODB_URI` for backup and restore operations.

## Error Handling

All endpoints return standardized error responses:

```json
{
  "success": false,
  "message": "Error description",
  "error": "Detailed error message"
}
```

## Rate Limiting

Backup and export operations are resource-intensive. Consider implementing:
- Rate limiting for these endpoints
- Queue system for multiple concurrent operations
- Monitoring for long-running operations

## Future Enhancements

Potential improvements:
1. Scheduled automatic backups
2. Cloud storage integration (AWS S3, Google Cloud Storage)
3. Email notifications on backup completion
4. Incremental backups
5. Backup verification and integrity checks
6. Backup encryption
7. Multi-database support
8. Backup rotation and cleanup policies
