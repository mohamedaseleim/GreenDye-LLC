const mongoose = require('mongoose');

const fileSchema = new mongoose.Schema({
  url: String,
  name: String,
  mime: String,
  size: Number,
}, { _id: false });

const chatMessageSchema = new mongoose.Schema({
  conversation: { type: mongoose.Schema.Types.ObjectId, ref: 'ChatConversation', required: true },
  sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  senderType: { type: String, enum: ['user', 'system', 'bot'], default: 'user' },
  type: { type: String, enum: ['text', 'file', 'system'], default: 'text' },
  text: { type: String },
  files: [fileSchema],
  seenBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  bot: {
    provider: { type: String, enum: ['openai', 'rasa', 'none'], default: 'none' },
    confidence: { type: Number }
  },
  deletedAt: { type: Date },
  editedAt: { type: Date }
}, { timestamps: true });

module.exports = mongoose.model('ChatMessage', chatMessageSchema);
