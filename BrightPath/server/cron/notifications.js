const cron = require('node-cron');
const User = require('../models/User');
const Exam = require('../models/Exam');
const mongoose = require('mongoose');

// Helper function to mock sending an SMS or Email
const sendOffAppNotification = (user, exam, daysLeft) => {
    console.log('\n======================================================');
    console.log('🚨 [TWILIO/SMTP MOCK] OFF-APP NOTIFICATION TRIGGERED!');
    console.log(`To: ${user.name}`);
    console.log(`Alert: Your tracked exam "${exam.name}" is coming up in exactly ${daysLeft} days!`);
    console.log(`Action Required: Prepare your documents or check: ${exam.websiteUrl}`);
    console.log('======================================================\n');
};

const startCronJobs = () => {
    // Schedule task to run every 1 minute FOR DEMONSTRATION!
    // In a real production environment, you would use '0 8 * * *' (Every day at 8:00 AM)
    cron.schedule('*/2 * * * *', async () => {
        console.log('⏳ CRON: Scanning database for upcoming exam deadlines...');

        if (mongoose.connection.readyState !== 1) {
            console.log('CRON: Database mock mode active - skipping DB query.');
            return;
        }

        try {
            const today = new Date();
            today.setHours(0,0,0,0);

            // Fetch all exams and users
            const exams = await Exam.find({});
            const users = await User.find({});

            exams.forEach(exam => {
                const examDate = new Date(exam.examDate);
                examDate.setHours(0,0,0,0);
                const diffTime = examDate - today;
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

                // Trigger if exam is within 3 days or 7 days
                if (diffDays === 3 || diffDays === 7 || diffDays === 30 || diffDays === 1) {
                    
                    // Find all users who saved this exam in their dashboard
                    const interestedUsers = users.filter(usr => usr.bookmarks && usr.bookmarks.includes(exam.name));
                    
                    interestedUsers.forEach(user => {
                        sendOffAppNotification(user, exam, diffDays);
                    });
                }
            });

        } catch (error) {
            console.error('CRON Error:', error);
        }
    });
};

module.exports = startCronJobs;
