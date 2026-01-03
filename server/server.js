const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Database Connection
const connectDB = async () => {
    try {
        if (process.env.MONGO_URI.includes('example.mongodb.net') || !process.env.MONGO_URI) {
            console.log('⚠️  Notice: Using placeholder or missing MongoDB URI.');
            throw new Error('Placeholder URI');
        }
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ MongoDB Connected to Atlas');
    } catch (err) {
        console.error('❌ MongoDB Connection Error:', err.message);
        console.error('👉 If using MongoDB Atlas, please check your IP Whitelist: https://account.mongodb.com/account/login');
        process.exit(1);
    }
};
connectDB();

// Routes
app.use('/api/tasks', require('./routes/tasks'));
app.use('/api/auth', require('./routes/auth'));
app.use('/api/focus', require('./routes/focus'));
app.use('/api/habits', require('./routes/habits'));
app.use('/api/schedule', require('./routes/schedule'));
app.use('/api/focus', require('./routes/focus'));
app.use('/api/momentum', require('./routes/momentum'));
app.use('/api/goals', require('./routes/goals'));
app.use('/api/debug', require('./routes/debug'));

app.get('/', (req, res) => {
    res.send('Productivity App API is running'); // Server active
});


// Optimization: Reuse MongoDB connection if valid
if (mongoose.connection.readyState !== 0) {
    // console.log('Reusing existing MongoDB connection');
} else {
    connectDB();
}

// Export for Vercel
module.exports = app;

// Only listen if run directly
if (require.main === module) {
    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
}
