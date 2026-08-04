const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
  getRefundRequests,
  approveRefundRequest,
  rejectRefundRequest
} = require('../controllers/refundController');

// List refund requests (optional query ?status=pending/approved/rejected)
router.get('/', protect, authorize('admin'), getRefundRequests);

// Approve a refund request (triggers gateway refund)
router.put('/:id/approve', protect, authorize('admin'), approveRefundRequest);

// Reject a refund request
router.put('/:id/reject', protect, authorize('admin'), rejectRefundRequest);

module.exports = router;
