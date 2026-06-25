// BrightPath exam scraper
// -----------------------------------------------------------------------------
// Best-effort change detector for the official sites that update most often
// (NTA — NEET/JEE, SSC, UPSC). It is intentionally defensive:
//   - Uses axios + cheerio only (no headless browser) to stay within Render's
//     free-tier memory limits.
//   - Never throws. Any failure for a target is caught, logged, and the app
//     keeps serving the seeded data in server/data/sampleExams.js.
//   - If a URL returns a PDF (the notices on these sites are usually PDFs),
//     it is skipped with a warning rather than parsed as HTML.
//   - On a successful fetch it hashes the visible "notice board" text and, when
//     that hash changes versus the previous run, marks the matching exams'
//     `lastUpdated` in MongoDB and logs a CHANGE.
//
// REALITY NOTE: NTA and UPSC are JavaScript-rendered and publish dates inside
// PDFs behind anti-bot protection, so those targets will frequently be skipped
// or report "no parseable notices" and fall back to seed data. SSC's HTML
// calendar is the most likely to parse. This module gives you the pipeline,
// logging and change-detection plumbing; the per-site selectors are the part
// that needs occasional maintenance when the sites change.

const axios = require('axios');
const cheerio = require('cheerio');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');

const Exam = require('../models/Exam');
const seedExams = require('../data/sampleExams');

const STATE_FILE = path.join(__dirname, 'scrape-state.json');

// Sites to monitor. `bodies` are the conductingBody values whose exams get their
// lastUpdated bumped when this target's notices change.
const SCRAPE_TARGETS = [
    { key: 'NTA-NEET', name: 'NTA — NEET', url: 'https://neet.nta.nic.in/', bodies: ['NTA'] },
    { key: 'NTA-JEE', name: 'NTA — JEE Main', url: 'https://jeemain.nta.nic.in/', bodies: ['NTA'] },
    { key: 'SSC', name: 'Staff Selection Commission', url: 'https://ssc.gov.in/', bodies: ['SSC'] },
    { key: 'UPSC', name: 'Union Public Service Commission', url: 'https://upsc.gov.in/', bodies: ['UPSC'] }
];

const REQUEST_HEADERS = {
    'User-Agent': 'Mozilla/5.0 (compatible; BrightPathBot/1.0; +https://brightpath-waf7.onrender.com)',
    'Accept': 'text/html,application/xhtml+xml'
};

// ----------------------------- state helpers --------------------------------
function loadState() {
    try {
        if (fs.existsSync(STATE_FILE)) {
            return JSON.parse(fs.readFileSync(STATE_FILE, 'utf8'));
        }
    } catch (err) {
        console.warn(`[scraper] Could not read state file: ${err.message}`);
    }
    return {};
}

function saveState(state) {
    try {
        fs.writeFileSync(STATE_FILE, JSON.stringify(state, null, 2));
    } catch (err) {
        // Render's filesystem is ephemeral; failing to persist state is non-fatal.
        console.warn(`[scraper] Could not write state file: ${err.message}`);
    }
}

function hashText(text) {
    return crypto.createHash('sha256').update(text).digest('hex');
}

// --------------------------- parsing helpers --------------------------------
function looksLikePdf(url, contentType) {
    if (contentType && contentType.toLowerCase().includes('application/pdf')) return true;
    if (/\.pdf(\?|#|$)/i.test(url)) return true;
    return false;
}

// Pull notice-board style text out of a page: marquees, list items and links
// that mention a date or words like "notice", "exam", "registration".
function extractNotices($) {
    const notices = new Set();
    const keyword = /(exam|date|registration|admit|notice|notification|result|recruit|apply|schedule|advt|advertisement)/i;
    const dateLike = /\b(\d{1,2}[\/.\-\s](?:\d{1,2}|jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*[\/.\-\s]\d{2,4})\b/i;

    $('marquee, .marquee, .notice, .notification, .whats-new, li a, .views-row, td a, p a').each((_, el) => {
        const text = $(el).text().replace(/\s+/g, ' ').trim();
        if (text.length >= 12 && text.length <= 300 && (keyword.test(text) || dateLike.test(text))) {
            notices.add(text);
        }
    });

    return Array.from(notices).slice(0, 60); // cap to keep the hash stable-ish
}

function extractDates(notices) {
    const dateRe = /\b\d{1,2}[\/.\-\s](?:\d{1,2}|january|february|march|april|may|june|july|august|september|october|november|december|jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*[\/.\-\s,]*\d{2,4}\b/gi;
    const found = new Set();
    notices.forEach(n => {
        const m = n.match(dateRe);
        if (m) m.forEach(d => found.add(d.trim()));
    });
    return Array.from(found);
}

// --------------------------- core scrape logic ------------------------------
async function bumpLastUpdated(bodies) {
    if (mongoose.connection.readyState !== 1) return 0; // no DB → nothing to update
    try {
        const res = await Exam.updateMany(
            { conductingBody: { $in: bodies } },
            { $set: { lastUpdated: new Date() } }
        );
        return res.modifiedCount || res.nModified || 0;
    } catch (err) {
        console.warn(`[scraper] DB lastUpdated update failed for ${bodies.join(', ')}: ${err.message}`);
        return 0;
    }
}

async function scrapeTarget(target, state) {
    const label = `[scraper] ${target.name}`;
    try {
        const response = await axios.get(target.url, {
            headers: REQUEST_HEADERS,
            timeout: 15000,
            maxRedirects: 5,
            // resolve for any non-5xx so we can inspect the body / content-type
            validateStatus: (s) => s < 500
        });

        const contentType = response.headers['content-type'] || '';
        const finalUrl = (response.request && response.request.res && response.request.res.responseUrl) || target.url;

        if (looksLikePdf(finalUrl, contentType)) {
            console.warn(`${label}: SKIPPED — response is a PDF (${finalUrl}). Cannot parse as HTML.`);
            return { key: target.key, status: 'skipped', reason: 'pdf', message: 'Response was a PDF' };
        }

        if (response.status >= 400) {
            console.warn(`${label}: FAILED — HTTP ${response.status}. Falling back to seed data.`);
            return { key: target.key, status: 'failed', reason: `http_${response.status}`, message: `HTTP ${response.status}` };
        }

        if (typeof response.data !== 'string' || !response.data.includes('<')) {
            console.warn(`${label}: WARNING — no HTML body returned (likely JS-rendered). Falling back to seed data.`);
            return { key: target.key, status: 'no_html', reason: 'non_html', message: 'No HTML in response' };
        }

        const $ = cheerio.load(response.data);
        const notices = extractNotices($);

        if (notices.length === 0) {
            console.warn(`${label}: WARNING — no parseable notices found. Falling back to seed data.`);
            return { key: target.key, status: 'no_notices', reason: 'empty', message: 'No notices parsed' };
        }

        const joined = notices.join(' || ');
        const hash = hashText(joined);
        const prev = state[target.key];
        const dates = extractDates(notices);
        let changed = false;
        let updatedCount = 0;

        if (!prev || prev.hash !== hash) {
            changed = true;
            updatedCount = await bumpLastUpdated(target.bodies);
            console.log(`${label}: CHANGE DETECTED — ${notices.length} notices, ${dates.length} date(s) seen. Bumped ${updatedCount} exam record(s).`);
        } else {
            console.log(`${label}: OK — no change (${notices.length} notices).`);
        }

        state[target.key] = { hash, lastChecked: new Date().toISOString(), noticeCount: notices.length, sampleDates: dates.slice(0, 5) };

        return {
            key: target.key,
            status: 'ok',
            changed,
            noticeCount: notices.length,
            datesSeen: dates.slice(0, 5),
            recordsTouched: updatedCount
        };
    } catch (err) {
        const reason = err.code || (err.response && `http_${err.response.status}`) || 'error';
        console.error(`${label}: ERROR — ${reason}: ${err.message}. Serving seeded data instead.`);
        return { key: target.key, status: 'error', reason, message: err.message };
    }
}

// Run all targets. NEVER throws — always resolves with a summary.
async function runScrape() {
    const startedAt = new Date();
    console.log(`\n[scraper] ===== Run started ${startedAt.toISOString()} =====`);
    const state = loadState();
    const results = [];

    for (const target of SCRAPE_TARGETS) {
        // sequential on purpose — gentle on the target servers
        const result = await scrapeTarget(target, state);
        results.push(result);
    }

    saveState(state);

    const summary = {
        startedAt: startedAt.toISOString(),
        finishedAt: new Date().toISOString(),
        seededExamCount: seedExams.length,
        targets: results.length,
        ok: results.filter(r => r.status === 'ok').length,
        changed: results.filter(r => r.changed).length,
        skipped: results.filter(r => r.status === 'skipped').length,
        failed: results.filter(r => ['failed', 'error', 'no_html', 'no_notices'].includes(r.status)).length,
        results
    };

    console.log(`[scraper] ===== Run finished: ${summary.ok}/${summary.targets} ok, ${summary.changed} changed, ${summary.skipped} skipped, ${summary.failed} failed =====\n`);
    return summary;
}

// Schedule: every Sunday at 00:00 server time.
function scheduleScraper() {
    const cron = require('node-cron');
    cron.schedule('0 0 * * 0', () => {
        runScrape().catch(err => console.error(`[scraper] Scheduled run crashed: ${err.message}`));
    });
    console.log('[scraper] Weekly scrape scheduled (Sundays 00:00).');
}

module.exports = { runScrape, scheduleScraper, SCRAPE_TARGETS };
