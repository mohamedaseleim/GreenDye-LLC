const axios = require('axios');
const logger = require('../utils/logger');
const crypto = require('crypto');
const PaymentService = require('./paymentService');

/**
 * Service for integrating with the Fawry payment gateway.  Fawry
 * supports both card and cash payments using a reference number.  This
 * implementation follows the official documentation for creating a
 * payment request via the charge API.  See
 * https://atfawry.fawrystaging.com/ECommerceWeb/Fawry/payments/charge
 * for full details.  Credentials must be provided through the
 * environment variables FAWRY_API_URL, FAWRY_MERCHANT_CODE and
 * FAWRY_SECURITY_KEY.
 */
class FawryService extends PaymentService {
  constructor() {
    super();
    this.apiUrl = process.env.FAWRY_API_URL ||
      'https://atfawry.fawrystaging.com/ECommerceWeb/Fawry/payments/charge';
    this.merchantCode = process.env.FAWRY_MERCHANT_CODE;
    this.securityKey = process.env.FAWRY_SECURITY_KEY;
    if (!this.merchantCode || !this.securityKey) {
      logger.warn(
        'FawryService: missing FAWRY_MERCHANT_CODE or FAWRY_SECURITY_KEY environment variables',
      );
    }
  }

  /**
   * Construct a signature for the Fawry charge request.  The
   * specification defines the signature as the SHA-256 hash of
   * (merchantCode + merchantRefNum + customerProfileId + paymentMethod
   * + amount + securityKey).  All values are concatenated with no
   * separators.  See the Fawry API documentation lines 84–120 for
   * reference:contentReference[oaicite:0]{index=0}.
   *
   * @param {String} merchantRefNum  Unique reference number for the order
   * @param {String} customerProfileId  Identifier for the customer
   * @param {String} paymentMethod  Payment method e.g. CARD or PAY_AT_FAWRY
   * @param {Number} amount  Decimal amount
   * @returns {String}  SHA-256 signature in hex
   */
  _generateSignature(merchantRefNum, customerProfileId, paymentMethod, amount) {
    const data = `${this.merchantCode}${merchantRefNum}${customerProfileId}${paymentMethod}${amount}${this.securityKey}`;
    return crypto.createHash('sha256').update(data).digest('hex');
  }

  /**
   * Create a Fawry checkout session.  Sends a charge request to
   * Fawry's API and returns the reference number and checkout URL.
   *
   * @param {import('../models/Payment')} payment  Payment document
   * @returns {Promise<Object>}  { checkoutUrl, referenceNumber, providerResponse }
   */
  async createCheckout(payment) {
    // Derive identifiers
    const merchantRefNum = String(payment._id);
    // Fawry identifies the customer by a profile ID.  Use the user ID if available.
    const customerProfileId = payment.user ? String(payment.user) : merchantRefNum;
    const paymentMethod = 'CARD';
    const amount = Number(payment.amount);

    // Build charge items.  Fawry accepts an array of items with id,
    // description, price and qty.  Use the course id if present.
    const chargeItems = [
      {
        itemId: payment.course ? String(payment.course) : 'item',
        description: 'Course payment',
        price: amount,
        qty: 1,
      },
    ];

    const signature = this._generateSignature(
      merchantRefNum,
      customerProfileId,
      paymentMethod,
      amount,
    );

    const requestBody = {
      merchantCode: this.merchantCode,
      merchantRefNum,
      customerProfileId,
      customerName: payment.metadata?.customerName || 'Customer',
      customerEmail: payment.metadata?.customerEmail || 'customer@example.com',
      customerMobile: payment.metadata?.customerMobile || '0000000000',
      paymentMethod,
      amount,
      currencyCode: payment.currency || 'EGP',
      language: 'en',
      chargeItems,
      signature,
    };

    try {
      const { data } = await axios.post(this.apiUrl, requestBody, {
        headers: { 'Content-Type': 'application/json' },
      });
      // Fawry returns a reference number and a redirect URL when using card payments.
      const referenceNumber = data?.referenceNumber || merchantRefNum;
      const checkoutUrl =
        data?.paymentMethodUrl || data?.redirectUrl ||
        `${process.env.FRONTEND_URL}/checkout/fawry/${payment._id}`;
      // Persist provider response on the payment record
      payment.transactionId = referenceNumber;
      payment.paymentGatewayResponse = data;
      await payment.save();
      return {
        checkoutUrl,
        referenceNumber,
        providerResponse: data,
      };
    } catch (error) {
      logger.error(
        'Error creating Fawry checkout:',
        error.response?.data || error.message,
      );
      throw new Error('Failed to create Fawry checkout');
    }
  }
}

module.exports = FawryService;
