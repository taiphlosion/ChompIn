const express = require("express");
const QRCode = require('qrcode');
const pool = require("./db/db");
const { verifyToken, authorizeRoles } = require("./authMiddleware");

const router = express.Router();


router.get("/classrooms", verifyToken, authorizeRoles("professor"), async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM classrooms WHERE professor_id = $1",
      [req.user.id]
    );

    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch classrooms" });
  }
});


router.post("/create-classroom", verifyToken, authorizeRoles("professor"), async (req, res) => {
  try {
    const { className } = req.body;

    if (!className) {
      return res.status(400).json({ error: "Class name is required" });
    }

    console.log("req user", req.user);
    console.log("prefessor_id", req.user?.id);

    if (!req.user?.id) {
      return res.status(401).json({ error: "Unauthorized: User ID is missing" });
    }

    // Insert the new classroom into the database
    const result = await pool.query(
      "INSERT INTO classrooms (professor_id, class_name) VALUES ($1, $2) RETURNING *",
      [req.user.id, className]
    );

    res.status(201).json({ message: "Classroom created successfully", classroom: result.rows[0] });
  } catch (err) {
    console.error("Error creating classroom:", err);
    res.status(500).json({ error: "Failed to create classroom" });
  }
});

router.get(
  "/generate-qr",
  verifyToken,
  authorizeRoles("professor"),
  async (req, res) => {
    try {

      const { classroom_id } = req.body;

      if (!classroom_id) {
        return res.status(400).json({ error: "Classroom ID is required" });
      }

      const classroomResult = await pool.query(
        "SELECT * FROM classrooms WHERE id = $1 AND professor_id = $2",
        [classroom_id, req.user.id]
      );

      if (classroomResult.rows.length === 0) {
        return res.status(403).json({ error: "Unauthorized or classroom does not exist" });
      }

      const sessionId = `session_${Date.now()}`; // Unique session ID

      const createdAt = new Date();
      const expiresAt = new Date(createdAt.getTime() + 90 * 60 * 1000); // 90 mins later

      const qrData = `${process.env.URL}/attendance?session=${sessionId}`;
      const qrImage = await QRCode.toDataURL(qrData);

      await pool.query(
        "INSERT INTO sessions (session_id, classroom_id, professor_id, expires_at) VALUES ($1, $2, $3, $4)",
        [sessionId, req.body.classroom_id, req.user.id, expiresAt.toISOString()]
      );
      res.json({ qrImage, sessionId });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Failed to generate QR code" });
    }
  }
);


// this route will be triggered when the students cans the qr code and get TAKEN to the link with the sessionID in the URL
// they will need to be logged in, so that is why the verifyToken is in the statement.
router.post('/mark-attendance', verifyToken, authorizeRoles('student'), async (req, res) => {
  try {
    const { sessionId } = req.body;
    if (!sessionId) return res.status(400).json({ error: "No session ID provided" });

    // Ensure session exists and is valid and not expired.
    const sessionResult = await pool.query(
      "SELECT * FROM sessions WHERE session_id = $1 AND expires_at > NOW()",
      [sessionId]
    );

    if (sessionResult.rows.length === 0) {
      return res.status(400).json({ error: "Invalid or expired session" });
    }

    // Check if student has already checked in
    const studentId = req.user.id;
    const checkAttendance = await pool.query(
      "SELECT * FROM attendance WHERE session_id = $1 AND student_id = $2",
      [sessionId, studentId]
    );

    if (checkAttendance.rows.length > 0) {
      return res.status(400).json({ error: "Already checked in" });
    }


    // verify attendance location


    // Mark attendance
    await pool.query(
      "INSERT INTO attendance (session_id, student_id, timestamp) VALUES ($1, $2, NOW())",
      [sessionId, studentId]
    );


    // canvas api 

    res.json({ message: "Attendance marked successfully!" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
