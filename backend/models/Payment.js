const mongoose = require('mongoose');

const PaymentSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  currency: {
    type: String,
    enum: ['USD', 'EUR', 'EGP', 'SAR', 'NGN'],
    default: 'USD'
  },
  paymentMethod: {
    type: String,
    enum: ['stripe', 'paypal', 'fawry', 'paymob', 'credit_card', 'bank_transfer'],
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'processing', 'completed', 'failed', 'refunded', 'cancelled'],
    default: 'pending'
  },
  transactionId: {
    type: String,
    unique: true,
    sparse: true
  },
  paymentGatewayResponse: {
    type: mongoose.Schema.Types.Mixed
  },
  refundReason: {
    type: String
  },
  refundedAmount: {
    type: Number,
    default: 0
  },
  refundedAt: {
    type: Date
  },
  // Added fields for refund tracking
  refundTransactionId: {
    type: String
  },
  refundGatewayResponse: {
    type: mongoose.Schema.Types.Mixed
  },
  metadata: {
    ipAddress: String,
    userAgent: String,
    country: String,
    region: String
  },
  invoice: {
    invoiceNumber: String,
    invoiceUrl: String
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  completedAt: {
    type: Date
  }
});

// Create indexes for efficient queries
PaymentSchema.index({ user: 1 });
PaymentSchema.index({ course: 1 });
PaymentSchema.index({ status: 1 });
PaymentSchema.index({ transactionId: 1 });
PaymentSchema.index({ createdAt: -1 });

// Generate invoice number before saving
PaymentSchema.pre('save', function (next) {
  if (!this.invoice.invoiceNumber && this.status === 'completed') {
    const year = new Date().getFullYear();
    const random = Math.random().toString(36).substring(2, 8).toUpperCase();
    this.invoice.invoiceNumber = `INV-${year}-${random}`;
  }
  next();
});

module.exports = mongoose.model('Payment', PaymentSchema);
