const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const Song = require('./models/Song');

dotenv.config();

// Directory where songs are stored
const songsDir = path.join(__dirname, 'public', 'songs');

async function checkFileSizes() {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        // Get all songs from the database
        const songs = await Song.find({});
        console.log(`Found ${songs.length} songs in database`);

        // Check each song's audio file size
        let smallFiles = 0;
        let missingFiles = 0;
        let largeFiles = 0;

        for (const song of songs) {
            // Get filename from audioUrl
            let filename = song.audioUrl;
            if (filename.startsWith('/songs/')) {
                filename = filename.substring(7);
            }

            const filePath = path.join(songsDir, filename);

            // Check if file exists
            if (!fs.existsSync(filePath)) {
                console.log(`Missing file: ${filePath}`);
                missingFiles++;
                continue;
            }

            // Get file size
            const stats = fs.statSync(filePath);
            const fileSizeInBytes = stats.size;
            const fileSizeInKB = fileSizeInBytes / 1024;

            if (fileSizeInKB < 5) {
                console.log(`Small file (${fileSizeInKB.toFixed(2)} KB): ${filename} - Title: ${song.title}`);
                smallFiles++;

                // If file is very small, it's likely a placeholder or corrupted
                // Find a large MP3 file to copy as a replacement
                const sampleFiles = fs.readdirSync(songsDir)
                    .filter(file => file.endsWith('.mp3'))
                    .map(file => {
                        const fileStats = fs.statSync(path.join(songsDir, file));
                        return { file, size: fileStats.size };
                    })
                    .filter(item => item.size > 1000000) // Files larger than 1MB
                    .sort(() => 0.5 - Math.random()); // Randomize

                if (sampleFiles.length > 0) {
                    // Copy a random large file to replace the small file
                    const sourcePath = path.join(songsDir, sampleFiles[0].file);
                    fs.copyFileSync(sourcePath, filePath);
                    console.log(`Replaced small file ${filename} with ${sampleFiles[0].file}`);
                }
            } else {
                largeFiles++;
            }
        }

        console.log(`\nSummary:`);
        console.log(`Total songs in database: ${songs.length}`);
        console.log(`Large files (OK): ${largeFiles}`);
        console.log(`Small files (likely placeholders): ${smallFiles}`);
        console.log(`Missing files: ${missingFiles}`);

        // Disconnect from MongoDB
        mongoose.disconnect();
        console.log('Done!');
    } catch (err) {
        console.error('Error:', err);
        process.exit(1);
    }
}

checkFileSizes(); 