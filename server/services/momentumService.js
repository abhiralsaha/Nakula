const User = require('../models/User');
const Task = require('../models/Task');

class MomentumService {
    // Calculate the 4 Circular Metrics and Heatmap Data
    async getGraphMetrics(userId) {
        const user = await User.findById(userId);
        if (!user) throw new Error('User not found');

        // 1. DISCIPLINE: Daily Completion Rate (Days with 100% completion / Total Active Days)
        const dailyAgg = await Task.aggregate([
            { $match: { user: user._id } },
            {
                $group: {
                    _id: { $dateToString: { format: "%Y-%m-%d", date: "$date" } },
                    total: { $sum: 1 },
                    completed: { $sum: { $cond: [{ $eq: ["$status", "completed"] }, 1, 0] } }
                }
            }
        ]);

        const totalActiveDays = dailyAgg.length;
        const perfectDays = dailyAgg.filter(day => day.completed === day.total).length;

        const disciplineScore = totalActiveDays > 0 ? Math.round((perfectDays / totalActiveDays) * 100) : 0;

        // 2. CONSISTENCY: Streak Strength (Current Streak / 30? or just scaled)
        // 2. CONSISTENCY: Task Completion Rate (Total Completed / Total Created)
        const totalTasksAll = await Task.countDocuments({ user: userId });
        const totalCompletedAll = await Task.countDocuments({ user: userId, status: 'completed' });

        const consistencyMetric = totalTasksAll > 0 ? Math.round((totalCompletedAll / totalTasksAll) * 100) : 0;



        // 4. TASK: Volume (Today's completed / Weekly Goal scaled to daily)
        // If weekly goal is 50, daily target is ~7.
        const dailyTarget = user.weeklyGoal > 0 ? Math.ceil(user.weeklyGoal / 7) : 5;

        // Count today's tasks
        const todayStart = new Date();
        todayStart.setHours(0, 0, 0, 0);
        const tasksToday = await Task.countDocuments({
            user: userId,
            status: 'completed',
            completedAt: { $gte: todayStart }
        });

        const taskScore = Math.min((tasksToday / dailyTarget) * 100, 100);

        // 3. PERFORMANCE: Overall Efficiency (Average of the other 3 metrics)
        const performanceScore = Math.round((disciplineScore + consistencyMetric + taskScore) / 3);

        // HEATMAP DATA - Aggregate from actual Task documents
        // Get all completed tasks for this user in the last year
        const oneYearAgo = new Date();
        oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

        const tasksByDate = await Task.aggregate([
            {
                $match: {
                    user: user._id,
                    status: 'completed',
                    completedAt: { $gte: oneYearAgo }
                }
            },
            {
                $group: {
                    _id: {
                        $dateToString: { format: '%Y-%m-%d', date: '$completedAt' }
                    },
                    count: { $sum: 1 }
                }
            },
            {
                $project: {
                    _id: 0,
                    date: '$_id',
                    count: 1
                }
            },
            {
                $sort: { date: 1 }
            }
        ]);

        const heatmapData = tasksByDate;

        return {
            metrics: {
                discipline: disciplineScore,
                consistency: Math.round(consistencyMetric),
                performance: Math.round(performanceScore),
                task: Math.round(taskScore)
            },
            counts: {
                discipline: `${perfectDays}/${totalActiveDays}`,
                consistency: `${totalCompletedAll}/${totalTasksAll}`,
                performance: `Avg. Score`,
                task: `${tasksToday}/${dailyTarget}`
            },
            heatmap: heatmapData
        };
    }

    // Update stats after task completion
    async updateMomentum(userId, task) {
        const user = await User.findById(userId);
        if (!user) return;

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // Find or create today's stat entry
        let todayStat = user.dailyStats.find(s => new Date(s.date).getTime() === today.getTime());
        if (!todayStat) {
            todayStat = { date: today, tasksCompleted: 0, totalTasks: 0, hardTasksCompleted: 0, consistencyChange: 0 };
            user.dailyStats.push(todayStat);
        }

        // Update counts
        todayStat.tasksCompleted += 1;
        if (task.isNonNegotiable) {
            todayStat.hardTasksCompleted += 1;
        }

        // Recalculate Streak
        // Simple logic: if lastActive was yesterday, increment. If today, do nothing. If older, reset.
        const lastActive = new Date(user.lastActive);
        lastActive.setHours(0, 0, 0, 0);

        const diffDays = (today.getTime() - lastActive.getTime()) / (1000 * 3600 * 24);

        if (diffDays === 1) {
            user.streak += 1;
        } else if (diffDays > 1) {
            user.streak = 1; // Reset to 1 (today)
        }
        // If diffDays === 0, distinct streak points already counted or we don't increment streak daily?
        // Usually streak increments once per day. We can trust the diff logic.

        user.lastActive = new Date();

        // Update basic Momentum Score (placeholder logic for now)
        // "Elastic Consistency" could be: Score + (1 * multiplier)
        const gain = task.isNonNegotiable ? 2 : 1;
        user.consistencyScore = Math.min(user.consistencyScore + gain, 100);

        await user.save();
        return user;
    }
}

module.exports = new MomentumService();
