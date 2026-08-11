const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');
const ConsultantSchema = new mongoose.Schema({
  consultantId: { type: String, unique: true, default: () => `CO-${uuidv4().slice(0,8).toUpperCase()}` },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  fullName: { type: String, required: true },
  professionalTitle: { en: String, ar: String, fr: String },
  bio: { en: String, ar: String, fr: String },
  expertise: [String], industries: [String], countries: [String],
  languages: [{ language: String, proficiency: { type: String, enum: ['basic','intermediate','advanced','native'] } }],
  yearsOfExperience: { type: Number, min: 0, default: 0 },
  deliveryModes: [{ type: String, enum: ['remote','onsite','hybrid'] }],
  verificationStatus: { type: String, enum: ['pending','under_review','verified','rejected','suspended','expired','revoked'], default: 'pending', index: true },
  accreditationNumber: { type: String, unique: true, sparse: true },
  accreditationIssueDate: Date, accreditationExpiryDate: Date,
  verificationUrl: String, qrCode: String, isPublic: { type: Boolean, default: true }
}, { timestamps: true });
module.exports = mongoose.model('Consultant', ConsultantSchema);
