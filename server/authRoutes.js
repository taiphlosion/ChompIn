const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('./db');
const { verifyToken } = require("./authMiddleware"); // Import middleware

require('dotenv').config();


const router = express.Router();

// Sign up
router.post('/register', async (req, res) => {
    const { first_name, last_name, email, password, role } = req.body;

    try {
        const existingUser = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
        if (existingUser.rows.length > 0) {
            return res.status(400).json({ message: 'Email already in use' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = await pool.query(
            'INSERT INTO users (first_name, last_name, email, password_hash, role) VALUES ($1, $2, $3, $4, $5) RETURNING *',
            [first_name, last_name, email, hashedPassword, role]
        );

        res.status(201).json({ message: 'User registered successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Log in
router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
        if (user.rows.length === 0) {
            return res.status(400).json({ message: 'Invalid email or password' });
        }

        const isMatch = await bcrypt.compare(password, user.rows[0].password_hash);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid email or password' });
        }

        const token = jwt.sign(
            { userId: user.rows[0].id, role: user.rows[0].role },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        // Set HTTP-Only cookie
        res.cookie("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",  // Use secure cookies in production
            sameSite: "Strict",
            maxAge: 7 * 24 * 60 * 60 * 1000
        });

        res.json({ token, user: { id: user.rows[0].id, email: user.rows[0].email, role: user.rows[0].role } });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// **Get Current User (Protected Route)**
router.get("/me", verifyToken, async (req, res) => {
    try {
        // Fetch user from DB using `req.user.userId` (set by middleware)
        const user = await pool.query("SELECT id, email, role FROM users WHERE id = $1", [req.user.userId]);

        if (user.rows.length === 0) {
            return res.status(404).json({ message: "User not found" });
        }

        res.json(user.rows[0]); 
    } catch (err) {
        console.error("Database error:", err);
        res.status(500).json({ message: "Internal Server Error" });
    }
});

router.post("/logout", (req, res) => {
    res.clearCookie("token", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "Strict"
    });

    res.json({ message: "Logged out successfully" });
});


// example role protected route
// 🔒 Only professors can access this route
// router.get("/information only a professor can access", verifyToken, authorizeRoles("professor"), (req, res) => {
//     res.json({ message: "Welcome to the Professor Dashboard" });
// });

module.exports = router;
