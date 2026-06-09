const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const ApiKeySchema = new mongoose.Schema({
  // ✅ User se linked
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },

  // ✅ API Key
  key: {
    type: String,
    default: () => `pk_${uuidv4().replace(/-/g, '')}`, // pk_xxxxx format
    unique: true,
  },

  // ✅ Key details
  name: {
    type: String,
    default: 'My API Key',
  },

  // ✅ Usage tracking
  usageCount: {
    type: Number,
    default: 0,
  },
  lastUsed: {
    type: Date,
    default: null,
  },

  // ✅ Status
  isActive: {
    type: Boolean,
    default: true,
  },

  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// ✅ Index for fast lookup
ApiKeySchema.index({ key: 1 });
ApiKeySchema.index({ userId: 1 });

module.exports = mongoose.model('ApiKey', ApiKeySchema);