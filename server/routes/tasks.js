const express = require('express');
const router = express.Router();
const Task = require('../models/Task');
const User = require('../models/User');
const auth = require('../middleware/auth');

// Get all tasks for user
router.get('/', auth, async (req, res) => {
    try {
        if (!req.user.id) return res.json([]);
        const tasks = await Task.find({ user: req.user.id }).sort({ position: 1, date: -1 });
        res.json(tasks);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// Create a task
router.post('/', auth, async (req, res) => {
    const { title, description, type, priority, kanbanStatus, labels, dueDate } = req.body;
    try {
        const newTask = new Task({
            title,
            description,
            type,
            priority: priority || 2,
            kanbanStatus: kanbanStatus || 'todo',
            labels: labels || [],
            dueDate,
            dueDate,
            user: req.user.id,
            position: await Task.countDocuments({ user: req.user.id }) // Add to end
        });
        const task = await newTask.save();
        res.json(task);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// Update task (e.g., complete)
router.put('/:id', auth, async (req, res) => {
    const { title, description, status } = req.body;
    const taskFields = {};
    if (title) taskFields.title = title;
    if (description) taskFields.description = description;
    if (status) taskFields.status = status;

    try {
        if (!req.user.id) return res.status(401).json({ msg: 'Not authorized' });

        let task = await Task.findOne({ _id: req.params.id, user: req.user.id });
        if (!task) return res.status(404).json({ msg: 'Task not found' });

        // If completing, add points and set completedAt for heatmap
        if (status === 'completed' && task.status !== 'completed') {
            taskFields.completedAt = new Date();
            await User.findByIdAndUpdate(req.user.id, { $inc: { points: task.points } });
        }

        task = await Task.findOneAndUpdate(
            { _id: req.params.id, user: req.user.id },
            { $set: taskFields },
            { new: true }
        );
        res.json(task);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// Move task (Kanban drag-and-drop)
router.patch('/:id/move', auth, async (req, res) => {
    const { kanbanStatus, position } = req.body;
    try {
        if (!req.user.id) return res.status(401).json({ msg: 'Not authorized: User unknown' });

        let task = await Task.findOne({ _id: req.params.id, user: req.user.id });
        if (!task) return res.status(404).json({ msg: 'Task not found or not authorized' });

        // Update task status and position
        task.kanbanStatus = kanbanStatus || task.kanbanStatus;
        task.position = position !== undefined ? position : task.position;

        // If moving to done, mark as completed
        if (kanbanStatus === 'done' && task.status !== 'completed') {
            task.status = 'completed';
            task.completedAt = new Date();
            await User.findByIdAndUpdate(req.user.id, { $inc: { points: task.points } });
        }

        // If moving out of done, mark as pending
        if (kanbanStatus !== 'done' && task.status === 'completed') {
            task.status = 'pending';
            task.completedAt = null;
        }

        await task.save();
        res.json(task);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// Reorder tasks
router.patch('/reorder', auth, async (req, res) => {
    const { tasks } = req.body;
    try {
        if (!req.user.id) return res.status(401).json({ msg: 'Not authorized: User unknown' });

        // Safety check: ensure all tasks belong to user before finding
        const taskIds = tasks.map(t => t._id);
        const userTasks = await Task.find({ _id: { $in: taskIds }, user: req.user.id });
        if (userTasks.length !== tasks.length) {
            console.warn('Reorder attempt with mismatched ownership');
        }

        // Bulk write to update positions
        const bulkOps = tasks.map((task, index) => ({
            updateOne: {
                filter: { _id: task._id, user: req.user.id }, // Add user check filter to bulk ops
                update: { $set: { position: index } }
            }
        }));
        await Task.bulkWrite(bulkOps);
        res.json({ msg: 'Tasks reordered' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// Delete task
router.delete('/:id', auth, async (req, res) => {
    try {
        let task = await Task.findById(req.params.id);
        if (!task) return res.status(404).json({ msg: 'Task not found' });
        if (task.user.toString() !== (req.user.id ? req.user.id.toString() : '')) {
            console.log('--- AUTH FAILURE ---');
            console.log('Task ID:', task._id);
            console.log('Task User (DB):', task.user, typeof task.user);
            console.log('Req User (Token):', req.user.id, typeof req.user.id);
            console.log('Comparison:', task.user.toString(), '===', req.user.id ? req.user.id.toString() : 'null');

            const taskUser = task.user.toString();
            const reqUser = req.user.id ? req.user.id.toString() : 'null';
            return res.status(401).json({ msg: `Auth Failed: Owner ${taskUser} vs You ${reqUser}` });
        }

        await Task.findByIdAndDelete(req.params.id);
        res.json({ msg: 'Task removed' });
    } catch (err) {
        console.error('Delete Task Error:', err.message);
        res.status(500).json({ msg: 'Server Error: ' + err.message });
    }
});

module.exports = router;
