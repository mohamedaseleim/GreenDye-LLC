const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
  getAllTransactions,
  getRevenueAnalytics,
  getGatewayConfig,
  updateGatewayConfig,
  getPaymentStats,
  exportTransactions
} = require('../controllers/adminPaymentController');

// All routes require admin authorization
router.use(protect, authorize('admin'));

// Get all transactions with filters and pagination
router.get('/', getAllTransactions);

// Get payment statistics summary
router.get('/stats', getPaymentStats);

// Get revenue analytics
router.get('/analytics/revenue', getRevenueAnalytics);

// Export transactions report
router.get('/export', exportTransactions);

// Get payment gateway configuration
router.get('/gateway-config', getGatewayConfig);

// Update payment gateway configuration
router.put('/gateway-config', updateGatewayConfig);

module.exports = router;
