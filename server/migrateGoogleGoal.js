const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Goal = require('./models/Goal');
const DailyRoutine = require('./models/DailyRoutine');
const WeeklyPlan = require('./models/WeeklyPlan');
const User = require('./models/User');

dotenv.config();

const migrateGoogleGoal = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ MongoDB Connected for Migration');

        const users = await User.find();

        for (const user of users) {
            console.log(`Processing user: ${user.username}`);

            // 1. Check if "Google Interview Prep" goal already exists
            let googleGoal = await Goal.findOne({ user: user._id, title: "Google Interview Prep" });

            if (!googleGoal) {
                console.log('   Creating "Google Interview Prep" Goal...');
                googleGoal = new Goal({
                    user: user._id,
                    title: "Google Interview Prep",
                    description: "Master Data Structures, Algorithms, and System Design to crack the Google interview.",
                    deadline: new Date("2026-06-01"), // Approx 6 months out
                    progress: 0,
                    completed: false
                });
                await googleGoal.save();
                console.log('   ✅ Goal Created');
            } else {
                console.log('   Goal already exists');
            }

            // 2. Move existing Daily Routines (where goal is null) to this goal
            const routineResult = await DailyRoutine.updateMany(
                { user: user._id, goal: null },
                { $set: { goal: googleGoal._id } }
            );
            console.log(`   Migrated ${routineResult.modifiedCount} Daily Routine items to Google Goal.`);

            // 3. Move existing Weekly Plans (where goal is null) to this goal
            const planResult = await WeeklyPlan.updateMany(
                { user: user._id, goal: null },
                { $set: { goal: googleGoal._id } }
            );
            console.log(`   Migrated ${planResult.modifiedCount} Weekly Plan items to Google Goal.`);
        }

        console.log('Migration Complete');
        process.exit(0);

    } catch (err) {
        console.error('Migration Error:', err);
        process.exit(1);
    }
};

migrateGoogleGoal();
