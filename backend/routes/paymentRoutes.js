const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  createCheckout,
  verifyPayment,
  getUserPayments,
  requestRefund,
  getInvoice,
  stripeWebhook,
  paypalWebhook,
} = require('../controllers/paymentController');

// Initiate a checkout session
router.post('/checkout', protect, createCheckout);

// Generic verification endpoint (for providers without dedicated webhooks)
router.post('/verify', verifyPayment);

// Stripe webhook requires raw body for signature verification
router.post('/webhook/stripe', express.raw({ type: 'application/json' }), stripeWebhook);

// PayPal webhook (JSON body is fine)
router.post('/webhook/paypal', paypalWebhook);

// Get all payments for the authenticated user
router.get('/', protect, getUserPayments);

// Request a refund for a specific payment
router.post('/:id/refund', protect, requestRefund);

// Retrieve invoice for a specific payment
router.get('/:id/invoice', protect, getInvoice);

module.exports = router;
