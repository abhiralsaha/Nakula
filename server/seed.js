const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const Task = require('./models/Task');
const Goal = require('./models/Goal');

dotenv.config();

const seedData = async () => {
    try {
        if (!process.env.MONGO_URI) {
            throw new Error('MONGO_URI is not defined in .env file');
        }
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB Connected');

        // Clear existing data
        await User.deleteMany({});
        await Task.deleteMany({});
        await Goal.deleteMany({});
        console.log('Data Cleared');

        // Create Demo User
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash('password123', salt);

        const user = new User({
            username: 'demo_user',
            password: hashedPassword,
            points: 1250,
            streak: 12,
            lastActive: new Date()
        });
        await user.save();
        console.log('Demo User Created');

        // Create Tasks
        const tasks = [
            {
                user: user._id,
                title: 'Complete Project Proposal',
                description: 'Draft the initial proposal for the client.',
                status: 'pending',
                type: 'Work',
                points: 20
            },
            {
                user: user._id,
                title: 'Review Code Changes',
                description: 'Check PR #102 for bugs.',
                status: 'completed',
                type: 'Dev',
                points: 15
            },
            {
                user: user._id,
                title: 'Team Meeting',
                description: 'Weekly sync with the engineering team.',
                status: 'pending',
                type: 'Work',
                points: 10
            },
            {
                user: user._id,
                title: 'Morning Workout',
                description: '30 mins cardio.',
                status: 'completed',
                type: 'Health',
                points: 30
            }
        ];
        await Task.insertMany(tasks);
        console.log('Tasks Created');

        // Create Goals
        const goals = [
            {
                user: user._id,
                title: 'Learn React Native',
                description: 'Build a mobile app.',
                deadline: new Date('2025-12-31'),
                progress: 75,
                completed: false
            },
            {
                user: user._id,
                title: 'Read 20 Books',
                description: 'Focus on self-improvement.',
                deadline: new Date('2025-06-30'),
                progress: 40,
                completed: false
            },
            {
                user: user._id,
                title: 'Run a Marathon',
                description: 'Train for 42km.',
                deadline: new Date('2025-10-15'),
                progress: 10,
                completed: false
            }
        ];
        await Goal.insertMany(goals);
        console.log('Goals Created');

        console.log('Database Seeded Successfully');
        process.exit();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

seedData();
