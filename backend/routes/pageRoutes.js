const express = require('express');
const router = express.Router();
const { getPublicPage, getPublishedPages } = require('../controllers/pageController');

// Public route to fetch all published pages for navigation
router.get('/', getPublishedPages);

// Public route to fetch published pages by slug
router.get('/:slug', getPublicPage);

module.exports = router;
