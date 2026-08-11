const mongoose = require('mongoose');

/**
 * RefundRequest represents a user's request to refund a completed payment.
 * It references the Payment and User documents and tracks the
 * approval status as well as any refund details returned by the
 * payment provider.  Only one refund request can exist per payment.
 */
const RefundRequestSchema = new mongoose.Schema(
  {
    payment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Payment',
      required: true,
      unique: true
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    reason: { type: String },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending'
    },
    refundAmount: { type: Number },
    gatewayRefundId: { type: String },
    createdAt: { type: Date, default: Date.now },
    processedAt: { type: Date },
    processedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    responseMessage: { type: String }
  },
  { timestamps: true }
);

// Index for quickly retrieving requests by payment
RefundRequestSchema.index({ payment: 1 });

module.exports = mongoose.model('RefundRequest', RefundRequestSchema);
