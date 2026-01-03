const express = require('express');
const router = express.Router();
const momentumService = require('../services/momentumService');
const auth = require('../middleware/auth'); // Assuming you have auth middleware

// Get Graph Metrics (Discipline, Consistency, Performance, Task, Heatmap)
router.get('/graphs', auth, async (req, res) => {
    try {
        if (!req.user.id) return res.status(401).json({ message: 'User not synced' });

        const metrics = await momentumService.getGraphMetrics(req.user.id);
        res.json(metrics);
    } catch (error) {
        console.error('Error fetching momentum graphs:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Update Momentum (Called after task completion)
router.post('/update', auth, async (req, res) => {
    try {
        const { taskId } = req.body;
        // In a real app, you might fetch the task first to verify ownership and properties
        // For now, we'll accept the task object or ID
        // Note: The service expects a task object. 
        // Let's assume the frontend passes the relevant task data or we fetch it.
        // We'll require fetching the task from DB to be safe
        const Task = require('../models/Task');
        const task = await Task.findById(taskId);

        if (!task) return res.status(404).json({ message: 'Task not found' });
        if (task.user.toString() !== req.user.id) return res.status(401).json({ message: 'Unauthorized' });

        const updatedUser = await momentumService.updateMomentum(req.user.id, task);
        res.json(updatedUser);
    } catch (error) {
        console.error('Error updating momentum:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
