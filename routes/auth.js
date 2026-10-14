const express = require('express');
const bcrypt = require('bcryptjs');
const router = express.Router();
const pool = require('../config/database');

/* ---------- REGISTER ---------- */
router.get('/register', (req, res) => {
    if (req.session.user) return res.redirect('/');
    res.render('register', {
        title: 'Create Account',
        old: {},
        errors: [],
        isAuthPage: true,
    });
});

router.post('/register', async (req, res) => {
    const { full_name, email, password, password_confirm } = req.body;
    const errors = [];

    if (!full_name || full_name.length > 100) errors.push('Please enter your full name (max 100 characters).');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.push('Please enter a valid email address.');
    if (!password || password.length < 8) errors.push('Password must be at least 8 characters.');
    if (password !== password_confirm) errors.push('Passwords do not match.');

    if (!errors.length) {
        const [existing] = await pool.query('SELECT id FROM users WHERE email = ? LIMIT 1', [email]);
        if (existing.length) errors.push('That email address is already registered.');
    }

    if (errors.length) {
        return res.render('register', {
            title: 'Create Account',
            old: { full_name, email },
            errors,
            isAuthPage: true,
        });
    }

    const hash = await bcrypt.hash(password, 10);
    const [result] = await pool.query(
        "INSERT INTO users (full_name, email, password_hash, role) VALUES (?, ?, ?, 'student')",
        [full_name, email, hash]
    );

    req.session.user = { id: result.insertId, full_name, email, role: 'student' };
    req.flash('success', 'Welcome! Your account was created.');
    res.redirect('/');
});

/* ---------- LOGIN ---------- */
router.get('/login', (req, res) => {
    if (req.session.user) return res.redirect('/');
    res.render('login', {
        title: 'Log In',
        email: '',
        isAuthPage: true,
    });
});

router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    const renderError = (msg) => res.render('login', {
        title: 'Log In',
        email,
        loginError: msg,
        isAuthPage: true,
    });

    if (!email || !password) return renderError('Please enter both your email and password.');

    const [rows] = await pool.query(
        'SELECT id, full_name, email, password_hash, role, is_active FROM users WHERE email = ? LIMIT 1',
        [email]
    );
    const user = rows[0];

    const valid = user && user.is_active === 1 && await bcrypt.compare(password, user.password_hash);
    if (!valid) return renderError('Invalid email or password.');

    req.session.regenerate(err => {
        if (err) console.error(err);
        req.session.user = {
            id: user.id,
            full_name: user.full_name,
            email: user.email,
            role: user.role,
        };
        const dest = user.role === 'admin' ? '/admin/dashboard'
                   : user.role === 'faculty' ? '/faculty/dashboard'
                   : '/';
        res.redirect(dest);
    });
});

/* ---------- LOGOUT ---------- */
router.get('/logout', (req, res) => {
    req.session.destroy(() => res.redirect('/login'));
});

module.exports = router;