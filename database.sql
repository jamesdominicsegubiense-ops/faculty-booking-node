DROP DATABASE IF EXISTS faculty_booking_db;
CREATE DATABASE faculty_booking_db
    DEFAULT CHARACTER SET utf8mb4
    DEFAULT COLLATE utf8mb4_unicode_ci;
USE faculty_booking_db;

CREATE TABLE users (
    id            INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    full_name     VARCHAR(100)  NOT NULL,
    email         VARCHAR(150)  NOT NULL,
    password_hash VARCHAR(255)  NOT NULL,
    role          ENUM('student','faculty','admin') NOT NULL DEFAULT 'student',
    is_active     TINYINT(1)    NOT NULL DEFAULT 1,
    created_at    TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY uq_users_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE faculty_profiles (
    id                INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id           INT UNSIGNED NOT NULL,
    department        VARCHAR(100) NOT NULL,
    office_location   VARCHAR(100) DEFAULT NULL,
    bio               TEXT         DEFAULT NULL,
    consultation_mode ENUM('In-Person','Online','Hybrid') NOT NULL DEFAULT 'In-Person',
    created_at        TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY uq_profile_user (user_id),
    CONSTRAINT fk_profile_user FOREIGN KEY (user_id) REFERENCES users(id)
        ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE schedules (
    id          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    faculty_id  INT UNSIGNED NOT NULL,
    slot_date   DATE NULL,
    day_of_week ENUM('Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday') NOT NULL,
    start_time  TIME NOT NULL,
    end_time    TIME NOT NULL,
    is_active   TINYINT(1) NOT NULL DEFAULT 1,
    created_at  TIMESTAMP  NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_sched_faculty FOREIGN KEY (faculty_id) REFERENCES users(id)
        ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE bookings (
    id           INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    student_id   INT UNSIGNED NOT NULL,
    faculty_id   INT UNSIGNED NOT NULL,
    schedule_id  INT UNSIGNED DEFAULT NULL,
    booking_date DATE NOT NULL,
    start_time   TIME NOT NULL,
    end_time     TIME NOT NULL,
    purpose      VARCHAR(150) NOT NULL,
    notes        VARCHAR(500) DEFAULT NULL,
    status       ENUM('Pending','Approved','Completed','Declined') NOT NULL DEFAULT 'Pending',
    created_at   TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at   TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_book_student FOREIGN KEY (student_id) REFERENCES users(id)
        ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_book_faculty FOREIGN KEY (faculty_id) REFERENCES users(id)
        ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_book_schedule FOREIGN KEY (schedule_id) REFERENCES schedules(id)
        ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- SEED DATA — password for ALL: password123
-- Hash generated with bcryptjs (10 rounds)
INSERT INTO users (full_name, email, password_hash, role) VALUES
('Dr. Elena Marquez',   'elena.marquez@university.edu',  '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'faculty'),
('Prof. Daniel Okafor', 'daniel.okafor@university.edu',  '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'faculty'),
('Dr. Sofia Reyes',     'sofia.reyes@university.edu',    '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'faculty'),
('Mark Villanueva',     'mark.villanueva@student.edu',   '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'student'),
('Admin User',          'admin@university.edu',          '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'admin');

INSERT INTO faculty_profiles (user_id, department, office_location, bio, consultation_mode) VALUES
(1, 'Computer Science', 'Room 304, Tech Building', 'Specializes in databases and software architecture.', 'In-Person'),
(2, 'Information System', 'Room 212, Science Hall', 'Focuses on networking and cybersecurity.', 'Hybrid'),
(3, 'Information Technology', 'Online / Room 118, IT Center', 'Cloud infrastructure specialist.', 'Online');