const express = require("express");
const canvasApi = require("./canvasApi");
const router = express.Router();

// List user’s courses
router.get("/courses", async (req, res) => {
    try {
        const response = await canvasApi.get("/courses");
        res.json(response.data);
    } catch (err) {
        console.error(err.response?.data || err.message);
        res.status(500).json({ error: "Failed to list courses" });
    }
});

// List students in a course
router.get("/courses/:courseId/students", async (req, res) => {
    const { courseId } = req.params;
    try {
        const response = await canvasApi.get(`/courses/${courseId}/enrollments`, {
            params: { type: ["StudentEnrollment"] },
        });
        res.json(response.data);
    } catch (err) {
        console.error(err.response?.data || err.message);
        res.status(500).json({ error: "Failed to list students" });
    }
});

// Create attendance assignment
router.post("/courses/:courseId/assignments", async (req, res) => {
    const { courseId } = req.params;
    const { name, due_at } = req.body;

    try {
        const response = await canvasApi.post(`/courses/${courseId}/assignments`, {
            name: name || `Attendance - ${new Date().toLocaleDateString()}`,
            submission_types: ["online_text_entry"],
            due_at: due_at || new Date().toISOString(),
            points_possible: 1,
            published: true,
        });
        res.json(response.data);
    } catch (err) {
        console.error(err.response?.data || err.message);
        res.status(500).json({ error: "Failed to create assignment" });
    }
});

// Submit grade to assignment
router.post("/courses/:courseId/assignments/:assignmentId/submit", async (req, res) => {
    const { courseId, assignmentId } = req.params;
    const { user_id, grade } = req.body;

    try {
        const response = await canvasApi.post(`/courses/${courseId}/assignments/${assignmentId}/submissions`, {
            submission: {
                user_id,
                posted_grade: grade.toString(),
                submission_type: "online_text_entry",
                body: "Attendance recorded",
            },
        });
        res.json(response.data);
    } catch (err) {
        console.error(err.response?.data || err.message);
        res.status(500).json({ error: "Failed to submit attendance" });
    }
});

module.exports = router;
