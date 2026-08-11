const express = require('express');
const rateLimit = require('express-rate-limit');
const { protect, authorize } = require('../middleware/auth');
const { createContactMessage, getContactMessages, updateContactMessage } = require('../controllers/contactController');
const router = express.Router();

const contactLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 5, standardHeaders: true, legacyHeaders: false });
router.post('/', contactLimiter, createContactMessage);
router.get('/', protect, authorize('admin', 'super_admin'), getContactMessages);
router.put('/:id', protect, authorize('admin', 'super_admin'), updateContactMessage);
module.exports = router;
