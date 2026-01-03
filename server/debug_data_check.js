const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');
const DailyRoutine = require('./models/DailyRoutine');

dotenv.config();

const checkData = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ Connected to MongoDB');

        const users = await User.find();
        console.log(`Found ${users.length} users.`);

        const routines = await DailyRoutine.find();
        console.log(`Found ${routines.length} total routine items.`);

        for (const user of users) {
            const count = await DailyRoutine.countDocuments({ user: user._id });
            console.log(`User ${user.username} (ID: ${user._id}) has ${count} daily routine items.`);
        }

        process.exit();
    } catch (err) {
        console.error('❌ Error:', err);
        process.exit(1);
    }
};

checkData();
