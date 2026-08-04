const mongoose = require('mongoose');

const TrainerPayoutSchema = new mongoose.Schema({
  trainer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Trainer',
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
  status: {
    type: String,
    enum: ['pending', 'processing', 'completed', 'failed', 'cancelled'],
    default: 'pending'
  },
  payoutMethod: {
    type: String,
    enum: ['bank_transfer', 'paypal', 'stripe', 'other'],
    required: true
  },
  transactionId: {
    type: String,
    unique: true,
    sparse: true
  },
  period: {
    startDate: Date,
    endDate: Date
  },
  processedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  processedAt: {
    type: Date
  },
  notes: {
    type: String
  },
  payoutDetails: {
    type: mongoose.Schema.Types.Mixed // Transaction details, receipt, etc.
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Create indexes
TrainerPayoutSchema.index({ trainer: 1 });
TrainerPayoutSchema.index({ status: 1 });
TrainerPayoutSchema.index({ createdAt: -1 });

module.exports = mongoose.model('TrainerPayout', TrainerPayoutSchema);
