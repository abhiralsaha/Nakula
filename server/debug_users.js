const mongoose = require('mongoose');
const User = require('./models/User'); // Adjusted path
require('dotenv').config(); // Default path

const checkUsers = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');

        const count = await User.countDocuments();
        console.log(`Total Users: ${count}`);

        const users = await User.find({});
        users.forEach(u => {
            console.log(`User: ${u.username}, ID: ${u._id}, SupabaseID: ${u.supabaseId}`);
        });

        process.exit();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

checkUsers();
