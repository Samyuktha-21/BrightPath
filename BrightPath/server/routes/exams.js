const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Exam = require('../models/Exam');
const sampleExams = require('../data/sampleExams'); // shared fallback data

// GET all exams
router.get('/', async (req, res) => {
    try {
        let query = {};
        if (req.query.category && req.query.category !== 'All') {
            query.category = req.query.category;
        }

        // Check if mongoose is connected (1 = connected)
        if (mongoose.connection.readyState !== 1) {
            console.log('MongoDB not connected, serving sample data');
            let filtered = sampleExams;
            if (query.category) {
                filtered = sampleExams.filter(e => e.category === query.category);
            }
            return res.json(filtered);
        }

        const exams = await Exam.find(query).sort({ examDate: 1 });
        res.json(exams);
    } catch (err) {
        console.error('Error fetching exams:', err);
        // Fallback on error too
        let filtered = sampleExams;
        if (req.query.category && req.query.category !== 'All') {
            filtered = sampleExams.filter(e => e.category === req.query.category);
        }
        res.json(filtered);
    }
});

module.exports = router;
