const express = require('express');
const router = express.Router();
const Announcement = require('../models/Announcement');
const logger = require('../utils/logger');

// Priority order mapping for sorting
const priorityOrder = {
  urgent: 4,
  high: 3,
  medium: 2,
  low: 1
};

// @desc    Get active announcements (public)
// @route   GET /api/announcements/active
// @access  Public
router.get('/active', async (req, res) => {
  try {
    const now = new Date();
    
    const announcements = await Announcement.find({
      status: 'active',
      startDate: { $lte: now }
    }).sort({ startDate: -1 });

    const activeAnnouncements = announcements.filter((announcement) => (
      !announcement.endDate || announcement.endDate >= now
    ));

    // Sort by priority (urgent > high > medium > low) then by startDate
    activeAnnouncements.sort((a, b) => {
      const priorityDiff = (priorityOrder[b.priority] || 0) - (priorityOrder[a.priority] || 0);
      if (priorityDiff !== 0) return priorityDiff;
      return new Date(b.startDate) - new Date(a.startDate);
    });

    res.status(200).json({
      success: true,
      count: activeAnnouncements.length,
      data: activeAnnouncements
    });
  } catch (error) {
    logger.error('Error fetching active announcements:', error);
    res.status(500).json({
      success: false,
      message: 'Unable to fetch announcements at this time'
    });
  }
});

module.exports = router;
