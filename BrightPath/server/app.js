require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');

const Exam = require('./models/Exam');
const { runScrape } = require('./scraper/examScraper');

const app = express();
const SERVER_START = new Date();

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection (cached so repeated requests reuse one connection).
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

// --- Health check (for UptimeRobot / Render keep-alive). No DB dependency. ---
app.get('/health', (req, res) => {
    res.status(200).json({
        status: 'ok',
        uptime: process.uptime(),
        timestamp: new Date().toISOString()
    });
});

// Attempt a DB connection before handling other requests (no-op in mock mode)
app.use(async (req, res, next) => {
    try { await connectDB(); } catch (e) { /* fall through to mock data */ }
    next();
});

// Serve frontend (local single-port dev / Render). On Vercel static files are
// served by the platform via vercel.json, so this is harmless there.
app.use(express.static(path.join(__dirname, '../client')));

// --- When was exam data last refreshed? (used by the dashboard) ---
app.get('/api/last-updated', async (req, res) => {
    try {
        if (mongoose.connection.readyState === 1) {
            const latest = await Exam.findOne({}).sort({ lastUpdated: -1 }).select('lastUpdated');
            if (latest && latest.lastUpdated) {
                return res.json({ lastUpdated: latest.lastUpdated, source: 'database' });
            }
        }
    } catch (err) {
        console.error('last-updated error:', err.message);
    }
    // Fallback: when there is no DB, the data is as fresh as this server process.
    res.json({ lastUpdated: SERVER_START, source: 'seed' });
});

// --- Manual scraper trigger (so you can refresh from Render without redeploy) ---
// Protect with ADMIN_KEY env var if set:  GET /api/admin/scrape?key=YOUR_KEY
app.get('/api/admin/scrape', async (req, res) => {
    const adminKey = process.env.ADMIN_KEY;
    if (adminKey && req.query.key !== adminKey) {
        return res.status(401).json({ error: 'Unauthorized — provide ?key=<ADMIN_KEY>' });
    }
    try {
        const summary = await runScrape();
        res.json({ triggered: true, ...summary });
    } catch (err) {
        // runScrape is defensive and shouldn't throw, but never 500 the whole app.
        res.status(500).json({ triggered: true, error: err.message });
    }
});

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
