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
  Chip,
  CircularProgress,
  Tabs,
  Tab,
  Rating,
  Select,
  MenuItem,
  FormControl,
  InputLabel
} from '@mui/material';
import {
  CheckCircle as ApproveIcon,
  Cancel as RejectIcon,
  Flag as FlagIcon,
  Delete as DeleteIcon,
  Reply as ReplyIcon
} from '@mui/icons-material';
import { toast } from 'react-toastify';
import adminService from '../services/adminService';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const AdminModeration = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [currentTab, setCurrentTab] = useState(0);
  
  // Forum posts state
  const [posts, setPosts] = useState([]);
  const [postsLoading, setPostsLoading] = useState(true);
  
  // Reviews state
  const [reviews, setReviews] = useState([]);
  const [reviewsLoading, setReviewsLoading] = useState(true);
  const [reviewFilter, setReviewFilter] = useState('pending');
  
  // Dialog state
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [moderationReason, setModerationReason] = useState('');
  const [actionType, setActionType] = useState('');
  const [flagReason, setFlagReason] = useState('spam');
  
  // Response dialog state
  const [openResponseDialog, setOpenResponseDialog] = useState(false);
  const [responseText, setResponseText] = useState('');

  const fetchPendingPosts = async () => {
    try {
      setPostsLoading(true);
      const response = await adminService.getPendingForumPosts({ status: 'pending' });
      setPosts(response.data || []);
    } catch (error) {
      toast.error('Failed to fetch pending posts');
      console.error('Error:', error);
    } finally {
      setPostsLoading(false);
    }
  };

  const fetchReviews = async () => {
    try {
      setReviewsLoading(true);
      const response = await adminService.getAllReviews({ status: reviewFilter });
      setReviews(response.data || []);
    } catch (error) {
      toast.error('Failed to fetch reviews');
      console.error('Error:', error);
    } finally {
      setReviewsLoading(false);
    }
  };

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      navigate('/');
      return;
    }
    fetchPendingPosts();
    fetchReviews();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, navigate]);

  useEffect(() => {
    if (currentTab === 1) {
      fetchReviews();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reviewFilter, currentTab]);

  const handleTabChange = (event, newValue) => {
    setCurrentTab(newValue);
  };

  const handleOpenDialog = (item, action, isForum = false) => {
    setSelectedItem({ ...item, isForum });
    setActionType(action);
    setModerationReason('');
    setFlagReason('spam');
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedItem(null);
    setModerationReason('');
  };

  const handleOpenResponseDialog = (review) => {
    setSelectedItem(review);
    setResponseText(review.adminResponse?.text || '');
    setOpenResponseDialog(true);
  };

  const handleCloseResponseDialog = () => {
    setOpenResponseDialog(false);
    setSelectedItem(null);
    setResponseText('');
  };

  const handleModerate = async () => {
    try {
      if (selectedItem.isForum) {
        // Forum post moderation
        await adminService.moderateForumPost(
          selectedItem._id,
          actionType,
          moderationReason
        );
        toast.success(`Post ${actionType === 'approved' ? 'approved' : 'rejected'} successfully`);
        fetchPendingPosts();
      } else {
        // Review moderation
        switch (actionType) {
          case 'approve':
            await adminService.approveReview(selectedItem._id, moderationReason);
            toast.success('Review approved successfully');
            break;
          case 'reject':
            if (!moderationReason) {
              toast.error('Please provide a reason for rejection');
              return;
            }
            await adminService.rejectReview(selectedItem._id, moderationReason);
            toast.success('Review rejected successfully');
            break;
          case 'flag':
            if (!flagReason) {
              toast.error('Please select a flag reason');
              return;
            }
            await adminService.flagReview(selectedItem._id, flagReason, moderationReason);
            toast.success('Review flagged successfully');
            break;
          case 'remove':
            await adminService.removeReview(selectedItem._id, moderationReason);
            toast.success('Review removed successfully');
            break;
          default:
            break;
        }
        fetchReviews();
      }
      handleCloseDialog();
    } catch (error) {
      toast.error(`Failed to ${actionType} ${selectedItem.isForum ? 'post' : 'review'}`);
      console.error('Error:', error);
    }
  };

  const handleRespond = async () => {
    if (!responseText.trim()) {
      toast.error('Please enter a response');
      return;
    }

    try {
      await adminService.respondToReview(selectedItem._id, responseText);
      toast.success('Response added successfully');
      handleCloseResponseDialog();
      fetchReviews();
    } catch (error) {
      toast.error('Failed to add response');
      console.error('Error:', error);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'warning';
      case 'approved':
        return 'success';
      case 'rejected':
        return 'error';
      case 'flagged':
        return 'error';
      default:
        return 'default';
    }
  };

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
          Content Moderation
        </Typography>
      </Box>

      <Paper sx={{ mb: 3 }}>
        <Tabs value={currentTab} onChange={handleTabChange}>
          <Tab label="Forum Posts" />
          <Tab label="Course Reviews" />
        </Tabs>
      </Paper>

      {/* Forum Posts Tab */}
      {currentTab === 0 && (
        <>
          {postsLoading ? (
            <Box display="flex" justifyContent="center" py={5}>
              <CircularProgress />
            </Box>
          ) : posts.length === 0 ? (
            <Paper sx={{ p: 3, textAlign: 'center' }}>
              <Typography variant="h6" color="text.secondary">
                No pending posts to moderate
              </Typography>
            </Paper>
          ) : (
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Title</TableCell>
                    <TableCell>Author</TableCell>
                    <TableCell>Category</TableCell>
                    <TableCell>Created</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {posts.map((post) => (
                    <TableRow key={post._id}>
                      <TableCell>{post.title}</TableCell>
                      <TableCell>{post.author?.name || 'Unknown'}</TableCell>
                      <TableCell>{post.category || 'General'}</TableCell>
                      <TableCell>
                        {new Date(post.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={post.status || 'pending'}
                          color="warning"
                          size="small"
                        />
                      </TableCell>
                      <TableCell align="right">
                        <IconButton
                          size="small"
                          color="success"
                          onClick={() => handleOpenDialog(post, 'approved', true)}
                          title="Approve"
                        >
                          <ApproveIcon />
                        </IconButton>
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => handleOpenDialog(post, 'rejected', true)}
                          title="Reject"
                        >
                          <RejectIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </>
      )}

      {/* Course Reviews Tab */}
      {currentTab === 1 && (
        <>
          <Box sx={{ mb: 2 }}>
            <FormControl sx={{ minWidth: 200 }}>
              <InputLabel>Filter by Status</InputLabel>
              <Select
                value={reviewFilter}
                label="Filter by Status"
                onChange={(e) => setReviewFilter(e.target.value)}
              >
                <MenuItem value="pending">Pending</MenuItem>
                <MenuItem value="approved">Approved</MenuItem>
                <MenuItem value="rejected">Rejected</MenuItem>
                <MenuItem value="flagged">Flagged</MenuItem>
              </Select>
            </FormControl>
          </Box>

          {reviewsLoading ? (
            <Box display="flex" justifyContent="center" py={5}>
              <CircularProgress />
            </Box>
          ) : reviews.length === 0 ? (
            <Paper sx={{ p: 3, textAlign: 'center' }}>
              <Typography variant="h6" color="text.secondary">
                No {reviewFilter} reviews found
              </Typography>
            </Paper>
          ) : (
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Course</TableCell>
                    <TableCell>User</TableCell>
                    <TableCell>Rating</TableCell>
                    <TableCell>Review</TableCell>
                    <TableCell>Date</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {reviews.map((review) => (
                    <TableRow key={review._id}>
                      <TableCell>
                        {review.course?.title?.en || review.course?.title || 'Unknown Course'}
                      </TableCell>
                      <TableCell>{review.user?.name || 'Unknown'}</TableCell>
                      <TableCell>
                        <Rating value={review.rating} readOnly size="small" />
                      </TableCell>
                      <TableCell sx={{ maxWidth: 300 }}>
                        <Typography variant="body2" noWrap>
                          {review.reviewText}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        {new Date(review.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={review.status}
                          color={getStatusColor(review.status)}
                          size="small"
                        />
                      </TableCell>
                      <TableCell align="right">
                        {review.status === 'pending' && (
                          <>
                            <IconButton
                              size="small"
                              color="success"
                              onClick={() => handleOpenDialog(review, 'approve', false)}
                              title="Approve"
                            >
                              <ApproveIcon />
                            </IconButton>
                            <IconButton
                              size="small"
                              color="error"
                              onClick={() => handleOpenDialog(review, 'reject', false)}
                              title="Reject"
                            >
                              <RejectIcon />
                            </IconButton>
                          </>
                        )}
                        <IconButton
                          size="small"
                          color="warning"
                          onClick={() => handleOpenDialog(review, 'flag', false)}
                          title="Flag"
                        >
                          <FlagIcon />
                        </IconButton>
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => handleOpenDialog(review, 'remove', false)}
                          title="Remove"
                        >
                          <DeleteIcon />
                        </IconButton>
                        <IconButton
                          size="small"
                          color="primary"
                          onClick={() => handleOpenResponseDialog(review)}
                          title="Respond"
                        >
                          <ReplyIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </>
      )}

      {/* Moderation Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          {selectedItem?.isForum 
            ? (actionType === 'approved' ? 'Approve Post' : 'Reject Post')
            : actionType === 'approve' ? 'Approve Review'
            : actionType === 'reject' ? 'Reject Review'
            : actionType === 'flag' ? 'Flag Review'
            : 'Remove Review'
          }
        </DialogTitle>
        <DialogContent>
          {selectedItem && (
            <Box sx={{ mt: 2 }}>
              {selectedItem.isForum ? (
                <>
                  <Typography variant="h6" gutterBottom>
                    {selectedItem.title}
                  </Typography>
                  <Typography variant="body1" paragraph>
                    {selectedItem.content}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    By: {selectedItem.author?.name || 'Unknown'} •{' '}
                    {new Date(selectedItem.createdAt).toLocaleString()}
                  </Typography>
                </>
              ) : (
                <>
                  <Typography variant="h6" gutterBottom>
                    {selectedItem.course?.title?.en || selectedItem.course?.title || 'Course'}
                  </Typography>
                  <Box sx={{ mb: 2 }}>
                    <Rating value={selectedItem.rating} readOnly />
                  </Box>
                  <Typography variant="body1" paragraph>
                    {selectedItem.reviewText}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    By: {selectedItem.user?.name || 'Unknown'} •{' '}
                    {new Date(selectedItem.createdAt).toLocaleString()}
                  </Typography>
                </>
              )}
              
              {actionType === 'flag' && !selectedItem.isForum && (
                <FormControl fullWidth sx={{ mt: 2, mb: 2 }}>
                  <InputLabel>Flag Reason</InputLabel>
                  <Select
                    value={flagReason}
                    label="Flag Reason"
                    onChange={(e) => setFlagReason(e.target.value)}
                  >
                    <MenuItem value="spam">Spam</MenuItem>
                    <MenuItem value="inappropriate">Inappropriate Content</MenuItem>
                    <MenuItem value="offensive">Offensive Language</MenuItem>
                    <MenuItem value="fake">Fake Review</MenuItem>
                    <MenuItem value="other">Other</MenuItem>
                  </Select>
                </FormControl>
              )}
              
              <TextField
                fullWidth
                multiline
                rows={3}
                label={
                  actionType === 'rejected' || actionType === 'reject' || actionType === 'remove'
                    ? 'Reason (required)'
                    : actionType === 'flag'
                    ? 'Additional details'
                    : 'Notes (optional)'
                }
                value={moderationReason}
                onChange={(e) => setModerationReason(e.target.value)}
                sx={{ mt: 2 }}
                required={actionType === 'reject' || actionType === 'rejected'}
              />
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button
            onClick={handleModerate}
            variant="contained"
            color={
              actionType === 'approved' || actionType === 'approve' ? 'success' 
              : actionType === 'flag' ? 'warning'
              : 'error'
            }
          >
            {actionType === 'approved' || actionType === 'approve' ? 'Approve' 
             : actionType === 'rejected' || actionType === 'reject' ? 'Reject'
             : actionType === 'flag' ? 'Flag'
             : 'Remove'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Response Dialog */}
      <Dialog open={openResponseDialog} onClose={handleCloseResponseDialog} maxWidth="md" fullWidth>
        <DialogTitle>Respond to Review</DialogTitle>
        <DialogContent>
          {selectedItem && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="h6" gutterBottom>
                {selectedItem.course?.title?.en || selectedItem.course?.title || 'Course'}
              </Typography>
              <Box sx={{ mb: 2 }}>
                <Rating value={selectedItem.rating} readOnly />
              </Box>
              <Typography variant="body1" paragraph>
                {selectedItem.reviewText}
              </Typography>
              <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 2 }}>
                By: {selectedItem.user?.name || 'Unknown'} •{' '}
                {new Date(selectedItem.createdAt).toLocaleString()}
              </Typography>

              {selectedItem.adminResponse?.text && (
                <Paper sx={{ p: 2, mb: 2, bgcolor: 'grey.100' }}>
                  <Typography variant="subtitle2" color="primary" gutterBottom>
                    Current Response:
                  </Typography>
                  <Typography variant="body2">
                    {selectedItem.adminResponse.text}
                  </Typography>
                </Paper>
              )}

              <TextField
                fullWidth
                multiline
                rows={4}
                label="Admin Response"
                value={responseText}
                onChange={(e) => setResponseText(e.target.value)}
                placeholder="Write your response to this review..."
              />
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseResponseDialog}>Cancel</Button>
          <Button onClick={handleRespond} variant="contained" color="primary">
            Submit Response
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default AdminModeration;
