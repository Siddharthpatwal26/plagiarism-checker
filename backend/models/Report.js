const mongoose = require('mongoose');

const ReportSchema = new mongoose.Schema({
  text: {
    type: String,
    required: true,
  },
  score: {
    type: Number,
    required: true,
  },
  aiScore: {
    type: Number,
    default: 0,
  },
  excludeQuotes: {
    type: Boolean,
    default: false,
  },
  excludeBibliography: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Report', ReportSchema);
