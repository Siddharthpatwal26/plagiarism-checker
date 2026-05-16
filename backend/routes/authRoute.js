const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const passport = require('passport');

const JWT_SECRET = process.env.JWT_SECRET || 'plagiocheck_secret_key';
const FRONTEND_URL = 'http://localhost:3000';

// ✅ Token generate karo
const generateToken = (user) => {
    return jwt.sign(
        { id: user._id, email: user.email, name: user.name },
        JWT_SECRET,
        { expiresIn: '7d' }
    );
};

// ✅ REGISTER
router.post('/register', async (req, res) => {
    try {
        const { name, email, password } = req.body;

        if (!name || !email || !password)
            return res.status(400).json({ message: 'Saari fields zaroori hain!' });

        const existing = await User.findOne({ email });
        if (existing)
            return res.status(400).json({ message: 'Email already registered!' });

        const user = new User({ name, email, password });
        await user.save();

        const token = generateToken(user);
        res.status(201).json({
            success: true,
            token,
            user: { id: user._id, name: user.name, email: user.email },
        });
    } catch (err) {
        res.status(500).json({ message: 'Server error!', error: err.message });
    }
});

// ✅ LOGIN
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password)
            return res.status(400).json({ message: 'Email aur password zaroori hai!' });

        const user = await User.findOne({ email });
        if (!user)
            return res.status(400).json({ message: 'Email registered nahi hai!' });

        if (!user.password)
            return res.status(400).json({ message: 'Google se login karo!' });

        const isMatch = await user.comparePassword(password);
        if (!isMatch)
            return res.status(400).json({ message: 'Password galat hai!' });

        const token = generateToken(user);
        res.status(200).json({
            success: true,
            token,
            user: { id: user._id, name: user.name, email: user.email },
        });
    } catch (err) {
        res.status(500).json({ message: 'Server error!', error: err.message });
    }
});

// ✅ GOOGLE LOGIN — redirect
router.get('/google',
    passport.authenticate('google', { scope: ['profile', 'email'] })
);

// ✅ GOOGLE CALLBACK
router.get('/google/callback',
    passport.authenticate('google', { failureRedirect: `${FRONTEND_URL}/login` }),
    (req, res) => {
        const token = generateToken(req.user);
        res.redirect(`${FRONTEND_URL}/auth/success?token=${token}&name=${req.user.name}&email=${req.user.email}&id=${req.user._id}`);
    }
);

// ✅ GET current user (token verify)
router.get('/me', async (req, res) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) return res.status(401).json({ message: 'Token nahi mila!' });

        const decoded = jwt.verify(token, JWT_SECRET);
        const user = await User.findById(decoded.id).select('-password');
        if (!user) return res.status(404).json({ message: 'User nahi mila!' });

        res.status(200).json({ success: true, user });
    } catch (err) {
        res.status(401).json({ message: 'Invalid token!' });
    }
});

module.exports = router;