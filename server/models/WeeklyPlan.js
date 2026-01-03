const mongoose = require('mongoose');

const WeeklyPlanSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    goal: { type: mongoose.Schema.Types.ObjectId, ref: 'Goal', default: null }, // Link to specific goal
    phase: { type: String, required: true }, // e.g., "Foundation & Patterns", "The Google Filter"
    week: { type: Number, required: true }, // 1-12
    topic: { type: String, required: true },
    morningMission: { type: String, required: true }, // Description of morning routine for this week
    nightMission: { type: String, required: true }, // Description of night routine for this week

    // Daily breakdowns for detailed view
    days: [{
        day: { type: String }, // Mon, Tue, etc.
        morningTask: { type: String },
        nightTask: { type: String }
    }]
});

module.exports = mongoose.model('WeeklyPlan', WeeklyPlanSchema);
