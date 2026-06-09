const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
const passport = require('passport');
const session = require('express-session');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

// ✅ Passport Google config
require('./config/passport');

const checkRoute = require('./routes/checkRoute');
const authRoute = require('./routes/authRoute');

const app = express();

// ✅ Rate Limiters
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { message: 'Bahut zyada requests! 15 minute baad try karo.' }
});

const checkLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  message: { message: '1 minute mein sirf 10 checks allowed hain!' }
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: { message: 'Bahut zyada login attempts! 15 minute baad try karo.' }
});

app.use(globalLimiter);

// ✅ FIX: cors line add ki
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:3002'],
  methods: ['GET', 'POST'],
  credentials: true,
}));

app.use(bodyParser.json());

// ✅ Session — Google OAuth ke liye zaroori
app.use(session({
  secret: process.env.SESSION_SECRET || 'plagiocheck_session',
  resave: false,
  saveUninitialized: false,
}));

app.use(passport.initialize());
app.use(passport.session());

// ✅ Routes
app.use('/api', checkLimiter, checkRoute);
app.use('/api/auth', authLimiter, authRoute);

app.get('/', (req, res) => {
  res.send('Plagiarism Checker Backend Running!');
});

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/plagiarism-checker';

mongoose.connect(MONGO_URI)
  .then(() => {
    console.log('MongoDB Connected!');
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.log('MongoDB Error:', err.message);
  });