const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const User = require('../models/User');
const FocusData = require('../models/FocusData');

// Save a completed focus session
router.post('/', auth, async (req, res) => {
    const { durationSeconds, action = 'complete' } = req.body;

    console.log('Received focus session save request:', req.body);
    console.log('User ID:', req.user.id);

    if (!req.user.id && req.user.supabaseId) {
        console.log('User ID missing in request but Supabase ID present. Attempting auto-sync...');
        try {
            let user = await User.findOne({ supabaseId: req.user.supabaseId });
            if (!user) {
                console.log('User not found in DB. Creating new user...');
                user = new User({
                    supabaseId: req.user.supabaseId,
                    username: 'User_' + req.user.supabaseId.substring(0, 6),
                    points: 0,
                    streak: 0,
                    lastActive: new Date()
                });
                await user.save();
                console.log('New user created via auto-sync:', user._id);
            }
            req.user.id = user._id;
        } catch (dbErr) {
            console.error('Auto-sync failed:', dbErr);
            return res.status(500).json({ msg: 'Database error during auto-sync' });
        }
    }

    if (durationSeconds === undefined || durationSeconds < 0) {
        console.log('Invalid durationSeconds:', durationSeconds);
        return res.status(400).json({ msg: 'Invalid durationSeconds' });
    }

    try {
        // Calculate points (e.g., 2 points per minute, i.e., 1 point per 30 seconds)
        const pointsEarned = Math.floor(durationSeconds / 30);

        // 1. Save detailed log
        const newFocusSession = new FocusData({
            user: req.user.id,
            durationSeconds,
            action,
            date: new Date()
        });
        await newFocusSession.save();
        console.log('Focus session saved to DB:', newFocusSession._id);

        // 2. Update user aggregates
        const user = await User.findByIdAndUpdate(
            req.user.id,
            {
                $inc: {
                    focusSeconds: durationSeconds,
                    focusMinutes: Math.floor(durationSeconds / 60), // Keep legacy field updated
                    points: pointsEarned
                }
            },
            { new: true }
        );

        res.json({
            msg: 'Session saved',
            pointsEarned,
            totalPoints: user.points,
            totalFocusSeconds: user.focusSeconds
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// Get focus statistics
router.get('/stats', auth, async (req, res) => {
    try {
        // Get last 7 days of data
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        const sessions = await FocusData.find({
            user: req.user.id,
            date: { $gte: sevenDaysAgo }
        }).sort({ date: 1 });

        // Aggregate by day (in seconds)
        const dailyData = {};
        // Initialize last 7 days with 0
        for (let i = 0; i < 7; i++) {
            const d = new Date();
            d.setDate(d.getDate() - i);
            const dateStr = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
            dailyData[dateStr] = 0;
        }

        sessions.forEach(session => {
            const dateStr = new Date(session.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
            if (dailyData[dateStr] !== undefined) {
                dailyData[dateStr] += session.durationSeconds || 0;
            }
        });

        // Convert to array for Recharts (convert seconds to minutes for display)
        const chartData = Object.keys(dailyData).reverse().map(date => ({
            name: date,
            minutes: Number((dailyData[date] / 60).toFixed(1)), // Convert seconds to minutes with 1 decimal
            seconds: dailyData[date] // Also include raw seconds
        }));

        // Get totals
        const totalSessions = await FocusData.countDocuments({ user: req.user.id });
        const user = await User.findById(req.user.id).select('focusSeconds focusMinutes');

        res.json({
            chartData,
            totalSessions,
            totalSeconds: user.focusSeconds || 0,
            totalMinutes: user.focusMinutes || 0 // Keep for backwards compatibility
        });

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// Delete all focus history
router.delete('/all', auth, async (req, res) => {
    try {
        console.log('Deleting all focus history for user:', req.user.id);

        // 1. Delete all sessions
        const result = await FocusData.deleteMany({ user: req.user.id });
        console.log(`Deleted ${result.deletedCount} sessions`);

        // 2. Reset user stats
        await User.findByIdAndUpdate(req.user.id, {
            focusSeconds: 0,
            focusMinutes: 0
        });

        res.json({ msg: 'All focus history deleted' });
    } catch (err) {
        console.error('Error deleting focus history:', err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
