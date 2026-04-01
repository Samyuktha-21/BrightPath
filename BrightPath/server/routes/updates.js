const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Update = require('../models/Update');

// GET all active updates
router.get('/', async (req, res) => {
    try {
        // Check if mongoose is connected
        if (mongoose.connection.readyState !== 1) {
            return res.json([
                { text: "📢 JEE Main 2026 (Session 1): Registrations officially open November 1st, 2025." },
                { text: "⚡ NEET UG 2026: Verified syllabus and mock tests are now available in your Study Hub!" },
                { text: "📘 UPSC CSE Prelims: Expected exam date is May 28th, 2026. Start your revision!" },
                { text: "🎓 BrightPath Updates: Keep crushing your goals and track your exams with us!" }
            ]);
        }

        const updates = await Update.find({ active: true }).sort({ createdAt: -1 });
        res.json(updates);
    } catch (err) {
        console.error('Error fetching updates:', err);
        res.json([
            { text: "Welcome to BrightPath!" },
            { text: "Stay tuned for more updates." }
        ]);
    }
});

module.exports = router;
