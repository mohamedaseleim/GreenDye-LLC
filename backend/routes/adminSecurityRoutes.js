const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
  getActivityMonitoring,
  getFailedLogins,
  getSecurityAlertsData,
  updateSecurityAlert,
  getIPBlacklist,
  addIPToBlacklist,
  removeIPFromBlacklist,
  getSecurityDashboard,
  getActivityStats
} = require('../controllers/adminSecurityController');

// All routes require authentication and admin role
router.use(protect);
router.use(authorize('admin'));

// Dashboard overview
router.get('/dashboard', getSecurityDashboard);

// Activity monitoring
router.get('/activity', getActivityMonitoring);
router.get('/activity/stats', getActivityStats);

// Failed login attempts
router.get('/failed-logins', getFailedLogins);

// Security alerts
router.get('/alerts', getSecurityAlertsData);
router.put('/alerts/:id', updateSecurityAlert);

// IP blacklist management
router.get('/blacklist', getIPBlacklist);
router.post('/blacklist', addIPToBlacklist);
router.delete('/blacklist/:id', removeIPFromBlacklist);

module.exports = router;
