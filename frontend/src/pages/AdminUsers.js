import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  IconButton,
  Button,
  Chip,
  TextField,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  Checkbox,
  Tooltip,
  Grid,
  FormControl,
  InputLabel,
  Select
} from '@mui/material';
import {
  Edit as EditIcon,
  Block as BlockIcon,
  CheckCircle as CheckCircleIcon,
  Delete as DeleteIcon,
  VpnKey as KeyIcon,
  History as HistoryIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'react-toastify';
import adminService from '../services/adminService';

const AdminUsers = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [total, setTotal] = useState(0);
  const [selectedUsers, setSelectedUsers] = useState([]);
  
  // Filters
  const [filters, setFilters] = useState({
    search: '',
    role: '',
    status: '',
    isActive: ''
  });

  // Dialogs
  const [editDialog, setEditDialog] = useState({ open: false, user: null });
  const [resetPasswordDialog, setResetPasswordDialog] = useState({ open: false, userId: null });
  const [activityDialog, setActivityDialog] = useState({ open: false, userId: null, activities: [] });
  const [bulkActionDialog, setBulkActionDialog] = useState({ open: false, action: null });

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      navigate('/');
      return;
    }
    fetchUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, navigate, page, rowsPerPage, filters]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await adminService.getUsers({
        page: page + 1,
        limit: rowsPerPage,
        ...filters
      });
      setUsers(response.data);
      setTotal(response.total);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({ ...prev, [field]: value }));
    setPage(0);
  };

  const handleSelectUser = (userId) => {
    setSelectedUsers(prev => 
      prev.includes(userId) 
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const handleSelectAll = (event) => {
    if (event.target.checked) {
      setSelectedUsers(users.map(u => u._id));
    } else {
      setSelectedUsers([]);
    }
  };

  const handleSuspendUser = async (userId, reason = '') => {
    try {
      await adminService.suspendUser(userId, reason);
      toast.success('User suspended successfully');
      fetchUsers();
    } catch (error) {
      console.error('Error suspending user:', error);
      toast.error('Failed to suspend user');
    }
  };

  const handleActivateUser = async (userId) => {
    try {
      await adminService.activateUser(userId);
      toast.success('User activated successfully');
      fetchUsers();
    } catch (error) {
      console.error('Error activating user:', error);
      toast.error('Failed to activate user');
    }
  };

  const [deleteDialog, setDeleteDialog] = useState({ open: false, userId: null });

  const handleDeleteUser = async (userId) => {
    setDeleteDialog({ open: true, userId });
  };

  const confirmDeleteUser = async () => {
    try {
      await adminService.deleteUser(deleteDialog.userId);
      toast.success('User deleted successfully');
      setDeleteDialog({ open: false, userId: null });
      fetchUsers();
    } catch (error) {
      console.error('Error deleting user:', error);
      toast.error('Failed to delete user');
    }
  };

  const handleUpdateUser = async (userData) => {
    try {
      await adminService.updateUser(editDialog.user._id, userData);
      toast.success('User updated successfully');
      setEditDialog({ open: false, user: null });
      fetchUsers();
    } catch (error) {
      console.error('Error updating user:', error);
      toast.error('Failed to update user');
    }
  };

  const handleResetPassword = async (newPassword) => {
    try {
      await adminService.resetUserPassword(resetPasswordDialog.userId, newPassword);
      toast.success('Password reset successfully');
      setResetPasswordDialog({ open: false, userId: null });
    } catch (error) {
      console.error('Error resetting password:', error);
      toast.error('Failed to reset password');
    }
  };

  const handleViewActivity = async (userId) => {
    try {
      const response = await adminService.getUserActivity(userId);
      setActivityDialog({ open: true, userId, activities: response.data });
    } catch (error) {
      console.error('Error fetching activity:', error);
      toast.error('Failed to fetch user activity');
    }
  };

  const handleBulkAction = async (action, data = {}) => {
    if (selectedUsers.length === 0) {
      toast.warning('Please select users first');
      return;
    }

    try {
      if (action === 'delete') {
        await adminService.bulkDeleteUsers(selectedUsers);
        toast.success(`Deleted ${selectedUsers.length} users`);
      } else if (action === 'update') {
        await adminService.bulkUpdateUsers(selectedUsers, data);
        toast.success(`Updated ${selectedUsers.length} users`);
      }
      setSelectedUsers([]);
      setBulkActionDialog({ open: false, action: null });
      fetchUsers();
    } catch (error) {
      console.error('Error performing bulk action:', error);
      toast.error('Failed to perform bulk action');
    }
  };

  const getRoleColor = (role) => {
    const colors = {
      admin: 'error',
      trainer: 'warning',
      student: 'info'
    };
    return colors[role] || 'default';
  };

  const getStatusColor = (status) => {
    const colors = {
      active: 'success',
      inactive: 'default',
      suspended: 'error'
    };
    return colors[status] || 'default';
  };

  if (loading && users.length === 0) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold', color: 'primary.main' }}>
        User Management
      </Typography>

      {/* Filters */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} md={3}>
            <TextField
              fullWidth
              label="Search"
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              placeholder="Search by name or email"
            />
          </Grid>
          <Grid item xs={12} md={3}>
            <FormControl fullWidth>
              <InputLabel>Role</InputLabel>
              <Select
                value={filters.role}
                label="Role"
                onChange={(e) => handleFilterChange('role', e.target.value)}
              >
                <MenuItem value="">All Roles</MenuItem>
                <MenuItem value="student">Student</MenuItem>
                <MenuItem value="trainer">Trainer</MenuItem>
                <MenuItem value="admin">Admin</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={3}>
            <FormControl fullWidth>
              <InputLabel>Status</InputLabel>
              <Select
                value={filters.status}
                label="Status"
                onChange={(e) => handleFilterChange('status', e.target.value)}
              >
                <MenuItem value="">All Statuses</MenuItem>
                <MenuItem value="active">Active</MenuItem>
                <MenuItem value="inactive">Inactive</MenuItem>
                <MenuItem value="suspended">Suspended</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={3}>
            <FormControl fullWidth>
              <InputLabel>Active</InputLabel>
              <Select
                value={filters.isActive}
                label="Active"
                onChange={(e) => handleFilterChange('isActive', e.target.value)}
              >
                <MenuItem value="">All</MenuItem>
                <MenuItem value="true">Active</MenuItem>
                <MenuItem value="false">Inactive</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </Paper>

      {/* Bulk Actions */}
      {selectedUsers.length > 0 && (
        <Paper sx={{ p: 2, mb: 2, backgroundColor: 'primary.light' }}>
          <Box display="flex" alignItems="center" gap={2}>
            <Typography variant="body1" sx={{ color: 'white' }}>
              {selectedUsers.length} user(s) selected
            </Typography>
            <Button
              variant="contained"
              color="error"
              onClick={() => setBulkActionDialog({ open: true, action: 'delete' })}
            >
              Delete Selected
            </Button>
            <Button
              variant="contained"
              color="secondary"
              onClick={() => setBulkActionDialog({ open: true, action: 'suspend' })}
            >
              Suspend Selected
            </Button>
            <Button
              variant="outlined"
              sx={{ color: 'white', borderColor: 'white' }}
              onClick={() => setSelectedUsers([])}
            >
              Clear Selection
            </Button>
          </Box>
        </Paper>
      )}

      {/* Users Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell padding="checkbox">
                <Checkbox
                  checked={selectedUsers.length === users.length && users.length > 0}
                  indeterminate={selectedUsers.length > 0 && selectedUsers.length < users.length}
                  onChange={handleSelectAll}
                />
              </TableCell>
              <TableCell>Name</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Role</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Active</TableCell>
              <TableCell>Created</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {users.map((userData) => (
              <TableRow key={userData._id}>
                <TableCell padding="checkbox">
                  <Checkbox
                    checked={selectedUsers.includes(userData._id)}
                    onChange={() => handleSelectUser(userData._id)}
                  />
                </TableCell>
                <TableCell>{userData.name}</TableCell>
                <TableCell>{userData.email}</TableCell>
                <TableCell>
                  <Chip label={userData.role} color={getRoleColor(userData.role)} size="small" />
                </TableCell>
                <TableCell>
                  <Chip label={userData.status} color={getStatusColor(userData.status)} size="small" />
                </TableCell>
                <TableCell>
                  {userData.isActive ? (
                    <CheckCircleIcon color="success" />
                  ) : (
                    <BlockIcon color="disabled" />
                  )}
                </TableCell>
                <TableCell>{new Date(userData.createdAt).toLocaleDateString()}</TableCell>
                <TableCell>
                  <Tooltip title="Edit">
                    <IconButton
                      size="small"
                      onClick={() => setEditDialog({ open: true, user: userData })}
                    >
                      <EditIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="View Activity">
                    <IconButton
                      size="small"
                      onClick={() => handleViewActivity(userData._id)}
                    >
                      <HistoryIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Reset Password">
                    <IconButton
                      size="small"
                      onClick={() => setResetPasswordDialog({ open: true, userId: userData._id })}
                    >
                      <KeyIcon />
                    </IconButton>
                  </Tooltip>
                  {userData.status === 'suspended' ? (
                    <Tooltip title="Activate">
                      <IconButton
                        size="small"
                        color="success"
                        onClick={() => handleActivateUser(userData._id)}
                      >
                        <CheckCircleIcon />
                      </IconButton>
                    </Tooltip>
                  ) : (
                    <Tooltip title="Suspend">
                      <IconButton
                        size="small"
                        color="warning"
                        onClick={() => handleSuspendUser(userData._id)}
                      >
                        <BlockIcon />
                      </IconButton>
                    </Tooltip>
                  )}
                  <Tooltip title="Delete">
                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => handleDeleteUser(userData._id)}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Tooltip>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <TablePagination
          component="div"
          count={total}
          page={page}
          onPageChange={(e, newPage) => setPage(newPage)}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={(e) => {
            setRowsPerPage(parseInt(e.target.value, 10));
            setPage(0);
          }}
        />
      </TableContainer>

      {/* Edit User Dialog */}
      <EditUserDialog
        open={editDialog.open}
        user={editDialog.user}
        onClose={() => setEditDialog({ open: false, user: null })}
        onSave={handleUpdateUser}
      />

      {/* Reset Password Dialog */}
      <ResetPasswordDialog
        open={resetPasswordDialog.open}
        onClose={() => setResetPasswordDialog({ open: false, userId: null })}
        onReset={handleResetPassword}
      />

      {/* Activity Dialog */}
      <ActivityDialog
        open={activityDialog.open}
        activities={activityDialog.activities}
        onClose={() => setActivityDialog({ open: false, userId: null, activities: [] })}
      />

      {/* Bulk Action Dialog */}
      <BulkActionDialog
        open={bulkActionDialog.open}
        action={bulkActionDialog.action}
        count={selectedUsers.length}
        onClose={() => setBulkActionDialog({ open: false, action: null })}
        onConfirm={handleBulkAction}
      />

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialog.open} onClose={() => setDeleteDialog({ open: false, userId: null })}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete this user? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialog({ open: false, userId: null })}>Cancel</Button>
          <Button onClick={confirmDeleteUser} variant="contained" color="error">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

// Edit User Dialog Component
const EditUserDialog = ({ open, user, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'student',
    status: 'active',
    isActive: true
  });

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        role: user.role || 'student',
        status: user.status || 'active',
        isActive: user.isActive !== undefined ? user.isActive : true
      });
    }
  }, [user]);

  const handleSubmit = () => {
    onSave(formData);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Edit User</DialogTitle>
      <DialogContent>
        <Box sx={{ mt: 2 }}>
          <TextField
            fullWidth
            label="Name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            sx={{ mb: 2 }}
          />
          <TextField
            fullWidth
            label="Email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            sx={{ mb: 2 }}
          />
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Role</InputLabel>
            <Select
              value={formData.role}
              label="Role"
              onChange={(e) => setFormData({ ...formData, role: e.target.value })}
            >
              <MenuItem value="student">Student</MenuItem>
              <MenuItem value="trainer">Trainer</MenuItem>
              <MenuItem value="admin">Admin</MenuItem>
            </Select>
          </FormControl>
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Status</InputLabel>
            <Select
              value={formData.status}
              label="Status"
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
            >
              <MenuItem value="active">Active</MenuItem>
              <MenuItem value="inactive">Inactive</MenuItem>
              <MenuItem value="suspended">Suspended</MenuItem>
            </Select>
          </FormControl>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleSubmit} variant="contained" color="primary">
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
};

// Reset Password Dialog Component
const ResetPasswordDialog = ({ open, onClose, onReset }) => {
  const [newPassword, setNewPassword] = useState('');

  const handleSubmit = () => {
    if (newPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    onReset(newPassword);
    setNewPassword('');
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Reset User Password</DialogTitle>
      <DialogContent>
        <TextField
          fullWidth
          type="password"
          label="New Password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          sx={{ mt: 2 }}
          helperText="Minimum 6 characters"
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleSubmit} variant="contained" color="primary">
          Reset Password
        </Button>
      </DialogActions>
    </Dialog>
  );
};

// Activity Dialog Component
const ActivityDialog = ({ open, activities, onClose }) => {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>User Activity Logs</DialogTitle>
      <DialogContent>
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Action</TableCell>
                <TableCell>Details</TableCell>
                <TableCell>Date</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {activities.map((activity) => (
                <TableRow key={activity._id}>
                  <TableCell>{activity.action}</TableCell>
                  <TableCell>{activity.details}</TableCell>
                  <TableCell>{new Date(activity.createdAt).toLocaleString()}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
};

// Bulk Action Dialog Component
const BulkActionDialog = ({ open, action, count, onClose, onConfirm }) => {
  const [bulkData, setBulkData] = useState({
    status: 'active',
    role: 'student'
  });

  const handleConfirm = () => {
    if (action === 'delete') {
      onConfirm('delete');
    } else if (action === 'suspend') {
      onConfirm('update', { status: 'suspended', isActive: false });
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        {action === 'delete' ? 'Delete Users' : 'Bulk Update Users'}
      </DialogTitle>
      <DialogContent>
        {action === 'delete' ? (
          <Typography>
            Are you sure you want to delete {count} user(s)? This action cannot be undone.
          </Typography>
        ) : (
          <Box sx={{ mt: 2 }}>
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Status</InputLabel>
              <Select
                value={bulkData.status}
                label="Status"
                onChange={(e) => setBulkData({ ...bulkData, status: e.target.value })}
              >
                <MenuItem value="active">Active</MenuItem>
                <MenuItem value="inactive">Inactive</MenuItem>
                <MenuItem value="suspended">Suspended</MenuItem>
              </Select>
            </FormControl>
          </Box>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button 
          onClick={handleConfirm} 
          variant="contained" 
          color={action === 'delete' ? 'error' : 'primary'}
        >
          Confirm
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AdminUsers;
