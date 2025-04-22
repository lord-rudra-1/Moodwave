const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Song = require('./models/Song');

dotenv.config();

async function listSongs() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        const songs = await Song.find({});

        console.log('\nSongs in the database:');
        console.log('--------------------');

        // Group songs by mood
        const songsByMood = {};

        songs.forEach(song => {
            let mood;
            if (song.mood) {
                mood = song.mood;
            } else if (song.moodTags && song.moodTags.length > 0) {
                mood = song.moodTags[0]; // Use first mood tag
            } else {
                mood = 'Unknown';
            }

            if (!songsByMood[mood]) {
                songsByMood[mood] = [];
            }

            songsByMood[mood].push({
                id: song._id,
                title: song.title,
                artist: song.artist,
                audioFile: song.audioFile || song.audioUrl
            });
        });

        // Print songs by mood
        Object.keys(songsByMood).sort().forEach(mood => {
            console.log(`\n${mood} (${songsByMood[mood].length} songs):`);
            songsByMood[mood].forEach(song => {
                console.log(`- ${song.title} by ${song.artist} (Audio: ${song.audioFile})`);
            });
        });

        console.log('\nTotal songs:', songs.length);

        mongoose.disconnect();
    } catch (err) {
        console.error('Error:', err);
    }
}

listSongs(); 