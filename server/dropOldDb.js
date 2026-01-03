const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '.env') });

const dropOldDb = async () => {
    try {
        // Explicitly target the 'eventease' database from the current env
        // or ensure we are deleting the one specified in the current string before we change it.
        const oldUri = process.env.MONGO_URI;

        if (!oldUri.includes('eventease')) {
            console.log('Safe guard: The current URI does not look like "eventease". Aborting drop to prevent accidents.');
            return;
        }

        console.log('🔌 Connecting to old "eventease" database...');
        await mongoose.connect(oldUri);

        console.log('🗑️ Dropping "eventease" database...');
        await mongoose.connection.db.dropDatabase();

        console.log('✅ "eventease" database deleted successfully.');
        process.exit(0);
    } catch (err) {
        console.error('❌ Error dropping database:', err);
        process.exit(1);
    }
};

dropOldDb();
