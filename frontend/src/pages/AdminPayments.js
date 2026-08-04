import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Chip,
  CircularProgress,
  TextField,
  MenuItem,
  Grid,
  Card,
  CardContent,
  Button,
  Tabs,
  Tab,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Snackbar
} from '@mui/material';
import {
  Payment as PaymentIcon,
  TrendingUp as TrendingUpIcon,
  MonetizationOn as MoneyIcon,
  Assignment as ReportIcon,
  Settings as SettingsIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import adminService from '../services/adminService';
import { format } from 'date-fns';

const AdminPayments = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(0);
  const [transactions, setTransactions] = useState([]);
  const [stats, setStats] = useState(null);
  const [revenueData, setRevenueData] = useState(null);
  const [gatewayConfig, setGatewayConfig] = useState(null);
  const [refundRequests, setRefundRequests] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(20);
  const [totalCount, setTotalCount] = useState(0);
  const [filters, setFilters] = useState({
    status: '',
    paymentMethod: '',
    currency: ''
  });
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [selectedRefund, setSelectedRefund] = useState(null);
  const [rejectReason, setRejectReason] = useState('');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      navigate('/');
      return;
    }
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, navigate, page, rowsPerPage, filters]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const promises = [fetchTransactions(), fetchStats()];
      
      // Add conditional fetches based on active tab
      if (activeTab === 1) promises.push(fetchRevenueAnalytics());
      if (activeTab === 2) promises.push(fetchRefundRequests());
      if (activeTab === 3) promises.push(fetchGatewayConfig());
      
      await Promise.all(promises);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchTransactions = async () => {
    try {
      const params = {
        page: page + 1,
        limit: rowsPerPage,
        ...filters
      };
      const response = await adminService.getAllTransactions(params);
      setTransactions(response.data);
      setTotalCount(response.total);
    } catch (error) {
      console.error('Error fetching transactions:', error);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await adminService.getPaymentStats();
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const fetchRevenueAnalytics = async () => {
    try {
      const response = await adminService.getRevenueAnalytics();
      setRevenueData(response.data);
    } catch (error) {
      console.error('Error fetching revenue analytics:', error);
    }
  };

  const fetchRefundRequests = async () => {
    try {
      const response = await adminService.getRefundRequests();
      setRefundRequests(response.data);
    } catch (error) {
      console.error('Error fetching refund requests:', error);
    }
  };

  const fetchGatewayConfig = async () => {
    try {
      const response = await adminService.getGatewayConfig();
      setGatewayConfig(response.data);
    } catch (error) {
      console.error('Error fetching gateway config:', error);
    }
  };

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const handleApproveRefund = async (refundId) => {
    try {
      await adminService.approveRefund(refundId);
      showSnackbar('Refund approved successfully', 'success');
      fetchRefundRequests();
      fetchStats();
    } catch (error) {
      console.error('Error approving refund:', error);
      showSnackbar('Error approving refund: ' + (error.response?.data?.message || error.message), 'error');
    }
  };

  const handleRejectRefundClick = (refund) => {
    setSelectedRefund(refund);
    setRejectReason('');
    setRejectDialogOpen(true);
  };

  const handleRejectRefundConfirm = async () => {
    try {
      await adminService.rejectRefund(selectedRefund._id, rejectReason);
      showSnackbar('Refund rejected', 'success');
      setRejectDialogOpen(false);
      setSelectedRefund(null);
      setRejectReason('');
      fetchRefundRequests();
      fetchStats();
    } catch (error) {
      console.error('Error rejecting refund:', error);
      showSnackbar('Error rejecting refund: ' + (error.response?.data?.message || error.message), 'error');
    }
  };

  const handleExportTransactions = async () => {
    try {
      const response = await adminService.exportTransactions({ format: 'csv' });
      const url = window.URL.createObjectURL(new Blob([response]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `transactions-${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      showSnackbar('Transactions exported successfully', 'success');
    } catch (error) {
      console.error('Error exporting transactions:', error);
      showSnackbar('Error exporting transactions', 'error');
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      completed: 'success',
      pending: 'warning',
      failed: 'error',
      refunded: 'info',
      cancelled: 'default'
    };
    return colors[status] || 'default';
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({ ...prev, [field]: value }));
    setPage(0);
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
    // Fetch data for the selected tab if not already loaded
    if (newValue === 1 && !revenueData) {
      fetchRevenueAnalytics();
    } else if (newValue === 2) {
      // Always refetch refund requests to ensure latest data
      fetchRefundRequests();
    } else if (newValue === 3 && !gatewayConfig) {
      fetchGatewayConfig();
    }
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
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
          Payment Management
        </Typography>
        <Button
          variant="outlined"
          startIcon={<RefreshIcon />}
          onClick={fetchData}
        >
          Refresh
        </Button>
      </Box>

      {/* Statistics Cards */}
      {stats && (
        <Grid container spacing={3} mb={3}>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center" mb={1}>
                  <PaymentIcon color="primary" sx={{ mr: 1 }} />
                  <Typography variant="h6">Total Payments</Typography>
                </Box>
                <Typography variant="h4">{stats.payments.total}</Typography>
                <Typography variant="body2" color="text.secondary">
                  Completed: {stats.payments.completed}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center" mb={1}>
                  <MoneyIcon color="success" sx={{ mr: 1 }} />
                  <Typography variant="h6">This Month</Typography>
                </Box>
                <Typography variant="h4">${stats.revenue.thisMonth.toFixed(2)}</Typography>
                <Typography variant="body2" color="text.secondary">
                  Today: ${stats.revenue.today.toFixed(2)}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center" mb={1}>
                  <TrendingUpIcon color="info" sx={{ mr: 1 }} />
                  <Typography variant="h6">Last Month</Typography>
                </Box>
                <Typography variant="h4">${stats.revenue.lastMonth.toFixed(2)}</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center" mb={1}>
                  <ReportIcon color="warning" sx={{ mr: 1 }} />
                  <Typography variant="h6">Refund Requests</Typography>
                </Box>
                <Typography variant="h4">{stats.refunds.pending}</Typography>
                <Typography variant="body2" color="text.secondary">
                  Total: {stats.refunds.total}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Tabs */}
      <Paper sx={{ mb: 3 }}>
        <Tabs value={activeTab} onChange={handleTabChange} variant="fullWidth">
          <Tab label="All Transactions" icon={<PaymentIcon />} iconPosition="start" />
          <Tab label="Revenue Analytics" icon={<TrendingUpIcon />} iconPosition="start" />
          <Tab label="Refund Requests" icon={<ReportIcon />} iconPosition="start" />
          <Tab label="Gateway Config" icon={<SettingsIcon />} iconPosition="start" />
        </Tabs>
      </Paper>

      {/* Tab Content */}
      {activeTab === 0 && (
        <Paper sx={{ p: 3 }}>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
            <Typography variant="h6">All Transactions</Typography>
            <Button
              variant="contained"
              onClick={handleExportTransactions}
              disabled={transactions.length === 0}
            >
              Export CSV
            </Button>
          </Box>

          {/* Filters */}
          <Grid container spacing={2} mb={3}>
            <Grid item xs={12} sm={4}>
              <TextField
                select
                fullWidth
                label="Status"
                value={filters.status}
                onChange={(e) => handleFilterChange('status', e.target.value)}
              >
                <MenuItem value="">All</MenuItem>
                <MenuItem value="completed">Completed</MenuItem>
                <MenuItem value="pending">Pending</MenuItem>
                <MenuItem value="failed">Failed</MenuItem>
                <MenuItem value="refunded">Refunded</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                select
                fullWidth
                label="Payment Method"
                value={filters.paymentMethod}
                onChange={(e) => handleFilterChange('paymentMethod', e.target.value)}
              >
                <MenuItem value="">All</MenuItem>
                <MenuItem value="stripe">Stripe</MenuItem>
                <MenuItem value="paypal">PayPal</MenuItem>
                <MenuItem value="fawry">Fawry</MenuItem>
                <MenuItem value="paymob">Paymob</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                select
                fullWidth
                label="Currency"
                value={filters.currency}
                onChange={(e) => handleFilterChange('currency', e.target.value)}
              >
                <MenuItem value="">All</MenuItem>
                <MenuItem value="USD">USD</MenuItem>
                <MenuItem value="EUR">EUR</MenuItem>
                <MenuItem value="EGP">EGP</MenuItem>
                <MenuItem value="SAR">SAR</MenuItem>
                <MenuItem value="NGN">NGN</MenuItem>
              </TextField>
            </Grid>
          </Grid>

          {/* Transactions Table */}
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Transaction ID</TableCell>
                  <TableCell>Date</TableCell>
                  <TableCell>User</TableCell>
                  <TableCell>Course</TableCell>
                  <TableCell>Amount</TableCell>
                  <TableCell>Method</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {transactions.map((transaction) => (
                  <TableRow key={transaction._id} hover>
                    <TableCell>{transaction.transactionId || 'N/A'}</TableCell>
                    <TableCell>
                      {transaction.createdAt
                        ? format(new Date(transaction.createdAt), 'MMM dd, yyyy')
                        : 'N/A'}
                    </TableCell>
                    <TableCell>{transaction.user?.name || 'Unknown'}</TableCell>
                    <TableCell>{transaction.course?.title || 'N/A'}</TableCell>
                    <TableCell>
                      {transaction.amount} {transaction.currency}
                    </TableCell>
                    <TableCell>{transaction.paymentMethod}</TableCell>
                    <TableCell>
                      <Chip
                        label={transaction.status}
                        color={getStatusColor(transaction.status)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Button
                        size="small"
                        onClick={() => {
                          setSelectedTransaction(transaction);
                          setDetailsOpen(true);
                        }}
                      >
                        Details
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          <TablePagination
            component="div"
            count={totalCount}
            page={page}
            onPageChange={handleChangePage}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
        </Paper>
      )}

      {activeTab === 1 && revenueData && (
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Revenue Analytics
          </Typography>
          
          <Grid container spacing={3}>
            {/* Overall Stats */}
            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>Overall Statistics</Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={4}>
                      <Typography variant="body2" color="text.secondary">Total Revenue</Typography>
                      <Typography variant="h5">${revenueData.overall.totalRevenue.toFixed(2)}</Typography>
                    </Grid>
                    <Grid item xs={12} sm={4}>
                      <Typography variant="body2" color="text.secondary">Total Transactions</Typography>
                      <Typography variant="h5">{revenueData.overall.totalTransactions}</Typography>
                    </Grid>
                    <Grid item xs={12} sm={4}>
                      <Typography variant="body2" color="text.secondary">Average Transaction</Typography>
                      <Typography variant="h5">${revenueData.overall.averageTransaction.toFixed(2)}</Typography>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>

            {/* Revenue by Currency */}
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>Revenue by Currency</Typography>
                  {revenueData.revenueByCurrency.map((item) => (
                    <Box key={item._id} mb={2}>
                      <Box display="flex" justifyContent="space-between">
                        <Typography variant="body1">{item._id}</Typography>
                        <Typography variant="body1" fontWeight="bold">
                          {item.totalRevenue.toFixed(2)}
                        </Typography>
                      </Box>
                      <Typography variant="body2" color="text.secondary">
                        {item.totalTransactions} transactions (Avg: {item.averageTransaction.toFixed(2)})
                      </Typography>
                    </Box>
                  ))}
                </CardContent>
              </Card>
            </Grid>

            {/* Revenue by Payment Method */}
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>Revenue by Payment Method</Typography>
                  {revenueData.revenueByMethod.map((item) => (
                    <Box key={item._id} mb={2}>
                      <Box display="flex" justifyContent="space-between">
                        <Typography variant="body1">{item._id}</Typography>
                        <Typography variant="body1" fontWeight="bold">
                          ${item.revenue.toFixed(2)}
                        </Typography>
                      </Box>
                      <Typography variant="body2" color="text.secondary">
                        {item.transactions} transactions
                      </Typography>
                    </Box>
                  ))}
                </CardContent>
              </Card>
            </Grid>

            {/* Top Courses */}
            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>Top Revenue Generating Courses</Typography>
                  <TableContainer>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>Course</TableCell>
                          <TableCell align="right">Revenue</TableCell>
                          <TableCell align="right">Enrollments</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {revenueData.topCourses.map((course) => (
                          <TableRow key={course.courseId}>
                            <TableCell>{course.title}</TableCell>
                            <TableCell align="right">${course.revenue.toFixed(2)}</TableCell>
                            <TableCell align="right">{course.enrollments}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </CardContent>
              </Card>
            </Grid>

            {/* Refund Statistics */}
            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>Refund Statistics</Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body2" color="text.secondary">Total Refunded</Typography>
                      <Typography variant="h5">${revenueData.refunds.totalRefunded.toFixed(2)}</Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body2" color="text.secondary">Refund Count</Typography>
                      <Typography variant="h5">{revenueData.refunds.refundCount}</Typography>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Paper>
      )}

      {activeTab === 2 && (
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Refund Requests
          </Typography>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Date</TableCell>
                  <TableCell>User</TableCell>
                  <TableCell>Amount</TableCell>
                  <TableCell>Reason</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {refundRequests.map((request) => (
                  <TableRow key={request._id}>
                    <TableCell>
                      {request.createdAt
                        ? format(new Date(request.createdAt), 'MMM dd, yyyy')
                        : 'N/A'}
                    </TableCell>
                    <TableCell>{request.user?.name || 'Unknown'}</TableCell>
                    <TableCell>
                      {request.payment?.amount} {request.payment?.currency}
                    </TableCell>
                    <TableCell>{request.reason || 'No reason provided'}</TableCell>
                    <TableCell>
                      <Chip
                        label={request.status}
                        color={
                          request.status === 'approved'
                            ? 'success'
                            : request.status === 'rejected'
                            ? 'error'
                            : 'warning'
                        }
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      {request.status === 'pending' && (
                        <Box>
                          <Button
                            size="small"
                            color="success"
                            onClick={() => handleApproveRefund(request._id)}
                            sx={{ mr: 1 }}
                          >
                            Approve
                          </Button>
                          <Button
                            size="small"
                            color="error"
                            onClick={() => handleRejectRefundClick(request)}
                          >
                            Reject
                          </Button>
                        </Box>
                      )}
                      {request.status !== 'pending' && (
                        <Typography variant="body2" color="text.secondary">
                          {request.status === 'approved' ? 'Approved' : 'Rejected'}
                          {request.processedAt &&
                            ` on ${format(new Date(request.processedAt), 'MMM dd, yyyy')}`}
                        </Typography>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      )}

      {activeTab === 3 && gatewayConfig && (
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Payment Gateway Configuration
          </Typography>
          <Alert severity="info" sx={{ mb: 3 }}>
            Payment gateway credentials are configured via environment variables for security reasons.
            Changes require updating the server configuration and restart.
          </Alert>
          <Grid container spacing={2}>
            {Object.entries(gatewayConfig).map(([gateway, config]) => (
              <Grid item xs={12} sm={6} md={3} key={gateway}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" sx={{ textTransform: 'capitalize' }}>
                      {gateway}
                    </Typography>
                    <Box mt={2}>
                      <Chip
                        label={config.configured ? 'Configured' : 'Not Configured'}
                        color={config.configured ? 'success' : 'default'}
                        sx={{ mr: 1 }}
                      />
                      <Chip
                        label={config.enabled ? 'Enabled' : 'Disabled'}
                        color={config.enabled ? 'primary' : 'default'}
                      />
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Paper>
      )}

      {/* Transaction Details Dialog */}
      <Dialog open={detailsOpen} onClose={() => setDetailsOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Transaction Details</DialogTitle>
        <DialogContent>
          {selectedTransaction && (
            <Box>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">Transaction ID</Typography>
                  <Typography variant="body1">{selectedTransaction.transactionId || 'N/A'}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">Invoice Number</Typography>
                  <Typography variant="body1">{selectedTransaction.invoice?.invoiceNumber || 'N/A'}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">User</Typography>
                  <Typography variant="body1">{selectedTransaction.user?.name || 'Unknown'}</Typography>
                  <Typography variant="body2">{selectedTransaction.user?.email}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">Course</Typography>
                  <Typography variant="body1">{selectedTransaction.course?.title || 'N/A'}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">Amount</Typography>
                  <Typography variant="body1">
                    {selectedTransaction.amount} {selectedTransaction.currency}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">Payment Method</Typography>
                  <Typography variant="body1">{selectedTransaction.paymentMethod}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">Status</Typography>
                  <Chip
                    label={selectedTransaction.status}
                    color={getStatusColor(selectedTransaction.status)}
                    size="small"
                  />
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">Date</Typography>
                  <Typography variant="body1">
                    {selectedTransaction.createdAt
                      ? format(new Date(selectedTransaction.createdAt), 'MMM dd, yyyy HH:mm')
                      : 'N/A'}
                  </Typography>
                </Grid>
                {selectedTransaction.completedAt && (
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">Completed At</Typography>
                    <Typography variant="body1">
                      {format(new Date(selectedTransaction.completedAt), 'MMM dd, yyyy HH:mm')}
                    </Typography>
                  </Grid>
                )}
                {selectedTransaction.metadata && (
                  <>
                    <Grid item xs={12}>
                      <Typography variant="body2" color="text.secondary">Metadata</Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="body2">IP: {selectedTransaction.metadata.ipAddress}</Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="body2">Country: {selectedTransaction.metadata.country}</Typography>
                    </Grid>
                  </>
                )}
              </Grid>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDetailsOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Reject Refund Dialog */}
      <Dialog open={rejectDialogOpen} onClose={() => setRejectDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Reject Refund Request</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Provide a reason for rejecting this refund request (optional):
          </Typography>
          <TextField
            fullWidth
            multiline
            rows={3}
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            placeholder="Enter rejection reason..."
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRejectDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleRejectRefundConfirm} color="error" variant="contained">
            Reject Refund
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default AdminPayments;
