const Payment = require('../models/Payment');
const logger = require('../utils/logger');
const Course = require('../models/Course');
const Enrollment = require('../models/Enrollment');
const FawryService = require('../services/fawryService');
const PaymobService = require('../services/paymobService');
const StripeService = require('../services/stripeService');
const PayPalService = require('../services/paypalService');
const { convertCurrency } = require('../utils/currencyConverter');

// New imports for refund request and policy configuration
const RefundRequest = require('../models/RefundRequest');
const PolicyConfig = require('../models/PolicyConfig');

// Invoice utilities
const { generateInvoicePDF, sendInvoiceEmail } = require('../utils/invoiceGenerator');

/**
 * Create payment intent/checkout session
 * POST /api/payments/checkout
 * Private
 */
exports.createCheckout = async (req, res) => {
  try {
    const { courseId, paymentMethod, currency = 'USD' } = req.body;
    // Validate course exists
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found' });
    }
    // Check if user already enrolled
    const existingEnrollment = await Enrollment.findOne({ user: req.user.id, course: courseId });
    if (existingEnrollment) {
      return res.status(400).json({ success: false, message: 'You are already enrolled in this course' });
    }
    // Determine course price in requested currency
    let amount = course.price[currency] || course.price.USD;
    if (!course.price[currency] && currency !== 'USD') {
      amount = await convertCurrency(course.price.USD, 'USD', currency);
    }
    // Create payment record
    const payment = await Payment.create({
      user: req.user.id,
      course: courseId,
      amount,
      currency,
      paymentMethod,
      status: 'pending',
      metadata: {
        ipAddress: req.ip,
        userAgent: req.get('user-agent'),
        country: req.body.country || 'Unknown',
        region: req.body.region || 'Unknown',
      },
    });
    // Generate checkout URL based on payment method
    let checkoutData;
    switch (paymentMethod) {
      case 'stripe': {
        const service = new StripeService();
        checkoutData = await service.createCheckout(payment);
        break;
      }
      case 'paypal': {
        const service = new PayPalService();
        checkoutData = await service.createCheckout(payment);
        break;
      }
      case 'fawry': {
        const service = new FawryService();
        checkoutData = await service.createCheckout(payment);
        break;
      }
      case 'paymob': {
        const service = new PaymobService();
        checkoutData = await service.createCheckout(payment);
        break;
      }
      default:
        return res.status(400).json({ success: false, message: 'Invalid payment method' });
    }
    res.status(200).json({
      success: true,
      data: {
        paymentId: payment._id,
        ...checkoutData,
      },
    });
  } catch (error) {
    logger.error('Checkout error:', error);
    res.status(500).json({ success: false, message: 'Error creating checkout session', error: error.message });
  }
};

/**
 * Verify payment callback (generic fallback for gateways without webhooks)
 * POST /api/payments/verify
 * Public
 */
exports.verifyPayment = async (req, res) => {
  try {
    const { paymentId, transactionId, status, gatewayResponse } = req.body;
    const payment = await Payment.findById(paymentId);
    if (!payment) {
      return res.status(404).json({ success: false, message: 'Payment not found' });
    }
    // Update payment status and attach gateway response
    payment.status = status === 'success' ? 'completed' : 'failed';
    payment.transactionId = transactionId;
    payment.paymentGatewayResponse = gatewayResponse;

    if (status === 'success') {
      // mark as completed
      payment.completedAt = new Date();
      // create enrollment record
      await Enrollment.create({
        user: payment.user,
        course: payment.course,
        enrollmentDate: new Date(),
        status: 'active',
      });
    }

    // Save first to trigger pre-save hook (generates invoice number)
    await payment.save();

    // If successful, generate invoice PDF, store URL, and send it via email
    if (status === 'success') {
      try {
        // populate user and course for invoice details
        await payment.populate([
          { path: 'user', select: 'name email' },
          { path: 'course', select: 'title' },
        ]);
        // generate PDF invoice
        const { fileName, filePath } = await generateInvoicePDF(payment, payment.user, payment.course);
        // store relative invoice URL
        payment.invoice.invoiceUrl = `/invoices/${fileName}`;
        await payment.save();
        // email the invoice to the user
        await sendInvoiceEmail(payment.user, payment, payment.course, filePath);
      } catch (invoiceErr) {
        // log invoice errors but do not block payment verification
        logger.error('Invoice generation/email error:', invoiceErr);
      }
    }

    res.status(200).json({ success: true, data: payment });
  } catch (error) {
    logger.error('Payment verification error:', error);
    res.status(500).json({ success: false, message: 'Error verifying payment', error: error.message });
  }
};

/**
 * Get user payment history
 * GET /api/payments
 * Private
 */
exports.getUserPayments = async (req, res) => {
  try {
    const payments = await Payment.find({ user: req.user.id })
      .populate('course', 'title thumbnail')
      .sort('-createdAt');
    res.status(200).json({ success: true, count: payments.length, data: payments });
  } catch (error) {
    logger.error('Get payments error:', error);
    res.status(500).json({ success: false, message: 'Error fetching payments', error: error.message });
  }
};

/**
 * Request refund for a payment
 * POST /api/payments/:id/refund
 * Private
 */
exports.requestRefund = async (req, res) => {
  try {
    const { reason } = req.body;
    const payment = await Payment.findById(req.params.id);
    if (!payment) {
      return res.status(404).json({ success: false, message: 'Payment not found' });
    }
    // Verify payment belongs to user
    if (payment.user.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized to refund this payment' });
    }
    // Only completed payments can be refunded
    if (payment.status !== 'completed') {
      return res.status(400).json({ success: false, message: 'Only completed payments can be refunded' });
    }
    // Check for existing refund requests (pending or approved)
    const existingRequest = await RefundRequest.findOne({
      payment: payment._id,
      status: { $in: ['pending', 'approved'] }
    });
    if (existingRequest) {
      return res.status(400).json({ success: false, message: 'Refund already requested or processed' });
    }

    // Load refund policies (with defaults)
    const windowConfig = await PolicyConfig.findOne({ key: 'refundWindowDays' });
    const maxDays = windowConfig ? Number(windowConfig.value) : 30;
    const maxPercentConfig = await PolicyConfig.findOne({ key: 'refundMaxCompletionPercent' });
    const maxPercent = maxPercentConfig ? Number(maxPercentConfig.value) : 30;

    // Check refund window
    const daysSincePayment = (Date.now() - payment.completedAt) / (1000 * 60 * 60 * 24);
    if (daysSincePayment > maxDays) {
      return res.status(400).json({
        success: false,
        message: `Refund window has expired (${maxDays} days)`
      });
    }

    // Check course progress against policy
    const enrollment = await Enrollment.findOne({ user: payment.user, course: payment.course });
    const progress = enrollment ? enrollment.progress || 0 : 0;
    if (progress > maxPercent) {
      return res.status(400).json({
        success: false,
        message: `Refund not allowed if progress exceeds ${maxPercent}%`
      });
    }

    // Create refund request (status defaults to pending)
    const refundRequest = await RefundRequest.create({
      payment: payment._id,
      user: req.user.id,
      reason
    });

    return res.status(200).json({
      success: true,
      message: 'Refund request submitted and awaiting admin approval',
      data: refundRequest
    });
  } catch (error) {
    logger.error('Refund request error:', error);
    res.status(500).json({ success: false, message: 'Error processing refund request', error: error.message });
  }
};

/**
 * Get payment invoice
 * GET /api/payments/:id/invoice
 * Private
 */
exports.getInvoice = async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.id)
      .populate('user', 'name email')
      .populate('course', 'title');
    if (!payment) {
      return res.status(404).json({ success: false, message: 'Payment not found' });
    }
    // Verify payment belongs to user or user is admin
    if (payment.user._id.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to view this invoice' });
    }
    res.status(200).json({
      success: true,
      data: {
        invoiceNumber: payment.invoice.invoiceNumber,
        date: payment.completedAt,
        amount: payment.amount,
        currency: payment.currency,
        status: payment.status,
        invoiceUrl: payment.invoice.invoiceUrl, // expose the PDF URL
        user: {
          name: payment.user.name,
          email: payment.user.email,
        },
        course: {
          title: payment.course.title,
        },
        transactionId: payment.transactionId,
      },
    });
  } catch (error) {
    logger.error('Get invoice error:', error);
    res.status(500).json({ success: false, message: 'Error fetching invoice', error: error.message });
  }
};

/**
 * Handle Stripe webhook events
 * POST /api/payments/webhook/stripe
 * Public (verified by Stripe signature)
 * Note: StripeService.handleWebhook requires the full request object for signature verification
 */
exports.stripeWebhook = async (req, res) => {
  try {
    const service = new StripeService();
    const event = await service.handleWebhook(req);
    res.status(200).json({ success: true, received: true, eventType: event.type });
  } catch (error) {
    logger.error('Stripe webhook error:', error);
    res.status(400).json({ success: false, message: error.message });
  }
};

/**
 * Handle PayPal webhook events
 * POST /api/payments/webhook/paypal
 * Public (should be verified by PayPal signature in production)
 * Note: PayPalService.handleWebhook requires only the request body
 */
exports.paypalWebhook = async (req, res) => {
  try {
    const service = new PayPalService();
    await service.handleWebhook(req.body);
    res.status(200).json({ success: true, received: true });
  } catch (error) {
    logger.error('PayPal webhook error:', error);
    res.status(400).json({ success: false, message: error.message });
  }
};
