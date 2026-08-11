const crypto = require('crypto');

const required = ['MONGODB_URI','JWT_SECRET','FRONTEND_URL','PUBLIC_BASE_URL','SMTP_HOST','SMTP_PORT','SMTP_USER','SMTP_PASSWORD','FROM_EMAIL'];
const urlKeys = ['FRONTEND_URL','PUBLIC_BASE_URL','MOODLE_BASE_URL'];

module.exports = function validateEnv() {
  const missing = required.filter(key => !String(process.env[key] || '').trim());
  if (missing.length) throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  if (process.env.NODE_ENV === 'production') {
    if (process.env.MALWARE_SCAN_ENABLED !== 'true') throw new Error('MALWARE_SCAN_ENABLED must be true in production');
    if (process.env.JWT_SECRET.length < 64 || /replace|secret|password/i.test(process.env.JWT_SECRET)) throw new Error('JWT_SECRET must be a unique random value of at least 64 characters');
    if (!process.env.MONGODB_URI.includes('replicaSet=')) throw new Error('Production MONGODB_URI must include replicaSet for transaction support');
    if (!process.env.MONGODB_URI.startsWith('mongodb://') && !process.env.MONGODB_URI.startsWith('mongodb+srv://')) throw new Error('MONGODB_URI is invalid');
    for (const key of urlKeys) { if (process.env[key]) { const value = new URL(process.env[key]); if (value.protocol !== 'https:') throw new Error(`${key} must use HTTPS in production`); } }
    if (process.env.ALLOW_PRODUCTION_RESTORE === 'true') throw new Error('ALLOW_PRODUCTION_RESTORE must be false during normal startup');
  }
  process.env.INSTANCE_ID ||= crypto.randomUUID();
};
