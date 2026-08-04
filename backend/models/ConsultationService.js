const mongoose = require('mongoose');
const ConsultationServiceSchema = new mongoose.Schema({
  name: { en: { type: String, required: true }, ar: String, fr: String },
  slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
  summary: { en: String, ar: String, fr: String },
  description: { en: String, ar: String, fr: String },
  industries: [{ type: String, trim: true }],
  clientTypes: [{ type: String, enum: ['individual', 'organization', 'company', 'factory'] }],
  deliveryModes: [{ type: String, enum: ['remote', 'onsite', 'hybrid'] }],
  estimatedDuration: String,
  pricingModel: { type: String, enum: ['fixed', 'hourly', 'daily', 'proposal'], default: 'proposal' },
  startingPrice: { type: Number, min: 0 },
  currency: { type: String, default: 'USD' },
  isPublished: { type: Boolean, default: false, index: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });
ConsultationServiceSchema.index({ 'name.en': 'text', 'name.ar': 'text', 'name.fr': 'text' });
module.exports = mongoose.model('ConsultationService', ConsultationServiceSchema);
