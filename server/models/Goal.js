const mongoose = require('mongoose');

const GoalSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true },
    description: { type: String },
    deadline: { type: Date },
    completed: { type: Boolean, default: false },
    progress: { type: Number, default: 0 }, // Percentage
});

module.exports = mongoose.model('Goal', GoalSchema);
