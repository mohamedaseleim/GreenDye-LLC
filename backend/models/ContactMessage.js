const mongoose = require('mongoose');

const ContactMessageSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, maxlength: 120 },
  email: { type: String, required: true, trim: true, lowercase: true, maxlength: 254 },
  subject: { type: String, required: true, trim: true, maxlength: 200 },
  message: { type: String, required: true, trim: true, maxlength: 5000 },
  status: { type: String, enum: ['new', 'in_progress', 'resolved', 'spam'], default: 'new', index: true },
  ipAddress: { type: String, select: false },
  userAgent: { type: String, select: false },
  assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  adminNotes: { type: String, maxlength: 3000 },
  resolvedAt: Date
}, { timestamps: true });

ContactMessageSchema.index({ createdAt: -1 });
ContactMessageSchema.index({ email: 1, createdAt: -1 });

module.exports = mongoose.model('ContactMessage', ContactMessageSchema);
