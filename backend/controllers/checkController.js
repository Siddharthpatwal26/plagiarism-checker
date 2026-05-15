const Report = require('../models/Report');
const axios = require('axios');

const checkPlagiarism = async (req, res) => {
  try {
    const { text, reference, checkAI, excludeQuotes, excludeBibliography } = req.body;

    if (!text) {
      return res.status(400).json({ message: 'Text is required!' });
    }

    // Python ML server ko call karo
    const mlResponse = await axios.post('http://127.0.0.1:5001/analyze', {
      text: text,
      reference: reference || null,
      check_web: false,
      check_ai: checkAI || false,
      exclude_quotes: excludeQuotes || false,
      exclude_bib: excludeBibliography || false
    });

    const { score, matched_sources, highlights, ai_score, summary } = mlResponse.data;

    // MongoDB mein save karo
    const report = new Report({
      text: text,
      score: score,
      aiScore: ai_score || 0,
      excludeQuotes: excludeQuotes || false,
      excludeBibliography: excludeBibliography || false
    });
    await report.save();

    res.status(200).json({
      success: true,
      score: score,
      matched_sources: matched_sources,
      highlights: highlights,
      ai_score: ai_score || 0,
      summary: summary,
      message: 'Plagiarism check completed!'
    });

  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ message: 'Server error!' });
  }
};

module.exports = { checkPlagiarism };