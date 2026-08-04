import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Tabs,
  Tab,
  TextField,
  Button,
  Grid,
  Paper,
  IconButton,
  MenuItem,
  CircularProgress,
  Alert,
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Save as SaveIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import * as Icons from '@mui/icons-material';
import { toast } from 'react-toastify';
import adminService from '../services/adminService';

const AdminContentSettings = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [langTab, setLangTab] = useState(0);
  const [settings, setSettings] = useState(null);

  // Language tabs
  const languages = [
    { code: 'en', label: 'English' },
    { code: 'ar', label: 'Arabic' },
    { code: 'fr', label: 'French' },
  ];

  // Available icons for features
  const availableIcons = [
    'School',
    'Verified',
    'Language',
    'People',
    'TrendingUp',
    'Security',
    'Computer',
    'Psychology',
    'EmojiObjects',
    'Groups',
    'Speed',
    'Star',
  ];

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const response = await adminService.getContentSettings();
      setSettings(response.data);
    } catch (error) {
      console.error('Error fetching settings:', error);
      toast.error('Failed to load content settings');
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
    setLangTab(0); // Reset language tab when switching main tabs
  };

  const handleLangTabChange = (event, newValue) => {
    setLangTab(newValue);
  };

  const handleHomeChange = (field, lang, value) => {
    setSettings({
      ...settings,
      homePage: {
        ...settings.homePage,
        [field]: {
          ...settings.homePage[field],
          [lang]: value,
        },
      },
    });
  };

  const handleAboutChange = (field, lang, value) => {
    setSettings({
      ...settings,
      aboutPage: {
        ...settings.aboutPage,
        [field]: {
          ...settings.aboutPage[field],
          [lang]: value,
        },
      },
    });
  };

  const handleContactChange = (field, value, lang = null) => {
    if (lang) {
      setSettings({
        ...settings,
        contactPage: {
          ...settings.contactPage,
          [field]: {
            ...settings.contactPage[field],
            [lang]: value,
          },
        },
      });
    } else {
      setSettings({
        ...settings,
        contactPage: {
          ...settings.contactPage,
          [field]: value,
        },
      });
    }
  };

  const handleSocialMediaChange = (platform, value) => {
    setSettings({
      ...settings,
      socialMedia: {
        ...settings.socialMedia,
        [platform]: value,
      },
    });
  };

  const handleFeatureChange = (section, index, field, value) => {
    const newFeatures = [...settings[section].features];
    newFeatures[index] = {
      ...newFeatures[index],
      [field]: value,
    };
    setSettings({
      ...settings,
      [section]: {
        ...settings[section],
        features: newFeatures,
      },
    });
  };

  const addFeature = (section) => {
    setSettings({
      ...settings,
      [section]: {
        ...settings[section],
        features: [
          ...settings[section].features,
          { icon: 'School', title: '', description: '' },
        ],
      },
    });
  };

  const removeFeature = (section, index) => {
    const newFeatures = settings[section].features.filter((_, i) => i !== index);
    setSettings({
      ...settings,
      [section]: {
        ...settings[section],
        features: newFeatures,
      },
    });
  };

  const handleSave = async () => {
    try {
      setSaving(true);

      let response;
      if (activeTab === 0) {
        // Save Home Page
        response = await adminService.updateHomeContent({
          heroTitle: settings.homePage.heroTitle,
          heroSubtitle: settings.homePage.heroSubtitle,
          features: settings.homePage.features,
        });
        toast.success('Home page content updated successfully');
      } else if (activeTab === 1) {
        // Save About Page
        response = await adminService.updateAboutContent({
          mission: settings.aboutPage.mission,
          vision: settings.aboutPage.vision,
          features: settings.aboutPage.features,
        });
        toast.success('About page content updated successfully');
      } else if (activeTab === 2) {
        // Save Contact Page
        response = await adminService.updateContactContent({
          email: settings.contactPage.email,
          phone: settings.contactPage.phone,
          address: settings.contactPage.address,
          officeHours: settings.contactPage.officeHours,
          socialMedia: settings.socialMedia,
        });
        toast.success('Contact page content updated successfully');
      }

      // Use response data instead of refetching
      if (response && response.data) {
        // Update settings with new data based on active tab
        updateSettingsFromResponse(response.data, activeTab);
      }
    } catch (error) {
      console.error('Error saving settings:', error);
      
      // Display validation errors if available
      if (error.response && error.response.data && error.response.data.errors) {
        const validationErrors = error.response.data.errors;
        validationErrors.forEach((err) => {
          toast.error(`${err.param}: ${err.msg}`);
        });
      } else if (error.response && error.response.data && error.response.data.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error('Failed to save content settings');
      }
    } finally {
      setSaving(false);
    }
  };

  const updateSettingsFromResponse = (data, tab) => {
    switch (tab) {
      case 0: // Home Page
        setSettings(prev => ({
          ...prev,
          homePage: data,
        }));
        break;
      case 1: // About Page
        setSettings(prev => ({
          ...prev,
          aboutPage: data,
        }));
        break;
      case 2: // Contact Page
        setSettings(prev => ({
          ...prev,
          contactPage: data.contactPage,
          socialMedia: data.socialMedia,
        }));
        break;
      default:
        break;
    }
  };

  const renderIconPreview = (iconName) => {
    const IconComponent = Icons[iconName];
    if (!IconComponent) return null;
    return <IconComponent fontSize="large" color="primary" />;
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  if (!settings) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Alert severity="error">Failed to load content settings</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
          Content Settings
        </Typography>
        <Box>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={fetchSettings}
            sx={{ mr: 2 }}
          >
            Refresh
          </Button>
          <Button
            variant="contained"
            startIcon={<SaveIcon />}
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </Button>
        </Box>
      </Box>

      <Paper sx={{ mb: 3 }}>
        <Tabs value={activeTab} onChange={handleTabChange} variant="fullWidth">
          <Tab label="Home Page" />
          <Tab label="About Page" />
          <Tab label="Contact Page" />
        </Tabs>
      </Paper>

      {/* Home Page Tab */}
      {activeTab === 0 && (
        <Paper sx={{ p: 3 }}>
          <Typography variant="h5" gutterBottom>
            Home Page Content
          </Typography>

          {/* Language Tabs */}
          <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
            <Tabs value={langTab} onChange={handleLangTabChange}>
              {languages.map((lang, index) => (
                <Tab key={lang.code} label={lang.label} />
              ))}
            </Tabs>
          </Box>

          {/* Hero Section */}
          <Box mb={4}>
            <Typography variant="h6" gutterBottom>
              Hero Section
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label={`Hero Title (${languages[langTab].label})`}
                  value={settings.homePage.heroTitle[languages[langTab].code] || ''}
                  onChange={(e) =>
                    handleHomeChange('heroTitle', languages[langTab].code, e.target.value)
                  }
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label={`Hero Subtitle (${languages[langTab].label})`}
                  value={settings.homePage.heroSubtitle[languages[langTab].code] || ''}
                  onChange={(e) =>
                    handleHomeChange('heroSubtitle', languages[langTab].code, e.target.value)
                  }
                />
              </Grid>
            </Grid>
          </Box>

          {/* Features Section */}
          <Box>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="h6">Features</Typography>
              <Button
                variant="outlined"
                startIcon={<AddIcon />}
                onClick={() => addFeature('homePage')}
              >
                Add Feature
              </Button>
            </Box>

            <Grid container spacing={3}>
              {settings.homePage.features.map((feature, index) => (
                <Grid item xs={12} key={index}>
                  <Paper sx={{ p: 2, bgcolor: 'grey.50' }}>
                    <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                      <Typography variant="subtitle1">Feature {index + 1}</Typography>
                      <IconButton
                        color="error"
                        onClick={() => removeFeature('homePage', index)}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Box>
                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={4}>
                        <TextField
                          fullWidth
                          select
                          label="Icon"
                          value={feature.icon}
                          onChange={(e) =>
                            handleFeatureChange('homePage', index, 'icon', e.target.value)
                          }
                        >
                          {availableIcons.map((icon) => (
                            <MenuItem key={icon} value={icon}>
                              <Box display="flex" alignItems="center" gap={1}>
                                {renderIconPreview(icon)}
                                {icon}
                              </Box>
                            </MenuItem>
                          ))}
                        </TextField>
                      </Grid>
                      <Grid item xs={12} sm={8}>
                        <TextField
                          fullWidth
                          label="Title"
                          value={feature.title}
                          onChange={(e) =>
                            handleFeatureChange('homePage', index, 'title', e.target.value)
                          }
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <TextField
                          fullWidth
                          multiline
                          rows={2}
                          label="Description"
                          value={feature.description}
                          onChange={(e) =>
                            handleFeatureChange('homePage', index, 'description', e.target.value)
                          }
                        />
                      </Grid>
                    </Grid>
                  </Paper>
                </Grid>
              ))}
            </Grid>
          </Box>
        </Paper>
      )}

      {/* About Page Tab */}
      {activeTab === 1 && (
        <Paper sx={{ p: 3 }}>
          <Typography variant="h5" gutterBottom>
            About Page Content
          </Typography>

          {/* Language Tabs */}
          <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
            <Tabs value={langTab} onChange={handleLangTabChange}>
              {languages.map((lang, index) => (
                <Tab key={lang.code} label={lang.label} />
              ))}
            </Tabs>
          </Box>

          {/* Mission and Vision */}
          <Box mb={4}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  multiline
                  rows={4}
                  label={`Mission Statement (${languages[langTab].label})`}
                  value={settings.aboutPage.mission[languages[langTab].code] || ''}
                  onChange={(e) =>
                    handleAboutChange('mission', languages[langTab].code, e.target.value)
                  }
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  multiline
                  rows={4}
                  label={`Vision Statement (${languages[langTab].label})`}
                  value={settings.aboutPage.vision[languages[langTab].code] || ''}
                  onChange={(e) =>
                    handleAboutChange('vision', languages[langTab].code, e.target.value)
                  }
                />
              </Grid>
            </Grid>
          </Box>

          {/* Features Section */}
          <Box>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="h6">Features</Typography>
              <Button
                variant="outlined"
                startIcon={<AddIcon />}
                onClick={() => addFeature('aboutPage')}
              >
                Add Feature
              </Button>
            </Box>

            <Grid container spacing={3}>
              {settings.aboutPage.features.map((feature, index) => (
                <Grid item xs={12} key={index}>
                  <Paper sx={{ p: 2, bgcolor: 'grey.50' }}>
                    <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                      <Typography variant="subtitle1">Feature {index + 1}</Typography>
                      <IconButton
                        color="error"
                        onClick={() => removeFeature('aboutPage', index)}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Box>
                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={4}>
                        <TextField
                          fullWidth
                          select
                          label="Icon"
                          value={feature.icon}
                          onChange={(e) =>
                            handleFeatureChange('aboutPage', index, 'icon', e.target.value)
                          }
                        >
                          {availableIcons.map((icon) => (
                            <MenuItem key={icon} value={icon}>
                              <Box display="flex" alignItems="center" gap={1}>
                                {renderIconPreview(icon)}
                                {icon}
                              </Box>
                            </MenuItem>
                          ))}
                        </TextField>
                      </Grid>
                      <Grid item xs={12} sm={8}>
                        <TextField
                          fullWidth
                          label="Title"
                          value={feature.title}
                          onChange={(e) =>
                            handleFeatureChange('aboutPage', index, 'title', e.target.value)
                          }
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <TextField
                          fullWidth
                          multiline
                          rows={2}
                          label="Description"
                          value={feature.description}
                          onChange={(e) =>
                            handleFeatureChange('aboutPage', index, 'description', e.target.value)
                          }
                        />
                      </Grid>
                    </Grid>
                  </Paper>
                </Grid>
              ))}
            </Grid>
          </Box>
        </Paper>
      )}

      {/* Contact Page Tab */}
      {activeTab === 2 && (
        <Paper sx={{ p: 3 }}>
          <Typography variant="h5" gutterBottom>
            Contact Page Content
          </Typography>

          {/* Contact Information */}
          <Box mb={4}>
            <Typography variant="h6" gutterBottom>
              Contact Information
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Email"
                  type="email"
                  value={settings.contactPage.email}
                  onChange={(e) => handleContactChange('email', e.target.value)}
                  helperText="Valid email format required (e.g., contact@example.com)"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Phone"
                  value={settings.contactPage.phone}
                  onChange={(e) => handleContactChange('phone', e.target.value)}
                  helperText="Phone number with digits, spaces, +, -, ( ) allowed"
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Address"
                  value={settings.contactPage.address}
                  onChange={(e) => handleContactChange('address', e.target.value)}
                />
              </Grid>
            </Grid>
          </Box>

          {/* Office Hours */}
          <Box mb={4}>
            <Typography variant="h6" gutterBottom>
              Office Hours
            </Typography>
            <Grid container spacing={2}>
              {languages.map((lang) => (
                <Grid item xs={12} key={lang.code}>
                  <TextField
                    fullWidth
                    label={`Office Hours (${lang.label})`}
                    value={settings.contactPage.officeHours[lang.code] || ''}
                    onChange={(e) => handleContactChange('officeHours', e.target.value, lang.code)}
                  />
                </Grid>
              ))}
            </Grid>
          </Box>

          {/* Social Media Links */}
          <Box>
            <Typography variant="h6" gutterBottom>
              Social Media Links
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Facebook URL"
                  value={settings.socialMedia.facebook}
                  onChange={(e) => handleSocialMediaChange('facebook', e.target.value)}
                  helperText="e.g., https://facebook.com/yourpage"
                  placeholder="https://facebook.com/greendye"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Twitter URL"
                  value={settings.socialMedia.twitter}
                  onChange={(e) => handleSocialMediaChange('twitter', e.target.value)}
                  helperText="e.g., https://twitter.com/yourhandle or https://x.com/yourhandle"
                  placeholder="https://twitter.com/greendye"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="LinkedIn URL"
                  value={settings.socialMedia.linkedin}
                  onChange={(e) => handleSocialMediaChange('linkedin', e.target.value)}
                  helperText="e.g., https://linkedin.com/company/yourcompany"
                  placeholder="https://linkedin.com/company/greendye"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Instagram URL"
                  value={settings.socialMedia.instagram}
                  onChange={(e) => handleSocialMediaChange('instagram', e.target.value)}
                  helperText="e.g., https://instagram.com/yourhandle"
                  placeholder="https://instagram.com/greendye"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="YouTube URL"
                  value={settings.socialMedia.youtube}
                  onChange={(e) => handleSocialMediaChange('youtube', e.target.value)}
                  helperText="e.g., https://youtube.com/yourchannel"
                  placeholder="https://youtube.com/greendye"
                />
              </Grid>
            </Grid>
          </Box>
        </Paper>
      )}
    </Container>
  );
};

export default AdminContentSettings;
