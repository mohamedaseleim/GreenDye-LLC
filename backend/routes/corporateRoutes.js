const express = require('express');
const router = express.Router();
const {
  createOrganization,
  getAllOrganizations,
  getOrganization,
  updateOrganization,
  addMember,
  removeMember,
  createTeamEnrollment,
  getTeamEnrollments,
  getTeamEnrollmentStats
} = require('../controllers/corporateController');
const { protect, authorize } = require('../middleware/auth');

// All routes require authentication
router.use(protect);

// Organization routes
router.post('/organizations', createOrganization);
router.get('/organizations', authorize('admin'), getAllOrganizations);
router.get('/organizations/:id', getOrganization);
router.put('/organizations/:id', updateOrganization);

// Member management
router.post('/organizations/:id/members', addMember);
router.delete('/organizations/:id/members/:memberId', removeMember);

// Team enrollment routes
router.post('/team-enrollments', createTeamEnrollment);
router.get('/team-enrollments', getTeamEnrollments);
router.get('/team-enrollments/:id/stats', getTeamEnrollmentStats);

module.exports = router;
