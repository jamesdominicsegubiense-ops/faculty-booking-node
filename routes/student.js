const express = require('express');
const router = express.Router();
const pool = require('../config/database');
const { requireRole } = require('../middleware/auth');

router.get('/my-bookings', requireRole('student'), async (req, res) => {
    const me = req.session.user;
    const [bookings] = await pool.query(
        `SELECT b.*, u.full_name AS faculty_name, u.email AS faculty_email,
                p.department, p.consultation_mode, p.office_location
         FROM bookings b
         INNER JOIN users u ON u.id = b.faculty_id
         LEFT JOIN faculty_profiles p ON p.user_id = b.faculty_id
         WHERE b.student_id = ?
         ORDER BY b.booking_date DESC, b.start_time DESC`,
        [me.id]
    );
    res.render('my-bookings', { title: 'My Consultations', bookings });
});

router.post('/my-bookings/cancel', requireRole('student'), async (req, res) => {
    const me = req.session.user;
    const [result] = await pool.query(
        "DELETE FROM bookings WHERE id = ? AND student_id = ? AND status = 'Pending'",
        [req.body.booking_id, me.id]
    );
    req.flash(result.affectedRows ? 'success' : 'error',
              result.affectedRows ? 'Request cancelled.' : 'That booking cannot be cancelled.');
    res.redirect('/my-bookings');
});

module.exports = router;