const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Song = require('./models/Song');

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

// Default cover if mood can't be determined
const DEFAULT_COVER = 'chill-cover.jpg';

async function updateMissingCovers() {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        // Get all songs
        const allSongs = await Song.find({});
        console.log(`Total songs: ${allSongs.length}`);

        let updatedCount = 0;
        let errorCount = 0;

        // Update schema to include coverImage field if not present
        await Song.updateMany({}, { $setOnInsert: { coverImage: DEFAULT_COVER } }, { upsert: true });

        // Update each song with appropriate cover
        for (const song of allSongs) {
            try {
                // Determine cover image based on mood tags
                let coverImage = DEFAULT_COVER;

                if (song.moodTags && song.moodTags.length > 0) {
                    const primaryMood = song.moodTags[0];
                    if (moodCovers[primaryMood]) {
                        coverImage = moodCovers[primaryMood];
                    }
                }

                // Force update song with cover image using direct MongoDB update
                const result = await mongoose.connection.db.collection('songs')
                    .updateOne(
                        { _id: song._id },
                        { $set: { coverImage: coverImage } }
                    );

                if (result.modifiedCount > 0) {
                    updatedCount++;
                }
            } catch (err) {
                console.error(`Error updating cover for song ${song.title}:`, err.message);
                errorCount++;
            }
        }

        console.log(`Updated ${updatedCount} songs with cover images`);
        if (errorCount > 0) {
            console.log(`Encountered errors with ${errorCount} songs`);
        }

        // Verify all songs have coverImage
        const songsWithCover = await mongoose.connection.db.collection('songs')
            .countDocuments({ coverImage: { $exists: true } });

        console.log(`Songs with cover field: ${songsWithCover}`);

        // Add coverImage field to Song schema if it doesn't exist
        if (!Song.schema.path('coverImage')) {
            console.log('Adding coverImage field to Song schema');
            Song.schema.add({ coverImage: String });
        }

        // Disconnect from MongoDB
        mongoose.disconnect();
        console.log('Done!');
    } catch (err) {
        console.error('Error:', err);
        process.exit(1);
    }
}

updateMissingCovers(); 