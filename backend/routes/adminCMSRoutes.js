const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
  getAllPages,
  getPage,
  createPage,
  updatePage,
  deletePage,
  publishPage,
  getAllMedia,
  getMedia,
  updateMedia,
  deleteMedia,
  getAllAnnouncements,
  createAnnouncement,
  updateAnnouncement,
  deleteAnnouncement,
  getPendingForumPosts,
  moderateForumPost,
  getDashboardStats,
  getAuditTrail,
  getResourceAuditTrail
} = require('../controllers/adminCMSController');
const { uploadMedia, upload } = require('../controllers/adminMediaController');

// Protect all routes and authorize only admin
router.use(protect);
router.use(authorize('admin'));

// Dashboard stats
router.get('/stats', getDashboardStats);

// Page management
router.route('/pages')
  .get(getAllPages)
  .post(createPage);

router.route('/pages/:id')
  .get(getPage)
  .put(updatePage)
  .delete(deletePage);

router.put('/pages/:id/publish', publishPage);

// Media management
router.route('/media')
  .get(getAllMedia);

router.post('/media/upload', upload.array('files', 10), uploadMedia);

router.route('/media/:id')
  .get(getMedia)
  .put(updateMedia)
  .delete(deleteMedia);

// Announcement management
router.route('/announcements')
  .get(getAllAnnouncements)
  .post(createAnnouncement);

router.route('/announcements/:id')
  .put(updateAnnouncement)
  .delete(deleteAnnouncement);

// Content moderation
router.get('/moderation/forums', getPendingForumPosts);
router.put('/moderation/forums/:id', moderateForumPost);

// Audit trail
router.get('/audit-trail', getAuditTrail);
router.get('/audit-trail/resource/:resourceType/:resourceId', getResourceAuditTrail);

module.exports = router;
