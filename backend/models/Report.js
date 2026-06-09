const mongoose = require('mongoose');

const ReportSchema = new mongoose.Schema({
  // ✅ User se link
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null, // Guest user ke liye null
  },

  // ✅ Text info
  text: {
    type: String,
    required: true,
  },
  textPreview: {
    type: String, // Pehle 100 characters
    default: '',
  },
  fileName: {
    type: String,
    default: 'Direct Input',
  },
  wordCount: {
    type: Number,
    default: 0,
  },

  // ✅ Scores
  score: {
    type: Number,
    required: true,
  },
  aiScore: {
    type: Number,
    default: 0,
  },

  // ✅ Results
  summary: {
    type: String,
    default: '',
  },
  matchedSources: {
    type: Array,
    default: [],
  },
  highlights: {
    type: Array,
    default: [],
  },

  // ✅ Options
  excludeQuotes: {
    type: Boolean,
    default: false,
  },
  excludeBibliography: {
    type: Boolean,
    default: false,
  },

  // ✅ Verdict
  verdict: {
    type: String,
    enum: ['Original', 'Medium Risk', 'High Risk'],
    default: 'Original',
  },

  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// ✅ Indexes — fast search ke liye
ReportSchema.index({ userId: 1 });
ReportSchema.index({ createdAt: -1 });
ReportSchema.index({ score: 1 });

module.exports = mongoose.model('Report', ReportSchema);