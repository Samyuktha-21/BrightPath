const mongoose = require('mongoose');

const CommentSchema = new mongoose.Schema({
    userId: { type: String, required: true },
    userName: { type: String, required: true },
    text: { type: String, required: true },
    category: { 
        type: String, 
        required: true,
        enum: ['All Exams', 'Medical', 'Engineering', 'Government', 'Management', 'Law', 'Design', 'Other']
    }
}, { timestamps: true });

module.exports = mongoose.model('Comment', CommentSchema);
