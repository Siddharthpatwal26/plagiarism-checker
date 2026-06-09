const express = require('express');
const router = express.Router();
const { checkPlagiarism, getHistory, getReport } = require('../controllers/checkController');

// ✅ Plagiarism check
router.post('/check', checkPlagiarism);

// ✅ User history — MongoDB se
router.get('/history', getHistory);

// ✅ Single report
router.get('/report/:id', getReport);

module.exports = router;