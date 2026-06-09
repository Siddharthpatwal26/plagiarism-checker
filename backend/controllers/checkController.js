const Report = require('../models/Report');
const axios = require('axios');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'plagiocheck_secret_key';

// ✅ Token se user ID nikalo (optional — guest bhi allowed)
const getUserFromToken = (req) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return null;
    const decoded = jwt.verify(token, JWT_SECRET);
    return decoded.id;
  } catch {
    return null;
  }
};

const checkPlagiarism = async (req, res) => {
  try {
    const { text, reference, fileName, excludeQuotes, excludeBibliography } = req.body;

    if (!text) {
      return res.status(400).json({ message: 'Text is required!' });
    }

    // ✅ User ID nikalo token se
    const userId = getUserFromToken(req);

    // ✅ Python ML server ko call karo
    const mlResponse = await axios.post('http://127.0.0.1:5001/analyze', {
      text: text,
      reference: reference || null,
      check_web: true,
      exclude_quotes: excludeQuotes || false,
      exclude_bibliography: excludeBibliography || false,
    });

    const { score, matched_sources, highlights, summary, ai_score } = mlResponse.data;

    // ✅ Verdict calculate karo
    const verdict = score >= 70 ? 'High Risk' : score >= 40 ? 'Medium Risk' : 'Original';

    // ✅ MongoDB mein save karo — user linked
    const report = new Report({
      userId: userId || null,
      text: text,
      textPreview: text.substring(0, 100) + (text.length > 100 ? '...' : ''),
      fileName: fileName || 'Direct Input',
      wordCount: text.trim().split(/\s+/).filter(w => w.length > 0).length,
      score: score,
      aiScore: ai_score || 0,
      summary: summary || '',
      matchedSources: matched_sources || [],
      highlights: highlights || [],
      verdict: verdict,
      excludeQuotes: excludeQuotes || false,
      excludeBibliography: excludeBibliography || false,
    });

    await report.save();

    res.status(200).json({
      success: true,
      reportId: report._id,
      score: score,
      aiScore: ai_score || 0,
      matched_sources: matched_sources,
      highlights: highlights,
      summary: summary,
      verdict: verdict,
      message: 'Plagiarism check completed!'
    });

  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ message: 'Server error!', error: error.message });
  }
};

// ✅ User ki history fetch karo
const getHistory = async (req, res) => {
  try {
    const userId = getUserFromToken(req);
    if (!userId) {
      return res.status(401).json({ message: 'Login karo history dekhne ke liye!' });
    }

    const reports = await Report.find({ userId })
      .sort({ createdAt: -1 })
      .limit(20)
      .select('-text -highlights'); // Full text mat bhejo — heavy hai

    res.status(200).json({ success: true, reports });
  } catch (error) {
    res.status(500).json({ message: 'Server error!', error: error.message });
  }
};

// ✅ Single report fetch karo
const getReport = async (req, res) => {
  try {
    const report = await Report.findById(req.params.id);
    if (!report) {
      return res.status(404).json({ message: 'Report nahi mili!' });
    }
    res.status(200).json({ success: true, report });
  } catch (error) {
    res.status(500).json({ message: 'Server error!', error: error.message });
  }
};

module.exports = { checkPlagiarism, getHistory, getReport };