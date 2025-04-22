const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Comment = require('./models/Comment');
const Song = require('./models/Song');
const User = require('./models/User');

dotenv.config();

async function createSampleComments() {
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

        // Sample comments
        const sampleComments = [
            "This is such a beautiful song!",
            "Perfect for my morning routine!",
            "The melody is so catchy, can't stop listening to it.",
            "One of my all-time favorites.",
            "This beat is fire! 🔥",
            "The lyrics really speak to me.",
            "Great song for relaxing after a long day.",
            "I love the artist's voice in this track.",
            "Added to my playlist immediately!",
            "Reminds me of summer vibes."
        ];

        // Delete existing comments
        await Comment.deleteMany({});
        console.log('Cleared existing comments');

        const comments = [];
        const now = new Date();

        // Add 3-5 random comments to each song
        for (const song of songs) {
            const numComments = Math.floor(Math.random() * 3) + 3; // 3-5 comments per song

            for (let i = 0; i < numComments; i++) {
                const commentText = sampleComments[Math.floor(Math.random() * sampleComments.length)];
                const createdAt = new Date(now.getTime() - (Math.random() * 7 * 24 * 60 * 60 * 1000)); // Random time in the last week

                const comment = await Comment.create({
                    songId: song._id,
                    userId: user._id,
                    comment: commentText,
                    createdAt
                });

                comments.push(comment);
            }
        }

        console.log(`Created ${comments.length} comments across ${songs.length} songs`);

        mongoose.disconnect();
        console.log('Done');
    } catch (err) {
        console.error('Error:', err);
        process.exit(1);
    }
}

createSampleComments(); 