import { reportError } from '../services/errorReporter';
import { parseCsv, downloadBlob } from '../utils/csv';
import { isAdministrator } from '../utils/roles';
import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Paper,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  TextField,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  Chip,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  CircularProgress,
  Alert
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Refresh as RefreshIcon,
  Block as BlockIcon,
  Restore as RestoreIcon,
  FileDownload as DownloadIcon,
  Upload as UploadIcon,
  Edit as EditIcon,
  QrCode as QrCodeIcon
} from '@mui/icons-material';
import { toast } from 'react-toastify';
import adminService from '../services/adminService';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const AdminCertificates = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(20);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState('');
  const [filterValid, setFilterValid] = useState('');
  const [filterRevoked, setFilterRevoked] = useState('');
  const [openBulkDialog, setOpenBulkDialog] = useState(false);
  const [bulkData, setBulkData] = useState('');
  const [openCreateDialog, setOpenCreateDialog] = useState(false);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [openQrDialog, setOpenQrDialog] = useState(false);
  const [selectedCertificate, setSelectedCertificate] = useState(null);
  const [users, setUsers] = useState([]);
  const [credentials, setCredentials] = useState([]);
  const [formData, setFormData] = useState({
    userId: '',
    credentialReference: '',
    recipientName: '',
    credentialTitle: '',
    certificateLevel: '',
    grade: '',
    score: '',
    assessorName: '',
    scheme: '',
    heldOn: '',
    duration: '',
    heldIn: '',
    issuedBy: 'GreenDye for Training and Consultancy',
    completionDate: '',
    issueDate: '',
    expiryDate: ''
  });

  useEffect(() => {
    if (!isAdministrator(user)) {
      navigate('/');
      return;
    }
    fetchCertificates();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, navigate, page, rowsPerPage, search, filterValid, filterRevoked]);

const fetchCertificates = async (pageOverride) => {
    try {
      setLoading(true);
      const currentPage = pageOverride !== undefined ? pageOverride : page;
      
      // إعداد الباراميترات الأساسية
      const params = {
        page: currentPage + 1,
        limit: rowsPerPage,
        search
      };
      
      // إضافة الفلاتر فقط إذا كان لها قيمة (مثل صفحة المدربين)
      if (filterValid !== '') {
        params.isValid = filterValid;
      }
      
      if (filterRevoked !== '') {
        params.isRevoked = filterRevoked;
      }
      
      const response = await adminService.getAllCertificates(params);
      setCertificates(response.data || []);
      setTotal(response.total || 0);
    } catch (error) {
      toast.error('Failed to fetch certificates');
      reportError('frontend.error', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (event, newPage) => {
    setPage(newPage);
  };

  const handleRowsPerPageChange = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleSearchChange = (event) => {
    setSearch(event.target.value);
    setPage(0);
  };

  const handleRevoke = async (id) => {
    const reason=window.prompt('Enter the revocation reason');
    if(!reason?.trim())return;

    try {
      await adminService.revokeCertificate(id, reason.trim());
      toast.success('Certificate revoked successfully');
      fetchCertificates();
    } catch (error) {
      toast.error('Failed to revoke certificate');
      reportError('frontend.error', error);
    }
  };

  const handleRestore = async (id) => {
    try {
      await adminService.restoreCertificate(id);
      toast.success('Certificate restored successfully');
      fetchCertificates();
    } catch (error) {
      toast.error('Failed to restore certificate');
      reportError('frontend.error', error);
    }
  };

  const handleDelete = async (id) => {
    const reason=window.prompt('Enter the archival/deletion reason');
    if(!reason?.trim())return;

    try {
      await adminService.deleteCertificate(id, reason.trim());
      toast.success('Credential removed from active records successfully');
      fetchCertificates();
    } catch (error) {
      toast.error('Failed to delete certificate');
      reportError('frontend.error', error);
    }
  };

  const handleOpenEditDialog = (cert) => {
    setSelectedCertificate(cert);
    setFormData({
      userId: cert.user?._id || '',
      credentialReference: cert.credentialReference || '',
      recipientName: cert.recipientName || cert.userName || '',
      credentialTitle: cert.credentialTitle || '',
      certificateLevel: cert.certificateLevel || '',
      grade: cert.grade || '',
      score: cert.score || '',
      assessorName: cert.metadata?.instructor || '',
      scheme: cert.metadata?.scheme || '',
      heldOn: cert.metadata?.heldOn ? new Date(cert.metadata.heldOn).toISOString().split('T')[0] : '',
      duration: cert.metadata?.duration || '',
      heldIn: cert.metadata?.heldIn || '',
      issuedBy: cert.metadata?.issuedBy || 'GreenDye for Training and Consultancy',
      completionDate: cert.completionDate ? new Date(cert.completionDate).toISOString().split('T')[0] : '',
      issueDate: cert.issueDate ? new Date(cert.issueDate).toISOString().split('T')[0] : '',
      expiryDate: cert.expiryDate ? new Date(cert.expiryDate).toISOString().split('T')[0] : ''
    });
    setOpenEditDialog(true);
    // Fetch data asynchronously after opening dialog - errors are handled in fetchUsers/fetchCredentials
    Promise.all([fetchUsers(), fetchCredentials()]).catch(err => {
      reportError('frontend.error', err);
      // User will already see error toasts from fetchUsers/fetchCredentials
    });
  };

  const handleCloseEditDialog = () => {
    setOpenEditDialog(false);
    setSelectedCertificate(null);
    setFormData({
      userId: '',
      credentialReference: '',
      recipientName: '',
      credentialTitle: '',
      certificateLevel: '',
      grade: '',
      score: '',
      assessorName: '',
      scheme: '',
      heldOn: '',
      duration: '',
      heldIn: '',
      issuedBy: 'GreenDye for Training and Consultancy',
      completionDate: '',
      issueDate: '',
      expiryDate: ''
    });
  };

  const handleUpdateCertificate = async () => {
    try {
      // Validate score if provided
      const scoreError = validateScore(formData.score);
      if (scoreError) {
        toast.error(scoreError);
        return;
      }

      // Validate duration if provided
      const durationError = validateDuration(formData.duration);
      if (durationError) {
        toast.error(durationError);
        return;
      }

      // Prepare data - only include fields that have values
      const data = {};

      // Add all optional fields if provided
      if (formData.credentialReference) data.credentialReference = formData.credentialReference;
      if (formData.recipientName) data.recipientName = formData.recipientName;
      if (formData.credentialTitle) data.credentialTitle = formData.credentialTitle;
      if (formData.certificateLevel) data.certificateLevel = formData.certificateLevel;
      if (formData.grade) data.grade = formData.grade;
      if (formData.score) data.score = parseFloat(formData.score);
      if (formData.assessorName) data.assessorName = formData.assessorName;
      data.metadata = {
        ...(formData.scheme && { scheme: formData.scheme }),
        ...(formData.heldOn && { heldOn: formData.heldOn }),
        ...(formData.duration && { duration: parseFloat(formData.duration) }),
        ...(formData.heldIn && { heldIn: formData.heldIn })
      };
      if (formData.completionDate) data.completionDate = formData.completionDate;
      if (formData.issueDate) data.issueDate = formData.issueDate;
      // Allow clearing expiry date by setting to null if empty string
      if (formData.expiryDate) {
        data.expiryDate = formData.expiryDate;
      } else if (formData.expiryDate === '') {
        data.expiryDate = null;
      }

      await adminService.updateCertificate(selectedCertificate._id, data);
      toast.success('Certificate updated successfully');
      handleCloseEditDialog();
      fetchCertificates();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update certificate');
      reportError('frontend.error', error);
    }
  };

  const handleShowQrCode = (cert) => {
    setSelectedCertificate(cert);
    setOpenQrDialog(true);
  };

  const handleRegenerate = async (id) => {
    try {
      await adminService.regenerateCertificate(id);
      toast.success('Certificate regenerated successfully');
      fetchCertificates();
    } catch (error) {
      toast.error('Failed to regenerate certificate');
      reportError('frontend.error', error);
    }
  };

  const handleExport = async () => {
    try {
      const response = await adminService.exportCertificates({
        format: 'csv',
        isValid: filterValid,
        isRevoked: filterRevoked
      });
      
      downloadBlob(response, `greendye-credentials-${new Date().toISOString().slice(0,10)}.csv`);
      toast.success('Export completed');
    } catch (error) {
      toast.error('Failed to export certificates');
      reportError('frontend.error', error);
    }
  };

  const handleBulkUpload = async () => {
    try {
      const rows = parseCsv(bulkData.trim());
      if (rows.length < 2) throw new Error('CSV must contain a header and at least one record');
      const headers = rows[0].map(value => value.trim());
      const required = ['credentialTitle', 'credentialReference'];
      if (required.some(name => !headers.includes(name))) throw new Error(`CSV headers must include ${required.join(' and ')}`);
      const credentials = rows.slice(1).map((values, rowIndex) => {
        const record = Object.fromEntries(headers.map((name, index) => [name, values[index]?.trim() || '']));
        if (!record.credentialTitle || !record.credentialReference || (!record.recipientEmail && !record.recipientName)) throw new Error(`Missing required value on row ${rowIndex + 2}`);
        return {
          recipientEmail: record.recipientEmail || undefined,
          recipientName: record.recipientName || undefined,
          credentialTitle: record.credentialTitle,
          credentialReference: record.credentialReference,
          certificateType: record.credentialType || 'professional',
          certificateLevel: record.credentialLevel || undefined,
          grade: record.grade || undefined,
          score: record.score === '' ? undefined : Number(record.score),
          issueDate: record.issueDate || undefined,
          expiryDate: record.expiryDate || undefined,
          assessorName: record.assessorName || undefined
        };
      });

      const response = await adminService.bulkUploadCertificates(credentials);
            toast.success(`Uploaded ${response.data.inserted.length} certificates. ${response.data.failed.length} failed.`);
      setOpenBulkDialog(false);
      setBulkData('');
      fetchCertificates();
    } catch (error) {
      toast.error('Failed to bulk upload certificates');
      reportError('frontend.error', error);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await adminService.getCredentialRecipients();
      setUsers(response.data || []);
    } catch (error) {
      reportError('frontend.error', error);
      toast.error('Failed to fetch users');
    }
  };

  const fetchCredentials = async () => {
    try {
      const response = await adminService.getAllCredentialsForEnrollment();
      setCredentials(response.data || []);
    } catch (error) {
      reportError('frontend.error', error);
      toast.error('Failed to fetch credentials');
    }
  };

  const handleOpenCreateDialog = () => {
    setOpenCreateDialog(true);
    // Fetch data asynchronously after opening dialog
    // Errors are already handled in fetchUsers and fetchCredentials with toast messages
    Promise.all([fetchUsers(), fetchCredentials()]);
  };

  const handleCloseCreateDialog = () => {
    setOpenCreateDialog(false);
    setFormData({
      userId: '',
      credentialReference: '',
      recipientName: '',
      credentialTitle: '',
      certificateLevel: '',
      grade: '',
      score: '',
      assessorName: '',
      scheme: '',
      heldOn: '',
      duration: '',
      heldIn: '',
      issuedBy: 'GreenDye for Training and Consultancy',
      completionDate: '',
      issueDate: '',
      expiryDate: ''
    });
  };

  const handleFormChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const getCredentialDisplayTitle = (credential) => {
    return credential.title?.en || credential.title?.default || credential.title || 'Untitled Credential';
  };

   const validateScore = (scoreString) => {
    // التحويل إلى نص لضمان عدم حدوث خطأ مع الأرقام
    const strVal = String(scoreString !== undefined && scoreString !== null ? scoreString : '');
    
    if (!strVal.trim()) return null; // No score provided is valid
    
    const scoreValue = parseFloat(strVal);
    if (isNaN(scoreValue) || scoreValue < 0 || scoreValue > 100) {
      return 'Score must be a valid number between 0 and 100';
    }
    return null; // Valid score
  };
  
  const validateDuration = (durationString) => {
    // التحويل إلى نص لضمان عدم حدوث خطأ مع الأرقام
    const strVal = String(durationString !== undefined && durationString !== null ? durationString : '');
    
    if (!strVal.trim()) return null; // No duration provided is valid
    
    const durationValue = parseFloat(strVal);
    if (isNaN(durationValue) || durationValue < 0) {
      return 'Duration must be a valid positive number';
    }
    return null; // Valid duration
  };

  const handleCreateCertificate = async () => {
    try {
      // Validation - no longer require userId and credentialReference
      // But at least one identifier should be provided
      if (!formData.userId && !formData.recipientName) {
        toast.error('Please provide either a user selection or recipient name');
        return;
      }

      if (!formData.credentialReference || !formData.credentialTitle) {
        toast.error('Credential reference and credential title are required');
        return;
      }

      // Validate score if provided
      const scoreError = validateScore(formData.score);
      if (scoreError) {
        toast.error(scoreError);
        return;
      }

      // Validate duration if provided
      const durationError = validateDuration(formData.duration);
      if (durationError) {
        toast.error(durationError);
        return;
      }

      // Prepare data - only include fields that have values
      const data = {};

      // Add user and credential if selected
      if (formData.userId) data.user = formData.userId;
      if (formData.credentialReference) data.credentialReference = formData.credentialReference;

      // Add all optional fields if provided
      if (formData.recipientName) data.recipientName = formData.recipientName;
      if (formData.credentialTitle) data.credentialTitle = formData.credentialTitle;
      if (formData.certificateLevel) data.certificateLevel = formData.certificateLevel;
      if (formData.grade) data.grade = formData.grade;
      if (formData.score) data.score = parseFloat(formData.score);
      if (formData.assessorName) data.assessorName = formData.assessorName;
      data.metadata = {
        ...(formData.scheme && { scheme: formData.scheme }),
        ...(formData.heldOn && { heldOn: formData.heldOn }),
        ...(formData.duration && { duration: parseFloat(formData.duration) }),
        ...(formData.heldIn && { heldIn: formData.heldIn })
      };
      if (formData.completionDate) data.completionDate = formData.completionDate;
      if (formData.issueDate) data.issueDate = formData.issueDate;
      if (formData.expiryDate) data.expiryDate = formData.expiryDate;

      await adminService.createCertificate(data);
      toast.success('Certificate created successfully');
      
      // Close the dialog first
      handleCloseCreateDialog();
      
      // Fetch page 0 (which shows as page 1 in the backend due to 0-based vs 1-based indexing)
      // This ensures we fetch the first page where the newly created certificate should appear
      // (certificates are sorted by issueDate desc, so newest appear first)
      await fetchCertificates(0);
      
      // Then set the page state to 0 to keep the UI in sync
      if (page !== 0) {
        setPage(0);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create certificate');
      reportError('frontend.error', error);
    }
  };

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
          Certificate Management
        </Typography>
        <Box>
          <Button
            variant="outlined"
            startIcon={<UploadIcon />}
            onClick={() => setOpenBulkDialog(true)}
            sx={{ mr: 1 }}
          >
            Bulk Upload
          </Button>
          <Button
            variant="outlined"
            startIcon={<DownloadIcon />}
            onClick={handleExport}
            sx={{ mr: 1 }}
          >
            Export
          </Button>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleOpenCreateDialog}
          >
            Add Certificate
          </Button>
        </Box>
      </Box>

      {/* Filters */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              label="Search"
              placeholder="Search by name or certificate ID"
              value={search}
              onChange={handleSearchChange}
            />
          </Grid>
          <Grid item xs={12} md={3}>
            <FormControl fullWidth>
              <InputLabel>Valid Status</InputLabel>
              <Select
                value={filterValid}
                onChange={(e) => setFilterValid(e.target.value)}
                label="Valid Status"
              >
                <MenuItem value="">All</MenuItem>
                <MenuItem value="true">Valid</MenuItem>
                <MenuItem value="false">Invalid</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={3}>
            <FormControl fullWidth>
              <InputLabel>Revoked Status</InputLabel>
              <Select
                value={filterRevoked}
                onChange={(e) => setFilterRevoked(e.target.value)}
                label="Revoked Status"
              >
                <MenuItem value="">All</MenuItem>
                <MenuItem value="false">Active</MenuItem>
                <MenuItem value="true">Revoked</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={2}>
            <Button
              fullWidth
              variant="outlined"
              onClick={fetchCertificates}
              startIcon={<RefreshIcon />}
            >
              Refresh
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* Table */}
      {loading ? (
        <Box display="flex" justifyContent="center" py={5}>
          <CircularProgress />
        </Box>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Certificate ID</TableCell>
                <TableCell>QR Code</TableCell>
                <TableCell>User Name</TableCell>
                <TableCell>Credential</TableCell>
                <TableCell>Grade</TableCell>
                <TableCell>Issue Date</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {certificates.map((cert) => (
                <TableRow key={cert._id}>
                  <TableCell>{cert.certificateId}</TableCell>
                  <TableCell>
                    {cert.qrCode ? (
                      <IconButton
                        size="small"
                        onClick={() => handleShowQrCode(cert)}
                        title="View QR Code"
                      >
                        <QrCodeIcon />
                      </IconButton>
                    ) : (
                      <Typography variant="caption" color="text.secondary">N/A</Typography>
                    )}
                  </TableCell>
                  <TableCell>{cert.userName || cert.recipientName || cert.user?.name || 'N/A'}</TableCell>
                  <TableCell>
                    {cert.credentialTitle || cert.credential?.title?.en || cert.credentialName?.en || 'N/A'}
                  </TableCell>
                  <TableCell>{cert.grade}</TableCell>
                  <TableCell>
                    {new Date(cert.issueDate).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    {cert.isRevoked ? (
                      <Chip label="Revoked" color="error" size="small" />
                    ) : cert.isValid ? (
                      <Chip label="Valid" color="success" size="small" />
                    ) : (
                      <Chip label="Invalid" color="warning" size="small" />
                    )}
                  </TableCell>
                  <TableCell align="right">
                    <IconButton
                      size="small"
                      onClick={() => handleOpenEditDialog(cert)}
                      title="Edit"
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => handleRegenerate(cert._id)}
                      title="Regenerate"
                    >
                      <RefreshIcon />
                    </IconButton>
                    {cert.isRevoked ? (
                      <IconButton
                        size="small"
                        onClick={() => handleRestore(cert._id)}
                        title="Restore"
                      >
                        <RestoreIcon />
                      </IconButton>
                    ) : (
                      <IconButton
                        size="small"
                        onClick={() => handleRevoke(cert._id)}
                        title="Revoke"
                      >
                        <BlockIcon />
                      </IconButton>
                    )}
                    <IconButton
                      size="small"
                      onClick={() => handleDelete(cert._id)}
                      title="Delete"
                    >
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <TablePagination
            component="div"
            count={total}
            page={page}
            onPageChange={handlePageChange}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={handleRowsPerPageChange}
            rowsPerPageOptions={[10, 20, 50, 100]}
          />
        </TableContainer>
      )}

      {/* Bulk Upload Dialog */}
      <Dialog open={openBulkDialog} onClose={() => setOpenBulkDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>Bulk Upload Certificates</DialogTitle>
        <DialogContent>
          <Alert severity="info" sx={{ mb: 2 }}>
            Paste CSV with headers: recipientEmail, recipientName, credentialTitle, credentialReference, credentialType, credentialLevel, grade, score, issueDate, expiryDate, assessorName
          </Alert>
          <TextField
            fullWidth
            multiline
            rows={10}
            value={bulkData}
            onChange={(e) => setBulkData(e.target.value)}
            placeholder="recipientEmail,recipientName,credentialTitle,credentialReference,credentialType,credentialLevel,grade,score,issueDate,expiryDate,assessorName&#10;user@example.com,Example Name,Quality Professional,GD-QP-001,professional,Level 1,A,95,2026-08-11,2028-08-11,Assessor Name"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenBulkDialog(false)}>Cancel</Button>
          <Button onClick={handleBulkUpload} variant="contained">
            Upload
          </Button>
        </DialogActions>
      </Dialog>

      {/* Create Certificate Dialog */}
      <Dialog open={openCreateDialog} onClose={handleCloseCreateDialog} maxWidth="md" fullWidth>
        <DialogTitle>Create Certificate</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <Grid container spacing={2}>
              {/* User (Optional) */}
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel>User (Optional)</InputLabel>
                  <Select
                    value={formData.userId}
                    onChange={(e) => handleFormChange('userId', e.target.value)}
                    label="User (Optional)"
                  >
                    <MenuItem value="">Select User</MenuItem>
                    {users.map((user) => (
                      <MenuItem key={user._id} value={user._id}>
                        {user.name} ({user.email})
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              {/* Credential (Optional) */}
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel>Credential (Optional)</InputLabel>
                  <Select
                    value={formData.credentialReference}
                    onChange={(e) => handleFormChange('credentialReference', e.target.value)}
                    label="Credential (Optional)"
                  >
                    <MenuItem value="">Select Credential</MenuItem>
                    {credentials.map((credential) => (
                      <MenuItem key={credential._id} value={credential._id}>
                        {getCredentialDisplayTitle(credential)}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              {/* Recipient Name (Optional) */}
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Recipient Name (Optional)"
                  value={formData.recipientName}
                  onChange={(e) => handleFormChange('recipientName', e.target.value)}
                  placeholder="Enter recipient name"
                />
              </Grid>

              {/* Credential or Program Title (Optional) */}
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Credential or Program Title (Optional)"
                  value={formData.credentialTitle}
                  onChange={(e) => handleFormChange('credentialTitle', e.target.value)}
                  placeholder="Enter credential or program title"
                />
              </Grid>

              {/* Certificate Level (Optional) */}
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Certificate Level (Optional)"
                  value={formData.certificateLevel}
                  onChange={(e) => handleFormChange('certificateLevel', e.target.value)}
                  placeholder="e.g., Foundation, Advanced, Professional"
                />
              </Grid>

              {/* Grade (Optional) */}
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Grade (Optional)</InputLabel>
                  <Select
                    value={formData.grade}
                    onChange={(e) => handleFormChange('grade', e.target.value)}
                    label="Grade (Optional)"
                  >
                    <MenuItem value="">None</MenuItem>
                    <MenuItem value="A+">A+</MenuItem>
                    <MenuItem value="A">A</MenuItem>
                    <MenuItem value="B+">B+</MenuItem>
                    <MenuItem value="B">B</MenuItem>
                    <MenuItem value="C+">C+</MenuItem>
                    <MenuItem value="C">C</MenuItem>
                    <MenuItem value="Pass">Pass</MenuItem>
                    <MenuItem value="Distinction">Distinction</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              {/* Score (Optional) */}
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Score (Optional)"
                  type="number"
                  inputProps={{ min: 0, max: 100 }}
                  value={formData.score}
                  onChange={(e) => handleFormChange('score', e.target.value)}
                  placeholder="0-100"
                />
              </Grid>

              {/* Issuer / Assessor Name (Optional) */}
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Issuer / Assessor Name (Optional)"
                  value={formData.assessorName}
                  onChange={(e) => handleFormChange('assessorName', e.target.value)}
                  placeholder="Enter issuer name"
                />
              </Grid>

              {/* Scheme (Optional) */}
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Scheme (Optional)"
                  value={formData.scheme}
                  onChange={(e) => handleFormChange('scheme', e.target.value)}
                  placeholder="Enter scheme"
                />
              </Grid>

              {/* Held On (Optional) */}
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Held On (Optional)"
                  type="date"
                  InputLabelProps={{ shrink: true }}
                  value={formData.heldOn}
                  onChange={(e) => handleFormChange('heldOn', e.target.value)}
                />
              </Grid>

              {/* Duration (Optional) */}
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Duration in Hours (Optional)"
                  type="number"
                  inputProps={{ min: 0, step: 0.5 }}
                  value={formData.duration}
                  onChange={(e) => handleFormChange('duration', e.target.value)}
                  placeholder="Enter duration or credit hours"
                />
              </Grid>

              {/* Held in (Optional) */}
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Held in (Optional)"
                  value={formData.heldIn}
                  onChange={(e) => handleFormChange('heldIn', e.target.value)}
                  placeholder="Enter location"
                />
              </Grid>

              {/* Issued by (Optional) */}
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Issued by (Optional)"
                  value={formData.issuedBy}
                  onChange={(e) => handleFormChange('issuedBy', e.target.value)}
                  placeholder="GreenDye for Training and Consultancy"
                />
              </Grid>

              {/* Completion Date (Optional) */}
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Completion Date (Optional)"
                  type="date"
                  InputLabelProps={{ shrink: true }}
                  value={formData.completionDate}
                  onChange={(e) => handleFormChange('completionDate', e.target.value)}
                />
              </Grid>

              {/* Issue Date (Optional) */}
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Issue Date (Optional)"
                  type="date"
                  InputLabelProps={{ shrink: true }}
                  value={formData.issueDate}
                  onChange={(e) => handleFormChange('issueDate', e.target.value)}
                />
              </Grid>

              {/* Expiry Date (Optional) */}
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Expiry Date (Optional)"
                  type="date"
                  InputLabelProps={{ shrink: true }}
                  value={formData.expiryDate}
                  onChange={(e) => handleFormChange('expiryDate', e.target.value)}
                />
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseCreateDialog}>Cancel</Button>
          <Button onClick={handleCreateCertificate} variant="contained" color="primary">
            Create
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Certificate Dialog */}
      <Dialog open={openEditDialog} onClose={handleCloseEditDialog} maxWidth="md" fullWidth>
        <DialogTitle>Edit Certificate</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <Grid container spacing={2}>
              {/* Recipient Name */}
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Recipient Name"
                  value={formData.recipientName}
                  onChange={(e) => handleFormChange('recipientName', e.target.value)}
                  placeholder="Enter recipient name"
                />
              </Grid>

              {/* Credential or Program Title */}
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Credential or Program Title"
                  value={formData.credentialTitle}
                  onChange={(e) => handleFormChange('credentialTitle', e.target.value)}
                  placeholder="Enter credential or program title"
                />
              </Grid>

              {/* Certificate Level */}
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Certificate Level"
                  value={formData.certificateLevel}
                  onChange={(e) => handleFormChange('certificateLevel', e.target.value)}
                  placeholder="e.g., Foundation, Advanced, Professional"
                />
              </Grid>

              {/* Grade */}
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Grade</InputLabel>
                  <Select
                    value={formData.grade}
                    onChange={(e) => handleFormChange('grade', e.target.value)}
                    label="Grade"
                  >
                    <MenuItem value="">None</MenuItem>
                    <MenuItem value="A+">A+</MenuItem>
                    <MenuItem value="A">A</MenuItem>
                    <MenuItem value="B+">B+</MenuItem>
                    <MenuItem value="B">B</MenuItem>
                    <MenuItem value="C+">C+</MenuItem>
                    <MenuItem value="C">C</MenuItem>
                    <MenuItem value="Pass">Pass</MenuItem>
                    <MenuItem value="Distinction">Distinction</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              {/* Score */}
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Score"
                  type="number"
                  inputProps={{ min: 0, max: 100 }}
                  value={formData.score}
                  onChange={(e) => handleFormChange('score', e.target.value)}
                  placeholder="0-100"
                />
              </Grid>

              {/* Issuer / Assessor Name */}
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Issuer / Assessor Name"
                  value={formData.assessorName}
                  onChange={(e) => handleFormChange('assessorName', e.target.value)}
                  placeholder="Enter issuer name"
                />
              </Grid>

              {/* Scheme */}
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Scheme"
                  value={formData.scheme}
                  onChange={(e) => handleFormChange('scheme', e.target.value)}
                  placeholder="Enter scheme"
                />
              </Grid>

              {/* Held On */}
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Held On"
                  type="date"
                  InputLabelProps={{ shrink: true }}
                  value={formData.heldOn}
                  onChange={(e) => handleFormChange('heldOn', e.target.value)}
                />
              </Grid>

              {/* Duration */}
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Duration in Hours"
                  type="number"
                  inputProps={{ min: 0, step: 0.5 }}
                  value={formData.duration}
                  onChange={(e) => handleFormChange('duration', e.target.value)}
                  placeholder="Enter duration or credit hours"
                />
              </Grid>

              {/* Held in */}
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Held in"
                  value={formData.heldIn}
                  onChange={(e) => handleFormChange('heldIn', e.target.value)}
                  placeholder="Enter location"
                />
              </Grid>

              {/* Issued by */}
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Issued by"
                  value={formData.issuedBy}
                  onChange={(e) => handleFormChange('issuedBy', e.target.value)}
                  placeholder="GreenDye for Training and Consultancy"
                />
              </Grid>
        
              {/* Completion Date */}
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Completion Date"
                  type="date"
                  InputLabelProps={{ shrink: true }}
                  value={formData.completionDate}
                  onChange={(e) => handleFormChange('completionDate', e.target.value)}
                />
              </Grid>

              {/* Issue Date */}
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Issue Date"
                  type="date"
                  InputLabelProps={{ shrink: true }}
                  value={formData.issueDate}
                  onChange={(e) => handleFormChange('issueDate', e.target.value)}
                />
              </Grid>

              {/* Expiry Date */}
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Expiry Date"
                  type="date"
                  InputLabelProps={{ shrink: true }}
                  value={formData.expiryDate}
                  onChange={(e) => handleFormChange('expiryDate', e.target.value)}
                />
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseEditDialog}>Cancel</Button>
          <Button onClick={handleUpdateCertificate} variant="contained" color="primary">
            Update
          </Button>
        </DialogActions>
      </Dialog>

      {/* QR Code Display Dialog */}
      <Dialog open={openQrDialog} onClose={() => setOpenQrDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Certificate QR Code</DialogTitle>
        <DialogContent>
          {selectedCertificate && selectedCertificate.qrCode ? (
            <Box sx={{ textAlign: 'center', py: 2 }}>
              <Typography variant="subtitle1" gutterBottom>
                Certificate ID: {selectedCertificate.certificateId}
              </Typography>
              <Box sx={{ mt: 2, mb: 2 }}>
                <img
                  src={selectedCertificate.qrCode}
                  alt={`QR Code for ${selectedCertificate.certificateId}`}
                  style={{ maxWidth: '300px', width: '100%', height: 'auto' }}
                />
              </Box>
              {selectedCertificate.verificationUrl && (
                <Typography variant="body2" color="text.secondary" sx={{ wordBreak: 'break-all' }}>
                  Verification URL: {selectedCertificate.verificationUrl}
                </Typography>
              )}
            </Box>
          ) : (
            <Alert severity="warning">QR Code not available for this certificate</Alert>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenQrDialog(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default AdminCertificates;
