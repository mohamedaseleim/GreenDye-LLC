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
  Alert,
  Tabs,
  Tab,
  Card,
  CardContent,
  Divider,
  Tooltip
} from '@mui/material';
import {
  Add as AddIcon,
  AttachMoney as PayoutIcon,
  Check as ApproveIcon,
  Close as RejectIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  HourglassEmpty as PendingIcon,
  QrCode as QrCodeIcon,
  Refresh as RefreshIcon,
  TrendingUp as MetricsIcon,
  VerifiedUser as VerifiedIcon,
  Visibility as ViewIcon
} from '@mui/icons-material';
import { toast } from 'react-toastify';
import adminService from '../services/adminService';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const AdminTrainers = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [trainers, setTrainers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterVerified, setFilterVerified] = useState('');
  const [filterApplication, setFilterApplication] = useState('');
  const [currentTab, setCurrentTab] = useState(0);
  
  // Constants
  const MAX_EXPERIENCE_YEARS = 50;
  const DEFAULT_COMMISSION_RATE = 20;
  
  // Dialogs
  const [openDetailsDialog, setOpenDetailsDialog] = useState(false);
  const [openMetricsDialog, setOpenMetricsDialog] = useState(false);
  const [openPayoutDialog, setOpenPayoutDialog] = useState(false);
  const [openCreateDialog, setOpenCreateDialog] = useState(false);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [openQrDialog, setOpenQrDialog] = useState(false);
  
  // Selected data
  const [selectedTrainer, setSelectedTrainer] = useState(null);
  const [trainerMetrics, setTrainerMetrics] = useState(null);
  const [trainerPayouts, setTrainerPayouts] = useState([]);
  
  // Form data
  const [reviewNotes, setReviewNotes] = useState('');
  const [payoutAmount, setPayoutAmount] = useState('');
  const [payoutMethod, setPayoutMethod] = useState('bank_transfer');
  const [payoutNotes, setPayoutNotes] = useState('');
  
  // Create trainer form data
  const [users, setUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [currentBioLang, setCurrentBioLang] = useState('en');
  const [createdTrainer, setCreatedTrainer] = useState(null);
  const [createFormData, setCreateFormData] = useState({
    verificationStatus: 'Pending',
    userId: '',
    fullName: '',
    title: '',
    bioEn: '',
    bioAr: '',
    bioFr: '',
    expertise: '',
    experience: '',
    verificationDate: '',
    qualifications: [],
    certifications: [],
    languages: [],
    commissionRate: DEFAULT_COMMISSION_RATE
  });
  
  // Edit trainer form data
  const [editBioLang, setEditBioLang] = useState('en');
  const [editFormData, setEditFormData] = useState({
    fullName: '',
    title: '',
    bioEn: '',
    bioAr: '',
    bioFr: '',
    expertise: '',
    experience: '',
    qualifications: [],
    certifications: [],
    languages: [],
    commissionRate: DEFAULT_COMMISSION_RATE
  });

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      navigate('/');
      return;
    }
    fetchTrainers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, navigate, page, rowsPerPage, search, filterStatus, filterVerified, filterApplication, currentTab]);

  const fetchTrainers = async () => {
    try {
      setLoading(true);
      const params = {
        page: page + 1,
        limit: rowsPerPage,
        search
      };
      
      if (filterStatus !== '') {
        params.status = filterStatus;
      }
      if (filterVerified !== '') {
        params.verified = filterVerified;
      }
      if (filterApplication !== '') {
        params.applicationStatus = filterApplication;
      }
      
      // If on pending applications tab, filter by pending status
      if (currentTab === 1) {
        const response = await adminService.getPendingApplications(params);
        setTrainers(response.data || []);
        setTotal(response.total || 0);
      } else {
        const response = await adminService.getAllTrainers(params);
        setTrainers(response.data || []);
        setTotal(response.total || 0);
      }
    } catch (error) {
      toast.error('Failed to fetch trainers');
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (trainerId) => {
    try {
      await adminService.approveTrainer(trainerId, reviewNotes);
      toast.success('Trainer application approved');
      setReviewNotes('');
      fetchTrainers();
    } catch (error) {
      toast.error('Failed to approve trainer');
      console.error('Error:', error);
    }
  };

  const handleReject = async (trainerId) => {
    try {
      await adminService.rejectTrainer(trainerId, reviewNotes);
      toast.success('Trainer application rejected');
      setReviewNotes('');
      fetchTrainers();
    } catch (error) {
      toast.error('Failed to reject trainer');
      console.error('Error:', error);
    }
  };

  const handleDelete = async (trainerId) => {
    if (!window.confirm('Are you sure you want to delete this trainer profile?')) {
      return;
    }
    
    try {
      await adminService.deleteTrainer(trainerId);
      toast.success('Trainer deleted successfully');
      fetchTrainers();
    } catch (error) {
      toast.error('Failed to delete trainer');
      console.error('Error:', error);
    }
  };

  const handleViewDetails = async (trainer) => {
    setSelectedTrainer(trainer);
    setOpenDetailsDialog(true);
  };

  const handleViewMetrics = async (trainer) => {
    try {
      setSelectedTrainer(trainer);
      const response = await adminService.getTrainerMetrics(trainer._id);
      setTrainerMetrics(response.data);
      setOpenMetricsDialog(true);
    } catch (error) {
      toast.error('Failed to load metrics');
      console.error('Error:', error);
    }
  };

  const handleViewPayouts = async (trainer) => {
    try {
      setSelectedTrainer(trainer);
      const response = await adminService.getTrainerPayouts(trainer._id);
      setTrainerPayouts(response.data || []);
      setOpenPayoutDialog(true);
    } catch (error) {
      toast.error('Failed to load payouts');
      console.error('Error:', error);
    }
  };

  const handleCreatePayout = async () => {
    if (!payoutAmount || parseFloat(payoutAmount) <= 0) {
      toast.error('Please enter a valid payout amount');
      return;
    }

    try {
      await adminService.createPayout(selectedTrainer._id, {
        amount: parseFloat(payoutAmount),
        payoutMethod,
        notes: payoutNotes
      });
      toast.success('Payout created successfully');
      setPayoutAmount('');
      setPayoutNotes('');
      handleViewPayouts(selectedTrainer);
      fetchTrainers();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create payout');
      console.error('Error:', error);
    }
  };

  const handleUpdateVerification = async (trainerId, isVerified) => {
    try {
      await adminService.updateVerificationStatus(trainerId, isVerified, reviewNotes);
      toast.success(`Trainer ${isVerified ? 'verified' : 'unverified'} successfully`);
      setReviewNotes('');
      fetchTrainers();
    } catch (error) {
      toast.error('Failed to update verification status');
      console.error('Error:', error);
    }
  };

  const handleOpenCreateDialog = async () => {
    setOpenCreateDialog(true);
    await fetchUsers();
  };

  const fetchUsers = async () => {
    try {
      setLoadingUsers(true);
      const response = await adminService.getUsers({ role: 'student', limit: 100 });
      setUsers(response.data || []);
    } catch (error) {
      toast.error('Failed to load users');
      console.error('Error:', error);
    } finally {
      setLoadingUsers(false);
    }
  };

  const handleCreateTrainer = async () => {
    if (!createFormData.userId) {
      toast.error('Please select a user');
      return;
    }
    
    if (!createFormData.fullName || createFormData.fullName.length < 3) {
      toast.error('Please enter a full name (minimum 3 characters)');
      return;
    }

    try {
      const requestData = {
        verificationStatus: createFormData.verificationStatus,
        userId: createFormData.userId,
        fullName: createFormData.fullName,
        commissionRate: createFormData.commissionRate !== '' && createFormData.commissionRate !== null 
          ? parseFloat(createFormData.commissionRate) 
          : DEFAULT_COMMISSION_RATE
      };

      // Add optional fields if provided
      if (createFormData.title) {
        requestData.title = { en: createFormData.title };
      }
      
      // Add bio with multi-language support
      const bio = {};
      if (createFormData.bioEn) bio.en = createFormData.bioEn;
      if (createFormData.bioAr) bio.ar = createFormData.bioAr;
      if (createFormData.bioFr) bio.fr = createFormData.bioFr;
      if (Object.keys(bio).length > 0) {
        requestData.bio = bio;
      }
      
      if (createFormData.expertise) {
        const expertiseArray = createFormData.expertise.split(',').map(e => e.trim()).filter(e => e);
        if (expertiseArray.length > 0) {
          requestData.expertise = expertiseArray;
        }
      }
      
      if (createFormData.experience) {
        const exp = parseFloat(createFormData.experience);
        if (!isNaN(exp) && exp >= 0 && exp <= MAX_EXPERIENCE_YEARS) {
          requestData.experience = exp;
        }
      }
      
      if (createFormData.verificationDate) {
        requestData.verificationDate = createFormData.verificationDate;
      }
      
      if (createFormData.qualifications && createFormData.qualifications.length > 0) {
        requestData.qualifications = createFormData.qualifications;
      }
      
      if (createFormData.certifications && createFormData.certifications.length > 0) {
        requestData.certifications = createFormData.certifications;
      }
      
      if (createFormData.languages && createFormData.languages.length > 0) {
        requestData.languages = createFormData.languages;
      }

      const response = await adminService.createTrainer(requestData);
      toast.success('Trainer profile created successfully');
      
      // Store created trainer to show QR code
      setCreatedTrainer(response.data);
      
      // Reset form
      setCreateFormData({
        verificationStatus: 'Pending',
        userId: '',
        fullName: '',
        title: '',
        bioEn: '',
        bioAr: '',
        bioFr: '',
        expertise: '',
        experience: '',
        verificationDate: '',
        qualifications: [],
        certifications: [],
        languages: [],
        commissionRate: DEFAULT_COMMISSION_RATE
      });
      setOpenCreateDialog(false);
      fetchTrainers();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create trainer profile');
      console.error('Error:', error);
    }
  };

  const handleCloseCreateDialog = () => {
    setOpenCreateDialog(false);
    setCreatedTrainer(null);
    setCreateFormData({
      verificationStatus: 'Pending',
      userId: '',
      fullName: '',
      title: '',
      bioEn: '',
      bioAr: '',
      bioFr: '',
      expertise: '',
      experience: '',
      verificationDate: '',
      qualifications: [],
      certifications: [],
      languages: [],
      commissionRate: DEFAULT_COMMISSION_RATE
    });
  };

  const handleOpenEditDialog = (trainer) => {
    setSelectedTrainer(trainer);
    
    // Extract bio by language with optional chaining
    const bioEn = trainer.bio?.en || '';
    const bioAr = trainer.bio?.ar || '';
    const bioFr = trainer.bio?.fr || '';
    
    // Extract title with optional chaining
    const titleEn = trainer.title?.en || '';
    
    // Extract expertise as comma-separated string
    const expertise = Array.isArray(trainer.expertise) ? trainer.expertise.join(', ') : '';
    
    setEditFormData({
      fullName: trainer.fullName || '',
      title: titleEn,
      bioEn,
      bioAr,
      bioFr,
      expertise,
      experience: trainer.experience || '',
      qualifications: trainer.qualifications || [],
      certifications: trainer.certifications || [],
      languages: trainer.languages || [],
      commissionRate: trainer.commissionRate || DEFAULT_COMMISSION_RATE
    });
    setOpenEditDialog(true);
  };

  const handleUpdateTrainer = async () => {
    if (!editFormData.fullName || editFormData.fullName.length < 3) {
      toast.error('Please enter a full name (minimum 3 characters)');
      return;
    }

    try {
      const requestData = {
        fullName: editFormData.fullName,
        commissionRate: editFormData.commissionRate !== '' && editFormData.commissionRate !== null 
          ? parseFloat(editFormData.commissionRate) 
          : DEFAULT_COMMISSION_RATE
      };

      // Add optional fields if provided
      if (editFormData.title) {
        requestData.title = { en: editFormData.title };
      }
      
      // Add bio with multi-language support
      const bio = {};
      if (editFormData.bioEn) bio.en = editFormData.bioEn;
      if (editFormData.bioAr) bio.ar = editFormData.bioAr;
      if (editFormData.bioFr) bio.fr = editFormData.bioFr;
      if (Object.keys(bio).length > 0) {
        requestData.bio = bio;
      }
      
      if (editFormData.expertise) {
        const expertiseArray = editFormData.expertise.split(',').map(e => e.trim()).filter(e => e);
        if (expertiseArray.length > 0) {
          requestData.expertise = expertiseArray;
        }
      }
      
      if (editFormData.experience) {
        const exp = parseFloat(editFormData.experience);
        if (!isNaN(exp) && exp >= 0 && exp <= MAX_EXPERIENCE_YEARS) {
          requestData.experience = exp;
        }
      }
      
      if (editFormData.qualifications && editFormData.qualifications.length > 0) {
        requestData.qualifications = editFormData.qualifications;
      }
      
      if (editFormData.certifications && editFormData.certifications.length > 0) {
        requestData.certifications = editFormData.certifications;
      }
      
      if (editFormData.languages && editFormData.languages.length > 0) {
        requestData.languages = editFormData.languages;
      }

      await adminService.updateTrainer(selectedTrainer._id, requestData);
      toast.success('Trainer profile updated successfully');
      
      setOpenEditDialog(false);
      setSelectedTrainer(null);
      fetchTrainers();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update trainer profile');
      console.error('Error:', error);
    }
  };

  const handleCloseEditDialog = () => {
    setOpenEditDialog(false);
    setSelectedTrainer(null);
  };

  const handleViewQrCode = (trainer) => {
    setSelectedTrainer(trainer);
    setOpenQrDialog(true);
  };

  const handleCloseQrDialog = () => {
    setOpenQrDialog(false);
    setSelectedTrainer(null);
  };

  const handlePageChange = (event, newPage) => {
    setPage(newPage);
  };

  const handleRowsPerPageChange = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleTabChange = (event, newValue) => {
    setCurrentTab(newValue);
    setPage(0);
  };
  
  // Helper functions for managing dynamic arrays
  const addQualification = () => {
    setCreateFormData({
      ...createFormData,
      qualifications: [...createFormData.qualifications, { degree: '', institution: '', year: '' }]
    });
  };
  
  const removeQualification = (index) => {
    setCreateFormData({
      ...createFormData,
      qualifications: createFormData.qualifications.filter((_, i) => i !== index)
    });
  };
  
  const updateQualification = (index, field, value) => {
    const updated = [...createFormData.qualifications];
    updated[index] = { ...updated[index], [field]: value };
    setCreateFormData({ ...createFormData, qualifications: updated });
  };
  
  const addCertification = () => {
    setCreateFormData({
      ...createFormData,
      certifications: [...createFormData.certifications, { name: '', organization: '', year: '' }]
    });
  };
  
  const removeCertification = (index) => {
    setCreateFormData({
      ...createFormData,
      certifications: createFormData.certifications.filter((_, i) => i !== index)
    });
  };
  
  const updateCertification = (index, field, value) => {
    const updated = [...createFormData.certifications];
    updated[index] = { ...updated[index], [field]: value };
    setCreateFormData({ ...createFormData, certifications: updated });
  };
  
  const addLanguage = () => {
    setCreateFormData({
      ...createFormData,
      languages: [...createFormData.languages, { language: '', proficiency: 'intermediate' }]
    });
  };
  
  const removeLanguage = (index) => {
    setCreateFormData({
      ...createFormData,
      languages: createFormData.languages.filter((_, i) => i !== index)
    });
  };
  
  const updateLanguage = (index, field, value) => {
    const updated = [...createFormData.languages];
    updated[index] = { ...updated[index], [field]: value };
    setCreateFormData({ ...createFormData, languages: updated });
  };

  // Helper functions for managing dynamic arrays in edit form
  const addEditQualification = () => {
    setEditFormData({
      ...editFormData,
      qualifications: [...editFormData.qualifications, { degree: '', institution: '', year: '' }]
    });
  };
  
  const removeEditQualification = (index) => {
    setEditFormData({
      ...editFormData,
      qualifications: editFormData.qualifications.filter((_, i) => i !== index)
    });
  };
  
  const updateEditQualification = (index, field, value) => {
    const updated = [...editFormData.qualifications];
    updated[index] = { ...updated[index], [field]: value };
    setEditFormData({ ...editFormData, qualifications: updated });
  };
  
  const addEditCertification = () => {
    setEditFormData({
      ...editFormData,
      certifications: [...editFormData.certifications, { name: '', organization: '', year: '' }]
    });
  };
  
  const removeEditCertification = (index) => {
    setEditFormData({
      ...editFormData,
      certifications: editFormData.certifications.filter((_, i) => i !== index)
    });
  };
  
  const updateEditCertification = (index, field, value) => {
    const updated = [...editFormData.certifications];
    updated[index] = { ...updated[index], [field]: value };
    setEditFormData({ ...editFormData, certifications: updated });
  };
  
  const addEditLanguage = () => {
    setEditFormData({
      ...editFormData,
      languages: [...editFormData.languages, { language: '', proficiency: 'intermediate' }]
    });
  };
  
  const removeEditLanguage = (index) => {
    setEditFormData({
      ...editFormData,
      languages: editFormData.languages.filter((_, i) => i !== index)
    });
  };
  
  const updateEditLanguage = (index, field, value) => {
    const updated = [...editFormData.languages];
    updated[index] = { ...updated[index], [field]: value };
    setEditFormData({ ...editFormData, languages: updated });
  };

  const getStatusChip = (trainer) => {
    if (trainer.applicationStatus === 'approved') {
      return <Chip label="Approved" color="success" size="small" />;
    } else if (trainer.applicationStatus === 'rejected') {
      return <Chip label="Rejected" color="error" size="small" />;
    } else if (trainer.applicationStatus === 'under_review') {
      return <Chip label="Under Review" color="warning" size="small" />;
    } else {
      return <Chip label="Pending" color="default" size="small" />;
    }
  };

  const getVerificationChip = (isVerified) => {
    return isVerified 
      ? <Chip label="Verified" color="primary" size="small" icon={<VerifiedIcon />} />
      : <Chip label="Not Verified" color="default" size="small" icon={<PendingIcon />} />;
  };

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
          Trainer Management
        </Typography>
        <Box>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={fetchTrainers}
            sx={{ mr: 1 }}
          >
            Refresh
          </Button>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleOpenCreateDialog}
          >
            Add Trainer
          </Button>
        </Box>
      </Box>

      <Paper sx={{ mb: 3 }}>
        <Tabs value={currentTab} onChange={handleTabChange}>
          <Tab label="All Trainers" />
          <Tab label="Pending Applications" />
        </Tabs>
      </Paper>

      {/* Filters */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} md={3}>
            <TextField
              fullWidth
              label="Search"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(0); }}
              placeholder="Name or email..."
            />
          </Grid>
          <Grid item xs={12} md={3}>
            <FormControl fullWidth>
              <InputLabel>Status</InputLabel>
              <Select
                value={filterStatus}
                label="Status"
                onChange={(e) => { setFilterStatus(e.target.value); setPage(0); }}
              >
                <MenuItem value="">All</MenuItem>
                <MenuItem value="active">Active</MenuItem>
                <MenuItem value="inactive">Inactive</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={3}>
            <FormControl fullWidth>
              <InputLabel>Verified</InputLabel>
              <Select
                value={filterVerified}
                label="Verified"
                onChange={(e) => { setFilterVerified(e.target.value); setPage(0); }}
              >
                <MenuItem value="">All</MenuItem>
                <MenuItem value="true">Verified</MenuItem>
                <MenuItem value="false">Not Verified</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={3}>
            <FormControl fullWidth>
              <InputLabel>Application</InputLabel>
              <Select
                value={filterApplication}
                label="Application"
                onChange={(e) => { setFilterApplication(e.target.value); setPage(0); }}
              >
                <MenuItem value="">All</MenuItem>
                <MenuItem value="pending">Pending</MenuItem>
                <MenuItem value="approved">Approved</MenuItem>
                <MenuItem value="rejected">Rejected</MenuItem>
                <MenuItem value="under_review">Under Review</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </Paper>

      {/* Trainers Table */}
      <TableContainer component={Paper}>
        {loading ? (
          <Box display="flex" justifyContent="center" p={3}>
            <CircularProgress />
          </Box>
        ) : trainers.length === 0 ? (
          <Box p={3}>
            <Alert severity="info">No trainers found</Alert>
          </Box>
        ) : (
          <>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Trainer ID</TableCell>
                  <TableCell>Name</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Verified</TableCell>
                  <TableCell>Commission</TableCell>
                  <TableCell>Pending Payout</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {trainers.map((trainer) => (
                  <TableRow key={trainer._id}>
                    <TableCell>{trainer.trainerId}</TableCell>
                    <TableCell>{trainer.fullName || trainer.user?.name}</TableCell>
                    <TableCell>{trainer.user?.email}</TableCell>
                    <TableCell>{getStatusChip(trainer)}</TableCell>
                    <TableCell>{getVerificationChip(trainer.isVerified)}</TableCell>
                    <TableCell>{trainer.commissionRate}%</TableCell>
                    <TableCell>${trainer.pendingPayout?.toFixed(2) || '0.00'}</TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                        <Tooltip title="View QR Code">
                          <IconButton size="small" onClick={() => handleViewQrCode(trainer)}>
                            <QrCodeIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="View Details">
                          <IconButton size="small" onClick={() => handleViewDetails(trainer)}>
                            <ViewIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Edit">
                          <IconButton size="small" onClick={() => handleOpenEditDialog(trainer)}>
                            <EditIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Metrics">
                          <IconButton size="small" onClick={() => handleViewMetrics(trainer)}>
                            <MetricsIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Payouts">
                          <IconButton size="small" onClick={() => handleViewPayouts(trainer)}>
                            <PayoutIcon />
                          </IconButton>
                        </Tooltip>
                        {trainer.applicationStatus === 'pending' && (
                          <>
                            <Tooltip title="Approve">
                              <IconButton 
                                size="small" 
                                color="success"
                                onClick={() => handleApprove(trainer._id)}
                              >
                                <ApproveIcon />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Reject">
                              <IconButton 
                                size="small" 
                                color="error"
                                onClick={() => handleReject(trainer._id)}
                              >
                                <RejectIcon />
                              </IconButton>
                            </Tooltip>
                          </>
                        )}
                        <Tooltip title="Delete">
                          <IconButton 
                            size="small" 
                            color="error"
                            onClick={() => handleDelete(trainer._id)}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Tooltip>
                      </Box>
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
              rowsPerPageOptions={[5, 10, 25, 50]}
            />
          </>
        )}
      </TableContainer>

      {/* Trainer Details Dialog */}
      <Dialog 
        open={openDetailsDialog} 
        onClose={() => setOpenDetailsDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Trainer Details</DialogTitle>
        <DialogContent>
          {selectedTrainer && (
            <Box sx={{ mt: 2 }}>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" color="textSecondary">Trainer ID</Typography>
                  <Typography variant="body1">{selectedTrainer.trainerId}</Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" color="textSecondary">Full Name</Typography>
                  <Typography variant="body1">{selectedTrainer.fullName}</Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" color="textSecondary">Email</Typography>
                  <Typography variant="body1">{selectedTrainer.user?.email}</Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" color="textSecondary">Application Status</Typography>
                  <Typography variant="body1">{getStatusChip(selectedTrainer)}</Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" color="textSecondary">Commission Rate</Typography>
                  <Typography variant="body1">{selectedTrainer.commissionRate}%</Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" color="textSecondary">Pending Payout</Typography>
                  <Typography variant="body1">${selectedTrainer.pendingPayout?.toFixed(2) || '0.00'}</Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" color="textSecondary">Total Paid Out</Typography>
                  <Typography variant="body1">${selectedTrainer.totalPaidOut?.toFixed(2) || '0.00'}</Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" color="textSecondary">Rating</Typography>
                  <Typography variant="body1">{selectedTrainer.rating?.toFixed(1) || 'N/A'}</Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="subtitle2" color="textSecondary">Expertise</Typography>
                  <Box sx={{ mt: 1 }}>
                    {selectedTrainer.expertise?.map((exp, idx) => (
                      <Chip key={idx} label={exp} size="small" sx={{ mr: 0.5, mb: 0.5 }} />
                    ))}
                  </Box>
                </Grid>
                {selectedTrainer.reviewNotes && (
                  <Grid item xs={12}>
                    <Typography variant="subtitle2" color="textSecondary">Review Notes</Typography>
                    <Typography variant="body2">{selectedTrainer.reviewNotes}</Typography>
                  </Grid>
                )}
              </Grid>
              <Divider sx={{ my: 2 }} />
              <TextField
                fullWidth
                multiline
                rows={3}
                label="Add Review Notes"
                value={reviewNotes}
                onChange={(e) => setReviewNotes(e.target.value)}
                sx={{ mb: 2 }}
              />
              <Box sx={{ display: 'flex', gap: 1 }}>
                {!selectedTrainer.isVerified && (
                  <Button
                    variant="contained"
                    color="success"
                    onClick={() => handleUpdateVerification(selectedTrainer._id, true)}
                  >
                    Verify Trainer
                  </Button>
                )}
                {selectedTrainer.isVerified && (
                  <Button
                    variant="outlined"
                    color="warning"
                    onClick={() => handleUpdateVerification(selectedTrainer._id, false)}
                  >
                    Unverify Trainer
                  </Button>
                )}
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDetailsDialog(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Metrics Dialog */}
      <Dialog 
        open={openMetricsDialog} 
        onClose={() => setOpenMetricsDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Performance Metrics</DialogTitle>
        <DialogContent>
          {trainerMetrics && (
            <Box sx={{ mt: 2 }}>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" color="primary">Courses</Typography>
                      <Typography variant="h4">{trainerMetrics.courses.total}</Typography>
                      <Typography variant="body2" color="textSecondary">
                        Published: {trainerMetrics.courses.published} | Draft: {trainerMetrics.courses.draft}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" color="primary">Students</Typography>
                      <Typography variant="h4">{trainerMetrics.students.total}</Typography>
                      <Typography variant="body2" color="textSecondary">
                        Active: {trainerMetrics.students.activeEnrollments} | Completed: {trainerMetrics.students.completedEnrollments}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" color="primary">Revenue</Typography>
                      <Typography variant="h4">${trainerMetrics.revenue.totalRevenue.toFixed(2)}</Typography>
                      <Typography variant="body2" color="textSecondary">
                        Trainer Earnings: ${trainerMetrics.revenue.trainerEarnings.toFixed(2)}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" color="primary">Performance</Typography>
                      <Typography variant="h4">{trainerMetrics.performance.averageCourseRating.toFixed(1)}</Typography>
                      <Typography variant="body2" color="textSecondary">
                        Completion Rate: {trainerMetrics.performance.completionRate}%
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenMetricsDialog(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Payout Dialog */}
      <Dialog 
        open={openPayoutDialog} 
        onClose={() => setOpenPayoutDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Trainer Payouts</DialogTitle>
        <DialogContent>
          {selectedTrainer && (
            <Box sx={{ mt: 2 }}>
              <Card sx={{ mb: 3 }}>
                <CardContent>
                  <Typography variant="h6">Payout Summary</Typography>
                  <Grid container spacing={2} sx={{ mt: 1 }}>
                    <Grid item xs={4}>
                      <Typography variant="body2" color="textSecondary">Pending</Typography>
                      <Typography variant="h6">${selectedTrainer.pendingPayout?.toFixed(2) || '0.00'}</Typography>
                    </Grid>
                    <Grid item xs={4}>
                      <Typography variant="body2" color="textSecondary">Total Paid</Typography>
                      <Typography variant="h6">${selectedTrainer.totalPaidOut?.toFixed(2) || '0.00'}</Typography>
                    </Grid>
                    <Grid item xs={4}>
                      <Typography variant="body2" color="textSecondary">Commission</Typography>
                      <Typography variant="h6">{selectedTrainer.commissionRate}%</Typography>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>

              <Typography variant="h6" sx={{ mb: 2 }}>Create New Payout</Typography>
              <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    type="number"
                    label="Amount"
                    value={payoutAmount}
                    onChange={(e) => setPayoutAmount(e.target.value)}
                    inputProps={{ min: 0, step: 0.01 }}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth>
                    <InputLabel>Payout Method</InputLabel>
                    <Select
                      value={payoutMethod}
                      label="Payout Method"
                      onChange={(e) => setPayoutMethod(e.target.value)}
                    >
                      <MenuItem value="bank_transfer">Bank Transfer</MenuItem>
                      <MenuItem value="paypal">PayPal</MenuItem>
                      <MenuItem value="stripe">Stripe</MenuItem>
                      <MenuItem value="other">Other</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    multiline
                    rows={2}
                    label="Notes"
                    value={payoutNotes}
                    onChange={(e) => setPayoutNotes(e.target.value)}
                  />
                </Grid>
                <Grid item xs={12}>
                  <Button
                    variant="contained"
                    onClick={handleCreatePayout}
                    disabled={!payoutAmount || parseFloat(payoutAmount) <= 0}
                  >
                    Process Payout
                  </Button>
                </Grid>
              </Grid>

              <Divider sx={{ mb: 2 }} />
              
              <Typography variant="h6" sx={{ mb: 2 }}>Payout History</Typography>
              {trainerPayouts.length === 0 ? (
                <Alert severity="info">No payouts yet</Alert>
              ) : (
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Date</TableCell>
                      <TableCell>Amount</TableCell>
                      <TableCell>Method</TableCell>
                      <TableCell>Status</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {trainerPayouts.map((payout) => (
                      <TableRow key={payout._id}>
                        <TableCell>{new Date(payout.createdAt).toLocaleDateString()}</TableCell>
                        <TableCell>${payout.amount.toFixed(2)}</TableCell>
                        <TableCell>{payout.payoutMethod}</TableCell>
                        <TableCell>
                          <Chip 
                            label={payout.status} 
                            size="small"
                            color={payout.status === 'completed' ? 'success' : 'default'}
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenPayoutDialog(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Create Trainer Dialog */}
      <Dialog 
        open={openCreateDialog} 
        onClose={handleCloseCreateDialog}
        maxWidth="lg"
        fullWidth
        scroll="paper"
      >
        <DialogTitle>Create Trainer Profile</DialogTitle>
        <DialogContent dividers>
          <Box sx={{ mt: 1 }}>
            <Grid container spacing={3}>
              {/* Verification Status */}
              <Grid item xs={12} md={6}>
                <FormControl fullWidth required>
                  <InputLabel>Verification Status (Required)</InputLabel>
                  <Select
                    value={createFormData.verificationStatus}
                    label="Verification Status (Required)"
                    onChange={(e) => setCreateFormData({ ...createFormData, verificationStatus: e.target.value })}
                  >
                    <MenuItem value="Approved">Approved</MenuItem>
                    <MenuItem value="Pending">Pending</MenuItem>
                    <MenuItem value="Rejected">Rejected</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              {/* User Selection */}
              <Grid item xs={12} md={6}>
                <FormControl fullWidth required>
                  <InputLabel>Select User (Required)</InputLabel>
                  <Select
                    value={createFormData.userId}
                    label="Select User (Required)"
                    onChange={(e) => {
                      const selectedUser = users.find(u => u._id === e.target.value);
                      setCreateFormData({
                        ...createFormData,
                        userId: e.target.value,
                        fullName: selectedUser?.name || ''
                      });
                    }}
                    disabled={loadingUsers}
                  >
                    {loadingUsers ? (
                      <MenuItem value="">
                        <CircularProgress size={20} sx={{ mr: 1 }} />
                        Loading users...
                      </MenuItem>
                    ) : users.length === 0 ? (
                      <MenuItem value="">No users available</MenuItem>
                    ) : (
                      users.map((user) => (
                        <MenuItem key={user._id} value={user._id}>
                          {user.name} ({user.email})
                        </MenuItem>
                      ))
                    )}
                  </Select>
                </FormControl>
              </Grid>

              {/* Full Name */}
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  required
                  label="Full Name (Required)"
                  value={createFormData.fullName}
                  onChange={(e) => setCreateFormData({ ...createFormData, fullName: e.target.value })}
                  helperText="Minimum 3 characters"
                />
              </Grid>

              {/* Professional Title */}
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Professional Title (Optional)"
                  value={createFormData.title}
                  onChange={(e) => setCreateFormData({ ...createFormData, title: e.target.value })}
                  placeholder="e.g., Senior Web Development Instructor"
                />
              </Grid>

              {/* Biography - Multi-language */}
              <Grid item xs={12}>
                <Typography variant="subtitle2" gutterBottom>
                  Biography (Optional - Multi-language)
                </Typography>
                <Tabs value={currentBioLang} onChange={(e, val) => setCurrentBioLang(val)} sx={{ mb: 1 }}>
                  <Tab label="English" value="en" />
                  <Tab label="Arabic" value="ar" />
                  <Tab label="French" value="fr" />
                </Tabs>
                {currentBioLang === 'en' && (
                  <TextField
                    fullWidth
                    multiline
                    rows={3}
                    label="Biography (English)"
                    value={createFormData.bioEn}
                    onChange={(e) => setCreateFormData({ ...createFormData, bioEn: e.target.value })}
                  />
                )}
                {currentBioLang === 'ar' && (
                  <TextField
                    fullWidth
                    multiline
                    rows={3}
                    label="Biography (Arabic)"
                    value={createFormData.bioAr}
                    onChange={(e) => setCreateFormData({ ...createFormData, bioAr: e.target.value })}
                  />
                )}
                {currentBioLang === 'fr' && (
                  <TextField
                    fullWidth
                    multiline
                    rows={3}
                    label="Biography (French)"
                    value={createFormData.bioFr}
                    onChange={(e) => setCreateFormData({ ...createFormData, bioFr: e.target.value })}
                  />
                )}
              </Grid>

              {/* Areas of Expertise */}
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Areas of Expertise (Optional)"
                  value={createFormData.expertise}
                  onChange={(e) => setCreateFormData({ ...createFormData, expertise: e.target.value })}
                  placeholder="Web Development, React, Node.js"
                  helperText="Comma-separated list of expertise areas"
                />
              </Grid>

              {/* Years of Experience */}
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  type="number"
                  label="Years of Experience (Optional)"
                  value={createFormData.experience}
                  onChange={(e) => setCreateFormData({ ...createFormData, experience: e.target.value })}
                  inputProps={{ min: 0, max: MAX_EXPERIENCE_YEARS, step: 0.5 }}
                  helperText={`Maximum ${MAX_EXPERIENCE_YEARS} years (can include decimals like 2.5)`}
                />
              </Grid>

              {/* Verified On Date */}
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  type="date"
                  label="Verified On (Optional)"
                  value={createFormData.verificationDate}
                  onChange={(e) => setCreateFormData({ ...createFormData, verificationDate: e.target.value })}
                  InputLabelProps={{ shrink: true }}
                  helperText="Automatically set to current date for Approved status"
                />
              </Grid>

              {/* Qualifications Section */}
              <Grid item xs={12}>
                <Divider sx={{ my: 2 }} />
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="subtitle1" fontWeight="medium">
                    Qualifications (Optional)
                  </Typography>
                  <Button
                    size="small"
                    variant="outlined"
                    startIcon={<AddIcon />}
                    onClick={addQualification}
                  >
                    Add Qualification
                  </Button>
                </Box>
                {createFormData.qualifications.map((qual, index) => (
                  <Box key={index} sx={{ mb: 2, p: 2, border: '1px solid #e0e0e0', borderRadius: 1 }}>
                    <Grid container spacing={2}>
                      <Grid item xs={12} md={5}>
                        <TextField
                          fullWidth
                          size="small"
                          label="Degree/Name"
                          value={qual.degree}
                          onChange={(e) => updateQualification(index, 'degree', e.target.value)}
                        />
                      </Grid>
                      <Grid item xs={12} md={5}>
                        <TextField
                          fullWidth
                          size="small"
                          label="Institution/Organization"
                          value={qual.institution}
                          onChange={(e) => updateQualification(index, 'institution', e.target.value)}
                        />
                      </Grid>
                      <Grid item xs={8} md={2}>
                        <TextField
                          fullWidth
                          size="small"
                          type="number"
                          label="Year"
                          value={qual.year}
                          onChange={(e) => updateQualification(index, 'year', e.target.value)}
                        />
                      </Grid>
                      <Grid item xs={4} md={1}>
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => removeQualification(index)}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Grid>
                    </Grid>
                  </Box>
                ))}
              </Grid>

              {/* Certifications Section */}
              <Grid item xs={12}>
                <Divider sx={{ my: 2 }} />
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="subtitle1" fontWeight="medium">
                    Certifications (Optional)
                  </Typography>
                  <Button
                    size="small"
                    variant="outlined"
                    startIcon={<AddIcon />}
                    onClick={addCertification}
                  >
                    Add Certification
                  </Button>
                </Box>
                {createFormData.certifications.map((cert, index) => (
                  <Box key={index} sx={{ mb: 2, p: 2, border: '1px solid #e0e0e0', borderRadius: 1 }}>
                    <Grid container spacing={2}>
                      <Grid item xs={12} md={5}>
                        <TextField
                          fullWidth
                          size="small"
                          label="Certificate Name"
                          value={cert.name}
                          onChange={(e) => updateCertification(index, 'name', e.target.value)}
                        />
                      </Grid>
                      <Grid item xs={12} md={5}>
                        <TextField
                          fullWidth
                          size="small"
                          label="Issuing Organization"
                          value={cert.organization}
                          onChange={(e) => updateCertification(index, 'organization', e.target.value)}
                        />
                      </Grid>
                      <Grid item xs={8} md={2}>
                        <TextField
                          fullWidth
                          size="small"
                          type="number"
                          label="Year"
                          value={cert.year}
                          onChange={(e) => updateCertification(index, 'year', e.target.value)}
                        />
                      </Grid>
                      <Grid item xs={4} md={1}>
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => removeCertification(index)}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Grid>
                    </Grid>
                  </Box>
                ))}
              </Grid>

              {/* Languages Section */}
              <Grid item xs={12}>
                <Divider sx={{ my: 2 }} />
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="subtitle1" fontWeight="medium">
                    Languages (Optional)
                  </Typography>
                  <Button
                    size="small"
                    variant="outlined"
                    startIcon={<AddIcon />}
                    onClick={addLanguage}
                  >
                    Add Language
                  </Button>
                </Box>
                {createFormData.languages.map((lang, index) => (
                  <Box key={index} sx={{ mb: 2, p: 2, border: '1px solid #e0e0e0', borderRadius: 1 }}>
                    <Grid container spacing={2}>
                      <Grid item xs={12} md={5}>
                        <TextField
                          fullWidth
                          size="small"
                          label="Language"
                          value={lang.language}
                          onChange={(e) => updateLanguage(index, 'language', e.target.value)}
                          placeholder="e.g., English, Arabic, French"
                        />
                      </Grid>
                      <Grid item xs={8} md={6}>
                        <FormControl fullWidth size="small">
                          <InputLabel>Proficiency</InputLabel>
                          <Select
                            value={lang.proficiency}
                            label="Proficiency"
                            onChange={(e) => updateLanguage(index, 'proficiency', e.target.value)}
                          >
                            <MenuItem value="native">Native</MenuItem>
                            <MenuItem value="advanced">Fluent/Advanced</MenuItem>
                            <MenuItem value="intermediate">Intermediate</MenuItem>
                            <MenuItem value="basic">Basic</MenuItem>
                          </Select>
                        </FormControl>
                      </Grid>
                      <Grid item xs={4} md={1}>
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => removeLanguage(index)}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Grid>
                    </Grid>
                  </Box>
                ))}
              </Grid>

              {/* Commission Rate */}
              <Grid item xs={12}>
                <Divider sx={{ my: 2 }} />
                <TextField
                  fullWidth
                  type="number"
                  label="Commission Rate (%) (Optional)"
                  value={createFormData.commissionRate}
                  onChange={(e) => setCreateFormData({ ...createFormData, commissionRate: e.target.value })}
                  inputProps={{ min: 0, max: 100, step: 1 }}
                  helperText="Percentage commission for the trainer (default: 20%)"
                />
              </Grid>

              {/* Display created trainer info with QR code */}
              {createdTrainer && createdTrainer.qrCode && (
                <Grid item xs={12}>
                  <Alert severity="success" sx={{ mt: 2 }}>
                    <Typography variant="subtitle2" gutterBottom>
                      Trainer Created Successfully!
                    </Typography>
                    <Typography variant="body2" gutterBottom>
                      Trainer ID: <strong>{createdTrainer.trainerId}</strong>
                    </Typography>
                    {createdTrainer.qrCode && (
                      <Box sx={{ mt: 2, textAlign: 'center' }}>
                        <Typography variant="body2" gutterBottom>
                          QR Code for Verification:
                        </Typography>
                        <img 
                          src={createdTrainer.qrCode} 
                          alt="Trainer QR Code" 
                          style={{ maxWidth: '200px', border: '1px solid #ccc', padding: '8px' }}
                        />
                        <Typography variant="caption" display="block" sx={{ mt: 1 }}>
                          Verification URL: {createdTrainer.verificationUrl}
                        </Typography>
                      </Box>
                    )}
                  </Alert>
                </Grid>
              )}
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseCreateDialog}>Close</Button>
          <Button 
            onClick={handleCreateTrainer}
            variant="contained"
            disabled={!createFormData.userId || !createFormData.fullName || createFormData.fullName.length < 3}
          >
            Create Trainer
          </Button>
        </DialogActions>
      </Dialog>

      {/* QR Code Dialog */}
      <Dialog 
        open={openQrDialog} 
        onClose={handleCloseQrDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Trainer QR Code</DialogTitle>
        <DialogContent>
          {selectedTrainer && (
            <Box sx={{ mt: 2, textAlign: 'center' }}>
              <Typography variant="subtitle1" gutterBottom>
                Trainer ID: <strong>{selectedTrainer.trainerId}</strong>
              </Typography>
              <Typography variant="body2" color="textSecondary" gutterBottom>
                Name: {selectedTrainer.fullName}
              </Typography>
              <Divider sx={{ my: 2 }} />
              {selectedTrainer.qrCode ? (
                <>
                  <Typography variant="body2" gutterBottom>
                    Scan this QR code to verify the trainer:
                  </Typography>
                  <Box sx={{ mt: 2, mb: 2 }}>
                    <Box
                      component="img"
                      src={selectedTrainer.qrCode}
                      alt="Trainer QR Code"
                      sx={{ maxWidth: '300px', border: '2px solid #2e7d32', p: 2, borderRadius: 1 }}
                    />
                  </Box>
                  {selectedTrainer.verificationUrl && (
                    <Box sx={{ mt: 2, p: 2, bgcolor: '#f5f5f5', borderRadius: 1 }}>
                      <Typography variant="caption" display="block" color="textSecondary">
                        Verification URL:
                      </Typography>
                      <Typography variant="body2" sx={{ wordBreak: 'break-word' }}>
                        {selectedTrainer.verificationUrl}
                      </Typography>
                    </Box>
                  )}
                </>
              ) : (
                <Alert severity="warning">
                  QR code not available for this trainer. It may have been created before the QR code feature was implemented.
                </Alert>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseQrDialog}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Edit Trainer Dialog */}
      <Dialog 
        open={openEditDialog} 
        onClose={handleCloseEditDialog}
        maxWidth="lg"
        fullWidth
        scroll="paper"
      >
        <DialogTitle>Edit Trainer Profile</DialogTitle>
        <DialogContent dividers>
          <Box sx={{ mt: 1 }}>
            <Grid container spacing={3}>
              {/* Full Name */}
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  required
                  label="Full Name (Required)"
                  value={editFormData.fullName}
                  onChange={(e) => setEditFormData({ ...editFormData, fullName: e.target.value })}
                  helperText="Minimum 3 characters"
                />
              </Grid>

              {/* Professional Title */}
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Professional Title (Optional)"
                  value={editFormData.title}
                  onChange={(e) => setEditFormData({ ...editFormData, title: e.target.value })}
                  placeholder="e.g., Senior Web Development Instructor"
                />
              </Grid>

              {/* Biography - Multi-language */}
              <Grid item xs={12}>
                <Typography variant="subtitle2" gutterBottom>
                  Biography (Optional - Multi-language)
                </Typography>
                <Tabs value={editBioLang} onChange={(e, val) => setEditBioLang(val)} sx={{ mb: 1 }}>
                  <Tab label="English" value="en" />
                  <Tab label="Arabic" value="ar" />
                  <Tab label="French" value="fr" />
                </Tabs>
                {editBioLang === 'en' && (
                  <TextField
                    fullWidth
                    multiline
                    rows={3}
                    label="Biography (English)"
                    value={editFormData.bioEn}
                    onChange={(e) => setEditFormData({ ...editFormData, bioEn: e.target.value })}
                  />
                )}
                {editBioLang === 'ar' && (
                  <TextField
                    fullWidth
                    multiline
                    rows={3}
                    label="Biography (Arabic)"
                    value={editFormData.bioAr}
                    onChange={(e) => setEditFormData({ ...editFormData, bioAr: e.target.value })}
                  />
                )}
                {editBioLang === 'fr' && (
                  <TextField
                    fullWidth
                    multiline
                    rows={3}
                    label="Biography (French)"
                    value={editFormData.bioFr}
                    onChange={(e) => setEditFormData({ ...editFormData, bioFr: e.target.value })}
                  />
                )}
              </Grid>

              {/* Areas of Expertise */}
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Areas of Expertise (Optional)"
                  value={editFormData.expertise}
                  onChange={(e) => setEditFormData({ ...editFormData, expertise: e.target.value })}
                  placeholder="Web Development, React, Node.js"
                  helperText="Comma-separated list of expertise areas"
                />
              </Grid>

              {/* Years of Experience */}
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  type="number"
                  label="Years of Experience (Optional)"
                  value={editFormData.experience}
                  onChange={(e) => setEditFormData({ ...editFormData, experience: e.target.value })}
                  inputProps={{ min: 0, max: MAX_EXPERIENCE_YEARS, step: 0.5 }}
                  helperText={`Maximum ${MAX_EXPERIENCE_YEARS} years (can include decimals like 2.5)`}
                />
              </Grid>

              {/* Commission Rate */}
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  type="number"
                  label="Commission Rate (%) (Optional)"
                  value={editFormData.commissionRate}
                  onChange={(e) => setEditFormData({ ...editFormData, commissionRate: e.target.value })}
                  inputProps={{ min: 0, max: 100, step: 1 }}
                  helperText="Percentage commission for the trainer (default: 20%)"
                />
              </Grid>

              {/* Qualifications Section */}
              <Grid item xs={12}>
                <Divider sx={{ my: 2 }} />
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="subtitle1" fontWeight="medium">
                    Qualifications (Optional)
                  </Typography>
                  <Button
                    size="small"
                    variant="outlined"
                    startIcon={<AddIcon />}
                    onClick={addEditQualification}
                  >
                    Add Qualification
                  </Button>
                </Box>
                {editFormData.qualifications.map((qual, index) => (
                  <Box key={index} sx={{ mb: 2, p: 2, border: '1px solid #e0e0e0', borderRadius: 1 }}>
                    <Grid container spacing={2}>
                      <Grid item xs={12} md={5}>
                        <TextField
                          fullWidth
                          size="small"
                          label="Degree/Name"
                          value={qual.degree}
                          onChange={(e) => updateEditQualification(index, 'degree', e.target.value)}
                        />
                      </Grid>
                      <Grid item xs={12} md={5}>
                        <TextField
                          fullWidth
                          size="small"
                          label="Institution/Organization"
                          value={qual.institution}
                          onChange={(e) => updateEditQualification(index, 'institution', e.target.value)}
                        />
                      </Grid>
                      <Grid item xs={8} md={2}>
                        <TextField
                          fullWidth
                          size="small"
                          type="number"
                          label="Year"
                          value={qual.year}
                          onChange={(e) => updateEditQualification(index, 'year', e.target.value)}
                        />
                      </Grid>
                      <Grid item xs={4} md={1}>
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => removeEditQualification(index)}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Grid>
                    </Grid>
                  </Box>
                ))}
              </Grid>

              {/* Certifications Section */}
              <Grid item xs={12}>
                <Divider sx={{ my: 2 }} />
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="subtitle1" fontWeight="medium">
                    Certifications (Optional)
                  </Typography>
                  <Button
                    size="small"
                    variant="outlined"
                    startIcon={<AddIcon />}
                    onClick={addEditCertification}
                  >
                    Add Certification
                  </Button>
                </Box>
                {editFormData.certifications.map((cert, index) => (
                  <Box key={index} sx={{ mb: 2, p: 2, border: '1px solid #e0e0e0', borderRadius: 1 }}>
                    <Grid container spacing={2}>
                      <Grid item xs={12} md={5}>
                        <TextField
                          fullWidth
                          size="small"
                          label="Certificate Name"
                          value={cert.name}
                          onChange={(e) => updateEditCertification(index, 'name', e.target.value)}
                        />
                      </Grid>
                      <Grid item xs={12} md={5}>
                        <TextField
                          fullWidth
                          size="small"
                          label="Issuing Organization"
                          value={cert.organization}
                          onChange={(e) => updateEditCertification(index, 'organization', e.target.value)}
                        />
                      </Grid>
                      <Grid item xs={8} md={2}>
                        <TextField
                          fullWidth
                          size="small"
                          type="number"
                          label="Year"
                          value={cert.year}
                          onChange={(e) => updateEditCertification(index, 'year', e.target.value)}
                        />
                      </Grid>
                      <Grid item xs={4} md={1}>
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => removeEditCertification(index)}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Grid>
                    </Grid>
                  </Box>
                ))}
              </Grid>

              {/* Languages Section */}
              <Grid item xs={12}>
                <Divider sx={{ my: 2 }} />
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="subtitle1" fontWeight="medium">
                    Languages (Optional)
                  </Typography>
                  <Button
                    size="small"
                    variant="outlined"
                    startIcon={<AddIcon />}
                    onClick={addEditLanguage}
                  >
                    Add Language
                  </Button>
                </Box>
                {editFormData.languages.map((lang, index) => (
                  <Box key={index} sx={{ mb: 2, p: 2, border: '1px solid #e0e0e0', borderRadius: 1 }}>
                    <Grid container spacing={2}>
                      <Grid item xs={12} md={5}>
                        <TextField
                          fullWidth
                          size="small"
                          label="Language"
                          value={lang.language}
                          onChange={(e) => updateEditLanguage(index, 'language', e.target.value)}
                          placeholder="e.g., English, Arabic, French"
                        />
                      </Grid>
                      <Grid item xs={8} md={6}>
                        <FormControl fullWidth size="small">
                          <InputLabel>Proficiency</InputLabel>
                          <Select
                            value={lang.proficiency}
                            label="Proficiency"
                            onChange={(e) => updateEditLanguage(index, 'proficiency', e.target.value)}
                          >
                            <MenuItem value="native">Native</MenuItem>
                            <MenuItem value="advanced">Fluent/Advanced</MenuItem>
                            <MenuItem value="intermediate">Intermediate</MenuItem>
                            <MenuItem value="basic">Basic</MenuItem>
                          </Select>
                        </FormControl>
                      </Grid>
                      <Grid item xs={4} md={1}>
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => removeEditLanguage(index)}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Grid>
                    </Grid>
                  </Box>
                ))}
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseEditDialog}>Cancel</Button>
          <Button 
            onClick={handleUpdateTrainer}
            variant="contained"
            disabled={!editFormData.fullName || editFormData.fullName.length < 3}
          >
            Update Trainer
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default AdminTrainers;
