const express = require("express");
const { verifyToken, authorizeRoles } = require("./authMiddleware");

const router = express.Router();

router.get(
  "/generate-qr",
  verifyToken,
  authorizeRoles("professor"),
  async (req, res) => {
    try {
      const sessionId = `session_${Date.now()}`; // Unique session ID
      const token = jwt.sign(
        { sessionId, exp: Math.floor(Date.now() / 1000) + 90 * 60 },
        process.env.JWT_SECRET
      );

      const qrData = `${process.env.URL}/attendance?token=${token}`;
      const qrImage = await QRCode.toDataURL(qrData);

      res.json({ qrImage, sessionId });
    } catch (err) {
      res.status(500).json({ error: "Failed to generate QR code" });
    }
  }
);

module.exports = router;
