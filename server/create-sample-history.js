const mongoose = require('mongoose');
const dotenv = require('dotenv');
const PlaybackHistory = require('./models/PlaybackHistory');
const Song = require('./models/Song');
const User = require('./models/User');

dotenv.config();

async function createSampleHistory() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        // Get a user and songs
        const user = await User.findOne();
        console.log('User found:', user ? user._id : 'None');

        const songs = await Song.find().limit(5);
        console.log('Songs found:', songs.length);

        if (!user || songs.length === 0) {
            console.log('No user or songs found. Exiting.');
            process.exit(1);
        }

        // Delete any existing history
        await PlaybackHistory.deleteMany({ userId: user._id });
        console.log('Cleared existing history');

        // Create sample history entries
        const history = [];
        const now = new Date();

        for (let i = 0; i < songs.length; i++) {
            const playedAt = new Date(now.getTime() - (i * 30 * 60 * 1000)); // 30 minutes apart
            const entry = await PlaybackHistory.create({
                userId: user._id,
                songId: songs[i]._id,
                playedAt
            });
            history.push(entry);
        }

        console.log('Created', history.length, 'history entries');

        mongoose.disconnect();
        console.log('Done');
    } catch (err) {
        console.error('Error:', err);
        process.exit(1);
    }
}

createSampleHistory(); 