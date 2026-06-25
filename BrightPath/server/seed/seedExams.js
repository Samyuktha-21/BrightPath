require('dotenv').config();
const mongoose = require('mongoose');
const Exam = require('../models/Exam');
const sampleExams = require('../data/sampleExams');

// Connect to DB (Use logic from index.js if needed, or simple env var)
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/brightpath';

mongoose.connect(MONGODB_URI)
    .then(() => console.log('MongoDB Connected for Seeding'))
    .catch(err => {
        console.error('MongoDB Connection Error:', err);
        process.exit(1);
    });

const seedDB = async () => {
    try {
        await Exam.deleteMany({});
        console.log('Cleared existing exams');
        await Exam.insertMany(sampleExams);
        console.log(`Database seeded with ${sampleExams.length} exams!`);
    } catch (err) {
        console.error('Error seeding database:', err);
    } finally {
        mongoose.connection.close();
    }
};

seedDB();
