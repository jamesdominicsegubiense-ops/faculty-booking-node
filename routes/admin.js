const express = require('express');
const bcrypt = require('bcryptjs');
const router = express.Router();
const pool = require('../config/database');
const { requireRole } = require('../middleware/auth');

const DEPARTMENTS = [
    'Computer Science', 'Information Technology', 'Information System',
    'Engineering', 'Business Administration',
];

router.use(requireRole('admin'));

/* ---------- DASHBOARD ---------- */
router.get('/dashboard', async (req, res) => {
    const [roles] = await pool.query("SELECT role, COUNT(*) AS c FROM users GROUP BY role");
    const stats = { students: 0, faculty: 0, admins: 0, bookings: 0 };
    roles.forEach(r => {
        if (r.role === 'student') stats.students = r.c;
        if (r.role === 'faculty') stats.faculty = r.c;
        if (r.role === 'admin') stats.admins = r.c;
    });
    const [[{ c: totalBookings }]] = await pool.query('SELECT COUNT(*) AS c FROM bookings');
    stats.bookings = totalBookings;

    const filter = ['All', 'student', 'faculty', 'admin'].includes(req.query.role)
        ? req.query.role : 'All';

    let sql = `SELECT u.id, u.full_name, u.email, u.role, u.is_active, p.department
               FROM users u LEFT JOIN faculty_profiles p ON p.user_id = u.id`;
    const params = [];
    if (filter !== 'All') { sql += ' WHERE u.role = ?'; params.push(filter); }
    sql += " ORDER BY FIELD(u.role,'admin','faculty','student'), u.full_name";

    const [users] = await pool.query(sql, params);

    res.render('admin-dashboard', {
        title: 'Admin Dashboard',
        stats, users, filter, departments: DEPARTMENTS,
    });
});

/* ---------- CREATE FACULTY ---------- */
router.post('/create-faculty', async (req, res) => {
    const { full_name, email, password, department, office_location, consultation_mode } = req.body;

    if (!full_name || !email || !password || password.length < 8 || !DEPARTMENTS.includes(department)) {
        req.flash('error', 'Please fill all required fields correctly.');
        return res.redirect('/admin/dashboard');
    }

    const [existing] = await pool.query('SELECT id FROM users WHERE email = ? LIMIT 1', [email]);
    if (existing.length) {
        req.flash('error', 'That email is already registered.');
        return res.redirect('/admin/dashboard');
    }

    const conn = await pool.getConnection();
    try {
        await conn.beginTransaction();
        const hash = await bcrypt.hash(password, 10);
        const [r] = await conn.query(
            "INSERT INTO users (full_name, email, password_hash, role) VALUES (?, ?, ?, 'faculty')",
            [full_name, email, hash]
        );
        await conn.query(
            'INSERT INTO faculty_profiles (user_id, department, office_location, bio, consultation_mode) VALUES (?, ?, ?, ?, ?)',
            [r.insertId, department, office_location || null, 'New faculty member.', consultation_mode]
        );
        await conn.commit();
        conn.release();
        req.flash('success', `Faculty account for ${full_name} created.`);
    } catch (err) {
        await conn.rollback(); conn.release();
        console.error(err);
        req.flash('error', 'Could not create faculty account.');
    }
    res.redirect('/admin/dashboard');
});

/* ---------- TOGGLE ACTIVE ---------- */
router.post('/toggle-active', async (req, res) => {
    const me = req.session.user;
    const id = parseInt(req.body.user_id, 10);
    if (!id || id === me.id) {
        req.flash('error', 'You cannot deactivate your own account.');
        return res.redirect('/admin/dashboard');
    }
    await pool.query('UPDATE users SET is_active = NOT is_active WHERE id = ?', [id]);
    req.flash('success', 'User status updated.');
    res.redirect('/admin/dashboard');
});

/* ---------- DELETE USER ---------- */
router.post('/delete-user', async (req, res) => {
    const me = req.session.user;
    const id = parseInt(req.body.user_id, 10);

    if (!id || id === me.id) {
        req.flash('error', 'You cannot delete your own account.');
        return res.redirect('/admin/dashboard');
    }

    const [target] = await pool.query('SELECT role FROM users WHERE id = ? LIMIT 1', [id]);
    if (!target.length) {
        req.flash('error', 'User not found.');
        return res.redirect('/admin/dashboard');
    }

    if (target[0].role === 'admin') {
        const [[{ c }]] = await pool.query("SELECT COUNT(*) AS c FROM users WHERE role = 'admin'");
        if (c <= 1) {
            req.flash('error', 'Cannot delete the last remaining admin.');
            return res.redirect('/admin/dashboard');
        }
    }

    await pool.query('DELETE FROM users WHERE id = ?', [id]);
    req.flash('success', 'User deleted.');
    res.redirect('/admin/dashboard');
});

/* ---------- FACULTY REPORT ---------- */
router.get('/faculty-report', async (req, res) => {
    const from = req.query.from || '';
    const to = req.query.to || '';

    let dateWhere = '';
    const params = [];
    if (/^\d{4}-\d{2}-\d{2}$/.test(from)) { dateWhere += ' AND b.booking_date >= ?'; params.push(from); }
    if (/^\d{4}-\d{2}-\d{2}$/.test(to))   { dateWhere += ' AND b.booking_date <= ?'; params.push(to); }

    const [rows] = await pool.query(`
        SELECT u.id, u.full_name, u.email, p.department, p.consultation_mode,
               COUNT(b.id) AS total_requests,
               SUM(CASE WHEN b.status='Pending'   THEN 1 ELSE 0 END) AS pending_count,
               SUM(CASE WHEN b.status='Approved'  THEN 1 ELSE 0 END) AS approved_count,
               SUM(CASE WHEN b.status='Completed' THEN 1 ELSE 0 END) AS completed_count,
               SUM(CASE WHEN b.status='Declined'  THEN 1 ELSE 0 END) AS declined_count,
               SUM(CASE WHEN b.status='Approved' AND b.booking_date >= CURDATE() THEN 1 ELSE 0 END) AS upcoming_count,
               MAX(CASE WHEN b.status='Completed' THEN b.booking_date END) AS last_consultation
        FROM users u
        INNER JOIN faculty_profiles p ON p.user_id = u.id
        LEFT JOIN bookings b ON b.faculty_id = u.id ${dateWhere}
        WHERE u.role = 'faculty'
        GROUP BY u.id, u.full_name, u.email, p.department, p.consultation_mode
        ORDER BY completed_count DESC, total_requests DESC, u.full_name
    `, params);

    const totals = { faculty: rows.length, total: 0, pending: 0, approved: 0, completed: 0, declined: 0, upcoming: 0, no_activity: 0 };
    rows.forEach(r => {
        totals.total     += Number(r.total_requests);
        totals.pending   += Number(r.pending_count);
        totals.approved  += Number(r.approved_count);
        totals.completed += Number(r.completed_count);
        totals.declined  += Number(r.declined_count);
        totals.upcoming  += Number(r.upcoming_count);
        if (Number(r.total_requests) === 0) totals.no_activity++;
    });

    res.render('admin-report', { title: 'Faculty Report', rows, totals, from, to });
});

/* ---------- EXPORT FACULTY REPORT AS CSV ---------- */
router.get('/faculty-report/export', async (req, res) => {
    const from = req.query.from || '';
    const to = req.query.to || '';

    let dateWhere = '';
    const params = [];
    if (/^\d{4}-\d{2}-\d{2}$/.test(from)) { dateWhere += ' AND b.booking_date >= ?'; params.push(from); }
    if (/^\d{4}-\d{2}-\d{2}$/.test(to))   { dateWhere += ' AND b.booking_date <= ?'; params.push(to); }

    const [rows] = await pool.query(`
        SELECT u.full_name, u.email, p.department, p.consultation_mode,
               COUNT(b.id) AS total_requests,
               SUM(CASE WHEN b.status='Pending'   THEN 1 ELSE 0 END) AS pending_count,
               SUM(CASE WHEN b.status='Approved'  THEN 1 ELSE 0 END) AS approved_count,
               SUM(CASE WHEN b.status='Completed' THEN 1 ELSE 0 END) AS completed_count,
               SUM(CASE WHEN b.status='Declined'  THEN 1 ELSE 0 END) AS declined_count,
               MAX(CASE WHEN b.status='Completed' THEN b.booking_date END) AS last_consultation
        FROM users u
        INNER JOIN faculty_profiles p ON p.user_id = u.id
        LEFT JOIN bookings b ON b.faculty_id = u.id ${dateWhere}
        WHERE u.role = 'faculty'
        GROUP BY u.id, u.full_name, u.email, p.department, p.consultation_mode
        ORDER BY completed_count DESC, total_requests DESC, u.full_name
    `, params);

    // Build CSV content
    const header = [
        'Faculty Name',
        'Email',
        'Department',
        'Consultation Mode',
        'Total Requests',
        'Pending',
        'Approved',
        'Completed',
        'Declined',
        'Last Consultation',
    ];

    const escapeCsv = (val) => {
        if (val === null || val === undefined) return '';
        const s = String(val);
        return /[",\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s;
    };

    let csv = header.join(',') + '\n';
    rows.forEach(r => {
        csv += [
            escapeCsv(r.full_name),
            escapeCsv(r.email),
            escapeCsv(r.department),
            escapeCsv(r.consultation_mode),
            r.total_requests,
            r.pending_count,
            r.approved_count,
            r.completed_count,
            r.declined_count,
            escapeCsv(r.last_consultation || ''),
        ].join(',') + '\n';
    });

    const filename = `faculty-report-${new Date().toISOString().slice(0,10)}.csv`;

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(csv);
});

module.exports = router;