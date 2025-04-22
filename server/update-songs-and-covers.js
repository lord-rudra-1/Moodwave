const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Song = require('./models/Song');

dotenv.config();

// Map song filenames to mood tags based on content/title
const songMoodMap = {
    // Happy Songs
    'Rang De Basanti (DJJOhAL.Com).mp3': ['Happy', 'Energetic'],
    'Marjaani (DJJOhAL.Com).mp3': ['Happy', 'Energetic'],
    'Ik Rupiya (DJJOhAL.Com).mp3': ['Happy'],
    'Pal Pal (DJJOhAL.Com).mp3': ['Happy'],
    'Hit The Floor (The Power Rmx) (DJJOhAL.Com).mp3': ['Happy', 'Energetic'],

    // Sad Songs
    'Tujhe Yaad Na Meri Ayee 2 (DJJOhAL.Com).mp3': ['Sad', 'Melancholic'],
    'Dooriyan (Passion Mix) (DJJOhAL.Com).mp3': ['Sad'],
    'Dhoondte (DJJOhAL.Com).mp3': ['Sad', 'Melancholic'],
    'Dil Kya Kare (DJJOhAL.Com).mp3': ['Sad'],
    'Boondon Se Baatein (DJJOhAL.Com).mp3': ['Sad', 'Melancholic'],

    // Energetic Songs
    'Tennu Le Ft Aynell (Colle Rmx) (DJJOhAL.Com).mp3': ['Energetic'],
    'Tenu Le Ke (DJJOhAL.Com).mp3': ['Energetic'],
    'Sound Of Tha Police (Partybreak 2009) (DJJOhAL.Com).mp3': ['Energetic'],
    'Boom Boom Pow (DJJOhAL.Com).mp3': ['Energetic'],
    'Ghajab (DJJOhAL.Com).mp3': ['Energetic'],

    // Calm Songs
    'Bheegi Bheegi Raaton Mein (DJJOhAL.Com).mp3': ['Calm'],
    'Kaate Nahin Kate (DJJOhAL.Com).mp3': ['Calm'],
    'Shaam Mastani (DJJOhAL.Com).mp3': ['Calm'],
    'Chanda Re (DJJOhAL.Com).mp3': ['Calm'],
    'O Re Lakad (DJJOhAL.Com).mp3': ['Calm'],

    // Romantic Songs
    'Phir Milenge (DJJOhAL.Com).mp3': ['Romantic'],
    'Teri Meri (DJJOhAL.Com).mp3': ['Romantic'],
    'Teri Meri Ek Jind (DJJOhAL.Com).mp3': ['Romantic'],
    'Hum Tumhen Chahte Hain Aise (DJJOhAL.Com).mp3': ['Romantic'],
    'Na Kajre Ki Dhaar (DJJOhAL.Com).mp3': ['Romantic'],

    // Melancholic Songs
    'Woh Jo Kahan Tha (DJJOhAL.Com).mp3': ['Melancholic'],
    'Hai Junoon (Velvet Mix) (DJJOhAL.Com).mp3': ['Melancholic'],
    'Haule Haule (Heartless Mix) (DJJOhAL.Com).mp3': ['Melancholic'],
    'Subah Hogi (DJJOhAL.Com).mp3': ['Melancholic'],
    'Aashiqui Mein Had Se (DJJOhAL.Com).mp3': ['Melancholic'],

    // Chill Songs
    'Kaise Bani (Latin House Refix) (DJJOhAL.Com).mp3': ['Chill'],
    'Rangeela Rangeela (DJJOhAL.Com).mp3': ['Chill'],
    'Hum Bhi Samajh (DJJOhAL.Com).mp3': ['Chill'],
    'Nasha Nashila (Ft Kevin Little Rmx) (DJJOhAL.Com).mp3': ['Chill'],
    'Piya Bavari (DJJOhAL.Com).mp3': ['Chill']
};

// Assign remaining songs to moods
const songsDir = path.join(__dirname, 'public', 'songs');
const coversDir = path.join(__dirname, 'public', 'covers');

// Covers to keep (one per mood)
const coversToKeep = {
    'Happy': 'happy-cover.jpg',
    'Sad': 'sad-cover.jpg',
    'Energetic': 'energy-cover.jpg',
    'Calm': 'peaceful-cover.jpg',
    'Romantic': 'love-cover.jpg',
    'Melancholic': 'melancholic-cover.jpg',
    'Chill': 'chill-cover.jpg'
};

async function updateSongsAndCovers() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        // Get existing songs from database
        const existingSongs = await Song.find({});
        console.log(`Found ${existingSongs.length} songs in database`);

        // Get all song files from directory
        const songFiles = fs.readdirSync(songsDir);
        console.log(`Found ${songFiles.length} song files in directory`);

        // Track renamed files and new songs
        const renamedFiles = [];
        const newSongs = [];

        // Extract existing audio URLs, handling null/undefined values
        const existingAudioUrls = existingSongs
            .filter(song => song.audioUrl) // Filter out songs with undefined audioUrl
            .map(song => {
                // Check if audioUrl starts with '/songs/' and remove it if it does
                const url = song.audioUrl.startsWith('/songs/')
                    ? song.audioUrl.substring(7)
                    : song.audioUrl;
                return url;
            });

        // Process each song file
        for (const file of songFiles) {
            if (!file.endsWith('.mp3')) continue;

            // Check if file is in database
            const isInDb = existingAudioUrls.some(url => url === file);

            // Generate clean name from original
            let cleanName = file.replace(' (DJJOhAL.Com)', '')
                .replace(/[\s\(\)]/g, '-')
                .toLowerCase();

            // Assign mood tags
            const moodTags = songMoodMap[file] || ['Happy']; // Default to Happy if not mapped

            // Determine artist and title from filename
            let title = file.replace(' (DJJOhAL.Com).mp3', '');
            let artist = 'Unknown Artist';

            // Rename the file if it doesn't already match the clean name
            if (file !== cleanName) {
                try {
                    fs.renameSync(
                        path.join(songsDir, file),
                        path.join(songsDir, cleanName)
                    );
                    renamedFiles.push({ original: file, renamed: cleanName });
                } catch (error) {
                    console.error(`Error renaming ${file}: ${error.message}`);
                }
            }

            // If not in database, add it
            if (!isInDb) {
                const newSong = {
                    title,
                    artist,
                    album: 'Unknown Album',
                    audioUrl: '/songs/' + cleanName,
                    moodTags,
                    duration: 180 // Default duration
                };

                newSongs.push(newSong);
            }
        }

        // Add new songs to database
        if (newSongs.length > 0) {
            await Song.insertMany(newSongs);
            console.log(`Added ${newSongs.length} new songs to database`);
        }

        console.log(`Renamed ${renamedFiles.length} song files`);

        // Update covers - keep only one per mood
        const coverFiles = fs.readdirSync(coversDir);
        const coversToDelete = coverFiles.filter(file =>
            !Object.values(coversToKeep).includes(file)
        );

        for (const file of coversToDelete) {
            try {
                fs.unlinkSync(path.join(coversDir, file));
            } catch (error) {
                console.error(`Error deleting cover ${file}: ${error.message}`);
            }
        }

        console.log(`Deleted ${coversToDelete.length} unnecessary cover files`);
        console.log(`Kept covers: ${Object.values(coversToKeep).join(', ')}`);

        mongoose.disconnect();
        console.log('Finished updating songs and covers');

    } catch (err) {
        console.error('Error:', err);
        process.exit(1);
    }
}

updateSongsAndCovers(); 