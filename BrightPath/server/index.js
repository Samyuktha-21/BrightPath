require('dotenv').config();
const app = require('./app');

const PORT = process.env.PORT || 5000;

// Background automation runs only on a long-lived server (local dev or Render) —
// NOT on serverless platforms like Vercel where the process is ephemeral.
const startCronJobs = require('./cron/notifications');
const { scheduleScraper } = require('./scraper/examScraper');

startCronJobs();       // daily exam-deadline notifications
scheduleScraper();     // weekly scrape of official sites (Sundays 00:00)
require('./seed/seedExams');
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
