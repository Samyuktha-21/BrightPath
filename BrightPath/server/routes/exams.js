const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Exam = require('../models/Exam');

// Sample data for fallback
const sampleExams = [
    // Medical
    { name: 'NEET UG 2026', category: 'Medical', conductingBody: 'NTA', examDate: new Date('2026-05-05'), registrationDates: { start: new Date('2026-02-01'), end: new Date('2026-03-15') }, examLevel: 'National', websiteUrl: 'https://neet.nta.nic.in/', description: 'National Eligibility cum Entrance Test for MBBS/BDS courses.', materials: [{ title: 'Sets, Relations and Functions', link: 'materials/notes.png', type: 'Notes' }] },
    { name: 'NEET PG 2026', category: 'Medical', conductingBody: 'NBEMS', examDate: new Date('2026-03-03'), registrationDates: { start: new Date('2026-01-05'), end: new Date('2026-01-25') }, examLevel: 'National', websiteUrl: 'https://nbe.edu.in/', description: 'Eligibility-cum-ranking examination for Post Graduate Medical courses.', materials: [{ title: 'Sets, Relations and Functions', link: 'materials/notes.png', type: 'Notes' }] },
    { name: 'AIIMS INI-CET 2026', category: 'Medical', conductingBody: 'AIIMS New Delhi', examDate: new Date('2026-05-18'), registrationDates: { start: new Date('2026-03-01'), end: new Date('2026-04-10') }, examLevel: 'National', websiteUrl: 'https://www.aiimsexams.ac.in/', description: 'Institute of National Importance Combined Entrance Test.', materials: [{ title: 'Sets, Relations and Functions', link: 'materials/notes.png', type: 'Notes' }] },

    // Engineering
    { name: 'JEE Main 2026 (Session 1)', category: 'Engineering', conductingBody: 'NTA', examDate: new Date('2026-01-24'), registrationDates: { start: new Date('2025-11-01'), end: new Date('2025-11-30') }, examLevel: 'National', websiteUrl: 'https://jeemain.nta.ac.in/', description: 'Joint Entrance Examination Main for NITs, IIITs and GFTIs.', materials: [{ title: 'Sets, Relations and Functions', link: 'materials/notes.png', type: 'Notes' }] },
    { name: 'JEE Advanced 2026', category: 'Engineering', conductingBody: 'IIT Madras', examDate: new Date('2026-06-04'), registrationDates: { start: new Date('2026-04-30'), end: new Date('2026-05-07') }, examLevel: 'National', websiteUrl: 'https://jeeadv.ac.in/', description: 'Entrance exam for Indian Institutes of Technology (IITs).', materials: [{ title: 'Sets, Relations and Functions', link: 'materials/notes.png', type: 'Notes' }] },
    { name: 'BITSAT 2026 (Session 1)', category: 'Engineering', conductingBody: 'BITS Pilani', examDate: new Date('2026-05-20'), registrationDates: { start: new Date('2026-01-15'), end: new Date('2026-04-10') }, examLevel: 'University', websiteUrl: 'https://www.bitsadmission.com/', description: 'BITS Pilani Admission Test.', materials: [{ title: 'Sets, Relations and Functions', link: 'materials/notes.png', type: 'Notes' }] },
    { name: 'VITEEE 2026', category: 'Engineering', conductingBody: 'VIT', examDate: new Date('2026-04-19'), registrationDates: { start: new Date('2025-11-01'), end: new Date('2026-03-31') }, examLevel: 'University', websiteUrl: 'https://viteee.vit.ac.in/', description: 'VIT Engineering Entrance Examination.', materials: [{ title: 'Sets, Relations and Functions', link: 'materials/notes.png', type: 'Notes' }] },
    { name: 'SRMJEEE 2026', category: 'Engineering', conductingBody: 'SRM IST', examDate: new Date('2026-04-22'), registrationDates: { start: new Date('2025-11-15'), end: new Date('2026-04-10') }, examLevel: 'University', websiteUrl: 'https://www.srmist.edu.in/', description: 'SRM Joint Engineering Entrance Examination.', materials: [{ title: 'Sets, Relations and Functions', link: 'materials/notes.png', type: 'Notes' }] },

    // University
    { name: 'CUET UG 2026', category: 'University', conductingBody: 'NTA', examDate: new Date('2026-05-15'), registrationDates: { start: new Date('2026-02-09'), end: new Date('2026-03-30') }, examLevel: 'National', websiteUrl: 'https://cuet.samarth.ac.in/', description: 'Common University Entrance Test for Central Universities.', materials: [{ title: 'Sets, Relations and Functions', link: 'materials/notes.png', type: 'Notes' }] },

    // Government
    { name: 'UPSC CSE Prelims 2026', category: 'Government', conductingBody: 'UPSC', examDate: new Date('2026-05-28'), registrationDates: { start: new Date('2026-02-01'), end: new Date('2026-02-21') }, examLevel: 'National', websiteUrl: 'https://upsc.gov.in/', description: 'Civil Services Examination for IAS, IPS, IFS etc.', materials: [{ title: 'Sets, Relations and Functions', link: 'materials/notes.png', type: 'Notes' }] },
    { name: 'SSC CGL 2026', category: 'Government', conductingBody: 'SSC', examDate: new Date('2026-09-01'), registrationDates: { start: new Date('2026-04-01'), end: new Date('2026-05-01') }, examLevel: 'National', websiteUrl: 'https://ssc.nic.in/', description: 'Combined Graduate Level Examination for Group B and C posts.', materials: [{ title: 'Sets, Relations and Functions', link: 'materials/notes.png', type: 'Notes' }] },

    // Management
    { name: 'CAT 2026', category: 'Management', conductingBody: 'IIMs', examDate: new Date('2026-11-26'), registrationDates: { start: new Date('2026-08-02'), end: new Date('2026-09-13') }, examLevel: 'National', websiteUrl: 'https://iimcat.ac.in/', description: 'Common Admission Test for MBA admissions.', materials: [{ title: 'Sets, Relations and Functions', link: 'materials/notes.png', type: 'Notes' }] },
    { name: 'XAT 2026', category: 'Management', conductingBody: 'XLRI', examDate: new Date('2026-01-04'), registrationDates: { start: new Date('2025-07-15'), end: new Date('2025-11-30') }, examLevel: 'National', websiteUrl: 'https://xatonline.in/', description: 'Xavier Aptitude Test for management programs.', materials: [{ title: 'Sets, Relations and Functions', link: 'materials/notes.png', type: 'Notes' }] },

    // Law
    { name: 'CLAT 2026', category: 'Law', conductingBody: 'Consortium of NLUs', examDate: new Date('2025-12-03'), registrationDates: { start: new Date('2025-07-01'), end: new Date('2025-11-03') }, examLevel: 'National', websiteUrl: 'https://consortiumofnlus.ac.in/', description: 'Common Law Admission Test for NLUs.', materials: [{ title: 'Sets, Relations and Functions', link: 'materials/notes.png', type: 'Notes' }] },

    // Design
    { name: 'NIFT 2026', category: 'Design', conductingBody: 'NTA', examDate: new Date('2026-02-05'), registrationDates: { start: new Date('2025-12-01'), end: new Date('2025-12-31') }, examLevel: 'National', websiteUrl: 'https://nift.ac.in/', description: 'National Institute of Fashion Technology Entrance Exam.', materials: [{ title: 'Sets, Relations and Functions', link: 'materials/notes.png', type: 'Notes' }] }
];

// GET all exams
router.get('/', async (req, res) => {
    try {
        let query = {};
        if (req.query.category && req.query.category !== 'All') {
            query.category = req.query.category;
        }

        // Check if mongoose is connected (1 = connected)
        if (mongoose.connection.readyState !== 1) {
            console.log('MongoDB not connected, serving sample data');
            let filtered = sampleExams;
            if (query.category) {
                filtered = sampleExams.filter(e => e.category === query.category);
            }
            return res.json(filtered);
        }

        const exams = await Exam.find(query).sort({ examDate: 1 });
        res.json(exams);
    } catch (err) {
        console.error('Error fetching exams:', err);
        // Fallback on error too
        let filtered = sampleExams;
        if (req.query.category && req.query.category !== 'All') {
            filtered = sampleExams.filter(e => e.category === req.query.category);
        }
        res.json(filtered);
    }
});

module.exports = router;
