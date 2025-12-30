const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

/* =========================
   LOGIN
========================= */
router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    // 1. user check
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(400).json({ msg: "User not found" });
    }

    // 2. password check
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ msg: "Invalid credentials" });
    }

    // 3. generate token
    const payload = {
      id: user._id,
      role: user.role,
      name: user.name
    };

    const token = jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        role: user.role
      }
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
});

module.exports = router;
