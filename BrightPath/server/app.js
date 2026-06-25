require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection (cached for serverless/Vercel).
// If MONGODB_URI is not set, the app runs in "mock mode" — routes fall back to
// in-memory sample data. Set MONGODB_URI (e.g. a MongoDB Atlas string) for real persistence.
const MONGODB_URI = process.env.MONGODB_URI;
let connPromise = null;

async function connectDB() {
    if (!MONGODB_URI) return; // no DB configured -> routes serve mock data
    if (mongoose.connection.readyState === 1) return;
    if (!connPromise) {
        connPromise = mongoose
            .connect(MONGODB_URI, { serverSelectionTimeoutMS: 8000 })
            .then(() => console.log('MongoDB Connected'))
            .catch(err => {
                connPromise = null;
                console.error('MongoDB Connection Error:', err);
            });
    }
    await connPromise;
}

// Attempt a DB connection before handling requests (no-op in mock mode)
app.use(async (req, res, next) => {
    try { await connectDB(); } catch (e) { /* fall through to mock data */ }
    next();
});

// Serve frontend (used in local single-port dev; on Vercel static files are
// served directly by the platform via vercel.json)
app.use(express.static(path.join(__dirname, '../client')));

const examsRoute = require('./routes/exams');
const updatesRoute = require('./routes/updates');
const authRoute = require('./routes/auth');
const commentsRoute = require('./routes/comments');

app.use('/api/exams', examsRoute);
app.use('/api/updates', updatesRoute);
app.use('/api/auth', authRoute);
app.use('/api/comments', commentsRoute);

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/index.html'));
});

module.exports = app;
