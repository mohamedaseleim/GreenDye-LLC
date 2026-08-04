import React, { useState, useEffect, useMemo, useCallback } from 'react';
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
  CircularProgress,
  Checkbox,
  FormControlLabel
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Publish as PublishIcon
} from '@mui/icons-material';
import { toast } from 'react-toastify';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import adminService from '../services/adminService';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

// Define formats outside component to prevent re-creation on every render
const QUILL_FORMATS = [
  'header',
  'bold', 'italic', 'underline', 'strike',
  'list', 'bullet', 'indent',
  'align',
  'link', 'image', 'video',
  'color', 'background',
  'blockquote', 'code-block'
];

const AdminPages = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [pages, setPages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedPage, setSelectedPage] = useState(null);
  const [formData, setFormData] = useState({
    slug: '',
    title: { en: '', ar: '', fr: '' },
    content: { en: '', ar: '', fr: '' },
    metaDescription: { en: '', ar: '', fr: '' },
    template: 'default',
    status: 'draft',
    showInHeader: false,
    showInFooter: false,
    menuOrder: 0
  });

  // Quill editor refs
  const quillRefEn = React.useRef(null);
  const quillRefAr = React.useRef(null);
  const quillRefFr = React.useRef(null);

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      navigate('/');
      return;
    }
    fetchPages();
  }, [user, navigate]);

  const fetchPages = async () => {
    try {
      setLoading(true);
      const response = await adminService.getAllPages();
      setPages(response.data || []);
    } catch (error) {
      toast.error('Failed to fetch pages');
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  // Image upload handler factory
  const createImageHandler = useCallback((quillRef) => {
    return () => {
      const input = document.createElement('input');
      input.setAttribute('type', 'file');
      input.setAttribute('accept', 'image/*');
      input.click();

      input.onchange = async () => {
        const file = input.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('files', file);
        formData.append('category', 'pages');

        try {
          const token = localStorage.getItem('token');
          const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/admin/cms/media/upload`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`
            },
            body: formData
          });

          const data = await response.json();
          
          if (data.success && data.data && data.data.length > 0) {
            const imageUrl = data.data[0].url;
            const quill = quillRef.current?.getEditor();
            if (quill) {
              const range = quill.getSelection(true);
              quill.insertEmbed(range?.index || 0, 'image', imageUrl);
            }
            toast.success('Image uploaded successfully');
          } else {
            toast.error('Failed to upload image');
          }
        } catch (error) {
          console.error('Error uploading image:', error);
          toast.error('Failed to upload image');
        }
      };
    };
  }, []);

  // Memoize modules for each language to prevent re-renders
  const modulesEn = useMemo(() => ({
    toolbar: {
      container: [
        [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
        ['bold', 'italic', 'underline', 'strike'],
        [{ 'list': 'ordered'}, { 'list': 'bullet' }],
        [{ 'indent': '-1'}, { 'indent': '+1' }],
        [{ 'align': [] }],
        ['link', 'image', 'video'],
        [{ 'color': [] }, { 'background': [] }],
        ['blockquote', 'code-block'],
        ['clean']
      ],
      handlers: {
        image: createImageHandler(quillRefEn)
      }
    }
  }), [createImageHandler]);

  const modulesAr = useMemo(() => ({
    toolbar: {
      container: [
        [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
        ['bold', 'italic', 'underline', 'strike'],
        [{ 'list': 'ordered'}, { 'list': 'bullet' }],
        [{ 'indent': '-1'}, { 'indent': '+1' }],
        [{ 'align': [] }],
        ['link', 'image', 'video'],
        [{ 'color': [] }, { 'background': [] }],
        ['blockquote', 'code-block'],
        ['clean']
      ],
      handlers: {
        image: createImageHandler(quillRefAr)
      }
    }
  }), [createImageHandler]);

  const modulesFr = useMemo(() => ({
    toolbar: {
      container: [
        [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
        ['bold', 'italic', 'underline', 'strike'],
        [{ 'list': 'ordered'}, { 'list': 'bullet' }],
        [{ 'indent': '-1'}, { 'indent': '+1' }],
        [{ 'align': [] }],
        ['link', 'image', 'video'],
        [{ 'color': [] }, { 'background': [] }],
        ['blockquote', 'code-block'],
        ['clean']
      ],
      handlers: {
        image: createImageHandler(quillRefFr)
      }
    }
  }), [createImageHandler]);

  const handleOpenDialog = (page = null) => {
    if (page) {
      setSelectedPage(page);
      setFormData({
        slug: page.slug || '',
        title: page.title || { en: '', ar: '', fr: '' },
        // Ensure content is initialized properly, handling potential missing keys
        content: { 
          en: page.content?.en || '', 
          ar: page.content?.ar || '', 
          fr: page.content?.fr || '' 
        },
        metaDescription: page.metaDescription || { en: '', ar: '', fr: '' },
        template: page.template || 'default',
        status: page.status || 'draft',
        showInHeader: page.showInHeader || false,
        showInFooter: page.showInFooter || false,
        menuOrder: page.menuOrder || 0
      });
    } else {
      setSelectedPage(null);
      setFormData({
        slug: '',
        title: { en: '', ar: '', fr: '' },
        content: { en: '', ar: '', fr: '' },
        metaDescription: { en: '', ar: '', fr: '' },
        template: 'default',
        status: 'draft',
        showInHeader: false,
        showInFooter: false,
        menuOrder: 0
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedPage(null);
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
      if (selectedPage) {
        await adminService.updatePage(selectedPage._id, formData);
        toast.success('Page updated successfully');
      } else {
        await adminService.createPage(formData);
        toast.success('Page created successfully');
      }
      handleCloseDialog();
      fetchPages();
    } catch (error) {
      toast.error('Failed to save page');
      console.error('Error:', error);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this page?')) {
      return;
    }

    try {
      await adminService.deletePage(id);
      toast.success('Page deleted successfully');
      fetchPages();
    } catch (error) {
      toast.error('Failed to delete page');
      console.error('Error:', error);
    }
  };

  const handlePublish = async (id) => {
    try {
      await adminService.publishPage(id);
      toast.success('Page published successfully');
      fetchPages();
    } catch (error) {
      toast.error('Failed to publish page');
      console.error('Error:', error);
    }
  };

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
          Page Management
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
        >
          Add Page
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
                <TableCell>Slug</TableCell>
                <TableCell>Title (EN)</TableCell>
                <TableCell>Template</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Updated</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {pages.map((page) => (
                <TableRow key={page._id}>
                  <TableCell>{page.slug}</TableCell>
                  <TableCell>{page.title?.en || 'N/A'}</TableCell>
                  <TableCell>{page.template}</TableCell>
                  <TableCell>
                    <Chip
                      label={page.status}
                      color={
                        page.status === 'published' ? 'success' :
                        page.status === 'draft' ? 'warning' : 'default'
                      }
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    {new Date(page.updatedAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell align="right">
                    <IconButton
                      size="small"
                      onClick={() => handleOpenDialog(page)}
                      title="Edit"
                    >
                      <EditIcon />
                    </IconButton>
                    {page.status !== 'published' && (
                      <IconButton
                        size="small"
                        onClick={() => handlePublish(page._id)}
                        title="Publish"
                      >
                        <PublishIcon />
                      </IconButton>
                    )}
                    <IconButton
                      size="small"
                      onClick={() => handleDelete(page._id)}
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

      {/* Page Editor Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="lg" fullWidth>
        <DialogTitle>
          {selectedPage ? 'Edit Page' : 'Create New Page'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Slug"
                value={formData.slug}
                onChange={(e) => handleInputChange('slug', e.target.value)}
                placeholder="about-us"
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <FormControl fullWidth>
                <InputLabel>Template</InputLabel>
                <Select
                  value={formData.template}
                  onChange={(e) => handleInputChange('template', e.target.value)}
                  label="Template"
                >
                  <MenuItem value="default">Default</MenuItem>
                  <MenuItem value="hero">Hero</MenuItem>
                  <MenuItem value="about">About</MenuItem>
                  <MenuItem value="contact">Contact</MenuItem>
                  <MenuItem value="faq">FAQ</MenuItem>
                  <MenuItem value="terms">Terms</MenuItem>
                  <MenuItem value="privacy">Privacy</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={3}>
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select
                  value={formData.status}
                  onChange={(e) => handleInputChange('status', e.target.value)}
                  label="Status"
                >
                  <MenuItem value="draft">Draft</MenuItem>
                  <MenuItem value="published">Published</MenuItem>
                  <MenuItem value="archived">Archived</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            {/* Navigation Settings */}
            <Grid item xs={12}>
              <Typography variant="subtitle1" gutterBottom sx={{ mt: 2 }}>
                Navigation Settings
              </Typography>
            </Grid>
            <Grid item xs={12} md={4}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={formData.showInHeader}
                    onChange={(e) => handleInputChange('showInHeader', e.target.checked)}
                  />
                }
                label="Show in Header Navigation"
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={formData.showInFooter}
                    onChange={(e) => handleInputChange('showInFooter', e.target.checked)}
                  />
                }
                label="Show in Footer Navigation"
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                type="number"
                label="Menu Order"
                value={formData.menuOrder}
                onChange={(e) => handleInputChange('menuOrder', Math.max(0, parseInt(e.target.value, 10) || 0))}
                helperText="Lower numbers appear first"
                inputProps={{ min: 0 }}
              />
            </Grid>

            {/* English Content */}
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
              <Box>
                <Typography variant="body2" sx={{ mb: 1, color: 'text.secondary' }}>
                  Content (EN)
                </Typography>
                <Box sx={{ 
                  '& .ql-container': { height: '300px' },
                  '& .ql-editor': { minHeight: '300px' },
                  mb: 2
                }}>
                  <ReactQuill
                    ref={quillRefEn}
                    theme="snow"
                    value={formData.content.en}
                    onChange={(value) => handleInputChange('content', value, 'en')}
                    modules={modulesEn}
                    formats={QUILL_FORMATS}
                  />
                </Box>
              </Box>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Meta Description (EN)"
                value={formData.metaDescription.en}
                onChange={(e) => handleInputChange('metaDescription', e.target.value, 'en')}
              />
            </Grid>

            {/* Arabic Content */}
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
              <Box>
                <Typography variant="body2" sx={{ mb: 1, color: 'text.secondary' }}>
                  Content (AR)
                </Typography>
                <Box sx={{ 
                  '& .ql-container': { height: '300px' },
                  '& .ql-editor': { minHeight: '300px' },
                  direction: 'rtl',
                  mb: 2
                }}>
                  <ReactQuill
                    ref={quillRefAr}
                    theme="snow"
                    value={formData.content.ar}
                    onChange={(value) => handleInputChange('content', value, 'ar')}
                    modules={modulesAr}
                    formats={QUILL_FORMATS}
                  />
                </Box>
              </Box>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Meta Description (AR)"
                value={formData.metaDescription.ar}
                onChange={(e) => handleInputChange('metaDescription', e.target.value, 'ar')}
                inputProps={{ dir: 'rtl' }}
              />
            </Grid>

            {/* French Content */}
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
              <Box>
                <Typography variant="body2" sx={{ mb: 1, color: 'text.secondary' }}>
                  Content (FR)
                </Typography>
                <Box sx={{ 
                  '& .ql-container': { height: '300px' },
                  '& .ql-editor': { minHeight: '300px' },
                  mb: 2
                }}>
                  <ReactQuill
                    ref={quillRefFr}
                    theme="snow"
                    value={formData.content.fr}
                    onChange={(value) => handleInputChange('content', value, 'fr')}
                    modules={modulesFr}
                    formats={QUILL_FORMATS}
                  />
                </Box>
              </Box>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Meta Description (FR)"
                value={formData.metaDescription.fr}
                onChange={(e) => handleInputChange('metaDescription', e.target.value, 'fr')}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained">
            {selectedPage ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default AdminPages;
