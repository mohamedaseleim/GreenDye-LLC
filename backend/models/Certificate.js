const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');
const QRCode = require('qrcode');
const { DEFAULT_CERTIFICATE_ISSUER } = require('../utils/constants');

const CertificateSchema = new mongoose.Schema({
  certificateId: {
    type: String,
    unique: true,
    index: true,
    default: () => `CERT-${uuidv4().replace(/-/g, '').toUpperCase()}`
  },

  // Credential holder linkage
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false,
    index: true
  },

  // Credential display fields
  recipientName: { type: String, required: false },
  traineeName: { type: String, required: false, select: false },
  userName: {
    type: String,
    required: false
  },
  certificateType: { type: String, enum: ['training','professional','trainer_accreditation','consultant_accreditation','attendance','achievement','experience','other'], default: 'professional' },
  source: { type: String, enum: ['green','moodle','manual','partner','external'], default: 'green' },
  externalReference: { externalCertificateId: String, externalVerificationUrl: String },
  credentialTitle: { type: String, required: true, trim: true, maxlength: 240 },
  credentialReference: { type: String, required: true, trim: true, uppercase: true, index: true },
  // Legacy import aliases retained for historical records only.
  courseTitle: { type: String, required: false, select: false },
  courseName: { type: Map, of: String, required: false, select: false },
  assessorName: { type: String, required: false },

  // Dates
  completionDate: {
    type: Date,
    default: Date.now
  },
  issueDate: {
    type: Date,
    default: Date.now,
    index: true
  },
  expiryDate: {
    type: Date
  },

  // Result
  certificateLevel: {
    type: String,
    required: false
  },
  grade: {
    type: String,
    enum: ['A+', 'A', 'B+', 'B', 'C+', 'C', 'Pass', 'Distinction'],
    required: false
  },
  score: {
    type: Number,
    min: 0,
    max: 100,
    required: false
  },

  // Verification artifacts
  verificationUrl: {
    type: String
  },
  qrCode: {
    type: String // data URL (PNG) optional cache
  },
  pdfUrl: {
    type: String
  },

  // Lifecycle
  status: { type: String, enum: ['draft','active','expired','revoked','archived','deleted'], default: 'draft', index: true },
  isValid: {
    type: Boolean,
    default: false,
    index: true
  },
  isRevoked: {
    type: Boolean,
    default: false,
    index: true
  },
  revokedDate: {
    type: Date
  },
  revokedReason: { type: String },
  archivedAt: Date,
  archivedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  deletedAt: Date,
  deletedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  deletionReason: String,

  // Extras
  metadata: {
    duration: Number, // hours
    instructor: String, // tutorName
    language: String,
    scheme: String,
    heldOn: Date,
    heldIn: String, // location
    issuedBy: { type: String, default: DEFAULT_CERTIFICATE_ISSUER },
    issuerUser: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    issuerName: String,
    recipientEmail: String
  },

  createdAt: {
    type: Date,
    default: Date.now
  }
});


CertificateSchema.pre('validate', function(next) {
  if (!this.user && !String(this.recipientName || '').trim()) this.invalidate('recipientName', 'recipientName or user is required');
  next();
});

// Build the public verification URL and QR code before saving (idempotent)
CertificateSchema.pre('save', async function () {
  if (this.status === 'active') { this.isValid = true; this.isRevoked = false; }
  else if (this.status === 'revoked') { this.isValid = false; this.isRevoked = true; }
  else { this.isValid = false; if (this.status !== 'revoked') this.isRevoked = false; }
  if (!this.verificationUrl) {
    const base = process.env.FRONTEND_URL || process.env.PUBLIC_BASE_URL || '';
    this.verificationUrl = `${base}/verify/certificate/${this.certificateId}`;
  }
  if (!this.qrCode && this.verificationUrl) {
    this.qrCode = await QRCode.toDataURL(this.verificationUrl, { errorCorrectionLevel: 'H', margin: 2 });
  }
});

// Indexes for fast lookups
CertificateSchema.index({ certificateId: 1 });
CertificateSchema.index({ user: 1 });
CertificateSchema.index({ isValid: 1, isRevoked: 1 });
CertificateSchema.index({ status: 1, issueDate: -1 });
CertificateSchema.index({ credentialReference: 1 }, { name: 'credentialReference_unique_v1', unique: true, partialFilterExpression: { credentialReference: { $type: 'string' } } });

module.exports = mongoose.model('Certificate', CertificateSchema);
