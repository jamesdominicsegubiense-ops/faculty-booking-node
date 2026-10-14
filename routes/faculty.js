const express = require('express');
const router = express.Router();
const pool = require('../config/database');
const { requireRole } = require('../middleware/auth');

router.use(requireRole('faculty'));

/* ---------- DASHBOARD ---------- */
router.get('/dashboard', async (req, res) => {
    const me = req.session.user;
    const filter = ['All', 'Pending', 'Approved', 'Completed', 'Declined'].includes(req.query.status)
        ? req.query.status : 'All';

    const [statRows] = await pool.query(
        "SELECT status, COUNT(*) AS total FROM bookings WHERE faculty_id = ? GROUP BY status",
        [me.id]
    );
    const stats = { Pending: 0, Approved: 0, Completed: 0, Declined: 0 };
    statRows.forEach(r => { if (r.status in stats) stats[r.status] = r.total; });

    let sql = `SELECT b.*, u.full_name AS student_name, u.email AS student_email
               FROM bookings b
               INNER JOIN users u ON u.id = b.student_id
               WHERE b.faculty_id = ?`;
    const params = [me.id];
    if (filter !== 'All') { sql += ' AND b.status = ?'; params.push(filter); }
    sql += ' ORDER BY b.booking_date DESC, b.start_time DESC';

    const [bookings] = await pool.query(sql, params);

    res.render('faculty-dashboard', {
        title: 'Faculty Dashboard',
        stats, bookings, filter,
    });
});

/* ---------- UPDATE STATUS ---------- */
router.post('/update-status', async (req, res) => {
    const me = req.session.user;
    const { booking_id, status } = req.body;

    if (!['Approved', 'Declined', 'Completed'].includes(status)) {
        req.flash('error', 'Invalid action.');
        return res.redirect('/faculty/dashboard');
    }

    const requiredFrom = status === 'Completed' ? 'Approved' : 'Pending';
    const [result] = await pool.query(
        'UPDATE bookings SET status = ? WHERE id = ? AND faculty_id = ? AND status = ?',
        [status, booking_id, me.id, requiredFrom]
    );

    req.flash(result.affectedRows ? 'success' : 'error',
              result.affectedRows ? `Booking marked as ${status}.` : 'Cannot update that booking.');
    res.redirect('/faculty/dashboard');
});

/* ---------- PROFILE ---------- */
router.get('/profile', async (req, res) => {
    const me = req.session.user;
    let [rows] = await pool.query('SELECT * FROM faculty_profiles WHERE user_id = ? LIMIT 1', [me.id]);
    let profile = rows[0];

    if (!profile) {
        await pool.query('INSERT INTO faculty_profiles (user_id, department) VALUES (?, ?)',
            [me.id, 'Computer Science']);
        [rows] = await pool.query('SELECT * FROM faculty_profiles WHERE user_id = ? LIMIT 1', [me.id]);
        profile = rows[0];
    }
    res.render('faculty-profile', { title: 'My Profile', profile });
});

router.post('/profile', async (req, res) => {
    const me = req.session.user;
    const { office_location, bio, consultation_mode } = req.body;

    if (!['In-Person', 'Online', 'Hybrid'].includes(consultation_mode)) {
        req.flash('error', 'Invalid consultation mode.');
        return res.redirect('/faculty/profile');
    }
    if ((bio || '').length > 1000 || (office_location || '').length > 100) {
        req.flash('error', 'Input too long.');
        return res.redirect('/faculty/profile');
    }

    await pool.query(
        `UPDATE faculty_profiles SET office_location = ?, bio = ?, consultation_mode = ?
         WHERE user_id = ?`,
        [office_location || null, bio || null, consultation_mode, me.id]
    );
    req.flash('success', 'Profile updated successfully.');
    res.redirect('/faculty/profile');
});

/* ---------- SCHEDULES ---------- */
router.get('/schedules', async (req, res) => {
    const me = req.session.user;
    const [schedules] = await pool.query(
        `SELECT * FROM schedules WHERE faculty_id = ?
         ORDER BY slot_date ASC, start_time ASC`,
        [me.id]
    );
    const activeCount = schedules.filter(s => s.is_active === 1).length;
    res.render('faculty-schedules', { title: 'My Schedule', schedules, activeCount });
});

router.post('/schedules/add', async (req, res) => {
    const me = req.session.user;
    const { slot_date, start_time, end_time } = req.body;

    if (!/^\d{4}-\d{2}-\d{2}$/.test(slot_date) || slot_date < new Date().toISOString().slice(0, 10)) {
        req.flash('error', 'Please choose a valid future date.');
        return res.redirect('/faculty/schedules');
    }
    if (!/^\d{2}:\d{2}$/.test(start_time) || !/^\d{2}:\d{2}$/.test(end_time) || start_time >= end_time) {
        req.flash('error', 'Invalid time range.');
        return res.redirect('/faculty/schedules');
    }

    const [overlap] = await pool.query(
        `SELECT id FROM schedules WHERE faculty_id = ? AND slot_date = ?
         AND is_active = 1 AND start_time < ? AND end_time > ? LIMIT 1`,
        [me.id, slot_date, end_time + ':00', start_time + ':00']
    );
    if (overlap.length) {
        req.flash('error', 'That slot overlaps with an existing schedule.');
        return res.redirect('/faculty/schedules');
    }

    const days = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
    const dayName = days[new Date(slot_date + 'T00:00:00').getDay()];

    await pool.query(
        'INSERT INTO schedules (faculty_id, slot_date, day_of_week, start_time, end_time, is_active) VALUES (?, ?, ?, ?, ?, 1)',
        [me.id, slot_date, dayName, start_time + ':00', end_time + ':00']
    );
    req.flash('success', `Slot added for ${slot_date}.`);
    res.redirect('/faculty/schedules');
});

router.post('/schedules/toggle', async (req, res) => {
    const me = req.session.user;
    await pool.query('UPDATE schedules SET is_active = NOT is_active WHERE id = ? AND faculty_id = ?',
        [req.body.schedule_id, me.id]);
    req.flash('success', 'Slot status updated.');
    res.redirect('/faculty/schedules');
});

router.post('/schedules/delete', async (req, res) => {
    const me = req.session.user;
    const id = req.body.schedule_id;

    const [[{ cnt }]] = await pool.query(
        `SELECT COUNT(*) AS cnt FROM bookings WHERE schedule_id = ?
         AND status IN ('Pending','Approved') AND booking_date >= CURDATE()`,
        [id]
    );
    if (cnt > 0) {
        req.flash('error', 'Cannot delete — this slot has upcoming bookings.');
        return res.redirect('/faculty/schedules');
    }

    await pool.query('DELETE FROM schedules WHERE id = ? AND faculty_id = ?', [id, me.id]);
    req.flash('success', 'Slot removed.');
    res.redirect('/faculty/schedules');
});

module.exports = router;