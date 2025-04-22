const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Song = require('./models/Song');

// Load environment variables
dotenv.config();

// Map of mood tags to cover images
const moodCovers = {
    'Happy': 'happy-cover.jpg',
    'Sad': 'sad-cover.jpg',
    'Energetic': 'energy-cover.jpg',
    'Calm': 'peaceful-cover.jpg',
    'Romantic': 'love-cover.jpg',
    'Melancholic': 'melancholic-cover.jpg',
    'Chill': 'chill-cover.jpg'
};

async function fixSongCovers() {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        // Get all songs
        const songs = await Song.find({});
        console.log(`Found ${songs.length} songs in database`);

        let updatedCount = 0;
        let errorCount = 0;

        // Update each song
        for (const song of songs) {
            try {
                // Determine cover image based on first mood tag
                let coverImage = 'default-cover.jpg'; // Default fallback

                if (song.moodTags && song.moodTags.length > 0) {
                    // Use the first mood tag to determine cover
                    const primaryMood = song.moodTags[0];
                    if (moodCovers[primaryMood]) {
                        coverImage = moodCovers[primaryMood];
                    }
                } else if (song.mood) {
                    // If song has a mood property (from older format)
                    if (moodCovers[song.mood]) {
                        coverImage = moodCovers[song.mood];
                    }
                }

                // Update the song with the cover image
                await Song.findByIdAndUpdate(song._id, { coverImage });
                updatedCount++;
            } catch (err) {
                console.error(`Error updating song ${song.title}:`, err.message);
                errorCount++;
            }
        }

        console.log(`Updated ${updatedCount} songs with cover images`);
        if (errorCount > 0) {
            console.log(`Encountered errors with ${errorCount} songs`);
        }

        // Disconnect from MongoDB
        mongoose.disconnect();
        console.log('Done!');
    } catch (err) {
        console.error('Error:', err);
        process.exit(1);
    }
}

fixSongCovers(); 