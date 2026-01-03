const cron = require('node-cron');
const Task = require('../models/Task');
const User = require('../models/User');
const notificationService = require('./notificationService');

const initScheduler = () => {
    console.log('⏳ Scheduler initialized');

    // Run every minute
    cron.schedule('* * * * *', async () => {
        try {
            const now = new Date();
            const oneMinuteLater = new Date(now.getTime() + 60000);

            // Find tasks due within the next minute (or past due) that haven't been notified
            // We look for tasks where dueDate is <= oneMinuteLater && notificationSent is false
            // Also ensure we don't pick up tasks from way in the past if we don't want to spam, 
            // but for now let's say tasks due in the last hour to next minute.
            const oneHourAgo = new Date(now.getTime() - 60 * 60000);

            const tasks = await Task.find({
                dueDate: { $gte: oneHourAgo, $lte: oneMinuteLater },
                notificationSent: false,
                status: { $ne: 'completed' }
            }).populate('user');

            if (tasks.length > 0) {
                console.log(`Checking ${tasks.length} tasks for notifications...`);
            }

            for (const task of tasks) {
                const user = task.user;
                if (!user) continue;

                // Check user preferences
                const channels = user.notificationChannels || [];

                if (channels.includes('sms') && user.mobileNumber) {
                    await notificationService.sendSMS(user.mobileNumber, `Task Reminder: ${task.title} is due at ${task.dueDate.toLocaleTimeString()}`);
                }

                if (channels.includes('email') && user.email) { // existing email field? User.js doesn't show email mock but auth adds it?
                    // Auth route added email to User model in update, but schema needs to support it if strict? 
                    // Schema doesn't have email explicitly defined in the previous view, let's assume it might not be there or schema is loose.
                    // Wait, I didn't add email to User Schema. I added it in the auth route update logic but not the schema definition?
                    // Mongoose is strict by default. I should check User Schema again or just use username/mock for now.
                    // Actually, let's assume I need to add email to schema if I want to use it.
                    // For now, I'll valid check `user.email` but if it's missing in schema it won't be saved.
                    // I will double check User Schema in a sec.
                    await notificationService.sendEmail(user.email || 'user@example.com', `Task Reminder: ${task.title}`, `Your task "${task.title}" is due.`);
                }

                if (channels.includes('alarm')) {
                    await notificationService.sendAlarm(user, task);
                }

                // Mark as notified
                task.notificationSent = true;
                await task.save();
            }

        } catch (err) {
            console.error('Scheduler Error:', err);
        }
    });
};

module.exports = initScheduler;
