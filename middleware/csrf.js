const crypto = require('crypto');

function csrfToken(req, res, next) {
    if (!req.session.csrfToken) {
        req.session.csrfToken = crypto.randomBytes(32).toString('hex');
    }
    res.locals.csrfToken = req.session.csrfToken;
    next();
}

function verifyCsrf(req, res, next) {
    if (req.method !== 'POST') return next();
    const sent = req.body._csrf || req.headers['x-csrf-token'];
    if (!sent || sent !== req.session.csrfToken) {
        return res.status(419).send('CSRF token mismatch. Please refresh the page.');
    }
    next();
}

module.exports = { csrfToken, verifyCsrf };