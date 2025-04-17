const express = require("express");
const pool = require("./db/db");
const { verifyToken, authorizeRoles } = require("./authMiddleware");

const router = express.Router();

// Professor Routes

// Get attendance statistics for all classes taught by the professor
router.get("/class-attendance", verifyToken, authorizeRoles("professor"), async (req, res) => {
    try {
        const query = `
            SELECT
            c.id AS classroom_id,
            c.class_name,
            COUNT(s.id) AS sessions_count,
            COUNT(a.student_id) AS enrolled_students,
            ROUND(AVG(
                (a.present_count + a.late_count * 0.8) * 100.0 / NULLIF(a.total_sessions, 0)
            ), 2) AS attendance_rate
            FROM
            classrooms c
            LEFT JOIN sessions s ON c.id = s.classroom_id
            LEFT JOIN attendance_summary a ON c.id = a.classroom_id
            WHERE
            c.professor_id = $1
            GROUP BY
            c.id, c.class_name
            ORDER BY
            c.class_name;
        `;

        const result = await pool.query(query, [req.user.id]);

        res.json(result.rows);
    } catch (err) {
        console.error("Error fetching class attendance:", err);
        res.status(500).json({ error: "Failed to fetch class attendance" });
    }
});

// Get top attending students for professor's classes
router.get("/top-students", verifyToken, authorizeRoles("professor"), async (req, res) => {
    try {
        const query = `
      SELECT 
        u.id,
        CONCAT(u.first_name, ' ', u.last_name) AS student_name,
        SUM(a.present_count + a.late_count) AS attendance_count,
        ROUND(
            SUM(a.present_count + a.late_count * 0.8) * 100.0 / NULLIF(SUM(a.total_sessions), 0), 
            2
        ) AS attendance_rate
        FROM 
        attendance_summary a
        JOIN 
        users u ON u.id = a.student_id
        JOIN 
        classrooms c ON c.id = a.classroom_id
        WHERE 
        u.role = 'student'
        AND c.professor_id = $1
        GROUP BY 
        u.id, u.first_name, u.last_name
        ORDER BY 
        attendance_rate DESC
        LIMIT 10;
    `;

        const result = await pool.query(query, [req.user.id]);

        res.json(result.rows);
    } catch (err) {
        console.error("Error fetching top students:", err);
        res.status(500).json({ error: "Failed to fetch top students" });
    }
});

// Student Routes

// Get personal attendance statistics
router.get("/personal-stats", verifyToken, authorizeRoles("student"), async (req, res) => {
    try {
        // Get basic stats
        const statsQuery = `
      WITH student_classes AS (
        SELECT classroom_id FROM enrollments WHERE student_id = $1
        ),
        relevant_sessions AS (
        SELECT s.id FROM sessions s
        JOIN student_classes sc ON sc.classroom_id = s.classroom_id
        ),
        attended_sessions AS (
        SELECT COUNT(*) AS count FROM attendance WHERE student_id = $1
        ),
        total_sessions AS (
        SELECT COUNT(*) AS total FROM relevant_sessions
        )
        SELECT 
        (SELECT total FROM total_sessions) AS total_sessions,
        (SELECT count FROM attended_sessions) AS attended_sessions,
        CASE 
            WHEN (SELECT total FROM total_sessions) = 0 THEN 0
            ELSE (SELECT count FROM attended_sessions) * 100.0 / (SELECT total FROM total_sessions)
        END AS attendance_rate;
    `;

        const statsResult = await pool.query(statsQuery, [req.user.id]);

        // Calculate streaks
        const streakQuery = `
      WITH attendance_dates AS (
        SELECT DISTINCT DATE(timestamp) AS att_date
        FROM attendance
        WHERE student_id = $1
        ORDER BY att_date
      ),
      date_groups AS (
        SELECT 
          att_date,
          att_date - (ROW_NUMBER() OVER (ORDER BY att_date) * INTERVAL '1 day') AS grp
        FROM attendance_dates
      ),
      streaks AS (
        SELECT 
          COUNT(*) AS streak_length,
          MIN(att_date) AS streak_start,
          MAX(att_date) AS streak_end,
          MAX(att_date) = CURRENT_DATE AS is_current
        FROM date_groups
        GROUP BY grp
        ORDER BY streak_start
      )
      SELECT 
        COALESCE((SELECT streak_length FROM streaks WHERE is_current ORDER BY streak_length DESC LIMIT 1), 0) AS current_streak,
        COALESCE((SELECT MAX(streak_length) FROM streaks), 0) AS longest_streak
    `;

        const streakResult = await pool.query(streakQuery, [req.user.id]);

        // Combine results
        const stats = {
            ...statsResult.rows[0],
            ...streakResult.rows[0]
        };

        res.json(stats);
    } catch (err) {
        console.error("Error fetching personal stats:", err);
        res.status(500).json({ error: "Failed to fetch personal stats" });
    }
});

router.get("/class-rank/:classroomId", verifyToken, authorizeRoles("student"), async (req, res) => {
    try {
        const { classroomId } = req.params;
        const studentId = req.user.id;

        const query = `
        WITH ranked AS (
          SELECT 
            student_id,
            (present_count + late_count * 0.8) / NULLIF(total_sessions, 0) AS attendance_ratio,
            RANK() OVER (
              ORDER BY (present_count + late_count * 0.8) / NULLIF(total_sessions, 0) DESC
            ) AS rank
          FROM attendance_summary
          WHERE classroom_id = $1
        )
        SELECT rank FROM ranked WHERE student_id = $2
      `;

        const result = await pool.query(query, [classroomId, studentId]);

        if (result.rows.length === 0) {
            return res.json({ rank: null });
        }

        res.json({ rank: result.rows[0].rank });
    } catch (err) {
        console.error("Error fetching class rank:", err);
        res.status(500).json({ error: "Failed to fetch class rank" });
    }
});

module.exports = router;