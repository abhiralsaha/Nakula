const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    supabaseId: { type: String, unique: true },
    password: { type: String },

    // Legacy fields
    points: { type: Number, default: 0 },
    streak: { type: Number, default: 0 },
    focusMinutes: { type: Number, default: 0 },
    focusSeconds: { type: Number, default: 0 },
    lastActive: { type: Date, default: Date.now },

    // Momentum Engine fields
    consistencyScore: { type: Number, default: 50, min: 0, max: 100 },
    level: { type: Number, default: 1, min: 1, max: 5 },
    currentVelocity: { type: Number, default: 0 }, // tasks per hour
    volatilityIndex: { type: Number, default: 50 }, // 0-100, lower is better
    resilienceScore: { type: Number, default: 50 }, // 0-100
    emergencyModeActive: { type: Boolean, default: false },

    // Tracking
    consecutiveLowDays: { type: Number, default: 0 }, // For penalty box
    weeklyGoal: { type: Number, default: 0 },
    stakedBadge: { type: String, default: null },
    badgeRusted: { type: Boolean, default: false },

    // Preferences
    theme: { type: String, default: 'dark' },
    notificationChannels: { type: [String], default: [] }, // 'sms', 'email', 'alarm'
    mobileNumber: { type: String },
    isMobileVerified: { type: Boolean, default: false },
    googleId: { type: String },

    // Historical data
    dailyStats: [{
        date: { type: Date },
        tasksCompleted: { type: Number, default: 0 },
        totalTasks: { type: Number, default: 0 },
        hardTasksCompleted: { type: Number, default: 0 }, // For Discipline metric
        consistencyChange: { type: Number, default: 0 }
    }]
});

// Calculate level based on consistency score
UserSchema.methods.calculateLevel = function () {
    if (this.consistencyScore >= 80) return 5;
    if (this.consistencyScore >= 60) return 4;
    if (this.consistencyScore >= 40) return 3;
    if (this.consistencyScore >= 20) return 2;
    return 1;
};

module.exports = mongoose.model('User', UserSchema);
