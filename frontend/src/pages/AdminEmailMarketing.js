import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  Tabs,
  Tab,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  IconButton,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Grid,
  Card,
  CardContent,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Send as SendIcon,
  Visibility as ViewIcon,
  Assessment as StatsIcon,
  Email as EmailIcon,
  Campaign as CampaignIcon,
  Newspaper as NewsletterIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'react-toastify';
import adminService from '../services/adminService';

const AdminEmailMarketing = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(0);
  const [stats, setStats] = useState(null);

  // Campaigns state
  const [campaigns, setCampaigns] = useState([]);
  const [campaignsPage, setCampaignsPage] = useState(0);
  const [campaignsRowsPerPage, setCampaignsRowsPerPage] = useState(10);
  const [campaignsTotal, setCampaignsTotal] = useState(0);

  // Newsletters state
  const [newsletters, setNewsletters] = useState([]);
  const [newslettersPage, setNewslettersPage] = useState(0);
  const [newslettersRowsPerPage, setNewslettersRowsPerPage] = useState(10);
  const [newslettersTotal, setNewslettersTotal] = useState(0);

  // Dialog states
  const [campaignDialog, setCampaignDialog] = useState(false);
  const [newsletterDialog, setNewsletterDialog] = useState(false);
  const [viewDialog, setViewDialog] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  // Form states
  const [campaignForm, setCampaignForm] = useState({
    name: '',
    subject: '',
    content: '',
    recipientType: 'all',
    customRecipients: [],
  });

  const [newsletterForm, setNewsletterForm] = useState({
    title: '',
    subject: '',
    content: '',
  });

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      navigate('/');
      return;
    }

    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, navigate, campaignsPage, newslettersPage, activeTab]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const statsData = await adminService.getEmailMarketingStats();
      setStats(statsData.data);

      if (activeTab === 0 || activeTab === 1) {
        const campaignsData = await adminService.getAllCampaigns({
          page: campaignsPage + 1,
          limit: campaignsRowsPerPage,
        });
        setCampaigns(campaignsData.data);
        setCampaignsTotal(campaignsData.total);
      }

      if (activeTab === 0 || activeTab === 2) {
        const newslettersData = await adminService.getAllNewsletters({
          page: newslettersPage + 1,
          limit: newslettersRowsPerPage,
        });
        setNewsletters(newslettersData.data);
        setNewslettersTotal(newslettersData.total);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load email marketing data');
    } finally {
      setLoading(false);
    }
  };

  // Helper function to display send results
  const showSendResults = (results, type) => {
    if (results.successful > 0) {
      toast.success(`${type} sent successfully! Sent: ${results.successful}, Failed: ${results.failed}`);
    } else {
      toast.error(`Failed to send ${type}. All ${results.failed} emails failed.`);
    }
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  // Campaign handlers
  const handleCreateCampaign = () => {
    setCampaignForm({
      name: '',
      subject: '',
      content: '',
      recipientType: 'all',
      customRecipients: [],
    });
    setSelectedItem(null);
    setCampaignDialog(true);
  };

  const handleEditCampaign = (campaign) => {
    setCampaignForm({
      name: campaign.name,
      subject: campaign.subject,
      content: campaign.content,
      recipientType: campaign.recipientType,
      customRecipients: campaign.customRecipients || [],
    });
    setSelectedItem(campaign);
    setCampaignDialog(true);
  };

  const handleSaveCampaign = async () => {
    try {
      if (selectedItem) {
        await adminService.updateCampaign(selectedItem._id, campaignForm);
        toast.success('Campaign updated successfully');
      } else {
        await adminService.createCampaign(campaignForm);
        toast.success('Campaign created successfully');
      }
      setCampaignDialog(false);
      fetchData();
    } catch (error) {
      console.error('Error saving campaign:', error);
      toast.error(error.response?.data?.message || 'Failed to save campaign');
    }
  };

  const handleSendCampaign = async (campaignId) => {
    if (!window.confirm('Are you sure you want to send this campaign? This action cannot be undone.')) {
      return;
    }

    try {
      const result = await adminService.sendCampaign(campaignId);
      showSendResults(result.data.results, 'Campaign');
      fetchData();
    } catch (error) {
      console.error('Error sending campaign:', error);
      toast.error(error.response?.data?.message || 'Failed to send campaign');
    }
  };

  // Newsletter handlers
  const handleCreateNewsletter = () => {
    setNewsletterForm({
      title: '',
      subject: '',
      content: '',
    });
    setSelectedItem(null);
    setNewsletterDialog(true);
  };

  const handleEditNewsletter = (newsletter) => {
    setNewsletterForm({
      title: newsletter.title,
      subject: newsletter.subject,
      content: newsletter.content,
    });
    setSelectedItem(newsletter);
    setNewsletterDialog(true);
  };

  const handleSaveNewsletter = async () => {
    try {
      if (selectedItem) {
        await adminService.updateNewsletter(selectedItem._id, newsletterForm);
        toast.success('Newsletter updated successfully');
      } else {
        await adminService.createNewsletter(newsletterForm);
        toast.success('Newsletter created successfully');
      }
      setNewsletterDialog(false);
      fetchData();
    } catch (error) {
      console.error('Error saving newsletter:', error);
      toast.error(error.response?.data?.message || 'Failed to save newsletter');
    }
  };

  const handlePublishNewsletter = async (newsletterId) => {
    if (!window.confirm('Are you sure you want to publish this newsletter? It will be sent to all users.')) {
      return;
    }

    try {
      const result = await adminService.publishNewsletter(newsletterId);
      showSendResults(result.data.results, 'Newsletter');
      fetchData();
    } catch (error) {
      console.error('Error publishing newsletter:', error);
      toast.error(error.response?.data?.message || 'Failed to publish newsletter');
    }
  };

  // Common handlers
  const handleDelete = async () => {
    try {
      // Check if it's a campaign (has recipientType) or newsletter (has title without recipientType)
      const isCampaign = selectedItem.recipientType !== undefined;
      
      if (isCampaign) {
        await adminService.deleteCampaign(selectedItem._id);
        toast.success('Campaign deleted successfully');
      } else {
        await adminService.deleteNewsletter(selectedItem._id);
        toast.success('Newsletter deleted successfully');
      }
      setDeleteDialog(false);
      fetchData();
    } catch (error) {
      console.error('Error deleting:', error);
      toast.error(error.response?.data?.message || 'Failed to delete');
    }
  };

  const handleView = (item) => {
    setSelectedItem(item);
    setViewDialog(true);
  };

  const getStatusColor = (status) => {
    const colors = {
      draft: 'default',
      scheduled: 'info',
      sending: 'warning',
      sent: 'success',
      failed: 'error',
      published: 'success',
      archived: 'default',
    };
    return colors[status] || 'default';
  };

  if (loading && !stats) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold', color: 'primary.main' }}>
        Email Marketing
      </Typography>

      {/* Statistics Cards */}
      {stats && (
        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid item xs={12} md={3}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center" mb={1}>
                  <CampaignIcon color="primary" sx={{ fontSize: 30, mr: 1 }} />
                  <Typography variant="h6">Campaigns</Typography>
                </Box>
                <Typography variant="h4">{stats.campaigns.total}</Typography>
                <Typography variant="body2" color="text.secondary">
                  Sent: {stats.campaigns.sent} | Draft: {stats.campaigns.draft}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={3}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center" mb={1}>
                  <NewsletterIcon color="secondary" sx={{ fontSize: 30, mr: 1 }} />
                  <Typography variant="h6">Newsletters</Typography>
                </Box>
                <Typography variant="h4">{stats.newsletters.total}</Typography>
                <Typography variant="body2" color="text.secondary">
                  Published: {stats.newsletters.published} | Draft: {stats.newsletters.draft}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={3}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center" mb={1}>
                  <EmailIcon color="success" sx={{ fontSize: 30, mr: 1 }} />
                  <Typography variant="h6">Emails Sent</Typography>
                </Box>
                <Typography variant="h4">{stats.emailsSent.total}</Typography>
                <Typography variant="body2" color="text.secondary">
                  Campaigns: {stats.emailsSent.campaigns} | Newsletters: {stats.emailsSent.newsletters}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={3}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center" mb={1}>
                  <StatsIcon color="error" sx={{ fontSize: 30, mr: 1 }} />
                  <Typography variant="h6">Failed Sends</Typography>
                </Box>
                <Typography variant="h4">{stats.failedEmails}</Typography>
                <Typography variant="body2" color="text.secondary">
                  Total failed emails
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Tabs */}
      <Paper sx={{ mb: 3 }}>
        <Tabs value={activeTab} onChange={handleTabChange}>
          <Tab label="Overview" />
          <Tab label="Campaigns" />
          <Tab label="Newsletters" />
        </Tabs>
      </Paper>

      {/* Overview Tab */}
      {activeTab === 0 && (
        <Box>
          <Typography variant="h6" gutterBottom>
            Email Marketing Overview
          </Typography>
          <Typography variant="body1" color="text.secondary" paragraph>
            Use campaigns for targeted bulk emails and newsletters for regular updates to all users.
          </Typography>
          <Box display="flex" gap={2} mb={3}>
            <Button
              variant="contained"
              color="primary"
              startIcon={<AddIcon />}
              onClick={handleCreateCampaign}
            >
              Create Campaign
            </Button>
            <Button
              variant="contained"
              color="secondary"
              startIcon={<AddIcon />}
              onClick={handleCreateNewsletter}
            >
              Create Newsletter
            </Button>
          </Box>
        </Box>
      )}

      {/* Campaigns Tab */}
      {activeTab === 1 && (
        <Box>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            <Typography variant="h6">Email Campaigns</Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleCreateCampaign}
            >
              New Campaign
            </Button>
          </Box>

          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>Subject</TableCell>
                  <TableCell>Recipient Type</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Recipients</TableCell>
                  <TableCell>Sent</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {campaigns.map((campaign) => (
                  <TableRow key={campaign._id}>
                    <TableCell>{campaign.name}</TableCell>
                    <TableCell>{campaign.subject}</TableCell>
                    <TableCell>
                      <Chip label={campaign.recipientType} size="small" />
                    </TableCell>
                    <TableCell>
                      <Chip label={campaign.status} color={getStatusColor(campaign.status)} size="small" />
                    </TableCell>
                    <TableCell>{campaign.totalRecipients || 0}</TableCell>
                    <TableCell>{campaign.successfulSends || 0}</TableCell>
                    <TableCell>
                      <IconButton size="small" onClick={() => handleView(campaign)}>
                        <ViewIcon />
                      </IconButton>
                      {campaign.status === 'draft' && (
                        <>
                          <IconButton size="small" onClick={() => handleEditCampaign(campaign)}>
                            <EditIcon />
                          </IconButton>
                          <IconButton size="small" color="primary" onClick={() => handleSendCampaign(campaign._id)}>
                            <SendIcon />
                          </IconButton>
                        </>
                      )}
                      {campaign.status !== 'sending' && (
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => {
                            setSelectedItem(campaign);
                            setDeleteDialog(true);
                          }}
                        >
                          <DeleteIcon />
                        </IconButton>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <TablePagination
              component="div"
              count={campaignsTotal}
              page={campaignsPage}
              onPageChange={(e, newPage) => setCampaignsPage(newPage)}
              rowsPerPage={campaignsRowsPerPage}
              onRowsPerPageChange={(e) => {
                setCampaignsRowsPerPage(parseInt(e.target.value, 10));
                setCampaignsPage(0);
              }}
            />
          </TableContainer>
        </Box>
      )}

      {/* Newsletters Tab */}
      {activeTab === 2 && (
        <Box>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            <Typography variant="h6">Newsletters</Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleCreateNewsletter}
            >
              New Newsletter
            </Button>
          </Box>

          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Title</TableCell>
                  <TableCell>Subject</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Subscribers</TableCell>
                  <TableCell>Sent</TableCell>
                  <TableCell>Published</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {newsletters.map((newsletter) => (
                  <TableRow key={newsletter._id}>
                    <TableCell>{newsletter.title}</TableCell>
                    <TableCell>{newsletter.subject}</TableCell>
                    <TableCell>
                      <Chip label={newsletter.status} color={getStatusColor(newsletter.status)} size="small" />
                    </TableCell>
                    <TableCell>{newsletter.totalSubscribers || 0}</TableCell>
                    <TableCell>{newsletter.sentCount || 0}</TableCell>
                    <TableCell>
                      {newsletter.publishedAt ? new Date(newsletter.publishedAt).toLocaleDateString() : '-'}
                    </TableCell>
                    <TableCell>
                      <IconButton size="small" onClick={() => handleView(newsletter)}>
                        <ViewIcon />
                      </IconButton>
                      {newsletter.status === 'draft' && (
                        <>
                          <IconButton size="small" onClick={() => handleEditNewsletter(newsletter)}>
                            <EditIcon />
                          </IconButton>
                          <IconButton size="small" color="primary" onClick={() => handlePublishNewsletter(newsletter._id)}>
                            <SendIcon />
                          </IconButton>
                        </>
                      )}
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => {
                          setSelectedItem(newsletter);
                          setDeleteDialog(true);
                        }}
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
              count={newslettersTotal}
              page={newslettersPage}
              onPageChange={(e, newPage) => setNewslettersPage(newPage)}
              rowsPerPage={newslettersRowsPerPage}
              onRowsPerPageChange={(e) => {
                setNewslettersRowsPerPage(parseInt(e.target.value, 10));
                setNewslettersPage(0);
              }}
            />
          </TableContainer>
        </Box>
      )}

      {/* Campaign Dialog */}
      <Dialog open={campaignDialog} onClose={() => setCampaignDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>{selectedItem ? 'Edit Campaign' : 'Create Campaign'}</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <TextField
              fullWidth
              label="Campaign Name"
              value={campaignForm.name}
              onChange={(e) => setCampaignForm({ ...campaignForm, name: e.target.value })}
              margin="normal"
            />
            <TextField
              fullWidth
              label="Email Subject"
              value={campaignForm.subject}
              onChange={(e) => setCampaignForm({ ...campaignForm, subject: e.target.value })}
              margin="normal"
            />
            <TextField
              fullWidth
              label="Email Content"
              value={campaignForm.content}
              onChange={(e) => setCampaignForm({ ...campaignForm, content: e.target.value })}
              margin="normal"
              multiline
              rows={8}
              helperText="You can use {name} and {email} as placeholders"
            />
            <FormControl fullWidth margin="normal">
              <InputLabel>Recipient Type</InputLabel>
              <Select
                value={campaignForm.recipientType}
                onChange={(e) => setCampaignForm({ ...campaignForm, recipientType: e.target.value })}
                label="Recipient Type"
              >
                <MenuItem value="all">All Users</MenuItem>
                <MenuItem value="students">Students Only</MenuItem>
                <MenuItem value="trainers">Trainers Only</MenuItem>
                <MenuItem value="admins">Admins Only</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCampaignDialog(false)}>Cancel</Button>
          <Button onClick={handleSaveCampaign} variant="contained" color="primary">
            Save
          </Button>
        </DialogActions>
      </Dialog>

      {/* Newsletter Dialog */}
      <Dialog open={newsletterDialog} onClose={() => setNewsletterDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>{selectedItem ? 'Edit Newsletter' : 'Create Newsletter'}</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <TextField
              fullWidth
              label="Newsletter Title"
              value={newsletterForm.title}
              onChange={(e) => setNewsletterForm({ ...newsletterForm, title: e.target.value })}
              margin="normal"
            />
            <TextField
              fullWidth
              label="Email Subject"
              value={newsletterForm.subject}
              onChange={(e) => setNewsletterForm({ ...newsletterForm, subject: e.target.value })}
              margin="normal"
            />
            <TextField
              fullWidth
              label="Newsletter Content"
              value={newsletterForm.content}
              onChange={(e) => setNewsletterForm({ ...newsletterForm, content: e.target.value })}
              margin="normal"
              multiline
              rows={10}
              helperText="You can use {name} and {email} as placeholders"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setNewsletterDialog(false)}>Cancel</Button>
          <Button onClick={handleSaveNewsletter} variant="contained" color="primary">
            Save
          </Button>
        </DialogActions>
      </Dialog>

      {/* View Dialog */}
      <Dialog open={viewDialog} onClose={() => setViewDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          {selectedItem?.name || selectedItem?.title}
        </DialogTitle>
        <DialogContent>
          {selectedItem && (
            <Box>
              <Typography variant="subtitle2" color="text.secondary">Subject:</Typography>
              <Typography variant="body1" paragraph>{selectedItem.subject}</Typography>
              
              <Typography variant="subtitle2" color="text.secondary">Content:</Typography>
              <Paper sx={{ p: 2, bgcolor: 'grey.100', mb: 2 }}>
                <Typography variant="body2" style={{ whiteSpace: 'pre-wrap' }}>
                  {selectedItem.content}
                </Typography>
              </Paper>

              {selectedItem.recipientType && (
                <>
                  <Typography variant="subtitle2" color="text.secondary">Recipient Type:</Typography>
                  <Typography variant="body1" paragraph>{selectedItem.recipientType}</Typography>
                </>
              )}

              <Typography variant="subtitle2" color="text.secondary">Status:</Typography>
              <Chip label={selectedItem.status} color={getStatusColor(selectedItem.status)} size="small" sx={{ mb: 2 }} />

              {selectedItem.totalRecipients > 0 && (
                <>
                  <Typography variant="subtitle2" color="text.secondary">Statistics:</Typography>
                  <Typography variant="body2">Total Recipients: {selectedItem.totalRecipients}</Typography>
                  <Typography variant="body2">Successful: {selectedItem.successfulSends || selectedItem.sentCount}</Typography>
                  <Typography variant="body2">Failed: {selectedItem.failedSends || 0}</Typography>
                </>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setViewDialog(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialog} onClose={() => setDeleteDialog(false)}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete this {selectedItem && selectedItem.recipientType !== undefined ? 'campaign' : 'newsletter'}?
            This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialog(false)}>Cancel</Button>
          <Button onClick={handleDelete} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default AdminEmailMarketing;
