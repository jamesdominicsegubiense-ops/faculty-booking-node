const express = require('express');
const router = express.Router();
const pool = require('../config/database');

const DEPARTMENTS = [
    'Computer Science',
    'Information Technology',
    'Information System',
    'Engineering',
    'Business Administration',
];

/* ---------- HOMEPAGE ---------- */
router.get('/', async (req, res) => {
    const q = (req.query.q || '').trim();
    const dept = (req.query.dept || '').trim();
    const mode = (req.query.mode || '').trim();

    let sql = `SELECT u.id, u.full_name, u.email,
                      p.department, p.office_location, p.bio, p.consultation_mode
               FROM users u
               INNER JOIN faculty_profiles p ON p.user_id = u.id
               WHERE u.role = 'faculty' AND u.is_active = 1`;
    const params = [];

    if (q) {
        sql += ' AND (u.full_name LIKE ? OR p.department LIKE ? OR p.bio LIKE ?)';
        params.push(`%${q}%`, `%${q}%`, `%${q}%`);
    }
    if (dept) { sql += ' AND p.department = ?'; params.push(dept); }
    if (mode) { sql += ' AND p.consultation_mode = ?'; params.push(mode); }
    sql += ' ORDER BY u.full_name ASC';

    const [facultyList] = await pool.query(sql, params);

    // Schedules
    const schedulesByFaculty = {};
    if (facultyList.length) {
        const ids = facultyList.map(f => f.id);
        const [schedules] = await pool.query(
            `SELECT id, faculty_id, day_of_week, slot_date, start_time, end_time
             FROM schedules
             WHERE is_active = 1 AND faculty_id IN (?)
             ORDER BY slot_date ASC, start_time ASC`,
            [ids]
        );
        schedules.forEach(s => {
            if (!schedulesByFaculty[s.faculty_id]) schedulesByFaculty[s.faculty_id] = [];
            schedulesByFaculty[s.faculty_id].push({
                id: s.id,
                day_of_week: s.day_of_week,
                slot_date: s.slot_date,
                start_time: s.start_time,
                end_time: s.end_time,
            });
        });
    }

    res.render('index', {
        title: 'Home',
        facultyList,
        departments: DEPARTMENTS,
        schedulesByFaculty,
        q, dept, mode,
    });
});

/* ---------- BOOK ACTION (JSON) ---------- */
router.post('/book-action', async (req, res) => {
    const respond = (ok, message, extra = {}, status = 200) =>
        res.status(status).json({ ok, message, ...extra });

    const user = req.session.user;
    if (!user) return respond(false, 'Please log in to book.', {}, 401);
    if (user.role !== 'student') return respond(false, 'Only students can book.', {}, 403);

    const { faculty_id, schedule_id, booking_date, purpose, notes } = req.body;

    if (!faculty_id || !schedule_id) return respond(false, 'Invalid selection.', {}, 422);
    if (!booking_date || booking_date < new Date().toISOString().slice(0, 10))
        return respond(false, 'Please choose a valid future date.', {}, 422);
    if (!purpose || purpose.length > 150)
        return respond(false, 'Purpose is required (max 150 chars).', {}, 422);
    if (notes && notes.length > 500) return respond(false, 'Notes max 500 chars.', {}, 422);

    const conn = await pool.getConnection();
    try {
        const [slots] = await conn.query(
            'SELECT * FROM schedules WHERE id = ? AND faculty_id = ? AND is_active = 1 LIMIT 1',
            [schedule_id, faculty_id]
        );
        if (!slots.length) { conn.release(); return respond(false, 'Slot not available.', {}, 404); }
        const slot = slots[0];

        // Date/day match check
        if (slot.slot_date) {
            if (booking_date !== slot.slot_date) {
                conn.release();
                return respond(false, `That slot is only available on ${slot.slot_date}.`, {}, 422);
            }
        } else {
            const days = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
            const reqDay = days[new Date(booking_date + 'T00:00:00').getDay()];
            if (reqDay !== slot.day_of_week) {
                conn.release();
                return respond(false, 'Date does not match slot\'s day of week.', {}, 422);
            }
        }

        await conn.beginTransaction();

        const [existing] = await conn.query(
            `SELECT id FROM bookings
             WHERE faculty_id = ? AND booking_date = ?
               AND status IN ('Pending','Approved')
               AND start_time < ? AND end_time > ?
             FOR UPDATE`,
            [faculty_id, booking_date, slot.end_time, slot.start_time]
        );

        if (existing.length) {
            await conn.rollback(); conn.release();
            return respond(false, 'Sorry, that slot was just taken.', {}, 409);
        }

        const [result] = await conn.query(
            `INSERT INTO bookings
                (student_id, faculty_id, schedule_id, booking_date, start_time, end_time, purpose, notes, status)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'Pending')`,
            [user.id, faculty_id, schedule_id, booking_date, slot.start_time, slot.end_time, purpose, notes || null]
        );

        await conn.commit();
        conn.release();
        respond(true, 'Request submitted! Wait for faculty to review.', {
            booking_id: result.insertId,
            status: 'Pending',
        });
    } catch (err) {
        await conn.rollback(); conn.release();
        console.error(err);
        respond(false, 'Something went wrong.', {}, 500);
    }
});

module.exports = router;