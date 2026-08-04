const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const NotificationPreferencesSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  preferredLanguage: { type: String, default: 'en' },
  emailEnabled: { type: Boolean, default: true },
  pushEnabled: { type: Boolean, default: false },
  // typePreferences: map of notification types to boolean to allow customizing
  typePreferences: { type: Map, of: Boolean, default: {} },
  // storing device FCM tokens (strings) for push notifications
  fcmTokens: { type: [String], default: [] },
}, { timestamps: true });

module.exports = mongoose.model('NotificationPreferences', NotificationPreferencesSchema);
