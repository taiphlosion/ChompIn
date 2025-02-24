const express = require("express");
const pool = require("./db/db");
const cors = require("cors");
const cookieParser = require("cookie-parser");

const app = express();

// Middleware
app.use(cors({ credentials: true, origin: "http://localhost:8081" }));
app.use(express.json());
app.use(cookieParser());

// Routes
const authRoutes = require("./authRoutes");
app.use("/api/auth", authRoutes);

const userRoutes = require("./userRoutes");
app.use("/api/user/", userRoutes);

app.get("/", (req, res) => {
  res.json({ message: "Hello from the backend!" });
});

app.get("/test-db", async (req, res) => {
  try {
    const result = await pool.query("SELECT NOW()"); // Query the database
    res.json({ message: "Database connected!", time: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: "Database connection failed" });
  }
});

app.listen(process.env.PORT, () =>
  console.log(`Server running on port ${process.env.PORT}`)
);
