import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Container,
  Paper,
  Typography,
  Button,
  Grid,
  Card,
  CardMedia,
  CardContent,
  CardActions,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Chip,
  CircularProgress,
  Alert
} from '@mui/material';
import {
  Delete as DeleteIcon,
  Edit as EditIcon,
  CloudUpload as UploadIcon,
  Image as ImageIcon,
  VideoLibrary as VideoIcon,
  Description as DocumentIcon
} from '@mui/icons-material';
import { toast } from 'react-toastify';
import adminService from '../services/adminService';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const AdminMedia = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [media, setMedia] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedMedia, setSelectedMedia] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const [formData, setFormData] = useState({
    title: { en: '', ar: '', fr: '' },
    description: { en: '', ar: '', fr: '' },
    altText: { en: '', ar: '', fr: '' },
    tags: []
  });

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      navigate('/');
      return;
    }
    fetchMedia();
  }, [user, navigate]);

  const fetchMedia = async () => {
    try {
      setLoading(true);
      const response = await adminService.getAllMedia();
      setMedia(response.data || []);
    } catch (error) {
      toast.error('Failed to fetch media');
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDrag = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback(async (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const files = e.dataTransfer.files;
      try {
        setUploading(true);
        const formData = new FormData();
        
        Array.from(files).forEach(file => {
          formData.append('files', file);
        });
        
        formData.append('category', 'general');

        const response = await adminService.uploadMedia(formData);
        toast.success(`Uploaded ${response.count} file(s) successfully`);
        fetchMedia();
      } catch (error) {
        toast.error('Failed to upload files');
        console.error('Error:', error);
      } finally {
        setUploading(false);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleFileUpload = async (files) => {
    try {
      setUploading(true);
      const formData = new FormData();
      
      Array.from(files).forEach(file => {
        formData.append('files', file);
      });
      
      formData.append('category', 'general');

      const response = await adminService.uploadMedia(formData);
      toast.success(`Uploaded ${response.count} file(s) successfully`);
      fetchMedia();
    } catch (error) {
      toast.error('Failed to upload files');
      console.error('Error:', error);
    } finally {
      setUploading(false);
    }
  };

  const handleFileSelect = (event) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      handleFileUpload(files);
    }
  };

  const handleEditMedia = (item) => {
    setSelectedMedia(item);
    setFormData({
      title: item.title || { en: '', ar: '', fr: '' },
      description: item.description || { en: '', ar: '', fr: '' },
      altText: item.altText || { en: '', ar: '', fr: '' },
      tags: item.tags || []
    });
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedMedia(null);
  };

  const handleUpdateMedia = async () => {
    try {
      await adminService.updateMedia(selectedMedia._id, formData);
      toast.success('Media updated successfully');
      handleCloseDialog();
      fetchMedia();
    } catch (error) {
      toast.error('Failed to update media');
      console.error('Error:', error);
    }
  };

  const handleDeleteMedia = async (id) => {
    if (!window.confirm('Are you sure you want to delete this media?')) {
      return;
    }

    try {
      await adminService.deleteMedia(id);
      toast.success('Media deleted successfully');
      fetchMedia();
    } catch (error) {
      toast.error('Failed to delete media');
      console.error('Error:', error);
    }
  };

  const getMediaIcon = (type) => {
    switch (type) {
      case 'image':
        return <ImageIcon />;
      case 'video':
        return <VideoIcon />;
      case 'document':
        return <DocumentIcon />;
      default:
        return <DocumentIcon />;
    }
  };

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
          Media Management
        </Typography>
      </Box>

      {/* Upload Area */}
      <Paper
        sx={{
          p: 4,
          mb: 3,
          border: dragActive ? '2px dashed #2e7d32' : '2px dashed #ccc',
          backgroundColor: dragActive ? '#f1f8f4' : '#fafafa',
          textAlign: 'center',
          cursor: 'pointer',
          transition: 'all 0.3s ease'
        }}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => document.getElementById('file-input').click()}
      >
        <input
          id="file-input"
          type="file"
          multiple
          onChange={handleFileSelect}
          style={{ display: 'none' }}
          accept="image/*,video/*,.pdf,.doc,.docx,.xls,.xlsx"
        />
        {uploading ? (
          <CircularProgress />
        ) : (
          <>
            <UploadIcon sx={{ fontSize: 60, color: 'primary.main', mb: 2 }} />
            <Typography variant="h6" gutterBottom>
              Drag and drop files here or click to browse
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Supported formats: Images, Videos, Documents (PDF, DOC, XLS)
            </Typography>
          </>
        )}
      </Paper>

      {/* Media Grid */}
      {loading ? (
        <Box display="flex" justifyContent="center" py={5}>
          <CircularProgress />
        </Box>
      ) : media.length === 0 ? (
        <Alert severity="info">No media files found. Upload some files to get started.</Alert>
      ) : (
        <Grid container spacing={2}>
          {media.map((item) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={item._id}>
              <Card>
                {item.type === 'image' ? (
                  <CardMedia
                    component="img"
                    height="200"
                    image={item.url}
                    alt={item.originalName}
                    sx={{ objectFit: 'cover' }}
                  />
                ) : (
                  <Box
                    display="flex"
                    justifyContent="center"
                    alignItems="center"
                    height={200}
                    bgcolor="grey.200"
                  >
                    {getMediaIcon(item.type)}
                  </Box>
                )}
                <CardContent>
                  <Typography variant="body2" noWrap title={item.originalName}>
                    {item.originalName}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {item.type} • {(item.size / 1024).toFixed(2)} KB
                  </Typography>
                  {item.tags && item.tags.length > 0 && (
                    <Box mt={1}>
                      {item.tags.slice(0, 2).map((tag, index) => (
                        <Chip key={index} label={tag} size="small" sx={{ mr: 0.5, mb: 0.5 }} />
                      ))}
                    </Box>
                  )}
                </CardContent>
                <CardActions>
                  <IconButton
                    size="small"
                    onClick={() => handleEditMedia(item)}
                    title="Edit"
                  >
                    <EditIcon />
                  </IconButton>
                  <IconButton
                    size="small"
                    onClick={() => handleDeleteMedia(item._id)}
                    title="Delete"
                  >
                    <DeleteIcon />
                  </IconButton>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Edit Media Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>Edit Media Metadata</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Title (EN)"
                value={formData.title.en || ''}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  title: { ...prev.title, en: e.target.value }
                }))}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={3}
                label="Description (EN)"
                value={formData.description.en || ''}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  description: { ...prev.description, en: e.target.value }
                }))}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Alt Text (EN)"
                value={formData.altText.en || ''}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  altText: { ...prev.altText, en: e.target.value }
                }))}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Tags (comma separated)"
                value={formData.tags.join(', ')}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  tags: e.target.value.split(',').map(tag => tag.trim()).filter(Boolean)
                }))}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleUpdateMedia} variant="contained">
            Update
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default AdminMedia;
