const asyncHandler = require('express-async-handler');
const Trainer = require('../models/Trainer');

// @desc    Apply for verification
// @route   PUT /api/trainers/:id/apply-verification
// @access  Private (trainer)
const applyForVerification = asyncHandler(async (req, res) => {
  const trainer = await Trainer.findById(req.params.id);
  if (!trainer) {
    res.status(404);
    throw new Error('Trainer not found');
  }
  // Store uploaded verification documents from request body
  trainer.verificationDocuments = req.body.verificationDocuments || [];
  // Reset verified status and verification date
  trainer.isVerified = false;
  trainer.verificationDate = null;
  await trainer.save();
  res.json({ message: 'Verification request submitted', trainer });
});

// @desc    Get trainers pending verification
// @route   GET /api/trainers/pending-verifications
// @access  Private/Admin
const getPendingVerifications = asyncHandler(async (req, res) => {
  const pendingTrainers = await Trainer.find({
    isVerified: false,
    verificationDocuments: { $exists: true, $not: { $size: 0 } },
  });
  res.json(pendingTrainers);
});

module.exports = {
  applyForVerification,
  getPendingVerifications,
};
