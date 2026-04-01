const mongoose = require('mongoose');

const UpdateSchema = new mongoose.Schema({
    text: {
        type: String,
        required: true
    },
    link: {
        type: String
    },
    active: {
        type: Boolean,
        default: true
    }
}, { timestamps: true });

module.exports = mongoose.model('Update', UpdateSchema);
