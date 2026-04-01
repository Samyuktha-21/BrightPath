const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const mongoose = require('mongoose');

// JWT Secret
const JWT_SECRET = process.env.JWT_SECRET || 'brightpath_super_secret_key_2026';

// In-Memory Fallback Database for when MongoDB is offline
let mockUsers = []; 

// Register User
router.post('/register', async (req, res) => {
    const { name, email, password } = req.body;
    try {
        if (!name || !email || !password) return res.status(400).json({ message: 'Please enter all fields' });

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        
        // Use Mock In-Memory Logic if No Database
        if (mongoose.connection.readyState !== 1) {
            if (mockUsers.find(u => u.email === email)) return res.status(400).json({ message: 'User already exists' });
            
            const newUser = { id: Date.now().toString(), name, email, password: hashedPassword, bookmarks: [] };
            mockUsers.push(newUser);
            const token = jwt.sign({ id: newUser.id }, JWT_SECRET, { expiresIn: '7d' });
            
            return res.json({ token, user: { id: newUser.id, name, email, bookmarks: newUser.bookmarks }});
        }

        // Real MongoDB Logic
        const existingUser = await User.findOne({ email });
        if (existingUser) return res.status(400).json({ message: 'User already exists' });

        const newUser = new User({ name, email, password: hashedPassword, bookmarks: [] });
        await newUser.save();

        const token = jwt.sign({ id: newUser._id }, JWT_SECRET, { expiresIn: '7d' });
        res.json({ token, user: { id: newUser._id, name: newUser.name, email: newUser.email, bookmarks: newUser.bookmarks }});
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

// Login User
router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        if (!email || !password) return res.status(400).json({ message: 'Please enter all fields' });

        // Use Mock Internal Logic if No Database
        if (mongoose.connection.readyState !== 1) {
            const user = mockUsers.find(u => u.email === email);
            if (!user) return res.status(400).json({ message: 'Invalid credentials or no database connected.' });
            
            const isMatch = await bcrypt.compare(password, user.password);
            if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });
            
            const token = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: '7d' });
            return res.json({ token, user: { id: user.id, name: user.name, email: user.email, bookmarks: user.bookmarks }});
        }

        // Real Database Logic
        const user = await User.findOne({ email });
        if (!user) return res.status(400).json({ message: 'Invalid credentials' });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

        const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: '7d' });
        res.json({ token, user: { id: user._id, name: user.name, email: user.email, bookmarks: user.bookmarks }});
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

// Update Bookmarks
router.put('/bookmarks', async (req, res) => {
    const { userId, bookmarks } = req.body;
    try {
        if (mongoose.connection.readyState !== 1) {
            let uIndex = mockUsers.findIndex(u => u.id === userId);
            if(uIndex !== -1) mockUsers[uIndex].bookmarks = bookmarks;
            return res.json({ success: true, message: 'Saved to memory', bookmarks });
        }

        const user = await User.findByIdAndUpdate(userId, { bookmarks }, { new: true });
        if (!user) return res.status(404).json({ message: 'User not found' });
        
        res.json({ success: true, bookmarks: user.bookmarks });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
