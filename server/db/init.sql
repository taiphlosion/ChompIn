-- initial tables

-- USERS
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash TEXT,
    auth_provider VARCHAR(20) DEFAULT 'local',
    role VARCHAR(20) CHECK (role IN ('student', 'professor')) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- TIME BLOCKS
CREATE TABLE IF NOT EXISTS time_blocks (
    id SERIAL PRIMARY KEY,
    block_number INTEGER UNIQUE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL
);

-- CLASSROOMS
CREATE TABLE IF NOT EXISTS classrooms (
    id SERIAL PRIMARY KEY,
    professor_id INTEGER NOT NULL REFERENCES users(id),
    class_name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- New scheduling fields
    days_of_week TEXT[], -- e.g., ARRAY['M','W','F']
    time_block_id INTEGER REFERENCES time_blocks(id),
    start_date DATE,
    end_date DATE,

    canvas_course_id BIGINT,
    canvas_assignment_id BIGINT
);

-- ENROLLMENTS (student <-> class relationship)
CREATE TABLE IF NOT EXISTS enrollments (
    id SERIAL PRIMARY KEY,
    student_id INTEGER NOT NULL REFERENCES users(id),
    classroom_id INTEGER NOT NULL REFERENCES classrooms(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(student_id, classroom_id)
);

-- SESSIONS
CREATE TABLE IF NOT EXISTS sessions (
    id SERIAL PRIMARY KEY,
    session_id VARCHAR(255) UNIQUE NOT NULL,
    classroom_id INTEGER NOT NULL REFERENCES classrooms(id),
    professor_id INTEGER NOT NULL REFERENCES users(id),
    session_date DATE NOT NULL DEFAULT CURRENT_DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP NOT NULL
);

-- ATTENDANCE (rich history)
CREATE TABLE IF NOT EXISTS attendance (
    id SERIAL PRIMARY KEY,
    session_id VARCHAR(255) NOT NULL REFERENCES sessions(session_id),
    student_id INTEGER NOT NULL REFERENCES users(id),
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(20) CHECK (status IN ('present', 'late', 'absent')) DEFAULT 'present',
    UNIQUE(session_id, student_id)
);

-- ATTENDANCE SUMMARY (cumulative)
CREATE TABLE IF NOT EXISTS attendance_summary (
    id SERIAL PRIMARY KEY,
    student_id INTEGER NOT NULL REFERENCES users(id),
    classroom_id INTEGER NOT NULL REFERENCES classrooms(id),
    total_sessions INTEGER DEFAULT 0,
    present_count INTEGER DEFAULT 0,
    late_count INTEGER DEFAULT 0,
    absent_count INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(student_id, classroom_id)
);

---------------------------------------------
---- SAMPLE DATA WHEN CREATING THE VOLUME----
---------------------------------------------

-- INSERT BLOCK TIMES (converted from ET to 24-hour format)
INSERT INTO time_blocks (block_number, start_time, end_time) VALUES
(1, '07:25', '08:15'),
(2, '08:30', '09:20'),
(3, '09:35', '10:25'),
(4, '10:40', '11:30'),
(5, '11:45', '12:35'),
(6, '12:50', '13:40'),
(7, '13:55', '14:45'),
(8, '15:00', '15:50'),
(9, '16:05', '16:55'),
(10, '17:10', '18:00'),
(11, '18:15', '19:05'),
(12, '19:20', '20:10'),
(13, '20:25', '21:15'),
(14, '21:30', '22:20');

-- SEED DATA FOR USERS
INSERT INTO users (id, first_name, last_name, email, password_hash, auth_provider, role, created_at) VALUES
(1, 'John', 'Doe', 'johndoe@ufl.edu', '$2a$10$sccyzharPgmVIYkVzTSXhOBQsJsbbn3FNps1VJdPBNoIyRBJYaTS.', 'local', 'student', '2025-04-17 03:48:44.636598'),
(2, 'Jane', 'Doe', 'janedoe@ufl.edu', '$2a$10$4q/QiDgIJXaDjPnFxjyPiu0pwxZOahsRPXdyRVBwLpmlLcfyYmCHe', 'local', 'professor', '2025-04-17 03:48:53.645067'),
(3, 'Dr.', 'Smith', 'smith@school.edu', '$2a$10$/.K3gIeE52ViTmiz6ubYhus1L660zBmDk7Kx/7/YrY8SyhcQU1jjK', 'local', 'professor', '2025-04-17 04:52:38.551904'),
(4, 'Carol', 'Kim', 'carol@school.edu', '$2a$10$qeqK2s7B3fycPbS1v9dIAOkObk4s66dRf6CJHngNDLRaIp5sYvW8y', 'local', 'student', '2025-04-17 04:54:35.154392'),
(5, 'Bob', 'Lee', 'bob@school.edu', '$2a$10$S9PgOe4CohKG0RVd7hP6tuS9uvMKmZwzODhHvPyUUfn2SLm1uMrnu', 'local', 'student', '2025-04-17 04:54:50.949731'),
(6, 'Alice', 'Nguyen', 'alice@school.edu', '$2a$10$A6Bhs.e9HIMJyRPEWHHO9.x1kb3TQmMEvBGLGu9Toek5gsdNepg1u', 'local', 'student', '2025-04-17 04:55:14.486431'),
(7, 'Kevin', 'Zamora', 'kevin@school.edu', '$2a$10$26SjlUog47hiPeqdCOr73.O1Y2SfJo6Zx6fOSEWWXwJ43uBQtp4WC', 'local', 'student', '2025-04-17 05:05:06.794957'),
(8, 'Emily', 'Pecker', 'emily@school.edu', '$2a$10$94LfG28ewOKqHGIlkmOjqOzLTNM5JVtiTpeSScgnlrPoaecXEvPui', 'local', 'student', '2025-04-17 05:05:19.887474'),
(9, 'Mason', 'Porter', 'mason@school.edu', '$2a$10$ed8kCU7ECj3I7WMGcAxdKefipFssXIt97npaZxnIjqOJ4qbxhos/y', 'local', 'student', '2025-04-17 05:05:30.519885'),
(10, 'Leo', 'Starfire', 'leo@school.edu', '$2a$10$O1PcNjt6/wqAzrECTZuzMu2ksMKN4q/0dQ7sFzLgBRQXHmfoJUcHi', 'local', 'student', '2025-04-17 05:05:40.487149'),
(11, 'Roger', 'Stone', 'roger@school.edu', '$2a$10$qk.yT446GREeKtgFzVb8jOG5oB8O4MUNYDJ9mQNGxMDV6HINx7tJi', 'local', 'professor', '2025-04-17 05:07:05.336943');

-- Reset the sequence to continue after our manually inserted IDs
SELECT setval('users_id_seq', (SELECT MAX(id) FROM users));

-- SEED DATA FOR CLASSROOMS
INSERT INTO classrooms (id, professor_id, class_name, created_at, canvas_course_id, canvas_assignment_id) VALUES
(1, 2, 'Intro to Information and Databases', '2025-04-17 04:57:39.470464', NULL, NULL),
(2, 2, 'Operating Systems', '2025-04-17 04:57:46.207921', NULL, NULL),
(3, 3, 'General Chemistry', '2025-04-17 04:59:11.134102', NULL, NULL),
(4, 3, 'Literature', '2025-04-17 04:59:21.753908', NULL, NULL),
(5, 11, 'Fluid Dynamics', '2025-04-17 05:07:19.064596', NULL, NULL),
(6, 11, 'Engineering Materials', '2025-04-17 05:07:27.82461', NULL, NULL),
(7, 2, 'Advanced Programming Concepts', '2025-04-17 06:30:45.470464', NULL, NULL),
(8, 2, 'Data Mining', '2025-04-17 06:31:22.207921', NULL, NULL),
(9, 3, 'Organic Chemistry', '2025-04-17 06:32:11.134102', NULL, NULL),
(10, 3, 'World Literature', '2025-04-17 06:32:55.753908', NULL, NULL),
(11, 11, 'Thermodynamics', '2025-04-17 06:33:19.064596', NULL, NULL),
(12, 11, 'Advanced Materials Science', '2025-04-17 06:34:27.82461', NULL, NULL);

-- Reset the sequence
SELECT setval('classrooms_id_seq', (SELECT MAX(id) FROM classrooms));

-- SEED DATA FOR ENROLLMENTS
INSERT INTO enrollments (id, student_id, classroom_id, created_at) VALUES
(1, 1, 1, '2025-04-17 05:22:46.775605'),
(2, 1, 2, '2025-04-17 05:22:46.775605'),
(3, 1, 3, '2025-04-17 05:22:46.775605'),
(4, 4, 2, '2025-04-17 05:22:46.775605'),
(5, 4, 1, '2025-04-17 05:22:46.775605'),
(6, 4, 4, '2025-04-17 05:22:46.775605'),
(7, 5, 1, '2025-04-17 05:22:46.775605'),
(8, 5, 2, '2025-04-17 05:22:46.775605'),
(9, 5, 6, '2025-04-17 05:22:46.775605'),
(10, 6, 2, '2025-04-17 05:22:46.775605'),
(11, 6, 5, '2025-04-17 05:22:46.775605'),
(12, 6, 6, '2025-04-17 05:22:46.775605'),
(13, 7, 3, '2025-04-17 05:22:46.775605'),
(14, 8, 4, '2025-04-17 05:22:46.775605'),
(15, 8, 3, '2025-04-17 05:22:46.775605'),
(16, 9, 1, '2025-04-17 05:22:46.775605'),
(17, 9, 5, '2025-04-17 05:22:46.775605'),
(18, 9, 6, '2025-04-17 05:22:46.775605'),
(19, 9, 2, '2025-04-17 05:22:46.775605'),
(20, 10, 5, '2025-04-17 05:22:46.775605'),
(21, 10, 6, '2025-04-17 05:22:46.775605'),
(22, 10, 1, '2025-04-17 05:22:46.775605'),
(23, 10, 2, '2025-04-17 05:22:46.775605'),
(24, 10, 3, '2025-04-17 05:22:46.775605'),
(25, 7, 1, '2025-04-17 06:35:46.775605'),
(26, 7, 2, '2025-04-17 06:35:46.775605'),
(27, 7, 5, '2025-04-17 06:35:46.775605'),
(28, 8, 1, '2025-04-17 06:35:46.775605'),
(29, 8, 2, '2025-04-17 06:35:46.775605'),
(30, 8, 5, '2025-04-17 06:35:46.775605'),
(31, 8, 6, '2025-04-17 06:35:46.775605'),
(32, 1, 7, '2025-04-17 06:35:46.775605'),
(33, 1, 8, '2025-04-17 06:35:46.775605'),
(34, 4, 7, '2025-04-17 06:35:46.775605'),
(35, 4, 8, '2025-04-17 06:35:46.775605'),
(36, 5, 7, '2025-04-17 06:35:46.775605'),
(37, 5, 9, '2025-04-17 06:35:46.775605'),
(38, 6, 8, '2025-04-17 06:35:46.775605'),
(39, 6, 10, '2025-04-17 06:35:46.775605'),
(40, 7, 8, '2025-04-17 06:35:46.775605'),
(41, 7, 9, '2025-04-17 06:35:46.775605'),
(42, 8, 8, '2025-04-17 06:35:46.775605'),
(43, 8, 10, '2025-04-17 06:35:46.775605'),
(44, 9, 7, '2025-04-17 06:35:46.775605'),
(45, 9, 10, '2025-04-17 06:35:46.775605'),
(46, 10, 7, '2025-04-17 06:35:46.775605'),
(47, 10, 11, '2025-04-17 06:35:46.775605'),
(48, 10, 12, '2025-04-17 06:35:46.775605');

-- Reset the sequence
SELECT setval('enrollments_id_seq', (SELECT MAX(id) FROM enrollments));

-- SEED DATA FOR SESSIONS
INSERT INTO sessions (id, session_id, classroom_id, professor_id, session_date, created_at, expires_at) VALUES
(1, 'session_1744362000000', 1, 2, '2025-04-11', '2025-04-11 09:00:00', '2025-04-11 10:30:00'),
(2, 'session_1744448400000', 1, 2, '2025-04-12', '2025-04-12 09:00:00', '2025-04-12 10:30:00'),
(3, 'session_1744534800000', 2, 2, '2025-04-13', '2025-04-13 09:00:00', '2025-04-13 10:30:00'),
(4, 'session_1744621200000', 2, 2, '2025-04-14', '2025-04-14 09:00:00', '2025-04-14 10:30:00'),
(5, 'session_1744707600000', 3, 3, '2025-04-15', '2025-04-15 09:00:00', '2025-04-15 10:30:00'),
(6, 'session_1744794000000', 3, 3, '2025-04-16', '2025-04-16 09:00:00', '2025-04-16 10:30:00'),
(7, 'session_1744880400000', 4, 3, '2025-04-17', '2025-04-17 09:00:00', '2025-04-17 10:30:00'),
(8, 'session_1744966800000', 4, 3, '2025-04-18', '2025-04-18 09:00:00', '2025-04-18 10:30:00'),
(9, 'session_1745053200000', 5, 11, '2025-04-19', '2025-04-19 09:00:00', '2025-04-19 10:30:00'),
(10, 'session_1745139600000', 5, 11, '2025-04-20', '2025-04-20 09:00:00', '2025-04-20 10:30:00'),
(11, 'session_1745226000000', 6, 11, '2025-04-21', '2025-04-21 09:00:00', '2025-04-21 10:30:00'),
(12, 'session_1745312400000', 6, 11, '2025-04-22', '2025-04-22 09:00:00', '2025-04-22 10:30:00'),
(13, 'session_1745398800000', 1, 2, '2025-04-23', '2025-04-23 09:00:00', '2025-04-23 10:30:00'),
(14, 'session_1745485200000', 2, 2, '2025-04-24', '2025-04-24 09:00:00', '2025-04-24 10:30:00'),
(15, 'session_1745571600000', 3, 3, '2025-04-25', '2025-04-25 09:00:00', '2025-04-25 10:30:00'),
(16, 'session_1745658000000', 4, 3, '2025-04-26', '2025-04-26 09:00:00', '2025-04-26 10:30:00'),
(17, 'session_1745744400000', 5, 11, '2025-04-27', '2025-04-27 09:00:00', '2025-04-27 10:30:00'),
(18, 'session_1745830800000', 6, 11, '2025-04-28', '2025-04-28 09:00:00', '2025-04-28 10:30:00'),
(19, 'session_1745917200000', 7, 2, '2025-04-29', '2025-04-29 14:00:00', '2025-04-29 15:30:00'),
(20, 'session_1746003600000', 8, 2, '2025-04-30', '2025-04-30 14:00:00', '2025-04-30 15:30:00'),
(21, 'session_1746090000000', 9, 3, '2025-05-01', '2025-05-01 14:00:00', '2025-05-01 15:30:00'),
(22, 'session_1746176400000', 10, 3, '2025-05-02', '2025-05-02 14:00:00', '2025-05-02 15:30:00'),
(23, 'session_1746262800000', 11, 11, '2025-05-03', '2025-05-03 14:00:00', '2025-05-03 15:30:00'),
(24, 'session_1746349200000', 12, 11, '2025-05-04', '2025-05-04 14:00:00', '2025-05-04 15:30:00');


-- Reset the sequence
SELECT setval('sessions_id_seq', (SELECT MAX(id) FROM sessions));

-- SEED DATA FOR ATTENDANCE
INSERT INTO attendance (id, session_id, student_id, timestamp, status) VALUES
(1, 'session_1744362000000', 1, NULL, 'absent'),
(2, 'session_1744362000000', 4, NULL, 'absent'),
(3, 'session_1744362000000', 5, '2025-04-11 09:07:00', 'present'),
(4, 'session_1744362000000', 9, '2025-04-11 09:00:00', 'present'),
(5, 'session_1744362000000', 10, NULL, 'absent'),
(6, 'session_1744448400000', 1, '2025-04-12 09:01:00', 'present'),
(7, 'session_1744448400000', 4, '2025-04-12 09:09:00', 'present'),
(8, 'session_1744448400000', 5, NULL, 'absent'),
(9, 'session_1744448400000', 9, '2025-04-12 09:02:00', 'present'),
(10, 'session_1744448400000', 10, NULL, 'absent'),
(11, 'session_1744534800000', 1, '2025-04-13 09:06:00', 'present'),
(12, 'session_1744534800000', 4, '2025-04-13 09:04:00', 'present'),
(13, 'session_1744534800000', 5, '2025-04-13 09:03:00', 'present'),
(14, 'session_1744534800000', 6, '2025-04-13 09:09:00', 'present'),
(15, 'session_1744534800000', 9, NULL, 'absent'),
(16, 'session_1744534800000', 10, NULL, 'absent'),
(17, 'session_1744621200000', 1, '2025-04-14 09:07:00', 'present'),
(18, 'session_1744621200000', 4, NULL, 'absent'),
(19, 'session_1744621200000', 5, '2025-04-14 09:05:00', 'present'),
(20, 'session_1744621200000', 6, '2025-04-14 09:04:00', 'present'),
(21, 'session_1744621200000', 9, '2025-04-14 09:02:00', 'present'),
(22, 'session_1744621200000', 10, '2025-04-14 09:02:00', 'present'),
(23, 'session_1744707600000', 1, NULL, 'absent'),
(24, 'session_1744707600000', 7, NULL, 'absent'),
(25, 'session_1744707600000', 8, '2025-04-15 09:04:00', 'present'),
(26, 'session_1744707600000', 10, NULL, 'absent'),
(27, 'session_1744794000000', 1, NULL, 'absent'),
(28, 'session_1744794000000', 7, '2025-04-16 09:01:00', 'present'),
(29, 'session_1744794000000', 8, '2025-04-16 09:10:00', 'present'),
(30, 'session_1744794000000', 10, '2025-04-16 09:01:00', 'present'),
(31, 'session_1744880400000', 4, NULL, 'absent'),
(32, 'session_1744880400000', 8, '2025-04-17 09:07:00', 'present'),
(33, 'session_1744966800000', 4, '2025-04-18 09:02:00', 'present'),
(34, 'session_1744966800000', 8, NULL, 'absent'),
(35, 'session_1745053200000', 6, '2025-04-19 09:00:00', 'present'),
(36, 'session_1745053200000', 9, '2025-04-19 09:10:00', 'present'),
(37, 'session_1745053200000', 10, '2025-04-19 09:04:00', 'present'),
(38, 'session_1745139600000', 6, NULL, 'absent'),
(39, 'session_1745139600000', 9, NULL, 'absent'),
(40, 'session_1745139600000', 10, '2025-04-20 09:05:00', 'present'),
(41, 'session_1745226000000', 5, '2025-04-21 09:05:00', 'present'),
(42, 'session_1745226000000', 6, '2025-04-21 09:05:00', 'present'),
(43, 'session_1745226000000', 9, '2025-04-21 09:05:00', 'present'),
(44, 'session_1745226000000', 10, '2025-04-21 09:06:00', 'present'),
(45, 'session_1745312400000', 5, '2025-04-22 09:08:00', 'present'),
(46, 'session_1745312400000', 6, NULL, 'absent'),
(47, 'session_1745312400000', 9, '2025-04-22 09:01:00', 'present'),
(48, 'session_1745312400000', 10, NULL, 'absent'),
(49, 'session_1745398800000', 1, '2025-04-23 09:02:00', 'present'),
(50, 'session_1745398800000', 4, '2025-04-23 09:03:00', 'present'),
(51, 'session_1745398800000', 5, '2025-04-23 09:01:00', 'present'),
(52, 'session_1745398800000', 7, '2025-04-23 09:05:00', 'present'),
(53, 'session_1745398800000', 8, NULL, 'absent'),
(54, 'session_1745398800000', 9, '2025-04-23 09:00:00', 'present'),
(55, 'session_1745398800000', 10, '2025-04-23 09:04:00', 'present'),
(56, 'session_1745485200000', 1, '2025-04-24 09:01:00', 'present'),
(57, 'session_1745485200000', 4, NULL, 'absent'),
(58, 'session_1745485200000', 5, '2025-04-24 09:03:00', 'present'),
(59, 'session_1745485200000', 6, '2025-04-24 09:05:00', 'present'),
(60, 'session_1745485200000', 7, '2025-04-24 09:00:00', 'present'),
(61, 'session_1745485200000', 8, '2025-04-24 09:02:00', 'present'),
(62, 'session_1745485200000', 9, '2025-04-24 09:04:00', 'present'),
(63, 'session_1745485200000', 10, NULL, 'absent'),
(64, 'session_1745571600000', 1, '2025-04-25 09:02:00', 'present'),
(65, 'session_1745571600000', 7, '2025-04-25 09:01:00', 'present'),
(66, 'session_1745571600000', 8, '2025-04-25 09:00:00', 'present'),
(67, 'session_1745571600000', 10, NULL, 'absent'),
(68, 'session_1745658000000', 4, '2025-04-26 09:01:00', 'present'),
(69, 'session_1745658000000', 8, '2025-04-26 09:00:00', 'present'),
(70, 'session_1745744400000', 6, NULL, 'absent'),
(71, 'session_1745744400000', 7, '2025-04-27 09:02:00', 'present'),
(72, 'session_1745744400000', 8, '2025-04-27 09:00:00', 'present'),
(73, 'session_1745744400000', 9, '2025-04-27 09:01:00', 'present'),
(74, 'session_1745744400000', 10, '2025-04-27 09:03:00', 'present'),
(75, 'session_1745830800000', 5, '2025-04-28 09:00:00', 'present'),
(76, 'session_1745830800000', 6, '2025-04-28 09:01:00', 'present'),
(77, 'session_1745830800000', 8, NULL, 'absent'),
(78, 'session_1745830800000', 9, '2025-04-28 09:03:00', 'present'),
(79, 'session_1745830800000', 10, '2025-04-28 09:02:00', 'present'),
(80, 'session_1745917200000', 1, '2025-04-29 14:01:00', 'present'),
(81, 'session_1745917200000', 4, '2025-04-29 14:03:00', 'present'),
(82, 'session_1745917200000', 5, NULL, 'absent'),
(83, 'session_1745917200000', 9, '2025-04-29 14:00:00', 'present'),
(84, 'session_1745917200000', 10, '2025-04-29 14:02:00', 'present'),
(85, 'session_1746003600000', 1, '2025-04-30 14:00:00', 'present'),
(86, 'session_1746003600000', 4, NULL, 'absent'),
(87, 'session_1746003600000', 6, '2025-04-30 14:01:00', 'present'),
(88, 'session_1746003600000', 7, '2025-04-30 14:03:00', 'present'),
(89, 'session_1746003600000', 8, '2025-04-30 14:02:00', 'present'),
(90, 'session_1746090000000', 5, '2025-05-01 14:00:00', 'present'),
(91, 'session_1746090000000', 7, '2025-05-01 14:01:00', 'present'),
(92, 'session_1746176400000', 6, NULL, 'absent'),
(93, 'session_1746176400000', 8, '2025-05-02 14:00:00', 'present'),
(94, 'session_1746176400000', 9, '2025-05-02 14:01:00', 'present'),
(95, 'session_1746262800000', 10, '2025-05-03 14:00:00', 'present'),
(96, 'session_1746349200000', 10, '2025-05-04 14:00:00', 'present');

-- Reset the sequence
SELECT setval('attendance_id_seq', (SELECT MAX(id) FROM attendance));

-- SEED DATA FOR ATTENDANCE SUMMARY
INSERT INTO attendance_summary (id, student_id, classroom_id, total_sessions, present_count, late_count, absent_count, created_at, updated_at) VALUES
(1, 1, 1, 2, 1, 0, 1, '2025-04-11 09:00:00', '2025-04-12 09:00:00'),
(2, 4, 1, 2, 1, 0, 1, '2025-04-11 09:00:00', '2025-04-12 09:00:00'),
(3, 5, 1, 2, 1, 0, 1, '2025-04-11 09:00:00', '2025-04-12 09:00:00'),
(4, 9, 1, 2, 2, 0, 0, '2025-04-11 09:00:00', '2025-04-12 09:00:00'),
(5, 10, 1, 2, 0, 0, 2, '2025-04-11 09:00:00', '2025-04-12 09:00:00'),
(6, 1, 2, 2, 2, 0, 0, '2025-04-11 09:00:00', '2025-04-12 09:00:00'),
(7, 4, 2, 2, 1, 0, 1, '2025-04-11 09:00:00', '2025-04-12 09:00:00'),
(8, 5, 2, 2, 2, 0, 0, '2025-04-11 09:00:00', '2025-04-12 09:00:00'),
(9, 6, 2, 2, 2, 0, 0, '2025-04-11 09:00:00', '2025-04-12 09:00:00'),
(10, 9, 2, 2, 1, 0, 1, '2025-04-11 09:00:00', '2025-04-12 09:00:00'),
(11, 10, 2, 2, 1, 0, 1, '2025-04-11 09:00:00', '2025-04-12 09:00:00'),
(12, 1, 3, 2, 0, 0, 2, '2025-04-11 09:00:00', '2025-04-12 09:00:00'),
(13, 7, 3, 2, 1, 0, 1, '2025-04-11 09:00:00', '2025-04-12 09:00:00'),
(14, 8, 3, 2, 2, 0, 0, '2025-04-11 09:00:00', '2025-04-12 09:00:00'),
(15, 10, 3, 2, 1, 0, 1, '2025-04-11 09:00:00', '2025-04-12 09:00:00'),
(16, 4, 4, 2, 1, 0, 1, '2025-04-11 09:00:00', '2025-04-12 09:00:00'),
(17, 8, 4, 2, 1, 0, 1, '2025-04-11 09:00:00', '2025-04-12 09:00:00'),
(18, 6, 5, 2, 1, 0, 1, '2025-04-11 09:00:00', '2025-04-12 09:00:00'),
(19, 9, 5, 2, 1, 0, 1, '2025-04-11 09:00:00', '2025-04-12 09:00:00'),
(20, 10, 5, 2, 2, 0, 0, '2025-04-11 09:00:00', '2025-04-12 09:00:00'),
(21, 5, 6, 2, 2, 0, 0, '2025-04-11 09:00:00', '2025-04-12 09:00:00'),
(22, 6, 6, 2, 1, 0, 1, '2025-04-11 09:00:00', '2025-04-12 09:00:00'),
(23, 9, 6, 2, 2, 0, 0, '2025-04-11 09:00:00', '2025-04-12 09:00:00'),
(24, 10, 6, 2, 1, 0, 1, '2025-04-11 09:00:00', '2025-04-12 09:00:00'),
(25, 7, 1, 1, 1, 0, 0, '2025-04-23 10:00:00', '2025-04-23 10:00:00'),
(26, 7, 2, 1, 1, 0, 0, '2025-04-24 10:00:00', '2025-04-24 10:00:00'),
(27, 8, 1, 1, 0, 0, 1, '2025-04-23 10:00:00', '2025-04-23 10:00:00'),
(28, 8, 2, 1, 1, 0, 0, '2025-04-24 10:00:00', '2025-04-24 10:00:00'),
(29, 1, 7, 1, 1, 0, 0, '2025-04-29 15:00:00', '2025-04-29 15:00:00'),
(30, 1, 8, 1, 1, 0, 0, '2025-04-30 15:00:00', '2025-04-30 15:00:00'),
(31, 4, 7, 1, 1, 0, 0, '2025-04-29 15:00:00', '2025-04-29 15:00:00'),
(32, 4, 8, 1, 0, 0, 1, '2025-04-30 15:00:00', '2025-04-30 15:00:00'),
(33, 5, 7, 1, 0, 0, 1, '2025-04-29 15:00:00', '2025-04-29 15:00:00'),
(34, 5, 9, 1, 1, 0, 0, '2025-05-01 15:00:00', '2025-05-01 15:00:00'),
(35, 6, 8, 1, 1, 0, 0, '2025-04-30 15:00:00', '2025-04-30 15:00:00'),
(36, 6, 10, 1, 0, 0, 1, '2025-05-02 15:00:00', '2025-05-02 15:00:00'),
(37, 7, 8, 1, 1, 0, 0, '2025-04-30 15:00:00', '2025-04-30 15:00:00'),
(38, 7, 9, 1, 1, 0, 0, '2025-05-01 15:00:00', '2025-05-01 15:00:00'),
(39, 8, 8, 1, 1, 0, 0, '2025-04-30 15:00:00', '2025-04-30 15:00:00'),
(40, 8, 10, 1, 1, 0, 0, '2025-05-02 15:00:00', '2025-05-02 15:00:00'),
(41, 9, 7, 1, 1, 0, 0, '2025-04-29 15:00:00', '2025-04-29 15:00:00'),
(42, 9, 10, 1, 1, 0, 0, '2025-05-02 15:00:00', '2025-05-02 15:00:00'),
(43, 10, 7, 1, 1, 0, 0, '2025-04-29 15:00:00', '2025-04-29 15:00:00'),
(44, 10, 11, 1, 1, 0, 0, '2025-05-03 15:00:00', '2025-05-03 15:00:00'),
(45, 10, 12, 1, 1, 0, 0, '2025-05-04 15:00:00', '2025-05-04 15:00:00');

-- Reset the sequence
SELECT setval('attendance_summary_id_seq', (SELECT MAX(id) FROM attendance_summary));