-- initial tables

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

CREATE TABLE IF NOT EXISTS classrooms (
    id SERIAL PRIMARY KEY,
    professor_id INTEGER NOT NULL REFERENCES users(id), -- Links to the professor
    class_name VARCHAR(255) NOT NULL, -- Name of the course
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS sessions (
    id SERIAL PRIMARY KEY,
    session_id VARCHAR(255) UNIQUE NOT NULL, -- The unique QR session ID
    classroom_id INTEGER NOT NULL REFERENCES classrooms(id), -- Which class this session is for
    professor_id INTEGER NOT NULL REFERENCES users(id), -- Who created this session
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, -- When the session was generated
    expires_at TIMESTAMP NOT NULL -- When this session becomes invalid
);

CREATE TABLE IF NOT EXISTS attendance (
    id SERIAL PRIMARY KEY,
    session_id VARCHAR(255) NOT NULL REFERENCES sessions(session_id), -- Now matches `sessions.session_id`
    student_id INTEGER NOT NULL REFERENCES users(id), -- Student checking in
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP, -- Time of check-in
    UNIQUE(session_id, student_id) -- Prevent duplicate check-ins
);