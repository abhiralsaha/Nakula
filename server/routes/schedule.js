const express = require('express');
const router = express.Router();
const DailyRoutine = require('../models/DailyRoutine');
const WeeklyPlan = require('../models/WeeklyPlan');
const auth = require('../middleware/auth');

// Get Daily Routine
router.get('/daily', auth, async (req, res) => {
    try {
        const goalId = req.query.goalId === 'null' ? null : req.query.goalId;
        const query = { user: req.user.id, goal: goalId }; // Filter by goal

        const routine = await DailyRoutine.find(query).sort({ order: 1 });
        res.json(routine);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});



// Get Weekly Plan
router.get('/weekly', auth, async (req, res) => {
    try {
        const goalId = req.query.goalId === 'null' ? null : req.query.goalId;
        const query = { user: req.user.id, goal: goalId }; // Filter by goal

        const plan = await WeeklyPlan.find(query).sort({ week: 1 });
        res.json(plan);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
