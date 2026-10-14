require('dotenv').config();
const express = require('express');
const session = require('express-session');
const flash = require('connect-flash');
const path = require('path');
const expressLayouts = require('express-ejs-layouts');

const { injectLocals } = require('./middleware/auth');
const { csrfToken, verifyCsrf } = require('./middleware/csrf');

const app = express();

/* ---------- Views ---------- */
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(expressLayouts);
app.set('layout', 'layout');

/* ---------- Body parsing + static ---------- */
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

/* ---------- Session ---------- */
app.use(session({
    secret: process.env.SESSION_SECRET || 'fallback-secret-change-me',
    resave: false,
    saveUninitialized: false,
    cookie: {
        httpOnly: true,
        sameSite: 'lax',
        maxAge: 1000 * 60 * 60 * 24,
    },
}));

app.use(flash());
app.use(injectLocals);
app.use(csrfToken);

/* ---------- Routes ---------- */
app.use('/', require('./routes/auth'));
app.use('/', verifyCsrf, require('./routes/index'));
app.use('/', verifyCsrf, require('./routes/student'));
app.use('/faculty', verifyCsrf, require('./routes/faculty'));
app.use('/admin', verifyCsrf, require('./routes/admin'));

/* ---------- 404 / 500 ---------- */
app.use((req, res) => res.status(404).render('404', { title: 'Not Found' }));

app.use((err, req, res, next) => {
    console.error(err);
    res.status(500).render('500', { title: 'Server Error' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 Faculink running at http://localhost:${PORT}`);
});