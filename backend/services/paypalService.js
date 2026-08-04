const PaymentService = require('./paymentService');
const logger = require('../utils/logger');
const paypal = require('@paypal/checkout-server-sdk');
const Course = require('../models/Course');
const Payment = require('../models/Payment');
const Enrollment = require('../models/Enrollment');
const TransactionLog = require('../models/TransactionLog');

/**
 * PayPalService handles order creation, webhook processing, and
 * refunds for PayPal payments.  It leverages the official PayPal SDK
 * to create orders, capture them, and issue refunds.  Each payment
 * action is recorded in the TransactionLog.
 */
class PayPalService extends PaymentService {
  constructor() {
    super();
    // Determine environment (sandbox or live)
    const env =
      process.env.PAYPAL_MODE === 'live'
        ? new paypal.core.LiveEnvironment(
            process.env.PAYPAL_CLIENT_ID,
            process.env.PAYPAL_CLIENT_SECRET,
          )
        : new paypal.core.SandboxEnvironment(
            process.env.PAYPAL_CLIENT_ID,
            process.env.PAYPAL_CLIENT_SECRET,
          );
    this.client = new paypal.core.PayPalHttpClient(env);
    this.clientId = process.env.PAYPAL_CLIENT_ID;
  }

  /**
   * Create a PayPal order for the given payment.  Returns the URL
   * customers should be redirected to in order to approve the payment.
   * Updates the payment document with the order id and provider
   * response, and records a pending transaction log.
   *
   * @param {import('../models/Payment')} payment  Payment document
   * @returns {Promise<Object>}  { checkoutUrl, orderId, clientId }
   */
  async createCheckout(payment) {
    const course = await Course.findById(payment.course).lean();
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
    const request = new paypal.orders.OrdersCreateRequest();
    request.prefer('return=representation');
    request.requestBody({
      intent: 'CAPTURE',
      purchase_units: [
        {
          amount: {
            currency_code: payment.currency,
            value: payment.amount.toFixed(2),
          },
          description: description || name,
          reference_id: payment._id.toString(),
        },
      ],
      application_context: {
        return_url: `${process.env.FRONTEND_URL}/payment/paypal/success`,
        cancel_url: `${process.env.FRONTEND_URL}/payment/cancel`,
        brand_name: 'GreenDye Academy',
      },
    });
    const order = await this.client.execute(request);
    const orderId = order.result.id;
    // Determine approval link
    let checkoutUrl = `${process.env.FRONTEND_URL}/payment/paypal/${payment._id}`;
    if (Array.isArray(order.result.links)) {
      const approveLink = order.result.links.find((l) => l.rel === 'approve');
      if (approveLink) {
        checkoutUrl = approveLink.href;
      }
    }
    // Persist provider response
    payment.transactionId = orderId;
    payment.paymentGatewayResponse = order.result;
    await payment.save();
    // Log pending transaction
    await TransactionLog.create({
      payment: payment._id,
      user: payment.user,
      course: payment.course,
      amount: payment.amount,
      currency: payment.currency,
      paymentMethod: payment.paymentMethod,
      status: payment.status,
      transactionId: orderId,
      gatewayResponse: order.result,
    });
    return { checkoutUrl, orderId, clientId: this.clientId };
  }

  /**
   * Capture a PayPal order.  This is typically called when the order
   * has been approved but not yet captured.  Capturing the order
   * finalises the payment and transfers funds.
   *
   * @param {string} orderId  PayPal order ID
   * @returns {Promise<Object>}  PayPal capture response
   */
  async captureOrder(orderId) {
    const request = new paypal.orders.OrdersCaptureRequest(orderId);
    request.requestBody({});
    return await this.client.execute(request);
  }

  /**
   * Handle PayPal webhook events.  Depending on the event type, this
   * method may capture the order (if approved) and mark the payment
   * as completed.  The PayPal webhook payload should already be
   * parsed into a JavaScript object before calling this method.
   *
   * @param {Object} body  PayPal webhook payload
   * @returns {Promise<Object>}  The processed event
   */
  async handleWebhook(body) {
    const eventType = body?.event_type;
    try {
      if (
        eventType === 'CHECKOUT.ORDER.APPROVED' ||
        eventType === 'PAYMENT.CAPTURE.COMPLETED'
      ) {
        const resource = body.resource;
        // Determine order ID depending on event type structure
        const orderId = resource?.id || resource?.supplementary_data?.related_ids?.order_id;
        if (orderId) {
          const payment = await Payment.findOne({ transactionId: orderId });
          if (payment && payment.status !== 'completed') {
            // Capture order if not captured yet (only for approved orders)
            if (eventType === 'CHECKOUT.ORDER.APPROVED') {
              await this.captureOrder(orderId);
            }
            payment.status = 'completed';
            payment.completedAt = new Date();
            payment.paymentGatewayResponse = resource;
            await payment.save();
            // Create enrollment
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
              transactionId: orderId,
              gatewayResponse: resource,
            });
          }
        }
      }
    } catch (error) {
      logger.error('PayPal webhook handling error:', error);
    }
    return body;
  }

  /**
   * Issue a refund for a completed PayPal capture.  This method
   * creates a refund request against the captured transaction, updates
   * the payment document, removes any associated enrollment, and logs
   * the refund in TransactionLog.  The returned object is the
   * PayPal API refund response.
   *
   * @param {import('../models/Payment')} payment  Payment document
   * @param {number} amount                        Amount to refund
   * @returns {Promise<Object>}                    PayPal refund response
   */
  async refundPayment(payment, amount) {
    try {
      const captureId = payment.transactionId;
      // Build refund request for the capture
      const request = new paypal.payments.CapturesRefundRequest(captureId);
      request.requestBody({
        amount: {
          value: amount.toFixed(2),
          currency_code: payment.currency,
        },
      });
      const refund = await this.client.execute(request);
      // Update payment document
      payment.status = 'refunded';
      payment.refundedAmount = amount;
      payment.refundedAt = new Date();
      payment.refundTransactionId = refund.result?.id;
      payment.refundGatewayResponse = refund.result;
      await payment.save();
      // Remove enrollment and log the refund
      await Enrollment.deleteOne({ user: payment.user, course: payment.course });
      await TransactionLog.create({
        payment: payment._id,
        user: payment.user,
        course: payment.course,
        amount,
        currency: payment.currency,
        paymentMethod: payment.paymentMethod,
        status: 'refunded',
        transactionId: refund.result?.id,
        gatewayResponse: refund.result,
      });
      return refund.result;
    } catch (error) {
      logger.error('PayPal refund error:', error);
      throw new Error('Error processing PayPal refund');
    }
  }
}

module.exports = PayPalService;
