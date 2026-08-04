const mongoose = require('mongoose');

/**
 * TransactionLog records every payment attempt and its outcome.
 * It references the Payment, User and Course documents and stores
 * gateway response data for compliance and auditing.
 */
const TransactionLogSchema = new mongoose.Schema({
  payment: { type: mongoose.Schema.Types.ObjectId, ref: 'Payment', required: true },
  user:    { type: mongoose.Schema.Types.ObjectId, ref: 'User',    required: true },
  course:  { type: mongoose.Schema.Types.ObjectId, ref: 'Course',  required: true },
  amount:      { type: Number, required: true },
  currency:    { type: String, required: true },
  paymentMethod: { type: String, required: true },
  status:      { type: String, enum: ['pending', 'completed', 'failed', 'refunded'], required: true },
  transactionId: { type: String },
  gatewayResponse: { type: mongoose.Schema.Types.Mixed },
  createdAt: { type: Date, default: Date.now }
});

// Index to quickly fetch logs by payment
TransactionLogSchema.index({ payment: 1 });
module.exports = mongoose.model('TransactionLog', TransactionLogSchema);
