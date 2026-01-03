const express = require('express');
const router = express.Router();
const Task = require('../models/Task');
const auth = require('../middleware/auth');

// Fix Ownership of all tasks to current user
// POST /api/debug/fix-ownership
router.post('/fix-ownership', auth, async (req, res) => {
    try {
        if (!req.user.id) return res.status(401).json({ msg: 'Not authorized' });

        // Update all tasks to belong to the current user
        // logic: update many where user is NOT current user (or all, to be safe)
        const result = await Task.updateMany({}, { $set: { user: req.user.id } });

        res.json({
            msg: `Ownership fixed for ${result.modifiedCount} tasks.`,
            count: result.modifiedCount
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
