const mongoose = require('mongoose');

async function test() {
    try {
        console.log('Testing local MongoDB connection...');
        await mongoose.connect('mongodb://127.0.0.1:27017/productivity');
        console.log('✅ Connected to local MongoDB successfully!');
        process.exit(0);
    } catch (err) {
        console.error('❌ Could not connect to local MongoDB:', err.message);
        process.exit(1);
    }
}

test();
