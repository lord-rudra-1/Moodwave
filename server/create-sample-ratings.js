const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Rating = require('./models/Rating');
const Song = require('./models/Song');
const User = require('./models/User');

dotenv.config();

async function createSampleRatings() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        // Get a user and songs
        const user = await User.findOne();
        console.log('User found:', user ? user._id : 'None');

        const songs = await Song.find();
        console.log('Songs found:', songs.length);

        if (!user || songs.length === 0) {
            console.log('No user or songs found. Exiting.');
            process.exit(1);
        }

        // Get all users for more realistic ratings
        const users = await User.find();
        console.log('Users found:', users.length);

        // Delete existing ratings
        await Rating.deleteMany({});
        console.log('Cleared existing ratings');

        const ratings = [];
        const now = new Date();

        // Generate realistic ratings distribution (average around 3.5-4.5)
        // with some songs rated higher than others
        for (const song of songs) {
            // Decide base rating for this song (3-5)
            const baseSongRating = Math.random() * 2 + 3;

            // Each song will get rated by 5-15 users
            const numRatings = Math.floor(Math.random() * 10) + 5;

            // Get random selection of users to rate this song
            const ratingUsers = users.length > 1
                ? [...users].sort(() => 0.5 - Math.random()).slice(0, numRatings)
                : [user]; // If only one user, use them for all ratings

            for (const ratingUser of ratingUsers) {
                // Generate a rating that's close to the song's base rating
                // but with some variation (±1)
                let userRating = Math.round(baseSongRating + (Math.random() * 2 - 1));
                // Ensure rating is between 1-5
                userRating = Math.max(1, Math.min(5, userRating));

                const ratedAt = new Date(now.getTime() - (Math.random() * 30 * 24 * 60 * 60 * 1000)); // Random time in the last month

                try {
                    const rating = await Rating.create({
                        songId: song._id,
                        userId: ratingUser._id,
                        rating: userRating,
                        ratedAt
                    });

                    ratings.push(rating);
                } catch (error) {
                    console.error(`Error creating rating for song ${song._id} by user ${ratingUser._id}:`, error.message);
                    // Continue with other ratings even if one fails
                }
            }
        }

        console.log(`Created ${ratings.length} ratings across ${songs.length} songs`);

        mongoose.disconnect();
        console.log('Done');
    } catch (err) {
        console.error('Error:', err);
        process.exit(1);
    }
}

createSampleRatings(); 