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

-- TIME BLOCKS
CREATE TABLE IF NOT EXISTS time_blocks (
    id SERIAL PRIMARY KEY,
    block_number INTEGER UNIQUE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL
);

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
(11, '18:15', '19:05');
