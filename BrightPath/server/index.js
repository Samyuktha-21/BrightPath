require('dotenv').config();
const app = require('./app');

const PORT = process.env.PORT || 5000;

// Background automation (cron notifications) runs only on a long-lived server,
// i.e. local dev or a traditional host — NOT on serverless platforms like Vercel.
const startCronJobs = require('./cron/notifications');
startCronJobs();

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
