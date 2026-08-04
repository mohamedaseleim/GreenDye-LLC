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
  const [courses, setCourses] = useState([]);
  const [formData, setFormData] = useState({
    userId: '',
    courseId: '',
    traineeName: '',
    courseTitle: '',
    certificateLevel: '',
    grade: '',
    score: '',
    tutorName: '',
    scheme: '',
    heldOn: '',
    duration: '',
    heldIn: '',
    issuedBy: 'GreenDye Academy',
    completionDate: '',
    issueDate: '',
    expiryDate: ''
  });

  useEffect(() => {
    if (!user || user.role !== 'admin') {
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
      console.error('Error:', error);
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
    if (!window.confirm('Are you sure you want to revoke this certificate?')) {
      return;
    }

    try {
      await adminService.revokeCertificate(id, 'Revoked by administrator');
      toast.success('Certificate revoked successfully');
      fetchCertificates();
    } catch (error) {
      toast.error('Failed to revoke certificate');
      console.error('Error:', error);
    }
  };

  const handleRestore = async (id) => {
    try {
      await adminService.restoreCertificate(id);
      toast.success('Certificate restored successfully');
      fetchCertificates();
    } catch (error) {
      toast.error('Failed to restore certificate');
      console.error('Error:', error);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to permanently delete this certificate?')) {
      return;
    }

    try {
      await adminService.deleteCertificate(id);
      toast.success('Certificate deleted successfully');
      fetchCertificates();
    } catch (error) {
      toast.error('Failed to delete certificate');
      console.error('Error:', error);
    }
  };

  const handleOpenEditDialog = (cert) => {
    setSelectedCertificate(cert);
    setFormData({
      userId: cert.user?._id || '',
      courseId: cert.course?._id || '',
      traineeName: cert.traineeName || cert.userName || '',
      courseTitle: cert.courseTitle || '',
      certificateLevel: cert.certificateLevel || '',
      grade: cert.grade || '',
      score: cert.score || '',
      tutorName: cert.metadata?.instructor || '',
      scheme: cert.metadata?.scheme || '',
      heldOn: cert.metadata?.heldOn ? new Date(cert.metadata.heldOn).toISOString().split('T')[0] : '',
      duration: cert.metadata?.duration || '',
      heldIn: cert.metadata?.heldIn || '',
      issuedBy: cert.metadata?.issuedBy || 'GreenDye Academy',
      completionDate: cert.completionDate ? new Date(cert.completionDate).toISOString().split('T')[0] : '',
      issueDate: cert.issueDate ? new Date(cert.issueDate).toISOString().split('T')[0] : '',
      expiryDate: cert.expiryDate ? new Date(cert.expiryDate).toISOString().split('T')[0] : ''
    });
    setOpenEditDialog(true);
    // Fetch data asynchronously after opening dialog - errors are handled in fetchUsers/fetchCourses
    Promise.all([fetchUsers(), fetchCourses()]).catch(err => {
      console.error('Error fetching users/courses:', err);
      // User will already see error toasts from fetchUsers/fetchCourses
    });
  };

  const handleCloseEditDialog = () => {
    setOpenEditDialog(false);
    setSelectedCertificate(null);
    setFormData({
      userId: '',
      courseId: '',
      traineeName: '',
      courseTitle: '',
      certificateLevel: '',
      grade: '',
      score: '',
      tutorName: '',
      scheme: '',
      heldOn: '',
      duration: '',
      heldIn: '',
      issuedBy: 'GreenDye Academy',
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
      if (formData.traineeName) data.traineeName = formData.traineeName;
      if (formData.courseTitle) data.courseTitle = formData.courseTitle;
      if (formData.certificateLevel) data.certificateLevel = formData.certificateLevel;
      if (formData.grade) data.grade = formData.grade;
      if (formData.score) data.score = parseFloat(formData.score);
      if (formData.tutorName) data.tutorName = formData.tutorName;
      if (formData.scheme) data.scheme = formData.scheme;
      if (formData.heldOn) data.heldOn = formData.heldOn;
      if (formData.duration) data.duration = parseFloat(formData.duration);
      if (formData.heldIn) data.heldIn = formData.heldIn;
      if (formData.issuedBy) data.issuedBy = formData.issuedBy;
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
      console.error('Error:', error);
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
      console.error('Error:', error);
    }
  };

  const handleExport = async () => {
    try {
      const response = await adminService.exportCertificates({
        format: 'csv',
        isValid: filterValid,
        isRevoked: filterRevoked
      });
      
      toast.success('Export completed');
      console.log('Export data:', response);
    } catch (error) {
      toast.error('Failed to export certificates');
      console.error('Error:', error);
    }
  };

  const handleBulkUpload = async () => {
    try {
      // Parse CSV data
      const lines = bulkData.trim().split('\n');
      const certificates = lines.slice(1).map(line => {
        const [userEmail, courseId, grade, score, issueDate] = line.split(',');
        return {
          userEmail: userEmail?.trim(),
          courseId: courseId?.trim(),
          grade: grade?.trim(),
          score: score ? parseFloat(score.trim()) : undefined,
          issueDate: issueDate?.trim()
        };
      });

      const response = await adminService.bulkUploadCertificates(certificates);
      // The response structure is { success: true, message: 'Bulk upload completed', data: { success: [], failed: [] } }
      toast.success(`Uploaded ${response.data.data.success.length} certificates. ${response.data.data.failed.length} failed.`);
      setOpenBulkDialog(false);
      setBulkData('');
      fetchCertificates();
    } catch (error) {
      toast.error('Failed to bulk upload certificates');
      console.error('Error:', error);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await adminService.getAllUsersForEnrollment();
      setUsers(response.data || []);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Failed to fetch users');
    }
  };

  const fetchCourses = async () => {
    try {
      const response = await adminService.getAllCoursesForEnrollment();
      setCourses(response.data || []);
    } catch (error) {
      console.error('Error fetching courses:', error);
      toast.error('Failed to fetch courses');
    }
  };

  const handleOpenCreateDialog = () => {
    setOpenCreateDialog(true);
    // Fetch data asynchronously after opening dialog
    // Errors are already handled in fetchUsers and fetchCourses with toast messages
    Promise.all([fetchUsers(), fetchCourses()]);
  };

  const handleCloseCreateDialog = () => {
    setOpenCreateDialog(false);
    setFormData({
      userId: '',
      courseId: '',
      traineeName: '',
      courseTitle: '',
      certificateLevel: '',
      grade: '',
      score: '',
      tutorName: '',
      scheme: '',
      heldOn: '',
      duration: '',
      heldIn: '',
      issuedBy: 'GreenDye Academy',
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

  const getCourseDisplayTitle = (course) => {
    return course.title?.en || course.title?.default || course.title || 'Untitled Course';
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
      // Validation - no longer require userId and courseId
      // But at least one identifier should be provided
      if (!formData.userId && !formData.traineeName) {
        toast.error('Please provide either a user selection or trainee name');
        return;
      }

      if (!formData.courseId && !formData.courseTitle) {
        toast.error('Please provide either a course selection or course title');
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

      // Add user and course if selected
      if (formData.userId) data.userId = formData.userId;
      if (formData.courseId) data.courseId = formData.courseId;

      // Add all optional fields if provided
      if (formData.traineeName) data.traineeName = formData.traineeName;
      if (formData.courseTitle) data.courseTitle = formData.courseTitle;
      if (formData.certificateLevel) data.certificateLevel = formData.certificateLevel;
      if (formData.grade) data.grade = formData.grade;
      if (formData.score) data.score = parseFloat(formData.score);
      if (formData.tutorName) data.tutorName = formData.tutorName;
      if (formData.scheme) data.scheme = formData.scheme;
      if (formData.heldOn) data.heldOn = formData.heldOn;
      if (formData.duration) data.duration = parseFloat(formData.duration);
      if (formData.heldIn) data.heldIn = formData.heldIn;
      if (formData.issuedBy) data.issuedBy = formData.issuedBy;
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
      console.error('Error:', error);
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
                <TableCell>Course</TableCell>
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
                  <TableCell>{cert.userName || cert.traineeName || cert.user?.name || 'N/A'}</TableCell>
                  <TableCell>
                    {cert.courseTitle || cert.course?.title?.en || cert.courseName?.en || 'N/A'}
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
            Paste CSV data with format: userEmail, courseId, grade, score, issueDate
          </Alert>
          <TextField
            fullWidth
            multiline
            rows={10}
            value={bulkData}
            onChange={(e) => setBulkData(e.target.value)}
            placeholder="user@example.com,60a1b2c3d4e5f6g7h8i9j0k,A,95,2024-01-15"
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

              {/* Course (Optional) */}
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel>Course (Optional)</InputLabel>
                  <Select
                    value={formData.courseId}
                    onChange={(e) => handleFormChange('courseId', e.target.value)}
                    label="Course (Optional)"
                  >
                    <MenuItem value="">Select Course</MenuItem>
                    {courses.map((course) => (
                      <MenuItem key={course._id} value={course._id}>
                        {getCourseDisplayTitle(course)}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              {/* Trainee Name (Optional) */}
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Trainee Name (Optional)"
                  value={formData.traineeName}
                  onChange={(e) => handleFormChange('traineeName', e.target.value)}
                  placeholder="Enter trainee name"
                />
              </Grid>

              {/* Course Title (Optional) */}
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Course Title (Optional)"
                  value={formData.courseTitle}
                  onChange={(e) => handleFormChange('courseTitle', e.target.value)}
                  placeholder="Enter course title"
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

              {/* Tutor Name (Optional) */}
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Tutor Name (Optional)"
                  value={formData.tutorName}
                  onChange={(e) => handleFormChange('tutorName', e.target.value)}
                  placeholder="Enter tutor name"
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
                  placeholder="Enter duration in hours"
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
                  placeholder="GreenDye Academy"
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
              {/* Trainee Name */}
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Trainee Name"
                  value={formData.traineeName}
                  onChange={(e) => handleFormChange('traineeName', e.target.value)}
                  placeholder="Enter trainee name"
                />
              </Grid>

              {/* Course Title */}
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Course Title"
                  value={formData.courseTitle}
                  onChange={(e) => handleFormChange('courseTitle', e.target.value)}
                  placeholder="Enter course title"
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

              {/* Tutor Name */}
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Tutor Name"
                  value={formData.tutorName}
                  onChange={(e) => handleFormChange('tutorName', e.target.value)}
                  placeholder="Enter tutor name"
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
                  placeholder="Enter duration in hours"
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
                  placeholder="GreenDye Academy"
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
