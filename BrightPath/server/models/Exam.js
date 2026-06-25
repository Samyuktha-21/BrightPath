const mongoose = require('mongoose');

const ExamSchema = new mongoose.Schema({
    name: { type: String, required: true },
    category: { type: String, required: true, enum: ['Medical', 'Engineering', 'Government', 'Management', 'Law', 'Design', 'University', 'Other'] },
    conductingBody: { type: String },
    examDate: { type: Date, required: true },
    registrationDates: {
        start: Date,
        end: Date
    },
    examLevel: { type: String, enum: ['National', 'State', 'University', 'International'] },
    websiteUrl: { type: String, required: true },
    description: { type: String },
    materials: [{
        title: { type: String },
        link: { type: String },
        type: { type: String, enum: ['Syllabus', 'Previous Year Paper', 'Mock Test', 'Notes'] }
    }],
    // True when the exam date is not yet officially announced (expected/based on past cycles)
    isTentative: { type: Boolean, default: false },
    lastUpdated: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('Exam', ExamSchema);
