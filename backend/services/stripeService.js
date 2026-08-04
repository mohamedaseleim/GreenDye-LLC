const PaymentService = require('./paymentService');
const logger = require('../utils/logger');
const Stripe = require('stripe');
const Course = require('../models/Course');
const Payment = require('../models/Payment');
const Enrollment = require('../models/Enrollment');
const TransactionLog = require('../models/TransactionLog');

/**
 * StripeService encapsulates interactions with the Stripe API.  It
 * creates checkout sessions, handles webhook notifications, and now
 * supports issuing refunds.  This service extends the abstract
 * PaymentService to provide a consistent interface for the controller
 * layer.
 */
class StripeService extends PaymentService {
  constructor() {
    super();
    const secretKey = process.env.STRIPE_SECRET_KEY;
    if (!secretKey) {
      logger.warn('StripeService: missing STRIPE_SECRET_KEY environment variable');
    }
    this.stripe = Stripe(secretKey);
    this.webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    this.publicKey = process.env.STRIPE_PUBLIC_KEY;
  }

  /**
   * Create a Stripe Checkout session for the given payment.  The session
   * url will be returned to the caller so the frontend can redirect
   * the customer.  The payment is updated with the session id and
   * provider response, and an initial transaction log entry is
   * created with status pending.
   *
   * @param {import('../models/Payment')} payment  Payment document
   * @returns {Promise<Object>}  { checkoutUrl, sessionId, publicKey }
   */
  async createCheckout(payment) {
    // Fetch course details to populate product info
    const course = await Course.findById(payment.course).lean();
    // Derive a human friendly name/description from multilingual fields
    let name = 'Course';
    let description = '';
    if (course) {
      if (course.title && typeof course.title.get === 'function') {
        name = course.title.get('en') || course.title.get('ar') || course.title.get('fr') || name;
      } else if (course.title && typeof course.title === 'object') {
        name = course.title.en || course.title.ar || course.title.fr || name;
      }
      if (course.description && typeof course.description.get === 'function') {
        description = course.description.get('en') || '';
      } else if (course.description && typeof course.description === 'object') {
        description = course.description.en || '';
      }
    }
    const session = await this.stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: payment.currency.toLowerCase(),
            unit_amount: Math.round(payment.amount * 100),
            product_data: {
              name,
              description,
            },
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${process.env.FRONTEND_URL}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.FRONTEND_URL}/payment/cancel`,
      metadata: {
        paymentId: payment._id.toString(),
        userId: payment.user.toString(),
        courseId: payment.course.toString(),
      },
    });
    // Persist provider details
    payment.transactionId = session.id;
    payment.paymentGatewayResponse = session;
    await payment.save();
    // Create a pending transaction log
    await TransactionLog.create({
      payment: payment._id,
      user: payment.user,
      course: payment.course,
      amount: payment.amount,
      currency: payment.currency,
      paymentMethod: payment.paymentMethod,
      status: payment.status,
      transactionId: session.id,
      gatewayResponse: session,
    });
    return {
      checkoutUrl: session.url,
      sessionId: session.id,
      publicKey: this.publicKey,
    };
  }

  /**
   * Handle Stripe webhook events.  This function verifies the event
   * signature and, if the checkout session has completed, marks the
   * payment as completed, creates the enrollment and logs the
   * transaction.  It returns the parsed event for further handling if
   * necessary.  Any signature errors will throw an exception for the
   * caller to catch.
   *
   * @param {Object} req  Express request containing raw body and headers
   * @returns {Promise<Object>}  Stripe event
   */
  async handleWebhook(req) {
    const sig = req.headers['stripe-signature'];
    if (!this.webhookSecret) {
      throw new Error('Stripe webhook secret not configured');
    }
    let event;
    try {
      // The request body will be a Buffer when using express.raw(); if
      // it's a plain object, convert to Buffer for verification.
      const payload = Buffer.isBuffer(req.body)
        ? req.body
        : Buffer.from(typeof req.body === 'string' ? req.body : JSON.stringify(req.body));
      event = this.stripe.webhooks.constructEvent(payload, sig, this.webhookSecret);
    } catch (err) {
      throw new Error(`Webhook signature verification failed: ${err.message}`);
    }
    // Handle checkout completion
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;
      const paymentId = session.metadata?.paymentId;
      if (paymentId) {
        const payment = await Payment.findById(paymentId);
        if (payment && payment.status !== 'completed') {
          payment.status = 'completed';
          payment.transactionId = session.payment_intent || session.id;
          payment.paymentGatewayResponse = session;
          payment.completedAt = new Date();
          await payment.save();
          // Ensure enrollment exists
          const existing = await Enrollment.findOne({
            user: payment.user,
            course: payment.course,
          });
          if (!existing) {
            await Enrollment.create({
              user: payment.user,
              course: payment.course,
              enrollmentDate: new Date(),
              status: 'active',
            });
          }
          // Log completed transaction
          await TransactionLog.create({
            payment: payment._id,
            user: payment.user,
            course: payment.course,
            amount: payment.amount,
            currency: payment.currency,
            paymentMethod: payment.paymentMethod,
            status: 'completed',
            transactionId: payment.transactionId,
            gatewayResponse: session,
          });
        }
      }
    }
    return event;
  }

  /**
   * Issue a refund for a completed payment.  The amount should be the
   * entire remaining amount or a partial refund.  On success, the payment
   * status, refundedAmount, refundedAt, and refund identifiers are
   * updated.  Enrollment is removed and the refund is logged.
   *
   * @param {import('../models/Payment')} payment  Payment document
   * @param {number} amount                        Amount to refund
   * @returns {Promise<Object>}                    Stripe refund object
   */
  async refundPayment(payment, amount) {
    try {
      const params = {};
      // Provide the payment_intent or session ID for Stripe to locate the charge
      if (payment.transactionId) {
        params.payment_intent = payment.transactionId;
      }
      // Refund in smallest currency unit if amount provided
      if (amount) {
        params.amount = Math.round(amount * 100);
      }
      // Create refund via Stripe API
      const refund = await this.stripe.refunds.create(params);
      // Update payment document
      payment.status = 'refunded';
      payment.refundedAmount = amount;
      payment.refundedAt = new Date();
      payment.refundTransactionId = refund.id;
      payment.refundGatewayResponse = refund;
      await payment.save();
      // Remove enrollment
      await Enrollment.deleteOne({ user: payment.user, course: payment.course });
      // Log the refund
      await TransactionLog.create({
        payment: payment._id,
        user: payment.user,
        course: payment.course,
        amount,
        currency: payment.currency,
        paymentMethod: payment.paymentMethod,
        status: 'refunded',
        transactionId: refund.id,
        gatewayResponse: refund,
      });
      return refund;
    } catch (error) {
      logger.error('Stripe refund error:', error);
      throw new Error('Error processing Stripe refund');
    }
  }
}

module.exports = StripeService;
