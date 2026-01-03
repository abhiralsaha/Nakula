const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');
const Task = require('./models/Task');
const path = require('path');

// Load env vars
dotenv.config({ path: path.join(__dirname, '.env') });

const seedMomentumData = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('📦 Connected to MongoDB...');

        // 1. Get ALL users to ensure the logged-in user gets data
        const users = await User.find({});

        if (users.length === 0) {
            console.log('⚠️ No users found. Creating a demo user...');
            const newUser = await User.create({
                username: 'DemoUser',
                password: 'password123',
                email: 'demo@example.com'
            });
            users.push(newUser);
        }

        console.log(`🚀 Seeding data for ${users.length} users...`);

        for (const user of users) {
            console.log(`\n👤 Processing user: ${user.username} (${user._id})`);

            // 2. Generate 365 Days of History (Heatmap Data)
            const today = new Date();
            const dailyStats = [];

            // Configuration for "realistic" activity
            // We want some "streaks" and some "gaps"
            let currentStreak = 0;

            for (let i = 364; i >= 0; i--) {
                const date = new Date(today);
                date.setDate(date.getDate() - i);

                // Randomly decide if we did tasks today (70% chance)
                // If we are in a streak, higher chance to continue
                const isActive = Math.random() > 0.3;

                let tasksCount = 0;
                let hardCount = 0;

                if (isActive) {
                    // Generate 1-10 tasks
                    // Weighted towards 3-6
                    tasksCount = Math.floor(Math.random() * 6) + 1; // 1 to 6
                    if (Math.random() > 0.8) tasksCount += 4; // occasional big day

                    // Hard tasks (Discipline metric) - roughly 20-30%
                    hardCount = Math.floor(tasksCount * (0.2 + Math.random() * 0.2));
                    currentStreak++;
                } else {
                    currentStreak = 0;
                }

                dailyStats.push({
                    date: date,
                    tasksCompleted: tasksCount,
                    totalTasks: tasksCount + Math.floor(Math.random() * 2), // small incomplete buffer
                    hardTasksCompleted: hardCount,
                    consistencyChange: isActive ? 1 : -1
                });
            }

            user.dailyStats = dailyStats;

            // 3. Update Current Metrics
            // Consistency: 30-day active %
            const last30 = dailyStats.slice(-30);
            const activeDays = last30.filter(d => d.tasksCompleted > 0).length;
            user.consistencyScore = Math.round((activeDays / 30) * 100);

            // Streak
            let streak = 0;
            // Calculate real streak from end of array backwards
            for (let i = dailyStats.length - 1; i >= 0; i--) {
                if (dailyStats[i].tasksCompleted > 0) streak++;
                else break;
            }
            user.streak = streak;

            // Level
            user.level = user.calculateLevel();

            // Velocity (Random 2-6 tasks/hr)
            user.currentVelocity = (Math.random() * 4 + 2).toFixed(1);

            // Weekly Goal
            user.weeklyGoal = 35;

            await user.save();
            console.log(`   ✅ Stats updated`);

            // 4. Create dummy tasks for today (optional, just for first user or all?)
            // Let's do it for all to be safe
            const todayStats = dailyStats[dailyStats.length - 1];
            if (todayStats.tasksCompleted > 0) {
                // Remove old dummy tasks to preventing dupe spam if re-run
                await Task.deleteMany({ user: user._id, description: 'Auto-generated via seed script' });

                const taskTypes = ['Code', 'Workout', 'Read', 'Meditate', 'Journal'];

                for (let i = 0; i < todayStats.tasksCompleted; i++) {
                    await Task.create({
                        user: user._id,
                        title: `${taskTypes[i % taskTypes.length]} Session`,
                        description: 'Auto-generated via seed script',
                        status: 'completed',
                        completedAt: new Date(),
                        isNonNegotiable: i < todayStats.hardTasksCompleted,
                        points: 10
                    });
                }
                console.log(`   📝 Tasks created: ${todayStats.tasksCompleted}`);
            }
        }

        console.log('\n🎉 All users seeded! Refresh your dashboard.');
        process.exit(0);

    } catch (err) {
        console.error('❌ Seeding failed:', err);
        process.exit(1);
    }
};

seedMomentumData();
