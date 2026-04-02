const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Comment = require('../models/Comment');

// In-Memory Fallback Database
let mockComments = [
    { id: '1', userName: 'Subbu', text: 'Does anyone have tips for the AIIMS biology section?', category: 'Medical', createdAt: new Date(Date.now() - 86400000) },
    { id: '2', userName: 'Rahul', text: 'When exactly does the JEE Advanced 2026 form drop?', category: 'Engineering', createdAt: new Date(Date.now() - 3600000) },
    { id: '3', userName: 'Priya', text: 'I highly recommend checking out the new UPSC syllabus PDF in the study hub!', category: 'Government', createdAt: new Date() }
];

// GET all comments (Optionally filter by category)
router.get('/', async (req, res) => {
    const categoryFilter = req.query.category;
    try {
        if (mongoose.connection.readyState !== 1) {
            let filtered = mockComments;
            if (categoryFilter && categoryFilter !== 'All Exams') {
                filtered = mockComments.filter(c => c.category === categoryFilter);
            }
            return res.json(filtered.sort((a,b) => b.createdAt - a.createdAt));
        }

        const query = (categoryFilter && categoryFilter !== 'All Exams') ? { category: categoryFilter } : {};
        const comments = await Comment.find(query).sort({ createdAt: -1 });
        res.json(comments);

    } catch (err) {
        console.error('Error fetching comments:', err);
        res.status(500).json({ message: 'Server Error' });
    }
});

// POST a new comment
router.post('/', async (req, res) => {
    const { userId, userName, text, category } = req.body;
    try {
        if (!userName || !text || !category) {
            return res.status(400).json({ message: 'Missing fields' });
        }

        if (mongoose.connection.readyState !== 1) {
            const newComment = {
                id: Date.now().toString(),
                userId: userId || 'anonymous',
                userName,
                text,
                category,
                createdAt: new Date()
            };
            mockComments.unshift(newComment); // Add to top
            return res.status(201).json(newComment);
        }

        const newComment = new Comment({
            userId: userId || 'anonymous',
            userName,
            text,
            category
        });

        await newComment.save();
        res.status(201).json(newComment);

    } catch (err) {
        console.error('Error saving comment:', err);
        res.status(500).json({ message: 'Server Error' });
    }
});

module.exports = router;
