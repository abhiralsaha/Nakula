const mongoose = require('mongoose');

const FocusDataSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    durationSeconds: {
        type: Number,
        required: true,
        default: 0
    },
    action: {
        type: String,
        enum: ['start', 'pause', 'resume', 'reset', 'complete'],
        default: 'complete'
    },
    date: {
        type: Date,
        default: Date.now
    }
}, { collection: 'focus_data' });

module.exports = mongoose.model('FocusData', FocusDataSchema);
