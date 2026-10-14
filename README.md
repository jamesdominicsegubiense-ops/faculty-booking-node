# Faculink — Faculty Consultation Booking System

A web-based consultation booking platform for universities built with **Node.js + Express** and **MySQL**. Students book consultations with professors, faculty manage their availability, and admins oversee the system.

---

## 👥 Team Members

| Name | Role | GitHub |
|------|------|--------|
| James Dominic Segubiense | Lead Developer — Frontend, Backend, Database, Auth, UI/UX, CSS, JS| [@jamesdominicsegubiense-ops](https://github.com/jamesdominicsegubiense-ops) |
| Charlotte Montion | Frontend — UI/UX, CSS, JS | @chmontion-art(https://github.com/@chmontion-art) |
| Ej Alberto | QA / Documentation — Testing, Reports | [@member3username](https://github.com/member3username) |

---

## 🎯 Project Description

**Faculink** is a faculty consultation booking system providing a secure, role-based platform where:

- **Students** browse faculty, filter by department/mode, and book time slots.
- **Faculty** publish availability, approve/decline/complete requests, and manage profiles.
- **Admins** create faculty accounts, monitor users, and view consultation reports.

---

## ✨ Features

### Student
- Browse and filter faculty by department and consultation mode
- Interactive booking modal
- Track request status (Pending / Approved / Completed / Declined)
- Cancel pending requests

### Faculty
- Approve / decline / mark-as-complete requests
- Publish consultation slots
- Edit profile (office location, mode, bio)

### Admin
- Create faculty accounts
- Activate / deactivate / delete users
- Faculty consultation report with date-range filter

### Security
- bcrypt password hashing
- CSRF tokens on all POST forms
- Session hardening (`httponly`, `samesite=Lax`)
- Role-based access control
- SQL injection protection (prepared statements)
- Input validation on server + client

---

## 🛠️ Tech Stack

- **Backend:** Node.js, Express 4
- **View Engine:** EJS
- **Database:** MySQL / MariaDB via `mysql2`
- **Auth:** `bcryptjs` + `express-session`
- **Frontend:** HTML5, CSS3, Vanilla JavaScript

---

## 📦 Installation / Setup

### Prerequisites
- Node.js (v18+)
- XAMPP or MySQL running on port 3306
- Git

### Steps

1. **Clone the repo**
   ```bash
   git clone https://github.com/jamesdominicsegubiense-ops/faculty-booking-node.git
   cd faculty-booking-node
