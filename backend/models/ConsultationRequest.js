const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');
const ConsultationRequestSchema = new mongoose.Schema({
  requestNumber: { type: String, unique: true, default: () => `CR-${new Date().getFullYear()}-${uuidv4().slice(0,8).toUpperCase()}` },
  client: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  clientType: { type: String, enum: ['individual', 'organization', 'company', 'factory'], required: true },
  organizationName: String,
  service: { type: mongoose.Schema.Types.ObjectId, ref: 'ConsultationService' },
  title: { type: String, required: true, trim: true, maxlength: 200 },
  challenge: { type: String, required: true, maxlength: 10000 },
  objectives: { type: String, maxlength: 5000 },
  country: String,
  deliveryMode: { type: String, enum: ['remote', 'onsite', 'hybrid'], default: 'remote' },
  preferredLanguage: { type: String, enum: ['en', 'ar', 'fr'], default: 'en' },
  timezone: String,
  budget: { amount: { type: Number, min: 0 }, currency: { type: String, default: 'USD' } },
  targetDate: Date,
  confidentiality: { type: String, enum: ['standard', 'confidential', 'highly_confidential'], default: 'standard' },
  status: { type: String, enum: ['draft','submitted','under_review','more_information_required','assigned','proposal_sent','awaiting_client','contracting','active','final_review','completed','rejected','cancelled','on_hold','disputed'], default: 'submitted', index: true },
  assignedConsultants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Consultant' }],
  internalNotes: { type: String, select: false }
}, { timestamps: true });
module.exports = mongoose.model('ConsultationRequest', ConsultationRequestSchema);
