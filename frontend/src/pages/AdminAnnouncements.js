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
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Grid,
  Chip,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  CircularProgress
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon
} from '@mui/icons-material';
import { toast } from 'react-toastify';
import adminService from '../services/adminService';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const AdminAnnouncements = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState(null);
  const [formData, setFormData] = useState({
    title: { en: '', ar: '', fr: '' },
    content: { en: '', ar: '', fr: '' },
    type: 'info',
    priority: 'medium',
    targetAudience: ['all'],
    status: 'draft',
    startDate: new Date().toISOString().split('T')[0],
    endDate: '',
    dismissible: true
  });

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      navigate('/');
      return;
    }
    fetchAnnouncements();
  }, [user, navigate]);

  const fetchAnnouncements = async () => {
    try {
      setLoading(true);
      const response = await adminService.getAllAnnouncements();
      setAnnouncements(response.data || []);
    } catch (error) {
      toast.error('Failed to fetch announcements');
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (announcement = null) => {
    if (announcement) {
      setSelectedAnnouncement(announcement);
      setFormData({
        title: announcement.title || { en: '', ar: '', fr: '' },
        content: announcement.content || { en: '', ar: '', fr: '' },
        type: announcement.type || 'info',
        priority: announcement.priority || 'medium',
        targetAudience: announcement.targetAudience || ['all'],
        status: announcement.status || 'draft',
        startDate: announcement.startDate ? new Date(announcement.startDate).toISOString().split('T')[0] : '',
        endDate: announcement.endDate ? new Date(announcement.endDate).toISOString().split('T')[0] : '',
        dismissible: announcement.dismissible !== false
      });
    } else {
      setSelectedAnnouncement(null);
      setFormData({
        title: { en: '', ar: '', fr: '' },
        content: { en: '', ar: '', fr: '' },
        type: 'info',
        priority: 'medium',
        targetAudience: ['all'],
        status: 'draft',
        startDate: new Date().toISOString().split('T')[0],
        endDate: '',
        dismissible: true
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedAnnouncement(null);
  };

  const handleInputChange = (field, value, lang = null) => {
    if (lang) {
      setFormData(prev => ({
        ...prev,
        [field]: {
          ...prev[field],
          [lang]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };

  const handleSubmit = async () => {
    try {
      if (selectedAnnouncement) {
        await adminService.updateAnnouncement(selectedAnnouncement._id, formData);
        toast.success('Announcement updated successfully');
      } else {
        await adminService.createAnnouncement(formData);
        toast.success('Announcement created successfully');
      }
      handleCloseDialog();
      fetchAnnouncements();
    } catch (error) {
      toast.error('Failed to save announcement');
      console.error('Error:', error);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this announcement?')) {
      return;
    }

    try {
      await adminService.deleteAnnouncement(id);
      toast.success('Announcement deleted successfully');
      fetchAnnouncements();
    } catch (error) {
      toast.error('Failed to delete announcement');
      console.error('Error:', error);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'success';
      case 'scheduled': return 'info';
      case 'expired': return 'default';
      default: return 'warning';
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'info': return 'info';
      case 'warning': return 'warning';
      case 'success': return 'success';
      case 'error': return 'error';
      default: return 'default';
    }
  };

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
          Announcement Management
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
        >
          Add Announcement
        </Button>
      </Box>

      {loading ? (
        <Box display="flex" justifyContent="center" py={5}>
          <CircularProgress />
        </Box>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Title (EN)</TableCell>
                <TableCell>Type</TableCell>
                <TableCell>Priority</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Start Date</TableCell>
                <TableCell>End Date</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {announcements.map((announcement) => (
                <TableRow key={announcement._id}>
                  <TableCell>{announcement.title?.en || 'N/A'}</TableCell>
                  <TableCell>
                    <Chip
                      label={announcement.type}
                      color={getTypeColor(announcement.type)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>{announcement.priority}</TableCell>
                  <TableCell>
                    <Chip
                      label={announcement.status}
                      color={getStatusColor(announcement.status)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    {new Date(announcement.startDate).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    {announcement.endDate ? new Date(announcement.endDate).toLocaleDateString() : '-'}
                  </TableCell>
                  <TableCell align="right">
                    <IconButton
                      size="small"
                      onClick={() => handleOpenDialog(announcement)}
                      title="Edit"
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => handleDelete(announcement._id)}
                      title="Delete"
                    >
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Announcement Editor Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          {selectedAnnouncement ? 'Edit Announcement' : 'Create New Announcement'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} md={4}>
              <FormControl fullWidth>
                <InputLabel>Type</InputLabel>
                <Select
                  value={formData.type}
                  onChange={(e) => handleInputChange('type', e.target.value)}
                  label="Type"
                >
                  <MenuItem value="info">Info</MenuItem>
                  <MenuItem value="warning">Warning</MenuItem>
                  <MenuItem value="success">Success</MenuItem>
                  <MenuItem value="error">Error</MenuItem>
                  <MenuItem value="maintenance">Maintenance</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={4}>
              <FormControl fullWidth>
                <InputLabel>Priority</InputLabel>
                <Select
                  value={formData.priority}
                  onChange={(e) => handleInputChange('priority', e.target.value)}
                  label="Priority"
                >
                  <MenuItem value="low">Low</MenuItem>
                  <MenuItem value="medium">Medium</MenuItem>
                  <MenuItem value="high">High</MenuItem>
                  <MenuItem value="urgent">Urgent</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={4}>
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select
                  value={formData.status}
                  onChange={(e) => handleInputChange('status', e.target.value)}
                  label="Status"
                >
                  <MenuItem value="draft">Draft</MenuItem>
                  <MenuItem value="active">Active</MenuItem>
                  <MenuItem value="scheduled">Scheduled</MenuItem>
                  <MenuItem value="expired">Expired</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                type="date"
                label="Start Date"
                value={formData.startDate}
                onChange={(e) => handleInputChange('startDate', e.target.value)}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                type="date"
                label="End Date"
                value={formData.endDate}
                onChange={(e) => handleInputChange('endDate', e.target.value)}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>

            <Grid item xs={12}>
              <Typography variant="subtitle1" gutterBottom>
                English Content
              </Typography>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Title (EN)"
                value={formData.title.en}
                onChange={(e) => handleInputChange('title', e.target.value, 'en')}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={4}
                label="Content (EN)"
                value={formData.content.en}
                onChange={(e) => handleInputChange('content', e.target.value, 'en')}
              />
            </Grid>

            <Grid item xs={12}>
              <Typography variant="subtitle1" gutterBottom>
                Arabic Content
              </Typography>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Title (AR)"
                value={formData.title.ar}
                onChange={(e) => handleInputChange('title', e.target.value, 'ar')}
                inputProps={{ dir: 'rtl' }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={3}
                label="Content (AR)"
                value={formData.content.ar}
                onChange={(e) => handleInputChange('content', e.target.value, 'ar')}
                inputProps={{ dir: 'rtl' }}
              />
            </Grid>

            {/* Added French Content Section */}
            <Grid item xs={12}>
              <Typography variant="subtitle1" gutterBottom>
                French Content
              </Typography>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Title (FR)"
                value={formData.title.fr}
                onChange={(e) => handleInputChange('title', e.target.value, 'fr')}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={3}
                label="Content (FR)"
                value={formData.content.fr}
                onChange={(e) => handleInputChange('content', e.target.value, 'fr')}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained">
            {selectedAnnouncement ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default AdminAnnouncements;
