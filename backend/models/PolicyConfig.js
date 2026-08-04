const mongoose = require('mongoose');

/**
 * PolicyConfig stores key/value pairs for application‑wide policies.
 * For example, refund policies such as the maximum number of days
 * after a purchase a refund can be requested and the maximum course
 * completion percentage allowed for refunds.  Additional policies can
 * be added as new documents in this collection.
 */
const PolicyConfigSchema = new mongoose.Schema(
  {
    key: {
      type: String,
      required: true,
      unique: true
    },
    value: {
      type: mongoose.Schema.Types.Mixed,
      required: true
    },
    description: { type: String }
  },
  { timestamps: true }
);

module.exports = mongoose.model('PolicyConfig', PolicyConfigSchema);
