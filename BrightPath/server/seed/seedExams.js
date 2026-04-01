require('dotenv').config();
const mongoose = require('mongoose');
const Exam = require('../models/Exam');
const path = require('path');

// Connect to DB (Use logic from index.js if needed, or simple env var)
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/brightpath';

mongoose.connect(MONGODB_URI)
    .then(() => console.log('MongoDB Connected for Seeding'))
    .catch(err => {
        console.error('MongoDB Connection Error:', err);
        process.exit(1);
    });

const sampleExams = [
    // Medical
    {
        name: 'NEET UG 2026',
        category: 'Medical',
        conductingBody: 'NTA',
        examDate: new Date('2026-05-05'),
        registrationDates: { start: new Date('2026-02-01'), end: new Date('2026-03-15') },
        examLevel: 'National',
        websiteUrl: 'https://neet.nta.nic.in/',
        description: 'National Eligibility cum Entrance Test for MBBS/BDS courses.'
    },
    {
        name: 'NEET PG 2026',
        category: 'Medical',
        conductingBody: 'NBEMS',
        examDate: new Date('2026-03-03'),
        registrationDates: { start: new Date('2026-01-05'), end: new Date('2026-01-25') },
        examLevel: 'National',
        websiteUrl: 'https://nbe.edu.in/',
        description: 'Eligibility-cum-ranking examination for Post Graduate Medical courses.'
    },
    {
        name: 'AIIMS INI-CET 2026',
        category: 'Medical',
        conductingBody: 'AIIMS New Delhi',
        examDate: new Date('2026-05-18'),
        registrationDates: { start: new Date('2026-03-01'), end: new Date('2026-04-10') },
        examLevel: 'National',
        websiteUrl: 'https://www.aiimsexams.ac.in/',
        description: 'Institute of National Importance Combined Entrance Test.'
    },

    // Engineering
    {
        name: 'JEE Main 2026 (Session 1)',
        category: 'Engineering',
        conductingBody: 'NTA',
        examDate: new Date('2026-01-24'),
        registrationDates: { start: new Date('2025-11-01'), end: new Date('2025-11-30') },
        examLevel: 'National',
        websiteUrl: 'https://jeemain.nta.ac.in/',
        description: 'Joint Entrance Examination Main for NITs, IIITs and GFTIs.'
    },
    {
        name: 'JEE Advanced 2026',
        category: 'Engineering',
        conductingBody: 'IIT Madras',
        examDate: new Date('2026-06-04'),
        registrationDates: { start: new Date('2026-04-30'), end: new Date('2026-05-07') },
        examLevel: 'National',
        websiteUrl: 'https://jeeadv.ac.in/',
        description: 'Entrance exam for Indian Institutes of Technology (IITs).'
    },
    {
        name: 'BITSAT 2026 (Session 1)',
        category: 'Engineering',
        conductingBody: 'BITS Pilani',
        examDate: new Date('2026-05-20'),
        registrationDates: { start: new Date('2026-01-15'), end: new Date('2026-04-10') },
        examLevel: 'University',
        websiteUrl: 'https://www.bitsadmission.com/',
        description: 'BITS Pilani Admission Test.'
    },
    {
        name: 'VITEEE 2026',
        category: 'Engineering',
        conductingBody: 'VIT',
        examDate: new Date('2026-04-19'),
        registrationDates: { start: new Date('2025-11-01'), end: new Date('2026-03-31') },
        examLevel: 'University',
        websiteUrl: 'https://viteee.vit.ac.in/',
        description: 'VIT Engineering Entrance Examination.'
    },
    {
        name: 'SRMJEEE 2026',
        category: 'Engineering',
        conductingBody: 'SRM IST',
        examDate: new Date('2026-04-22'),
        registrationDates: { start: new Date('2025-11-15'), end: new Date('2026-04-10') },
        examLevel: 'University',
        websiteUrl: 'https://www.srmist.edu.in/',
        description: 'SRM Joint Engineering Entrance Examination.'
    },

    // University
    {
        name: 'CUET UG 2026',
        category: 'University',
        conductingBody: 'NTA',
        examDate: new Date('2026-05-15'),
        registrationDates: { start: new Date('2026-02-09'), end: new Date('2026-03-30') },
        examLevel: 'National',
        websiteUrl: 'https://cuet.samarth.ac.in/',
        description: 'Common University Entrance Test for Central Universities.'
    },

    // Government
    {
        name: 'UPSC CSE Prelims 2026',
        category: 'Government',
        conductingBody: 'UPSC',
        examDate: new Date('2026-05-28'),
        registrationDates: { start: new Date('2026-02-01'), end: new Date('2026-02-21') },
        examLevel: 'National',
        websiteUrl: 'https://upsc.gov.in/',
        description: 'Civil Services Examination for IAS, IPS, IFS etc.'
    },
    {
        name: 'SSC CGL 2026',
        category: 'Government',
        conductingBody: 'SSC',
        examDate: new Date('2026-09-01'),
        registrationDates: { start: new Date('2026-04-01'), end: new Date('2026-05-01') },
        examLevel: 'National',
        websiteUrl: 'https://ssc.nic.in/',
        description: 'Combined Graduate Level Examination for Group B and C posts.'
    },

    // Management
    {
        name: 'CAT 2026',
        category: 'Management',
        conductingBody: 'IIMs',
        examDate: new Date('2026-11-26'),
        registrationDates: { start: new Date('2026-08-02'), end: new Date('2026-09-13') },
        examLevel: 'National',
        websiteUrl: 'https://iimcat.ac.in/',
        description: 'Common Admission Test for MBA admissions.'
    },
    {
        name: 'XAT 2026',
        category: 'Management',
        conductingBody: 'XLRI',
        examDate: new Date('2026-01-04'),
        registrationDates: { start: new Date('2025-07-15'), end: new Date('2025-11-30') },
        examLevel: 'National',
        websiteUrl: 'https://xatonline.in/',
        description: 'Xavier Aptitude Test for management programs.'
    },

    // Law
    {
        name: 'CLAT 2026',
        category: 'Law',
        conductingBody: 'Consortium of NLUs',
        examDate: new Date('2025-12-03'), // Usually in Dec of previous year for next session
        registrationDates: { start: new Date('2025-07-01'), end: new Date('2025-11-03') },
        examLevel: 'National',
        websiteUrl: 'https://consortiumofnlus.ac.in/',
        description: 'Common Law Admission Test for NLUs.'
    },

    // Design
    {
        name: 'NIFT 2026',
        category: 'Design',
        conductingBody: 'NTA',
        examDate: new Date('2026-02-05'),
        registrationDates: { start: new Date('2025-12-01'), end: new Date('2025-12-31') },
        examLevel: 'National',
        websiteUrl: 'https://nift.ac.in/',
        description: 'National Institute of Fashion Technology Entrance Exam.'
    }
];

const seedDB = async () => {
    try {
        await Exam.deleteMany({});
        console.log('Cleared existing exams');
        await Exam.insertMany(sampleExams);
        console.log('Database seeded with rich exam data!');
    } catch (err) {
        console.error('Error seeding database:', err);
    } finally {
        mongoose.connection.close();
    }
};

seedDB();
