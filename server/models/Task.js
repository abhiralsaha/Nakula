const mongoose = require('mongoose');

const TaskSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true },
    description: { type: String },
    type: { type: String, default: 'Personal' },
    status: { type: String, enum: ['pending', 'completed'], default: 'pending' },
    date: { type: Date, default: Date.now },
    completedAt: { type: Date },
    points: { type: Number, default: 10 },

    // Kanban Board fields
    kanbanStatus: {
        type: String,
        enum: ['todo', 'in_progress', 'done'],
        default: 'todo'
    },
    position: { type: Number, default: 0 }, // Order within column
    labels: [{ type: String }], // Color-coded labels
    dueDate: { type: Date },
    notificationSent: { type: Boolean, default: false },

    // Momentum Engine fields
    isNonNegotiable: { type: Boolean, default: false }, // Shows in Emergency Mode
    priority: { type: Number, default: 2, min: 1, max: 3 } // 1=Low, 2=Medium, 3=High
});

module.exports = mongoose.model('Task', TaskSchema);
