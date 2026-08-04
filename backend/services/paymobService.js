const axios = require('axios');
const logger = require('../utils/logger');
const PaymentService = require('./paymentService');

/**
 * Service to integrate with the Paymob (Accept) payment gateway.  The
 * standard card checkout flow requires three API calls: authenticate
 * with your API key, register an order, and request a payment key.
 * See the open‑source example in the rafa763/Paymob‑Payment‑Gateway
 * repository for reference.  The iframe URL returned can be used to
 * redirect the customer to Paymob's hosted payment page.
 */
class PaymobService extends PaymentService {
  constructor() {
    super();
    this.apiBase = 'https://accept.paymob.com/api';
    this.apiKey = process.env.PAYMOB_API_KEY;
    this.integrationId = process.env.PAYMOB_INTEGRATION_ID;
    this.iframeId = process.env.PAYMOB_IFRAME_ID;
    if (!this.apiKey || !this.integrationId || !this.iframeId) {
      logger.warn('PaymobService: missing PAYMOB_API_KEY, PAYMOB_INTEGRATION_ID or PAYMOB_IFRAME_ID environment variables');
    }
  }

  /**
   * Authenticate to Paymob and return an access token.  Tokens are
   * valid for several minutes and must be included in subsequent
   * requests.
   *
   * @returns {Promise<String>} access token
   */
  async _authenticate() {
    const url = `${this.apiBase}/auth/tokens`;
    const payload = { api_key: this.apiKey };
    const { data } = await axios.post(url, payload, {
      headers: { 'Content-Type': 'application/json' },
    });
    return data.token;
  }

  /**
   * Register an order with Paymob.  Returns the order ID.  The
   * amount passed to Paymob must be expressed in cents, i.e. 100 ×
   * the currency units.
   *
   * @param {String} token access token returned from authentication
   * @param {Number} amountCents  integer amount in cents (e.g. 5000 for EGP 50.00)
   * @returns {Promise<Number>} order id
   */
  async _createOrder(token, amountCents) {
    const url = `${this.apiBase}/ecommerce/orders`;
    const payload = {
      auth_token: token,
      delivery_needed: false,
      amount_cents: amountCents,
      currency: 'EGP',
      items: [],
    };
    const { data } = await axios.post(url, payload, {
      headers: { 'Content-Type': 'application/json' },
    });
    return data.id;
  }

  /**
   * Request a payment key for a previously registered order.  The
   * billing data fields are required by Paymob; they are used for
   * fraud checks but can be filled with placeholder values if no
   * customer details are available.
   *
   * @param {String} token  access token
   * @param {Number} orderId  order identifier from _createOrder
   * @param {Number} amountCents  integer amount in cents
   * @param {Object} billingData  customer billing data
   * @returns {Promise<String>}  payment key token
   */
  async _requestPaymentKey(token, orderId, amountCents, billingData) {
    const url = `${this.apiBase}/acceptance/payment_keys`;
    const payload = {
      auth_token: token,
      amount_cents: amountCents,
      expiration: 3600,
      order_id: orderId,
      billing_data: billingData,
      currency: 'EGP',
      integration_id: this.integrationId,
    };
    const { data } = await axios.post(url, payload, {
      headers: { 'Content-Type': 'application/json' },
    });
    return data.token;
  }

  /**
   * Create a Paymob checkout session and return the hosted payment
   * page URL.
   *
   * @param {import('../models/Payment')} payment  Payment document
   * @returns {Promise<Object>}  { checkoutUrl, orderId, paymentToken }
   */
  async createCheckout(payment) {
    try {
      const amount = Number(payment.amount || 0);
      // Paymob expects the amount in cents; multiply by 100 and round.
      const amountCents = Math.round(amount * 100);

      const token = await this._authenticate();
      const orderId = await this._createOrder(token, amountCents);
      // Provide minimal billing data.  Replace with real customer
      // information if available.  Fields marked with * are required.
      const billingData = {
        apartment: 'NA',
        email: payment.metadata?.customerEmail || 'customer@example.com',
        floor: 'NA',
        first_name: payment.metadata?.firstName || 'Customer',
        street: 'NA',
        building: 'NA',
        phone_number: payment.metadata?.customerMobile || '0000000000',
        shipping_method: 'NA',
        postal_code: 'NA',
        city: 'NA',
        country: 'EG',
        last_name: payment.metadata?.lastName || 'User',
        state: 'NA',
      };
      const paymentToken = await this._requestPaymentKey(token, orderId, amountCents, billingData);
      const checkoutUrl = `${this.apiBase}/acceptance/iframes/${this.iframeId}?payment_token=${paymentToken}`;
      // Persist provider identifiers
      payment.transactionId = orderId;
      payment.paymentGatewayResponse = { orderId, paymentToken };
      await payment.save();
      return {
        checkoutUrl,
        orderId,
        paymentToken,
      };
    } catch (error) {
      logger.error('Error creating Paymob checkout:', error.response?.data || error.message);
      throw new Error('Failed to create Paymob checkout');
    }
  }
}

module.exports = PaymobService;
