const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Song = require('./models/Song');

dotenv.config();

const newSongs = [
    // Happy Songs
    {
        title: 'Summer Vibes',
        artist: 'Sunshine Collective',
        album: 'Happy Days',
        genre: 'Pop',
        mood: 'Happy',
        coverImage: 'happy-cover.jpg',
        audioUrl: '/songs/happy-summer.mp3',
        moodTags: ['Happy']
    },
    {
        title: 'Groove Paradise',
        artist: 'Funky Five',
        album: 'Good Times',
        genre: 'Funk',
        mood: 'Happy',
        coverImage: 'happy-cover.jpg',
        audioUrl: '/songs/happy-groove.mp3',
        moodTags: ['Happy']
    },

    // Sad Songs
    {
        title: 'Rainy Days',
        artist: 'Melancholy Trio',
        album: 'Blue Memories',
        genre: 'Indie',
        mood: 'Sad',
        coverImage: 'sad-cover.jpg',
        audioUrl: '/songs/sad-rainy.mp3',
        moodTags: ['Sad']
    },
    {
        title: 'Lost Memories',
        artist: 'The Reflections',
        album: 'Past Times',
        genre: 'Alternative',
        mood: 'Sad',
        coverImage: 'sad-cover.jpg',
        audioUrl: '/songs/sad-memories.mp3',
        moodTags: ['Sad']
    },

    // Energetic Songs
    {
        title: 'Workout Anthem',
        artist: 'Power Pulse',
        album: 'Fitness Mix',
        genre: 'Electronic',
        mood: 'Energetic',
        coverImage: 'energy-cover.jpg',
        audioUrl: '/songs/energetic-workout.mp3',
        moodTags: ['Energetic']
    },
    {
        title: 'Party All Night',
        artist: 'Night Owls',
        album: 'Electric Dreams',
        genre: 'Dance',
        mood: 'Energetic',
        coverImage: 'energy-cover.jpg',
        audioUrl: '/songs/energetic-party.mp3',
        moodTags: ['Energetic']
    },

    // Calm Songs
    {
        title: 'Forest Whispers',
        artist: 'Nature Sounds',
        album: 'Peaceful Retreat',
        genre: 'Ambient',
        mood: 'Calm',
        coverImage: 'peaceful-cover.jpg',
        audioUrl: '/songs/calm-forest.mp3',
        moodTags: ['Calm']
    },
    {
        title: 'Ocean Waves',
        artist: 'Seaside Serenity',
        album: 'Coastal Dreams',
        genre: 'Ambient',
        mood: 'Calm',
        coverImage: 'peaceful-cover.jpg',
        audioUrl: '/songs/calm-waves.mp3',
        moodTags: ['Calm']
    },

    // Romantic Songs
    {
        title: 'Evening Romance',
        artist: 'Love Notes',
        album: 'Heart Strings',
        genre: 'Classical',
        mood: 'Romantic',
        coverImage: 'love-cover.jpg',
        audioUrl: '/songs/romantic-evening.mp3',
        moodTags: ['Romantic']
    },
    {
        title: 'Moonlight Serenade',
        artist: 'Starlight Orchestra',
        album: 'Eternal Love',
        genre: 'Jazz',
        mood: 'Romantic',
        coverImage: 'love-cover.jpg',
        audioUrl: '/songs/romantic-serenade.mp3',
        moodTags: ['Romantic']
    },

    // Melancholic Songs
    {
        title: 'Autumn Leaves',
        artist: 'Twilight Echoes',
        album: 'Fading Seasons',
        genre: 'Folk',
        mood: 'Melancholic',
        coverImage: 'sad-cover.jpg',
        audioUrl: '/songs/melancholic-autumn.mp3',
        moodTags: ['Melancholic']
    },
    {
        title: 'Yesterday\'s Dreams',
        artist: 'Memory Lane',
        album: 'Bittersweet',
        genre: 'Indie',
        mood: 'Melancholic',
        coverImage: 'sad-cover.jpg',
        audioUrl: '/songs/melancholic-nostalgia.mp3',
        moodTags: ['Melancholic']
    },

    // Chill Songs
    {
        title: 'Sunset Lounge',
        artist: 'Beach Vibes',
        album: 'Evening Chill',
        genre: 'Lofi',
        mood: 'Chill',
        coverImage: 'chill-cover.jpg',
        audioUrl: '/songs/chill-sunset.mp3',
        moodTags: ['Chill']
    },
    {
        title: 'Lo-Fi Dreams',
        artist: 'Study Beats',
        album: 'Focus Time',
        genre: 'Lofi',
        mood: 'Chill',
        coverImage: 'chill-cover.jpg',
        audioUrl: '/songs/chill-lofi.mp3',
        moodTags: ['Chill']
    }
];

async function addSongs() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        // Insert all the new songs
        const result = await Song.insertMany(newSongs);

        console.log(`Added ${result.length} new songs to the database`);

        // Get count of songs by mood
        const songs = await Song.find({});

        // Group songs by mood
        const songsByMood = {};

        songs.forEach(song => {
            let mood;
            if (song.mood) {
                mood = song.mood;
            } else if (song.moodTags && song.moodTags.length > 0) {
                mood = song.moodTags[0];
            } else {
                mood = 'Unknown';
            }

            if (!songsByMood[mood]) {
                songsByMood[mood] = [];
            }

            songsByMood[mood].push(song);
        });

        // Print songs count by mood
        console.log('\nSongs by mood:');
        Object.keys(songsByMood).sort().forEach(mood => {
            console.log(`${mood}: ${songsByMood[mood].length} songs`);
        });

        console.log('\nTotal songs in database:', songs.length);

        mongoose.disconnect();
        console.log('Done');
    } catch (err) {
        console.error('Error:', err);
        process.exit(1);
    }
}

addSongs(); 