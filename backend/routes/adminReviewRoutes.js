const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
  getAllReviews,
  getReviewDetails,
  approveReview,
  rejectReview,
  flagReview,
  removeReview,
  respondToReview,
  getReviewStats
} = require('../controllers/adminReviewController');

// All routes require admin authentication
router.use(protect);
router.use(authorize('admin'));

// Analytics route (before /:id to avoid conflict)
router.get('/analytics/stats', getReviewStats);

// Review moderation routes
router.route('/')
  .get(getAllReviews);

router.route('/:id')
  .get(getReviewDetails)
  .delete(removeReview);

router.put('/:id/approve', approveReview);
router.put('/:id/reject', rejectReview);
router.put('/:id/flag', flagReview);
router.put('/:id/respond', respondToReview);

module.exports = router;
