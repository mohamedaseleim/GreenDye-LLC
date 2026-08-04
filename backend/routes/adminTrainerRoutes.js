const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
  getAllTrainers,
  getTrainerById,
  createTrainer,
  updateTrainer,
  deleteTrainer,
  approveTrainer,
  rejectTrainer,
  getPendingApplications,
  updateVerificationStatus,
  getTrainerMetrics,
  getTrainerPayouts,
  createPayout,
  updatePayoutStatus,
  getAllPayouts
} = require('../controllers/adminTrainerController');

// Protect all routes and authorize only admin
router.use(protect);
router.use(authorize('admin'));

// Trainer management routes
router.route('/')
  .get(getAllTrainers)
  .post(createTrainer);

// Pending applications
router.get('/applications/pending', getPendingApplications);

// All payouts (across all trainers)
router.get('/payouts', getAllPayouts);

// Payout status update
router.put('/payouts/:payoutId', updatePayoutStatus);

// Individual trainer routes
router.route('/:id')
  .get(getTrainerById)
  .put(updateTrainer)
  .delete(deleteTrainer);

// Application approval/rejection
router.put('/:id/approve', approveTrainer);
router.put('/:id/reject', rejectTrainer);

// Verification status
router.put('/:id/verification', updateVerificationStatus);

// Performance metrics
router.get('/:id/metrics', getTrainerMetrics);

// Trainer payouts
router.route('/:id/payouts')
  .get(getTrainerPayouts)
  .post(createPayout);

module.exports = router;
