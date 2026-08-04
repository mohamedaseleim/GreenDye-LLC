const RefundRequest = require('../models/RefundRequest');
const logger = require('../utils/logger');
const Payment = require('../models/Payment');
// const Enrollment = require('../models/Enrollment'); // Unused import
const StripeService = require('../services/stripeService');
const PayPalService = require('../services/paypalService');
const FawryService = require('../services/fawryService');

exports.getRefundRequests = async (req, res) => {
  try {
    const { status } = req.query;
    const filter = {};
    if (status) filter.status = status;
    const refunds = await RefundRequest.find(filter)
      .populate('payment')
      .populate('user', 'name email')
      .populate('processedBy', 'name email')
      .sort('-createdAt');
    return res.status(200).json({ success: true, count: refunds.length, data: refunds });
  } catch (error) {
    logger.error('Get refund requests error:', error);
    return res.status(500).json({ success: false, message: 'Error fetching refund requests', error: error.message });
  }
};

exports.approveRefundRequest = async (req, res) => {
  try {
    const refundRequest = await RefundRequest.findById(req.params.id).populate('payment');
    if (!refundRequest) {
      return res.status(404).json({ success: false, message: 'Refund request not found' });
    }
    if (refundRequest.status !== 'pending') {
      return res.status(400).json({ success: false, message: 'Refund request already processed' });
    }

    const payment = await Payment.findById(refundRequest.payment._id);
    if (!payment || payment.status !== 'completed') {
      return res.status(400).json({ success: false, message: 'Payment is not refundable' });
    }

    const amount = payment.amount - (payment.refundedAmount || 0);
    let service;
    switch (payment.paymentMethod) {
      case 'stripe':
        service = new StripeService();
        break;
      case 'paypal':
        service = new PayPalService();
        break;
      case 'fawry':
        service = new FawryService();
        break;
      default:
        return res.status(400).json({ success: false, message: `Refund not supported for ${payment.paymentMethod}` });
    }

    // Attempt to refund via the provider
    const refundResponse = await service.refundPayment(payment, amount);

    // Update refund request state
    refundRequest.status = 'approved';
    refundRequest.processedAt = new Date();
    refundRequest.processedBy = req.user._id;
    refundRequest.refundAmount = amount;
    refundRequest.gatewayRefundId =
      payment.refundTransactionId || refundResponse?.id || refundResponse?.result?.id;
    await refundRequest.save();

    return res.status(200).json({
      success: true,
      message: 'Refund approved and processed',
      data: refundRequest
    });
  } catch (error) {
    logger.error('Approve refund error:', error);
    return res.status(500).json({ success: false, message: 'Error approving refund', error: error.message });
  }
};

exports.rejectRefundRequest = async (req, res) => {
  try {
    const refundRequest = await RefundRequest.findById(req.params.id).populate('payment');
    if (!refundRequest) {
      return res.status(404).json({ success: false, message: 'Refund request not found' });
    }
    if (refundRequest.status !== 'pending') {
      return res.status(400).json({ success: false, message: 'Refund request already processed' });
    }

    refundRequest.status = 'rejected';
    refundRequest.processedAt = new Date();
    refundRequest.processedBy = req.user._id;
    refundRequest.responseMessage = req.body.responseMessage || 'Refund request rejected';
    await refundRequest.save();

    return res.status(200).json({
      success: true,
      message: 'Refund rejected',
      data: refundRequest
    });
  } catch (error) {
    logger.error('Reject refund error:', error);
    return res.status(500).json({ success: false, message: 'Error rejecting refund', error: error.message });
  }
};
