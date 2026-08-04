import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Paper,
  Typography,
  Tabs,
  Tab,
  TextField,
  Button,
  Grid,
  Switch,
  FormControlLabel,
  Divider,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
  Alert,
  CircularProgress,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
} from '@mui/material';
import {
  Settings as SettingsIcon,
  Email as EmailIcon,
  Notifications as NotificationsIcon,
  Language as LanguageIcon,
  VpnKey as ApiKeyIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  Refresh as RefreshIcon,
  ContentCopy as CopyIcon,
} from '@mui/icons-material';
import { toast } from 'react-toastify';
import adminService from '../services/adminService';

const AdminSettings = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [apiKeys, setApiKeys] = useState([]);
  const [openApiKeyDialog, setOpenApiKeyDialog] = useState(false);
  const [newApiKey, setNewApiKey] = useState({
    name: '',
    description: '',
    permissions: ['read'],
  });

  // General Settings State
  const [generalSettings, setGeneralSettings] = useState({
    siteName: '',
    siteDescription: '',
    contactEmail: '',
    contactPhone: '',
    contactAddress: '',
    socialMedia: {
      facebook: '',
      twitter: '',
      linkedin: '',
      instagram: '',
      youtube: '',
    },
  });

  // Email Template State
  const [emailTemplates, setEmailTemplates] = useState({
    welcome: { subject: '', body: '' },
    passwordReset: { subject: '', body: '' },
    courseEnrollment: { subject: '', body: '' },
    certificateIssued: { subject: '', body: '' },
  });

  // Notification Settings State
  const [notificationSettings, setNotificationSettings] = useState({
    emailEnabled: true,
    pushEnabled: true,
    smsEnabled: false,
    defaultPreferences: {
      courseUpdates: true,
      announcements: true,
      promotions: false,
      newsletter: true,
    },
  });

  // Localization Settings State
  const [localizationSettings, setLocalizationSettings] = useState({
    defaultLanguage: 'en',
    availableLanguages: ['en', 'ar', 'fr'],
    defaultCurrency: 'USD',
    availableCurrencies: ['USD', 'EUR', 'EGP', 'SAR', 'NGN'],
    timezone: 'UTC',
    dateFormat: 'MM/DD/YYYY',
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const response = await adminService.getSettings();
      
      if (response.data.general) {
        setGeneralSettings(response.data.general);
      }
      if (response.data.emailTemplates) {
        setEmailTemplates(response.data.emailTemplates);
      }
      if (response.data.notifications) {
        setNotificationSettings(response.data.notifications);
      }
      if (response.data.localization) {
        setLocalizationSettings(response.data.localization);
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
      toast.error('Failed to load settings');
    } finally {
      setLoading(false);
    }
  };

  const fetchApiKeys = async () => {
    try {
      const response = await adminService.getApiKeys();
      setApiKeys(response.data);
    } catch (error) {
      console.error('Error fetching API keys:', error);
      toast.error('Failed to load API keys');
    }
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
    if (newValue === 4) {
      fetchApiKeys();
    }
  };

  const handleSaveGeneralSettings = async () => {
    try {
      setSaving(true);
      await adminService.updateGeneralSettings(generalSettings);
      toast.success('General settings saved successfully');
    } catch (error) {
      console.error('Error saving general settings:', error);
      toast.error('Failed to save general settings');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveEmailTemplates = async () => {
    try {
      setSaving(true);
      await adminService.updateEmailTemplates(emailTemplates);
      toast.success('Email templates saved successfully');
    } catch (error) {
      console.error('Error saving email templates:', error);
      toast.error('Failed to save email templates');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveNotificationSettings = async () => {
    try {
      setSaving(true);
      await adminService.updateNotificationSettings(notificationSettings);
      toast.success('Notification settings saved successfully');
    } catch (error) {
      console.error('Error saving notification settings:', error);
      toast.error('Failed to save notification settings');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveLocalizationSettings = async () => {
    try {
      setSaving(true);
      await adminService.updateLocalizationSettings(localizationSettings);
      toast.success('Localization settings saved successfully');
    } catch (error) {
      console.error('Error saving localization settings:', error);
      toast.error('Failed to save localization settings');
    } finally {
      setSaving(false);
    }
  };

  const handleCreateApiKey = async () => {
    try {
      const response = await adminService.createApiKey(newApiKey);
      setApiKeys([...apiKeys, response.data]);
      setOpenApiKeyDialog(false);
      setNewApiKey({ name: '', description: '', permissions: ['read'] });
      toast.success('API key created successfully');
    } catch (error) {
      console.error('Error creating API key:', error);
      toast.error('Failed to create API key');
    }
  };

  const handleDeleteApiKey = async (keyId) => {
    if (!window.confirm('Are you sure you want to delete this API key?')) return;
    
    try {
      await adminService.deleteApiKey(keyId);
      setApiKeys(apiKeys.filter(key => key._id !== keyId));
      toast.success('API key deleted successfully');
    } catch (error) {
      console.error('Error deleting API key:', error);
      toast.error('Failed to delete API key');
    }
  };

  const handleRegenerateApiKey = async (keyId) => {
    if (!window.confirm('Are you sure you want to regenerate this API key? The old key will no longer work.')) return;
    
    try {
      const response = await adminService.regenerateApiKey(keyId);
      setApiKeys(apiKeys.map(key => key._id === keyId ? response.data : key));
      toast.success('API key regenerated successfully');
    } catch (error) {
      console.error('Error regenerating API key:', error);
      toast.error('Failed to regenerate API key');
    }
  };

  const handleCopyApiKey = (key) => {
    navigator.clipboard.writeText(key);
    toast.success('API key copied to clipboard');
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
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold', color: 'primary.main', mb: 3 }}>
        System Settings
      </Typography>

      <Paper sx={{ width: '100%' }}>
        <Tabs value={activeTab} onChange={handleTabChange} variant="scrollable" scrollButtons="auto">
          <Tab icon={<SettingsIcon />} label="General" iconPosition="start" />
          <Tab icon={<EmailIcon />} label="Email Templates" iconPosition="start" />
          <Tab icon={<NotificationsIcon />} label="Notifications" iconPosition="start" />
          <Tab icon={<LanguageIcon />} label="Localization" iconPosition="start" />
          <Tab icon={<ApiKeyIcon />} label="API Keys" iconPosition="start" />
        </Tabs>

        <Box sx={{ p: 3 }}>
          {/* General Settings Tab */}
          {activeTab === 0 && (
            <Box>
              <Typography variant="h6" gutterBottom>General Site Settings</Typography>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Site Name"
                    value={generalSettings.siteName}
                    onChange={(e) => setGeneralSettings({ ...generalSettings, siteName: e.target.value })}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Contact Email"
                    type="email"
                    value={generalSettings.contactEmail}
                    onChange={(e) => setGeneralSettings({ ...generalSettings, contactEmail: e.target.value })}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    multiline
                    rows={3}
                    label="Site Description"
                    value={generalSettings.siteDescription}
                    onChange={(e) => setGeneralSettings({ ...generalSettings, siteDescription: e.target.value })}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Contact Phone"
                    value={generalSettings.contactPhone}
                    onChange={(e) => setGeneralSettings({ ...generalSettings, contactPhone: e.target.value })}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Contact Address"
                    value={generalSettings.contactAddress}
                    onChange={(e) => setGeneralSettings({ ...generalSettings, contactAddress: e.target.value })}
                  />
                </Grid>

                <Grid item xs={12}>
                  <Divider sx={{ my: 2 }} />
                  <Typography variant="subtitle1" gutterBottom>Social Media Links</Typography>
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Facebook URL"
                    value={generalSettings.socialMedia.facebook}
                    onChange={(e) => setGeneralSettings({
                      ...generalSettings,
                      socialMedia: { ...generalSettings.socialMedia, facebook: e.target.value }
                    })}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Twitter URL"
                    value={generalSettings.socialMedia.twitter}
                    onChange={(e) => setGeneralSettings({
                      ...generalSettings,
                      socialMedia: { ...generalSettings.socialMedia, twitter: e.target.value }
                    })}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="LinkedIn URL"
                    value={generalSettings.socialMedia.linkedin}
                    onChange={(e) => setGeneralSettings({
                      ...generalSettings,
                      socialMedia: { ...generalSettings.socialMedia, linkedin: e.target.value }
                    })}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Instagram URL"
                    value={generalSettings.socialMedia.instagram}
                    onChange={(e) => setGeneralSettings({
                      ...generalSettings,
                      socialMedia: { ...generalSettings.socialMedia, instagram: e.target.value }
                    })}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="YouTube URL"
                    value={generalSettings.socialMedia.youtube}
                    onChange={(e) => setGeneralSettings({
                      ...generalSettings,
                      socialMedia: { ...generalSettings.socialMedia, youtube: e.target.value }
                    })}
                  />
                </Grid>

                <Grid item xs={12}>
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={handleSaveGeneralSettings}
                    disabled={saving}
                  >
                    {saving ? 'Saving...' : 'Save General Settings'}
                  </Button>
                </Grid>
              </Grid>
            </Box>
          )}

          {/* Email Templates Tab */}
          {activeTab === 1 && (
            <Box>
              <Typography variant="h6" gutterBottom>Email Template Management</Typography>
              <Alert severity="info" sx={{ mb: 3 }}>
                Use variables like {'{{userName}}'}, {'{{siteName}}'}, {'{{courseName}}'}, {'{{resetLink}}'} in your templates.
              </Alert>

              {Object.entries(emailTemplates).map(([key, template]) => (
                <Box key={key} sx={{ mb: 4 }}>
                  <Typography variant="subtitle1" gutterBottom sx={{ textTransform: 'capitalize' }}>
                    {key.replace(/([A-Z])/g, ' $1').trim()}
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Subject"
                        value={template.subject}
                        onChange={(e) => setEmailTemplates({
                          ...emailTemplates,
                          [key]: { ...template, subject: e.target.value }
                        })}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        multiline
                        rows={4}
                        label="Body"
                        value={template.body}
                        onChange={(e) => setEmailTemplates({
                          ...emailTemplates,
                          [key]: { ...template, body: e.target.value }
                        })}
                      />
                    </Grid>
                  </Grid>
                  <Divider sx={{ mt: 2 }} />
                </Box>
              ))}

              <Button
                variant="contained"
                color="primary"
                onClick={handleSaveEmailTemplates}
                disabled={saving}
              >
                {saving ? 'Saving...' : 'Save Email Templates'}
              </Button>
            </Box>
          )}

          {/* Notification Settings Tab */}
          {activeTab === 2 && (
            <Box>
              <Typography variant="h6" gutterBottom>Notification Settings</Typography>
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <Typography variant="subtitle1" gutterBottom>Global Notification Channels</Typography>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={notificationSettings.emailEnabled}
                        onChange={(e) => setNotificationSettings({
                          ...notificationSettings,
                          emailEnabled: e.target.checked
                        })}
                      />
                    }
                    label="Email Notifications Enabled"
                  />
                  <FormControlLabel
                    control={
                      <Switch
                        checked={notificationSettings.pushEnabled}
                        onChange={(e) => setNotificationSettings({
                          ...notificationSettings,
                          pushEnabled: e.target.checked
                        })}
                      />
                    }
                    label="Push Notifications Enabled"
                  />
                  <FormControlLabel
                    control={
                      <Switch
                        checked={notificationSettings.smsEnabled}
                        onChange={(e) => setNotificationSettings({
                          ...notificationSettings,
                          smsEnabled: e.target.checked
                        })}
                      />
                    }
                    label="SMS Notifications Enabled"
                  />
                </Grid>

                <Grid item xs={12}>
                  <Divider sx={{ my: 2 }} />
                  <Typography variant="subtitle1" gutterBottom>Default User Preferences</Typography>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={notificationSettings.defaultPreferences.courseUpdates}
                        onChange={(e) => setNotificationSettings({
                          ...notificationSettings,
                          defaultPreferences: {
                            ...notificationSettings.defaultPreferences,
                            courseUpdates: e.target.checked
                          }
                        })}
                      />
                    }
                    label="Course Updates"
                  />
                  <FormControlLabel
                    control={
                      <Switch
                        checked={notificationSettings.defaultPreferences.announcements}
                        onChange={(e) => setNotificationSettings({
                          ...notificationSettings,
                          defaultPreferences: {
                            ...notificationSettings.defaultPreferences,
                            announcements: e.target.checked
                          }
                        })}
                      />
                    }
                    label="Announcements"
                  />
                  <FormControlLabel
                    control={
                      <Switch
                        checked={notificationSettings.defaultPreferences.promotions}
                        onChange={(e) => setNotificationSettings({
                          ...notificationSettings,
                          defaultPreferences: {
                            ...notificationSettings.defaultPreferences,
                            promotions: e.target.checked
                          }
                        })}
                      />
                    }
                    label="Promotions"
                  />
                  <FormControlLabel
                    control={
                      <Switch
                        checked={notificationSettings.defaultPreferences.newsletter}
                        onChange={(e) => setNotificationSettings({
                          ...notificationSettings,
                          defaultPreferences: {
                            ...notificationSettings.defaultPreferences,
                            newsletter: e.target.checked
                          }
                        })}
                      />
                    }
                    label="Newsletter"
                  />
                </Grid>

                <Grid item xs={12}>
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={handleSaveNotificationSettings}
                    disabled={saving}
                  >
                    {saving ? 'Saving...' : 'Save Notification Settings'}
                  </Button>
                </Grid>
              </Grid>
            </Box>
          )}

          {/* Localization Settings Tab */}
          {activeTab === 3 && (
            <Box>
              <Typography variant="h6" gutterBottom>Currency and Language Settings</Typography>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth>
                    <InputLabel>Default Language</InputLabel>
                    <Select
                      value={localizationSettings.defaultLanguage}
                      onChange={(e) => setLocalizationSettings({
                        ...localizationSettings,
                        defaultLanguage: e.target.value
                      })}
                    >
                      <MenuItem value="en">English</MenuItem>
                      <MenuItem value="ar">Arabic</MenuItem>
                      <MenuItem value="fr">French</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth>
                    <InputLabel>Default Currency</InputLabel>
                    <Select
                      value={localizationSettings.defaultCurrency}
                      onChange={(e) => setLocalizationSettings({
                        ...localizationSettings,
                        defaultCurrency: e.target.value
                      })}
                    >
                      <MenuItem value="USD">USD - US Dollar</MenuItem>
                      <MenuItem value="EUR">EUR - Euro</MenuItem>
                      <MenuItem value="EGP">EGP - Egyptian Pound</MenuItem>
                      <MenuItem value="SAR">SAR - Saudi Riyal</MenuItem>
                      <MenuItem value="NGN">NGN - Nigerian Naira</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Timezone"
                    value={localizationSettings.timezone}
                    onChange={(e) => setLocalizationSettings({
                      ...localizationSettings,
                      timezone: e.target.value
                    })}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth>
                    <InputLabel>Date Format</InputLabel>
                    <Select
                      value={localizationSettings.dateFormat}
                      onChange={(e) => setLocalizationSettings({
                        ...localizationSettings,
                        dateFormat: e.target.value
                      })}
                    >
                      <MenuItem value="MM/DD/YYYY">MM/DD/YYYY</MenuItem>
                      <MenuItem value="DD/MM/YYYY">DD/MM/YYYY</MenuItem>
                      <MenuItem value="YYYY-MM-DD">YYYY-MM-DD</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>

                <Grid item xs={12}>
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={handleSaveLocalizationSettings}
                    disabled={saving}
                  >
                    {saving ? 'Saving...' : 'Save Localization Settings'}
                  </Button>
                </Grid>
              </Grid>
            </Box>
          )}

          {/* API Keys Tab */}
          {activeTab === 4 && (
            <Box>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                <Typography variant="h6">API Key Management</Typography>
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={<AddIcon />}
                  onClick={() => setOpenApiKeyDialog(true)}
                >
                  Create API Key
                </Button>
              </Box>

              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Name</TableCell>
                      <TableCell>Key</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Created</TableCell>
                      <TableCell>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {apiKeys.map((apiKey) => (
                      <TableRow key={apiKey._id}>
                        <TableCell>{apiKey.name}</TableCell>
                        <TableCell>
                          <Box display="flex" alignItems="center">
                            <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                              {apiKey.key.substring(0, 20)}...
                            </Typography>
                            <IconButton size="small" onClick={() => handleCopyApiKey(apiKey.key)}>
                              <CopyIcon fontSize="small" />
                            </IconButton>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={apiKey.isActive ? 'Active' : 'Inactive'}
                            color={apiKey.isActive ? 'success' : 'default'}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>{new Date(apiKey.createdAt).toLocaleDateString()}</TableCell>
                        <TableCell>
                          <IconButton
                            size="small"
                            color="primary"
                            onClick={() => handleRegenerateApiKey(apiKey._id)}
                          >
                            <RefreshIcon />
                          </IconButton>
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => handleDeleteApiKey(apiKey._id)}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                    {apiKeys.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={5} align="center">
                          No API keys found. Create one to get started.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          )}
        </Box>
      </Paper>

      {/* Create API Key Dialog */}
      <Dialog open={openApiKeyDialog} onClose={() => setOpenApiKeyDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Create New API Key</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <TextField
              fullWidth
              label="Name"
              value={newApiKey.name}
              onChange={(e) => setNewApiKey({ ...newApiKey, name: e.target.value })}
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              multiline
              rows={3}
              label="Description"
              value={newApiKey.description}
              onChange={(e) => setNewApiKey({ ...newApiKey, description: e.target.value })}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenApiKeyDialog(false)}>Cancel</Button>
          <Button
            onClick={handleCreateApiKey}
            variant="contained"
            color="primary"
            disabled={!newApiKey.name}
          >
            Create
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default AdminSettings;
