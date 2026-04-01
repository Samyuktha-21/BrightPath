require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../client'))); // Serve frontend files

// MongoDB Connection
// Replace with your MongoDB connection string in .env
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/brightpath';

mongoose.connect(MONGODB_URI)
    .then(() => console.log('MongoDB Connected'))
    .catch(err => console.error('MongoDB Connection Error:', err));


// Routes
const examsRoute = require('./routes/exams');
const updatesRoute = require('./routes/updates');
const authRoute = require('./routes/auth');

app.use('/api/exams', examsRoute);
app.use('/api/updates', updatesRoute);
app.use('/api/auth', authRoute);

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/index.html'));
});

// Start Server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
