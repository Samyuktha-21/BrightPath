const mongoose = require('mongoose');

const ExamSchema = new mongoose.Schema({
    name: { type: String, required: true },
    category: {
        type: String,
        required: true,
        enum: ['Medical', 'Engineering', 'Government', 'Management', 'School', 'Law', 'Design', 'Language', 'University', 'Other']
    },
    conductingBody: { type: String },
    // Optional: rolling exams (GRE/GMAT/TOEFL/IELTS) have no single date — see isRolling/scheduleNote
    examDate: { type: Date },
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
    // True only when the date was confirmed against an official source
    isVerified: { type: Boolean, default: false },
    // True for year-round exams with no fixed date (GRE, GMAT, TOEFL, IELTS)
    isRolling: { type: Boolean, default: false },
    // Human-readable schedule note, used mainly for rolling/multi-stage exams
    scheduleNote: { type: String },
    lastUpdated: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('Exam', ExamSchema);
