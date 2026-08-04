const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');
const QRCode = require('qrcode');
const { DEFAULT_CERTIFICATE_ISSUER } = require('../utils/constants');

const CertificateSchema = new mongoose.Schema({
  certificateId: {
    type: String,
    unique: true,
    index: true,
    default: () => `CERT-${uuidv4().split('-')[0].toUpperCase()}`
  },

  // Holder & course linkage (now optional)
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false,
    index: true
  },

  // Display fields
  traineeName: {
    type: String,
    required: false
  },
  userName: {
    type: String,
    required: false
  },
  certificateType: { type: String, enum: ['training','professional','trainer_accreditation','consultant_accreditation','attendance','achievement','experience','other'], default: 'professional' },
  source: { type: String, enum: ['green','moodle','manual','partner','external'], default: 'green' },
  externalReference: { externalCertificateId: String, externalVerificationUrl: String },
  courseTitle: {
    type: String,
    required: false
  },
  courseName: {
    type: Map,
    of: String,
    required: false
  },

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
  verificationToken: {
    type: String,
    unique: true,
    index: true
  },
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
  isValid: {
    type: Boolean,
    default: true,
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
  revokedReason: {
    type: String
  },

  // Extras
  metadata: {
    duration: Number, // hours
    instructor: String, // tutorName
    language: String,
    scheme: String,
    heldOn: Date,
    heldIn: String, // location
    issuedBy: {
      type: String,
      default: DEFAULT_CERTIFICATE_ISSUER
    }
  },

  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Build verification token + URL before saving (idempotent)
CertificateSchema.pre('save', async function () {
  if (!this.verificationToken) this.verificationToken = uuidv4().replace(/-/g, '');
  if (!this.verificationUrl) {
    const base = process.env.FRONTEND_URL || process.env.PUBLIC_BASE_URL || '';
    this.verificationUrl = `${base}/verify/certificate/${this.certificateId}?t=${this.verificationToken}`;
  }
  if (!this.qrCode && this.verificationUrl) {
    this.qrCode = await QRCode.toDataURL(this.verificationUrl, { errorCorrectionLevel: 'H', margin: 2 });
  }
});

// Indexes for fast lookups
CertificateSchema.index({ certificateId: 1 });
CertificateSchema.index({ user: 1 });
CertificateSchema.index({ isValid: 1, isRevoked: 1 });
// Compound index to verify quickly by cert+token
CertificateSchema.index({ certificateId: 1, verificationToken: 1 }, { unique: true });

module.exports = mongoose.model('Certificate', CertificateSchema);
