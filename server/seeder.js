const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');
const Song = require('./models/Song');
const bcrypt = require('bcrypt');

// Load environment variables
dotenv.config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('MongoDB connected for seeding');
    runSeeder();
  })
  .catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });

const sampleSongs = [
  {
    title: 'Happy Vibes',
    artist: 'Mood Artist',
    album: 'Good Times',
    audioUrl: '/songs/happy-vibes.mp3',
    moodTags: ['Happy', 'Energetic'],
    duration: 180,
  },
  {
    title: 'Sad Blues',
    artist: 'Emotion Player',
    album: 'Rainy Days',
    audioUrl: '/songs/sad-blues.mp3',
    moodTags: ['Sad', 'Melancholic'],
    duration: 240,
  },
  {
    title: 'Chill Mode',
    artist: 'Relaxation Guru',
    album: 'Evening Wind',
    audioUrl: '/songs/chill-mode.mp3',
    moodTags: ['Calm', 'Chill'],
    duration: 210,
  },
  {
    title: 'Energy Rush',
    artist: 'Workout King',
    album: 'Fitness Mix',
    audioUrl: '/songs/energy-rush.mp3',
    moodTags: ['Energetic', 'Happy'],
    duration: 195,
  },
  {
    title: 'Love Song',
    artist: 'Heart Singer',
    album: 'Romance',
    audioUrl: '/songs/love-song.mp3',
    moodTags: ['Romantic', 'Calm'],
    duration: 225,
  },
];

const sampleUser = {
  username: 'testuser',
  email: 'test@example.com',
  passwordHash: 'password123',
};

const runSeeder = async () => {
  try {
    // Clear existing data
    await User.deleteMany();
    await Song.deleteMany();

    console.log('Data cleared');

    // Create user
    const createdUser = await User.create(sampleUser);
    console.log('User created');

    // Create songs
    const createdSongs = await Song.insertMany(sampleSongs);
    console.log('Songs created');

    console.log('Data seeded successfully');
    process.exit();
  } catch (error) {
    console.error('Error seeding data:', error);
    process.exit(1);
  }
};

// Handle exit
process.on('exit', () => {
  mongoose.disconnect();
  console.log('MongoDB disconnected on app termination');
}); 