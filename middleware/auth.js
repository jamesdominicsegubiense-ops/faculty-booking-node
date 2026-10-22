function requireLogin(req, res, next) {
    if (!req.session.user) {
        req.flash('error', 'Please log in first.');
        return res.redirect('/login');
    }
    next();
}

function requireRole(role) {
    return (req, res, next) => {
        if (!req.session.user) return res.redirect('/login');
        if (req.session.user.role !== role) {
            return res.status(403).render('403', { title: 'Forbidden' });
        }
        next();
    };
}

function injectLocals(req, res, next) {
    res.locals.user = req.session.user || null;
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    next();
}

module.exports = { requireLogin, requireRole, injectLocals };