const express = require('express');
const router = express.Router();
const Goal = require('../models/Goal');
const auth = require('../middleware/auth');

// Get all goals
router.get('/', auth, async (req, res) => {
    try {
        const goals = await Goal.find({ user: req.user.id });
        res.json(goals);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// Create a goal
router.post('/', auth, async (req, res) => {
    const { title, description, deadline, dailyRoutine, weeklyMap } = req.body;
    try {
        // 1. Create the Goal
        const newGoal = new Goal({
            title,
            description,
            deadline,
            user: req.user.id
        });
        const goal = await newGoal.save();

        // 2. Create associated Daily Routine items if provided
        if (dailyRoutine && dailyRoutine.length > 0) {
            const DailyRoutine = require('../models/DailyRoutine');
            const routineItems = dailyRoutine.map((item, index) => ({
                user: req.user.id,
                goal: goal._id,
                timeSlot: item.timeSlot,
                period: item.period,
                activity: item.activity,
                intensity: item.intensity,
                order: index
            }));
            await DailyRoutine.insertMany(routineItems);
        }

        // 3. Create associated Weekly Map items if provided
        if (weeklyMap && weeklyMap.length > 0) {
            const WeeklyPlan = require('../models/WeeklyPlan');
            const planItems = weeklyMap.map(item => ({
                user: req.user.id,
                goal: goal._id,
                phase: item.phase || "Custom Phase",
                week: item.week,
                topic: item.topic,
                morningMission: item.morningMission,
                nightMission: item.nightMission,
                days: item.days // Assuming structure matches
            }));
            await WeeklyPlan.insertMany(planItems);
        }

        res.json(goal);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// Update goal
router.put('/:id', auth, async (req, res) => {
    const { title, description, completed, progress } = req.body;
    const goalFields = {};
    if (title) goalFields.title = title;
    if (description) goalFields.description = description;
    if (completed !== undefined) goalFields.completed = completed;
    if (progress !== undefined) goalFields.progress = progress;

    try {
        let goal = await Goal.findById(req.params.id);
        if (!goal) return res.status(404).json({ msg: 'Goal not found' });
        if (goal.user.toString() !== req.user.id.toString()) return res.status(401).json({ msg: 'Not authorized' });

        // If completing, add points (e.g., 100 points for a goal)
        if (completed === true && goal.completed !== true) {
            const User = require('../models/User');
            await User.findByIdAndUpdate(req.user.id, { $inc: { points: 100 } });
        }

        goal = await Goal.findByIdAndUpdate(req.params.id, { $set: goalFields }, { new: true });

        // Handle Daily Routine Updates (Full Replace Strategy)
        if (req.body.dailyRoutine) {
            const DailyRoutine = require('../models/DailyRoutine');
            await DailyRoutine.deleteMany({ goal: req.params.id }); // Wipe old
            if (req.body.dailyRoutine.length > 0) {
                const routineItems = req.body.dailyRoutine.map((item, index) => ({
                    user: req.user.id,
                    goal: goal._id,
                    timeSlot: item.timeSlot,
                    period: item.period,
                    activity: item.activity,
                    intensity: item.intensity,
                    order: index
                }));
                await DailyRoutine.insertMany(routineItems);
            }
        }

        // Handle Weekly Map Updates (Full Replace Strategy)
        if (req.body.weeklyMap) {
            const WeeklyPlan = require('../models/WeeklyPlan');
            await WeeklyPlan.deleteMany({ goal: req.params.id }); // Wipe old
            if (req.body.weeklyMap.length > 0) {
                const planItems = req.body.weeklyMap.map(item => ({
                    user: req.user.id,
                    goal: goal._id,
                    phase: item.phase || "Custom Phase",
                    week: item.week,
                    topic: item.topic,
                    morningMission: item.morningMission,
                    nightMission: item.nightMission,
                    days: item.days
                }));
                await WeeklyPlan.insertMany(planItems);
            }
        }

        res.json(goal);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// Delete goal
router.delete('/:id', auth, async (req, res) => {
    try {
        let goal = await Goal.findById(req.params.id);
        if (!goal) return res.status(404).json({ msg: 'Goal not found' });
        if (goal.user.toString() !== req.user.id.toString()) return res.status(401).json({ msg: 'Not authorized' });

        // Cascade delete: Remove associated DailyRoutines and WeeklyPlans
        const DailyRoutine = require('../models/DailyRoutine');
        const WeeklyPlan = require('../models/WeeklyPlan');
        await DailyRoutine.deleteMany({ goal: req.params.id });
        await WeeklyPlan.deleteMany({ goal: req.params.id });

        await Goal.findByIdAndDelete(req.params.id);
        res.json({ msg: 'Goal removed' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
