<<<<<<< HEAD

---

### 2. `REQUIREMENTS.md`

```
# Requirements Document: Faculty Consultation Booking System

## 1. Users and Stakeholders

* **Students:** Primary users who need to book, view, and manage consultation schedules with faculty members.
* **Faculty Members:** Secondary users who manage their availability, view scheduled consultations, approve/decline appointments, and log consultation notes.
* **Administrators:** System managers responsible for user accounts, monitoring system activity, and overseeing bookings.
* **University Administration:** Stakeholders interested in increasing faculty-student engagement and tracking consultation metrics.

## 2. Functional Requirements

* **User Authentication:** Users (students and faculty) must be able to securely register, log in, and maintain a session.
* **Access Control:** Role-based access control ensuring students only see student booking features and faculty/admins see management dashboards.
* **Consultation Booking:** Students can select available time slots from faculty schedules and book consultation sessions with specific topics/purposes.
* **Double-Booking Prevention:** The system must prevent a student from booking a time slot that is already taken or pending.
* **Appointment Management:** Faculty members can view upcoming bookings and manage their appointment statuses (Approve, Decline, Complete).
* **Admin Management:** Admins can create faculty accounts, deactivate users, and export consultation reports.
* **Input Validation:** Form inputs (such as login credentials, booking forms, and user profile updates) must be validated on both client and server sides to prevent invalid data or injection.

## 3. Non-Functional Requirements

* **Security:** Passwords must be handled securely (hashed with bcrypt), and environment configuration must be protected (using `.env` and excluding it from version control).
* **Usability:** The user interface must be responsive, clean, and intuitive across standard desktop and mobile browsers.
* **Reliability & Performance:** Database queries should execute quickly, and the Node.js/Express server must handle concurrent user requests smoothly via XAMPP/MySQL.

## 4. Use Cases

* **UC1: Student Consultation Booking**
  * *Actor:* Student
  * *Description:* A student logs in, views available faculty time slots, selects a desired time, and submits a booking request.
* **UC2: Faculty Appointment Review**
  * *Actor:* Faculty Member
  * *Description:* A faculty member logs into their dashboard, reviews incoming student booking requests, and manages their schedule (Approve/Decline).
* **UC3: Admin User Management**
  * *Actor:* Administrator
  * *Description:* An admin logs in to create new faculty accounts and monitor the overall system activity.
=======

---

### 2. `REQUIREMENTS.md`

```
# Requirements Document: Faculty Consultation Booking System

## 1. Users and Stakeholders

* **Students:** Primary users who need to book, view, and manage consultation schedules with faculty members.
* **Faculty Members:** Secondary users who manage their availability, view scheduled consultations, approve/decline appointments, and log consultation notes.
* **Administrators:** System managers responsible for user accounts, monitoring system activity, and overseeing bookings.
* **University Administration:** Stakeholders interested in increasing faculty-student engagement and tracking consultation metrics.

## 2. Functional Requirements

* **User Authentication:** Users (students and faculty) must be able to securely register, log in, and maintain a session.
* **Access Control:** Role-based access control ensuring students only see student booking features and faculty/admins see management dashboards.
* **Consultation Booking:** Students can select available time slots from faculty schedules and book consultation sessions with specific topics/purposes.
* **Double-Booking Prevention:** The system must prevent a student from booking a time slot that is already taken or pending.
* **Appointment Management:** Faculty members can view upcoming bookings and manage their appointment statuses (Approve, Decline, Complete).
* **Admin Management:** Admins can create faculty accounts, deactivate users, and export consultation reports.
* **Input Validation:** Form inputs (such as login credentials, booking forms, and user profile updates) must be validated on both client and server sides to prevent invalid data or injection.

## 3. Non-Functional Requirements

* **Security:** Passwords must be handled securely (hashed with bcrypt), and environment configuration must be protected (using `.env` and excluding it from version control).
* **Usability:** The user interface must be responsive, clean, and intuitive across standard desktop and mobile browsers.
* **Reliability & Performance:** Database queries should execute quickly, and the Node.js/Express server must handle concurrent user requests smoothly via XAMPP/MySQL.

## 4. Use Cases

* **UC1: Student Consultation Booking**
  * *Actor:* Student
  * *Description:* A student logs in, views available faculty time slots, selects a desired time, and submits a booking request.
* **UC2: Faculty Appointment Review**
  * *Actor:* Faculty Member
  * *Description:* A faculty member logs into their dashboard, reviews incoming student booking requests, and manages their schedule (Approve/Decline).
* **UC3: Admin User Management**
  * *Actor:* Administrator
  * *Description:* An admin logs in to create new faculty accounts and monitor the overall system activity.
>>>>>>> 98287db4c16d25d1069fa965fa6d28af6520640d
