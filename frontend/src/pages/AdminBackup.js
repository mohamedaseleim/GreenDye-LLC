import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Paper,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  CardActions,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  LinearProgress,
} from '@mui/material';
import {
  Backup as BackupIcon,
  CloudDownload as DownloadIcon,
  CloudUpload as UploadIcon,
  Delete as DeleteIcon,
  Restore as RestoreIcon,
  GetApp as ExportIcon,
  Refresh as RefreshIcon,
  Storage as DatabaseIcon,
  Description as FileIcon,
} from '@mui/icons-material';
import { toast } from 'react-toastify';
import adminService from '../services/adminService';

const AdminBackup = () => {
  const [loading, setLoading] = useState(true);
  const [backups, setBackups] = useState([]);
  const [exports, setExports] = useState([]);
  const [processing, setProcessing] = useState(false);
  const [openRestoreDialog, setOpenRestoreDialog] = useState(false);
  const [openImportDialog, setOpenImportDialog] = useState(false);
  const [selectedBackup, setSelectedBackup] = useState(null);
  const [selectedExport, setSelectedExport] = useState(null);
  const [importMode, setImportMode] = useState('merge');

  useEffect(() => {
    fetchBackupList();
  }, []);

  const fetchBackupList = async () => {
    try {
      setLoading(true);
      const response = await adminService.listBackups();
      setBackups(response.data.backups || []);
      setExports(response.data.exports || []);
    } catch (error) {
      console.error('Error fetching backup list:', error);
      toast.error('Failed to load backup list');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateBackup = async () => {
    if (processing) return;
    
    try {
      setProcessing(true);
      toast.info('Creating database backup... This may take a few minutes.');
      
      await adminService.createDatabaseBackup();
      
      toast.success('Database backup created successfully!');
      fetchBackupList();
    } catch (error) {
      console.error('Error creating backup:', error);
      toast.error(error.response?.data?.message || 'Failed to create backup');
    } finally {
      setProcessing(false);
    }
  };

  const handleExportData = async () => {
    if (processing) return;
    
    try {
      setProcessing(true);
      toast.info('Exporting all data... This may take a few minutes.');
      
      await adminService.exportAllData();
      
      toast.success('Data export completed successfully!');
      fetchBackupList();
    } catch (error) {
      console.error('Error exporting data:', error);
      toast.error(error.response?.data?.message || 'Failed to export data');
    } finally {
      setProcessing(false);
    }
  };

  const handleDownload = async (item, type) => {
    try {
      // Determine which service function to use based on type
      const blob = type === 'backup' 
        ? await adminService.downloadBackup(item.filename)
        : await adminService.downloadExport(item.filename);
      
      // Create download link
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.setAttribute('download', item.filename);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Clean up
      window.URL.revokeObjectURL(downloadUrl);
    } catch (error) {
      console.error('Download error:', error);
      toast.error('Failed to download file');
    }
  };

  const handleDelete = async (item, type) => {
    if (!window.confirm(`Are you sure you want to delete this ${type}?`)) {
      return;
    }
    
    try {
      await adminService.deleteBackupFile(type, item.filename);
      
      toast.success(`${type} deleted successfully!`);
      fetchBackupList();
    } catch (error) {
      console.error(`Error deleting ${type}:`, error);
      toast.error(error.response?.data?.message || `Failed to delete ${type}`);
    }
  };

  const handleRestoreBackup = async () => {
    if (!selectedBackup) return;
    
    try {
      setProcessing(true);
      toast.info('Restoring database... This may take a few minutes.');
      
      await adminService.restoreDatabase(selectedBackup.filename);
      
      toast.success('Database restored successfully!');
      setOpenRestoreDialog(false);
      setSelectedBackup(null);
    } catch (error) {
      console.error('Error restoring backup:', error);
      toast.error(error.response?.data?.message || 'Failed to restore backup');
    } finally {
      setProcessing(false);
    }
  };

  const handleImportData = async () => {
    if (!selectedExport) return;
    
    try {
      setProcessing(true);
      toast.info('Importing data... This may take a few minutes.');
      
      await adminService.importData(selectedExport.filename, importMode);
      
      toast.success('Data imported successfully!');
      setOpenImportDialog(false);
      setSelectedExport(null);
    } catch (error) {
      console.error('Error importing data:', error);
      toast.error(error.response?.data?.message || 'Failed to import data');
    } finally {
      setProcessing(false);
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold', color: 'primary.main' }}>
        Backup & Export Tools
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        Manage database backups, export data for GDPR compliance, and restore from backups.
      </Typography>

      {processing && <LinearProgress sx={{ mb: 2 }} />}

      <Grid container spacing={3} sx={{ mb: 4 }}>
        {/* Database Backup Card */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" mb={2}>
                <DatabaseIcon color="primary" sx={{ fontSize: 40, mr: 2 }} />
                <Typography variant="h6">Database Backup</Typography>
              </Box>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Create a complete backup of your MongoDB database. This includes all collections and documents.
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Note: Requires MongoDB tools (mongodump) to be installed on the server.
              </Typography>
            </CardContent>
            <CardActions>
              <Button
                variant="contained"
                startIcon={<BackupIcon />}
                onClick={handleCreateBackup}
                disabled={processing}
                fullWidth
              >
                Create Database Backup
              </Button>
            </CardActions>
          </Card>
        </Grid>

        {/* Data Export Card */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" mb={2}>
                <ExportIcon color="secondary" sx={{ fontSize: 40, mr: 2 }} />
                <Typography variant="h6">Export All Data</Typography>
              </Box>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Export all data as JSON files for GDPR compliance. Each collection is exported separately and as a combined file.
              </Typography>
              <Typography variant="caption" color="text.secondary">
                This export is suitable for data portability and compliance requirements.
              </Typography>
            </CardContent>
            <CardActions>
              <Button
                variant="contained"
                color="secondary"
                startIcon={<ExportIcon />}
                onClick={handleExportData}
                disabled={processing}
                fullWidth
              >
                Export All Data
              </Button>
            </CardActions>
          </Card>
        </Grid>
      </Grid>

      {/* Database Backups Table */}
      <Paper sx={{ mb: 4 }}>
        <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6">Database Backups</Typography>
          <IconButton onClick={fetchBackupList} disabled={loading}>
            <RefreshIcon />
          </IconButton>
        </Box>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Filename</TableCell>
                <TableCell>Size</TableCell>
                <TableCell>Created</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {backups.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} align="center">
                    No backups available
                  </TableCell>
                </TableRow>
              ) : (
                backups.map((backup) => (
                  <TableRow key={backup.filename}>
                    <TableCell>
                      <Box display="flex" alignItems="center">
                        <DatabaseIcon sx={{ mr: 1 }} fontSize="small" />
                        {backup.filename}
                      </Box>
                    </TableCell>
                    <TableCell>{formatFileSize(backup.size)}</TableCell>
                    <TableCell>{new Date(backup.created).toLocaleString()}</TableCell>
                    <TableCell align="right">
                      <IconButton
                        size="small"
                        onClick={() => handleDownload(backup, 'backup')}
                        title="Download"
                      >
                        <DownloadIcon />
                      </IconButton>
                      <IconButton
                        size="small"
                        color="primary"
                        onClick={() => {
                          setSelectedBackup(backup);
                          setOpenRestoreDialog(true);
                        }}
                        title="Restore"
                      >
                        <RestoreIcon />
                      </IconButton>
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => handleDelete(backup, 'backup')}
                        title="Delete"
                      >
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Data Exports Table */}
      <Paper>
        <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6">Data Exports (GDPR)</Typography>
          <IconButton onClick={fetchBackupList} disabled={loading}>
            <RefreshIcon />
          </IconButton>
        </Box>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Filename</TableCell>
                <TableCell>Size</TableCell>
                <TableCell>Created</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {exports.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} align="center">
                    No exports available
                  </TableCell>
                </TableRow>
              ) : (
                exports.map((exportItem) => (
                  <TableRow key={exportItem.filename}>
                    <TableCell>
                      <Box display="flex" alignItems="center">
                        <FileIcon sx={{ mr: 1 }} fontSize="small" />
                        {exportItem.filename}
                      </Box>
                    </TableCell>
                    <TableCell>{formatFileSize(exportItem.size)}</TableCell>
                    <TableCell>{new Date(exportItem.created).toLocaleString()}</TableCell>
                    <TableCell align="right">
                      <IconButton
                        size="small"
                        onClick={() => handleDownload(exportItem, 'export')}
                        title="Download"
                      >
                        <DownloadIcon />
                      </IconButton>
                      <IconButton
                        size="small"
                        color="primary"
                        onClick={() => {
                          setSelectedExport(exportItem);
                          setOpenImportDialog(true);
                        }}
                        title="Import"
                      >
                        <UploadIcon />
                      </IconButton>
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => handleDelete(exportItem, 'export')}
                        title="Delete"
                      >
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Restore Backup Dialog */}
      <Dialog open={openRestoreDialog} onClose={() => !processing && setOpenRestoreDialog(false)}>
        <DialogTitle>Restore Database Backup</DialogTitle>
        <DialogContent>
          <Alert severity="warning" sx={{ mb: 2 }}>
            This will replace all current database data with the backup. This action cannot be undone.
          </Alert>
          <Typography variant="body2">
            Are you sure you want to restore from: <strong>{selectedBackup?.filename}</strong>?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenRestoreDialog(false)} disabled={processing}>
            Cancel
          </Button>
          <Button
            onClick={handleRestoreBackup}
            color="primary"
            variant="contained"
            disabled={processing}
            startIcon={processing ? <CircularProgress size={20} /> : <RestoreIcon />}
          >
            {processing ? 'Restoring...' : 'Restore'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Import Data Dialog */}
      <Dialog open={openImportDialog} onClose={() => !processing && setOpenImportDialog(false)}>
        <DialogTitle>Import Data</DialogTitle>
        <DialogContent>
          <Alert severity="info" sx={{ mb: 2 }}>
            Choose how to import the data. "Merge" will add data to existing records, while "Replace" will delete all existing data first.
          </Alert>
          <Typography variant="body2" sx={{ mb: 2 }}>
            Import from: <strong>{selectedExport?.filename}</strong>
          </Typography>
          <FormControl fullWidth>
            <InputLabel>Import Mode</InputLabel>
            <Select
              value={importMode}
              onChange={(e) => setImportMode(e.target.value)}
              label="Import Mode"
            >
              <MenuItem value="merge">Merge (Add to existing data)</MenuItem>
              <MenuItem value="replace">Replace (Delete existing data)</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenImportDialog(false)} disabled={processing}>
            Cancel
          </Button>
          <Button
            onClick={handleImportData}
            color="primary"
            variant="contained"
            disabled={processing}
            startIcon={processing ? <CircularProgress size={20} /> : <UploadIcon />}
          >
            {processing ? 'Importing...' : 'Import'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default AdminBackup;
