const express = require('express');
const router = express.Router();
const Habit = require('../models/Habit');
const auth = require('../middleware/auth');

// Helper to get date string (YYYY-MM-DD) for cleaner comparison
const getDateString = (date) => {
    return new Date(date).toISOString().split('T')[0];
};

// GET /api/habits - Get all habits for a user
router.get('/', auth, async (req, res) => {
    try {
        const habits = await Habit.find({ userId: req.user.id }).sort({ createdAt: -1 });
        res.json(habits);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

// POST /api/habits - Create a habit
router.post('/', auth, async (req, res) => {
    try {
        const { title, description } = req.body;
        const newHabit = new Habit({
            userId: req.user.id,
            title,
            description,
            completedDates: []
        });
        const habit = await newHabit.save();
        res.json(habit);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

// DELETE /api/habits/:id - Delete a habit
router.delete('/:id', auth, async (req, res) => {
    try {
        const habit = await Habit.findOne({ _id: req.params.id, userId: req.user.id });
        if (!habit) return res.status(404).json({ msg: 'Habit not found' });

        await habit.deleteOne();
        res.json({ msg: 'Habit removed' });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

// PUT /api/habits/:id/toggle - Toggle completion for today
router.put('/:id/toggle', auth, async (req, res) => {
    try {
        const habit = await Habit.findOne({ _id: req.params.id, userId: req.user.id });
        if (!habit) return res.status(404).json({ msg: 'Habit not found' });

        const targetDate = req.body.date ? new Date(req.body.date) : new Date();
        const targetDateStr = getDateString(targetDate);

        const dateIndex = habit.completedDates.findIndex(date =>
            getDateString(date) === targetDateStr
        );

        if (dateIndex > -1) {
            // Already completed on target date, remove it
            habit.completedDates.splice(dateIndex, 1);
        } else {
            // Not completed, add target date
            habit.completedDates.push(targetDate);
        }

        await habit.save();
        res.json(habit);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

// GET /api/habits/stats - Get daily completion stats for the area chart
router.get('/stats', auth, async (req, res) => {
    try {
        const habits = await Habit.find({ userId: req.user.id });

        // Generate last 7 days keys
        const result = [];
        const days = 7;

        for (let i = days - 1; i >= 0; i--) {
            const d = new Date();
            d.setDate(d.getDate() - i);
            const dateStr = getDateString(d);

            // Format for chart label
            const label = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

            // Count total completions for this day across all habits
            let count = 0;
            habits.forEach(h => {
                if (h.completedDates.some(cd => getDateString(cd) === dateStr)) {
                    count++;
                }
            });

            result.push({
                name: label,
                completed: count
            });
        }

        res.json(result);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
