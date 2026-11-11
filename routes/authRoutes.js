
const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const User = require("../models/User");
const { encrypt } = require("../utils/encrypt");
const connectDB = require("../config/db");

const router = express.Router();


// SIGNUP
router.post("/signup", async (req, res) => {
    
    try {
        if (!req.body || typeof req.body !== "object" || Array.isArray(req.body)) {
            return res.status(400).json({
                message: "Request body is required. Send JSON with Content-Type: application/json."
            });
        }

        const { email, password, gmailAppPassword } = req.body;

        if (!email || !password || !gmailAppPassword) {
            return res.status(400).json({
                message: "All fields are required"
            });
        }

        await connectDB();

        const normalizedEmail = email.trim().toLowerCase();

        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
            return res.status(400).json({
                message: "Enter a valid email address"
            });
        }

        if (password.length < 8) {
            return res.status(400).json({
                message: "Application password must be at least 8 characters"
            });
        }

        if (gmailAppPassword.length < 8) {
            return res.status(400).json({
                message: "Enter a valid Gmail App Password"
            });
        }

        const existingUser = await User.findOne({
            email: normalizedEmail
        });

        if (existingUser) {
            return res.status(409).json({
                message: "Account already exists. Please login."
            });
        }

        const hashedPassword = await bcrypt.hash(password, 12);
        const encryptedGmailPassword = encrypt(gmailAppPassword);

        await User.create({
            email: normalizedEmail,
            password: hashedPassword,
            gmailAppPassword: encryptedGmailPassword
        });

        res.status(201).json({
            message: "Registration successful. Please login."
        });

    } catch (error) {
        console.error("Signup error:", error.message);

        if (error.code === 11000) {
            return res.status(409).json({
                message: "Email already registered"
            });
        }

        res.status(500).json({
            message: error.message || "Signup failed"
        });
    }
});

// LOGIN
router.post("/login", async (req, res) => {
    try {
        if (!req.body || typeof req.body !== "object" || Array.isArray(req.body)) {
            return res.status(400).json({
                message: "Request body is required. Send JSON with Content-Type: application/json."
            });
        }

        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                message: "Email and password are required"
            });
        }

        await connectDB();

        const user = await User.findOne({
            email: email.trim().toLowerCase()
        });

        if (!user) {
            return res.status(401).json({
                message: "Invalid email or password"
            });
        }

        const isMatch = await bcrypt.compare(
            password,
            user.password
        );

        if (!isMatch) {
            return res.status(401).json({
                message: "Invalid email or password"
            });
        }

        const token = jwt.sign(
            { userId: user._id },
            process.env.JWT_SECRET,
            { expiresIn: "1d" }
        );

        res.json({
            message: "Login successful",
            token,
            user: {
                id: user._id,
                email: user.email
            }
        });

    } catch (error) {
        console.error("Login error:", error.message);

        res.status(500).json({
            message: "Login failed"
        });
    }
});

module.exports = router;
