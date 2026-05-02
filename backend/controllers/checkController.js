const Report = require('../models/Report');
const axios = require('axios');

const checkPlagiarism = async (req, res) => {
  try {
    const { text, reference } = req.body;

    if (!text) {
      return res.status(400).json({ message: 'Text is required!' });
    }

    // Python ML server ko call karo
    const mlResponse = await axios.post('http://127.0.0.1:5001/analyze', {
      text: text,
      reference: reference || null,
      check_web: false
    });

    const { score, matched_sources, highlights } = mlResponse.data;

    // MongoDB mein save karo
    const report = new Report({
      text: text,
      score: score,
    });
    await report.save();

    res.status(200).json({
      success: true,
      score: score,
      matched_sources: matched_sources,
      highlights: highlights,
      message: 'Plagiarism check completed!'
    });

  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ message: 'Server error!' });
  }
};

module.exports = { checkPlagiarism };