const express = require('express');
const router = express.Router();
const { checkPlagiarism } = require('../controllers/checkController');

router.post('/check', checkPlagiarism);

module.exports = router;