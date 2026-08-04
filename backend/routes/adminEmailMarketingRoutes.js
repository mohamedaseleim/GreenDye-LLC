const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
  getAllCampaigns,
  getCampaign,
  createCampaign,
  updateCampaign,
  deleteCampaign,
  sendCampaign,
  getCampaignStats,
  getAllNewsletters,
  getNewsletter,
  createNewsletter,
  updateNewsletter,
  deleteNewsletter,
  publishNewsletter,
  getEmailMarketingStats
} = require('../controllers/adminEmailMarketingController');

// Protect all routes and authorize only admin
router.use(protect);
router.use(authorize('admin'));

// Email marketing stats
router.get('/stats', getEmailMarketingStats);

// Campaign routes
router.route('/campaigns')
  .get(getAllCampaigns)
  .post(createCampaign);

router.route('/campaigns/:id')
  .get(getCampaign)
  .put(updateCampaign)
  .delete(deleteCampaign);

router.post('/campaigns/:id/send', sendCampaign);
router.get('/campaigns/:id/stats', getCampaignStats);

// Newsletter routes
router.route('/newsletters')
  .get(getAllNewsletters)
  .post(createNewsletter);

router.route('/newsletters/:id')
  .get(getNewsletter)
  .put(updateNewsletter)
  .delete(deleteNewsletter);

router.post('/newsletters/:id/publish', publishNewsletter);

module.exports = router;
