const mongoose = require('mongoose');

const DailyRoutineSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    goal: { type: mongoose.Schema.Types.ObjectId, ref: 'Goal', default: null }, // Link to specific goal
    timeSlot: { type: String, required: true },
    period: { type: String, required: true },
    activity: { type: String, required: true }, // The detailed description
    intensity: { type: String, required: true }, // e.g., "Alert", "High", "Passive"
    order: { type: Number, required: true } // For sorting
});

module.exports = mongoose.model('DailyRoutine', DailyRoutineSchema);
