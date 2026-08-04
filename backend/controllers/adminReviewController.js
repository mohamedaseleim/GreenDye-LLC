const Review = require('../models/Review');
const Course = require('../models/Course');
const AuditTrail = require('../models/AuditTrail');
const logger = require('../utils/logger');
const mongoSanitize = require('mongo-sanitize');

// @desc    Get all reviews with filters and pagination
// @route   GET /api/admin/reviews
// @access  Private/Admin
exports.getAllReviews = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      status,
      courseId,
      userId,
      sortBy = 'createdAt',
      order = 'desc'
    } = req.query;

    // Sanitize inputs
    const sanitizedStatus = status ? mongoSanitize(status) : null;
    const sanitizedCourseId = courseId ? mongoSanitize(courseId) : null;
    const sanitizedUserId = userId ? mongoSanitize(userId) : null;
    const sanitizedSortBy = mongoSanitize(sortBy);

    // Build filter object
    const filter = {};
    if (sanitizedStatus) filter.status = sanitizedStatus;
    if (sanitizedCourseId) filter.course = sanitizedCourseId;
    if (sanitizedUserId) filter.user = sanitizedUserId;

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const sortOrder = order === 'desc' ? -1 : 1;

    // Get reviews with populated data
    const reviews = await Review.find(filter)
      .populate('user', 'name email avatar')
      .populate('course', 'title thumbnail')
      .populate('adminResponse.respondedBy', 'name')
      .sort({ [sanitizedSortBy]: sortOrder })
      .skip(skip)
      .limit(parseInt(limit));

    // Get total count
    const totalCount = await Review.countDocuments(filter);

    res.status(200).json({
      success: true,
      count: reviews.length,
      totalCount,
      totalPages: Math.ceil(totalCount / parseInt(limit)),
      currentPage: parseInt(page),
      data: reviews
    });
  } catch (error) {
    logger.error('Get all reviews error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching reviews',
      error: error.message
    });
  }
};

// @desc    Get single review details
// @route   GET /api/admin/reviews/:id
// @access  Private/Admin
exports.getReviewDetails = async (req, res) => {
  try {
    const { id } = req.params;

    const review = await Review.findById(id)
      .populate('user', 'name email avatar')
      .populate('course', 'title description thumbnail')
      .populate('enrollment', 'progress completedLessons')
      .populate('moderationHistory.moderatedBy', 'name')
      .populate('adminResponse.respondedBy', 'name')
      .populate('flags.flaggedBy', 'name');

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }

    res.status(200).json({
      success: true,
      data: review
    });
  } catch (error) {
    logger.error('Get review details error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching review details',
      error: error.message
    });
  }
};

// @desc    Approve a review
// @route   PUT /api/admin/reviews/:id/approve
// @access  Private/Admin
exports.approveReview = async (req, res) => {
  try {
    const { id } = req.params;
    const sanitizedBody = mongoSanitize(req.body);
    const { reason } = sanitizedBody;

    const review = await Review.findById(id);

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }

    // Update review status
    review.status = 'approved';
    review.isVisible = true;
    review.moderationHistory.push({
      action: 'approved',
      reason: reason || 'Approved by admin',
      moderatedBy: req.user.id,
      moderatedAt: Date.now()
    });

    await review.save();

    // Recalculate course rating with approved reviews
    await recalculateCourseRating(review.course);

    // Create audit trail
    await AuditTrail.create({
      user: req.user.id,
      action: 'approve',
      resourceType: 'Review',
      resourceId: review._id,
      details: `Approved review for course ${review.course}`,
      ipAddress: req.ip
    });

    logger.info(`Review ${id} approved by admin ${req.user.id}`);

    res.status(200).json({
      success: true,
      message: 'Review approved successfully',
      data: review
    });
  } catch (error) {
    logger.error('Approve review error:', error);
    res.status(500).json({
      success: false,
      message: 'Error approving review',
      error: error.message
    });
  }
};

// @desc    Reject a review
// @route   PUT /api/admin/reviews/:id/reject
// @access  Private/Admin
exports.rejectReview = async (req, res) => {
  try {
    const { id } = req.params;
    const sanitizedBody = mongoSanitize(req.body);
    const { reason } = sanitizedBody;

    if (!reason) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a reason for rejection'
      });
    }

    const review = await Review.findById(id);

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }

    // Update review status
    review.status = 'rejected';
    review.isVisible = false;
    review.moderationHistory.push({
      action: 'rejected',
      reason,
      moderatedBy: req.user.id,
      moderatedAt: Date.now()
    });

    await review.save();

    // Recalculate course rating without rejected review
    await recalculateCourseRating(review.course);

    // Create audit trail
    await AuditTrail.create({
      user: req.user.id,
      action: 'reject',
      resourceType: 'Review',
      resourceId: review._id,
      details: `Rejected review for course ${review.course}: ${reason}`,
      ipAddress: req.ip
    });

    logger.info(`Review ${id} rejected by admin ${req.user.id}`);

    res.status(200).json({
      success: true,
      message: 'Review rejected successfully',
      data: review
    });
  } catch (error) {
    logger.error('Reject review error:', error);
    res.status(500).json({
      success: false,
      message: 'Error rejecting review',
      error: error.message
    });
  }
};

// @desc    Flag a review as inappropriate
// @route   PUT /api/admin/reviews/:id/flag
// @access  Private/Admin
exports.flagReview = async (req, res) => {
  try {
    const { id } = req.params;
    const sanitizedBody = mongoSanitize(req.body);
    const { reason, description } = sanitizedBody;

    if (!reason) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a reason for flagging'
      });
    }

    const validReasons = ['spam', 'inappropriate', 'offensive', 'fake', 'other'];
    if (!validReasons.includes(reason)) {
      return res.status(400).json({
        success: false,
        message: `Invalid flag reason. Must be one of: ${validReasons.join(', ')}`
      });
    }

    const review = await Review.findById(id);

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }

    // Add flag
    review.flags.push({
      reason,
      description: description || '',
      flaggedBy: req.user.id,
      flaggedAt: Date.now()
    });

    // Update status to flagged and hide from public view
    review.status = 'flagged';
    review.isVisible = false;
    review.moderationHistory.push({
      action: 'flagged',
      reason: `${reason}: ${description || 'No additional details'}`,
      moderatedBy: req.user.id,
      moderatedAt: Date.now()
    });

    await review.save();

    // Recalculate course rating without flagged review
    await recalculateCourseRating(review.course);

    // Create audit trail
    await AuditTrail.create({
      user: req.user.id,
      action: 'flag',
      resourceType: 'Review',
      resourceId: review._id,
      details: `Flagged review for course ${review.course}: ${reason}`,
      ipAddress: req.ip
    });

    logger.info(`Review ${id} flagged by admin ${req.user.id} for reason: ${reason}`);

    res.status(200).json({
      success: true,
      message: 'Review flagged successfully',
      data: review
    });
  } catch (error) {
    logger.error('Flag review error:', error);
    res.status(500).json({
      success: false,
      message: 'Error flagging review',
      error: error.message
    });
  }
};

// @desc    Remove a review (delete)
// @route   DELETE /api/admin/reviews/:id
// @access  Private/Admin
exports.removeReview = async (req, res) => {
  try {
    const { id } = req.params;
    const sanitizedBody = mongoSanitize(req.body);
    const { reason } = sanitizedBody;

    const review = await Review.findById(id);

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }

    const courseId = review.course;

    // Create audit trail before deletion
    await AuditTrail.create({
      user: req.user.id,
      action: 'delete',
      resourceType: 'Review',
      resourceId: review._id,
      details: `Deleted review for course ${courseId}: ${reason || 'No reason provided'}`,
      ipAddress: req.ip
    });

    // Delete the review
    await Review.findByIdAndDelete(id);

    // Recalculate course rating
    await recalculateCourseRating(courseId);

    logger.info(`Review ${id} removed by admin ${req.user.id}. Reason: ${reason || 'Not provided'}`);

    res.status(200).json({
      success: true,
      message: 'Review removed successfully'
    });
  } catch (error) {
    logger.error('Remove review error:', error);
    res.status(500).json({
      success: false,
      message: 'Error removing review',
      error: error.message
    });
  }
};

// @desc    Respond to a review as admin
// @route   PUT /api/admin/reviews/:id/respond
// @access  Private/Admin
exports.respondToReview = async (req, res) => {
  try {
    const { id } = req.params;
    const sanitizedBody = mongoSanitize(req.body);
    const { response } = sanitizedBody;

    if (!response || response.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a response'
      });
    }

    const review = await Review.findById(id);

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }

    // Add or update admin response
    review.adminResponse = {
      text: response.trim(),
      respondedBy: req.user.id,
      respondedAt: Date.now()
    };

    await review.save();

    // Create audit trail
    await AuditTrail.create({
      user: req.user.id,
      action: 'respond',
      resourceType: 'Review',
      resourceId: review._id,
      details: `Responded to review for course ${review.course}`,
      ipAddress: req.ip
    });

    logger.info(`Admin ${req.user.id} responded to review ${id}`);

    // Populate the response for return
    const populatedReview = await Review.findById(id)
      .populate('user', 'name email avatar')
      .populate('course', 'title')
      .populate('adminResponse.respondedBy', 'name');

    res.status(200).json({
      success: true,
      message: 'Response added successfully',
      data: populatedReview
    });
  } catch (error) {
    logger.error('Respond to review error:', error);
    res.status(500).json({
      success: false,
      message: 'Error responding to review',
      error: error.message
    });
  }
};

// @desc    Get review statistics
// @route   GET /api/admin/reviews/analytics/stats
// @access  Private/Admin
exports.getReviewStats = async (req, res) => {
  try {
    const { courseId } = req.query;
    const filter = courseId ? { course: mongoSanitize(courseId) } : {};

    // Total reviews
    const totalReviews = await Review.countDocuments(filter);

    // Reviews by status
    const reviewsByStatus = await Review.aggregate([
      { $match: filter },
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    // Average rating of approved reviews
    const avgRatingResult = await Review.aggregate([
      { $match: { ...filter, status: 'approved' } },
      { $group: { _id: null, avgRating: { $avg: '$rating' } } }
    ]);
    const avgRating = avgRatingResult.length > 0 
      ? parseFloat(avgRatingResult[0].avgRating.toFixed(2))
      : 0;

    // Flagged reviews count
    const flaggedCount = await Review.countDocuments({ ...filter, status: 'flagged' });

    // Pending reviews count
    const pendingCount = await Review.countDocuments({ ...filter, status: 'pending' });

    // Reviews with admin responses
    const responsesCount = await Review.countDocuments({
      ...filter,
      'adminResponse.text': { $exists: true, $ne: null }
    });

    res.status(200).json({
      success: true,
      data: {
        totalReviews,
        reviewsByStatus,
        avgRating,
        flaggedCount,
        pendingCount,
        responsesCount
      }
    });
  } catch (error) {
    logger.error('Get review stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching review statistics',
      error: error.message
    });
  }
};

// Helper function to recalculate course rating based on approved reviews
async function recalculateCourseRating(courseId) {
  try {
    const approvedReviews = await Review.find({
      course: courseId,
      status: 'approved'
    });

    const course = await Course.findById(courseId);
    if (!course) return;

    if (approvedReviews.length === 0) {
      course.rating = 0;
      course.reviewsCount = 0;
    } else {
      const totalRating = approvedReviews.reduce((sum, review) => sum + review.rating, 0);
      course.rating = totalRating / approvedReviews.length;
      course.reviewsCount = approvedReviews.length;
    }

    await course.save();
  } catch (error) {
    logger.error('Recalculate course rating error:', error);
  }
}
