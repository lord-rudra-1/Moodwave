const mongoose = require('mongoose');
const dotenv = require('dotenv');
const fs = require('fs');
const path = require('path');
const Song = require('./models/Song');

// Load environment variables
dotenv.config();

// Directory where the song files are stored
const songsDir = path.join(__dirname, 'public', 'songs');

async function checkAudioFiles() {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        // Get all songs
        const songs = await Song.find({});
        console.log(`Found ${songs.length} songs in database`);

        // Get all song files in the directory
        const songFiles = fs.readdirSync(songsDir);
        console.log(`Found ${songFiles.length} song files in directory`);

        // Check each song for audio file existence
        let fixedCount = 0;
        let unavailableCount = 0;

        for (const song of songs) {
            // Extract filename from audioUrl (removing '/songs/' prefix if present)
            const audioUrl = song.audioUrl;
            const filename = audioUrl.startsWith('/songs/')
                ? audioUrl.substring(7)
                : audioUrl;

            // Check if file exists in the songs directory
            const filePath = path.join(songsDir, filename);
            const fileExists = fs.existsSync(filePath);

            if (!fileExists) {
                console.log(`Audio file not found: ${filename}`);

                // Try to find file with similar name
                const possibleMatch = songFiles.find(file => {
                    return file.toLowerCase().includes(song.title.toLowerCase().replace(/\s+/g, '-'));
                });

                if (possibleMatch) {
                    console.log(`Found possible match: ${possibleMatch}`);

                    // Update song with new audioUrl
                    const newAudioUrl = `/songs/${possibleMatch}`;
                    await Song.findByIdAndUpdate(song._id, { audioUrl: newAudioUrl });
                    console.log(`Updated song ${song.title} with new audioUrl: ${newAudioUrl}`);
                    fixedCount++;
                } else {
                    console.log(`No match found for song: ${song.title}`);
                    unavailableCount++;
                }
            }
        }

        console.log(`Fixed ${fixedCount} songs with incorrect audio paths`);
        console.log(`${unavailableCount} songs have no available audio file`);

        // Disconnect from MongoDB
        mongoose.disconnect();
        console.log('Done!');
    } catch (err) {
        console.error('Error:', err);
        process.exit(1);
    }
}

checkAudioFiles(); 