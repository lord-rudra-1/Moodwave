const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const cors = require('cors');
const dotenv = require('dotenv');
const jwt = require('jsonwebtoken');
const path = require('path');

// Load environment variables
dotenv.config();

// Initialize express
const app = express();

// Basic middleware
app.use(cors());
app.use(express.json());

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('MongoDB Connected'))
  .catch(err => console.error('MongoDB Connection Error:', err));

// Generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });
};

// Simple User Schema
const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true }
});

const User = mongoose.model('User', userSchema);

// Song Schema
const songSchema = new mongoose.Schema({
  title: { type: String, required: true },
  artist: { type: String, required: true },
  album: { type: String },
  duration: { type: Number },
  genre: { type: String },
  mood: { type: String, enum: ['Happy', 'Sad', 'Energetic', 'Calm', 'Romantic', 'Melancholic', 'Chill'] },
  coverImage: { type: String },
  audioFile: { type: String, required: true },
  playCount: { type: Number, default: 0 },
  moodTags: { type: [String] }
}, {
  timestamps: true
});

const Song = mongoose.model('Song', songSchema);

// Comment Schema
const commentSchema = new mongoose.Schema({
  songId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Song',
    required: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  comment: {
    type: String,
    required: true,
    trim: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const Comment = mongoose.model('Comment', commentSchema);

// Playlist Schema
const playlistSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  songIds: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Song'
  }],
  moodTag: {
    type: String,
    enum: ['Happy', 'Sad', 'Energetic', 'Calm', 'Romantic', 'Melancholic', 'Chill', 'Mixed']
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const Playlist = mongoose.model('Playlist', playlistSchema);

// PlaybackHistory Schema
const playbackHistorySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  songId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Song',
    required: true
  },
  playedAt: {
    type: Date,
    default: Date.now
  }
});

const PlaybackHistory = mongoose.model('PlaybackHistory', playbackHistorySchema);

// Rating Schema
const ratingSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  songId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Song',
    required: true
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  ratedAt: {
    type: Date,
    default: Date.now
  }
});

// Compound index to ensure one rating per user per song
ratingSchema.index({ userId: 1, songId: 1 }, { unique: true });

const Rating = mongoose.model('Rating', ratingSchema);

// Add or initialize songs in the database
const initializeSongs = async () => {
  try {
    // Check if songs already exist
    const songsCount = await Song.countDocuments();
    if (songsCount > 0) {
      console.log(`Database already has ${songsCount} songs.`);
      return;
    }

    // Sample songs data
    const sampleSongs = [
      {
        title: 'Chill Mode',
        artist: 'ChillWave',
        album: 'Relaxation',
        duration: 180,
        genre: 'Electronic',
        mood: 'Chill',
        coverImage: 'chill-cover.jpg',
        audioFile: 'chill-mode.mp3'
      },
      {
        title: 'Happy Days',
        artist: 'Sunshine Band',
        album: 'Good Vibes',
        duration: 210,
        genre: 'Pop',
        mood: 'Happy',
        coverImage: 'happy-cover.jpg',
        audioFile: 'happy-days.mp3'
      },
      {
        title: 'Energy Boost',
        artist: 'Power Beats',
        album: 'Workout Mix',
        duration: 195,
        genre: 'Electronic',
        mood: 'Energetic',
        coverImage: 'energy-cover.jpg',
        audioFile: 'energy-boost.mp3'
      },
      {
        title: 'Peaceful Mind',
        artist: 'Zen Masters',
        album: 'Meditation',
        duration: 240,
        genre: 'Ambient',
        mood: 'Calm',
        coverImage: 'peaceful-cover.jpg',
        audioFile: 'peaceful-mind.mp3'
      },
      {
        title: 'Love Story',
        artist: 'Heart Beats',
        album: 'Romance',
        duration: 225,
        genre: 'Pop',
        mood: 'Romantic',
        coverImage: 'love-cover.jpg',
        audioFile: 'love-story.mp3'
      }
    ];

    await Song.insertMany(sampleSongs);
    console.log(`${sampleSongs.length} songs added to the database!`);
  } catch (error) {
    console.error('Error initializing songs:', error);
  }
};

// Run songs initialization
initializeSongs();

// Serve static files from the public folder
app.use('/songs', express.static(path.join(__dirname, 'public/songs')));
app.use('/covers', express.static(path.join(__dirname, 'public/covers')));

// Songs routes
app.get('/api/songs', async (req, res) => {
  try {
    const songs = await Song.find({});
    res.json(songs);
  } catch (error) {
    console.error('Error fetching songs:', error);
    res.status(500).json({ error: 'Failed to fetch songs' });
  }
});

// Get songs by mood
app.get('/api/songs/mood/:mood', async (req, res) => {
  try {
    const { mood } = req.params;
    // Search for songs with either mood field or moodTags array containing the mood
    const songs = await Song.find({
      $or: [
        { mood: mood },
        { moodTags: mood }
      ]
    });
    res.json(songs);
  } catch (error) {
    console.error('Error fetching songs by mood:', error);
    res.status(500).json({ error: 'Failed to fetch songs by mood' });
  }
});

// Simple registration route
app.post('/register', async (req, res) => {
  try {
    console.log('Registration attempt:', req.body);

    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    const existingUser = await User.findOne({
      $or: [{ email }, { username }]
    });

    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const user = await User.create({
      username,
      email,
      passwordHash
    });

    // Generate token for authentication
    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      _id: user._id,
      username: user.username,
      email: user.email,
      token
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      error: 'Registration failed',
      message: error.message
    });
  }
});

// Login route
app.post('/login', async (req, res) => {
  try {
    console.log('Login attempt:', { ...req.body, password: '****' });

    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Find user by email
    const user = await User.findOne({ email });

    if (!user) {
      console.log('User not found');
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Compare provided password with stored hash
    const isMatch = await bcrypt.compare(password, user.passwordHash);

    if (!isMatch) {
      console.log('Password does not match');
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Generate token
    const token = generateToken(user._id);

    console.log('Login successful for user:', user._id);

    res.json({
      success: true,
      _id: user._id,
      username: user.username,
      email: user.email,
      token
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      error: 'Login failed',
      message: error.message
    });
  }
});

// User profile route
app.get('/profile', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const token = authHeader.split(' ')[1];

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Get user by id
    const user = await User.findById(decoded.id).select('-passwordHash');

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      _id: user._id,
      username: user.username,
      email: user.email
    });
  } catch (error) {
    console.error('Profile error:', error);
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: 'Invalid token' });
    }
    res.status(500).json({
      error: 'Failed to get profile',
      message: error.message
    });
  }
});

// Basic route to test the server
app.get('/', (req, res) => {
  res.json({ message: 'Simple registration server is running' });
});

// Test HTML form
app.get('/simple-form', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Simple Registration</title>
      <style>
        body { font-family: Arial; max-width: 500px; margin: 20px auto; padding: 20px; }
        .form-group { margin-bottom: 15px; }
        input { width: 100%; padding: 8px; }
        button { background: #4CAF50; color: white; border: none; padding: 10px; cursor: pointer; }
        #result { margin-top: 20px; }
      </style>
    </head>
    <body>
      <h1>Simple Registration</h1>
      <div class="form-group">
        <label>Username:</label>
        <input type="text" id="username">
      </div>
      <div class="form-group">
        <label>Email:</label>
        <input type="email" id="email">
      </div>
      <div class="form-group">
        <label>Password:</label>
        <input type="password" id="password">
      </div>
      <button onclick="register()">Register</button>
      <div id="result"></div>

      <script>
        async function register() {
          const username = document.getElementById('username').value;
          const email = document.getElementById('email').value;
          const password = document.getElementById('password').value;
          
          try {
            const response = await fetch('/register', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ username, email, password })
            });
            
            const data = await response.json();
            document.getElementById('result').innerHTML = 
              '<pre>' + JSON.stringify(data, null, 2) + '</pre>';
          } catch (error) {
            document.getElementById('result').innerHTML = 
              '<pre>Error: ' + error.message + '</pre>';
          }
        }
      </script>
    </body>
    </html>
  `);
});

// Like a song
app.post('/songs/:id/like', async (req, res) => {
  try {
    const song = await Song.findById(req.params.id);
    if (!song) {
      return res.status(404).json({ error: 'Song not found' });
    }
    res.json({ success: true });
  } catch (error) {
    console.error('Error liking song:', error);
    res.status(500).json({ error: 'Failed to like song' });
  }
});

// Record song play
app.post('/songs/:id/play', async (req, res) => {
  try {
    // Get the user ID from token
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Not authorized, no token' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.id;

    const song = await Song.findByIdAndUpdate(
      req.params.id,
      { $inc: { playCount: 1 } },
      { new: true }
    );

    if (!song) {
      return res.status(404).json({ error: 'Song not found' });
    }

    // Record this play in playback history
    await PlaybackHistory.create({
      userId,
      songId: song._id
    });

    res.json({ success: true, playCount: song.playCount });
  } catch (error) {
    console.error('Error recording play:', error);
    res.status(500).json({ error: 'Failed to record play' });
  }
});

// Get user's playback history
app.get('/api/history', async (req, res) => {
  try {
    // Get the user ID from token
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Not authorized, no token' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.id;

    // Find history for this user and populate song details
    const history = await PlaybackHistory.find({ userId })
      .populate('songId')
      .sort({ playedAt: -1 }) // Sort by most recent first
      .limit(100); // Limit to 100 most recent entries

    res.json(history);
  } catch (error) {
    console.error('Error fetching playback history:', error);
    res.status(500).json({ error: 'Failed to fetch playback history' });
  }
});

// Delete a single history entry
app.delete('/api/history/:id', async (req, res) => {
  try {
    // Get the user ID from token
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Not authorized, no token' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.id;

    // Find and delete the history entry
    const historyEntry = await PlaybackHistory.findOneAndDelete({
      _id: req.params.id,
      userId: userId
    });

    if (!historyEntry) {
      return res.status(404).json({ error: 'History entry not found' });
    }

    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting history entry:', error);
    res.status(500).json({ error: 'Failed to delete history entry' });
  }
});

// Clear all history for a user
app.delete('/api/history', async (req, res) => {
  try {
    // Get the user ID from token
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Not authorized, no token' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.id;

    // Delete all history entries for this user
    await PlaybackHistory.deleteMany({ userId });

    res.json({ success: true });
  } catch (error) {
    console.error('Error clearing playback history:', error);
    res.status(500).json({ error: 'Failed to clear playback history' });
  }
});

// Playlist routes
app.get('/api/playlists', async (req, res) => {
  try {
    // Get the user ID from token
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Not authorized, no token' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.id;

    // Find playlists for this user
    const playlists = await Playlist.find({ userId });
    res.json(playlists);
  } catch (error) {
    console.error('Error fetching playlists:', error);
    res.status(500).json({ error: 'Failed to fetch playlists' });
  }
});

// Get single playlist with songs
app.get('/api/playlists/:id', async (req, res) => {
  try {
    const playlist = await Playlist.findById(req.params.id);

    if (!playlist) {
      return res.status(404).json({ error: 'Playlist not found' });
    }

    // Populate songs
    const songIds = await Song.find({ _id: { $in: playlist.songIds } });

    res.json({
      ...playlist.toObject(),
      songIds
    });
  } catch (error) {
    console.error('Error fetching playlist:', error);
    res.status(500).json({ error: 'Failed to fetch playlist' });
  }
});

// Create new playlist
app.post('/api/playlists', async (req, res) => {
  try {
    const { name, description, moodTag } = req.body;

    // Get user ID from token
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Not authorized, no token' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.id;

    const newPlaylist = await Playlist.create({
      name,
      description,
      moodTag: moodTag || 'Mixed',
      userId,
      songIds: []
    });

    res.status(201).json(newPlaylist);
  } catch (error) {
    console.error('Error creating playlist:', error);
    res.status(500).json({ error: 'Failed to create playlist' });
  }
});

// Add song to playlist
app.post('/api/playlists/:id/songs', async (req, res) => {
  try {
    const { songId } = req.body;

    if (!songId) {
      return res.status(400).json({ error: 'Song ID is required' });
    }

    // Verify the song exists
    const song = await Song.findById(songId);
    if (!song) {
      return res.status(404).json({ error: 'Song not found' });
    }

    // Find the playlist and add the song if it's not already there
    const playlist = await Playlist.findById(req.params.id);

    if (!playlist) {
      return res.status(404).json({ error: 'Playlist not found' });
    }

    // Check if song is already in playlist
    if (playlist.songIds.includes(songId)) {
      return res.status(400).json({ error: 'Song already in playlist' });
    }

    // Add song to playlist
    playlist.songIds.push(songId);
    await playlist.save();

    res.json({ success: true, playlist });
  } catch (error) {
    console.error('Error adding song to playlist:', error);
    res.status(500).json({ error: 'Failed to add song to playlist' });
  }
});

// Remove song from playlist
app.delete('/api/playlists/:playlistId/songs/:songId', async (req, res) => {
  try {
    const { playlistId, songId } = req.params;

    // Find the playlist
    const playlist = await Playlist.findById(playlistId);

    if (!playlist) {
      return res.status(404).json({ error: 'Playlist not found' });
    }

    // Remove song from playlist
    playlist.songIds = playlist.songIds.filter(id => id.toString() !== songId);
    await playlist.save();

    res.json({ success: true, playlist });
  } catch (error) {
    console.error('Error removing song from playlist:', error);
    res.status(500).json({ error: 'Failed to remove song from playlist' });
  }
});

// Delete playlist
app.delete('/api/playlists/:id', async (req, res) => {
  try {
    const playlist = await Playlist.findByIdAndDelete(req.params.id);

    if (!playlist) {
      return res.status(404).json({ error: 'Playlist not found' });
    }

    res.json({ success: true, message: 'Playlist deleted' });
  } catch (error) {
    console.error('Error deleting playlist:', error);
    res.status(500).json({ error: 'Failed to delete playlist' });
  }
});

// Comment routes

// Get comments for a song
app.get('/api/songs/:id/comments', async (req, res) => {
  try {
    const comments = await Comment.find({ songId: req.params.id })
      .populate('userId', 'username') // Only return the username field from User
      .sort({ createdAt: -1 }); // Sort by most recent first

    res.json(comments);
  } catch (error) {
    console.error('Error fetching comments:', error);
    res.status(500).json({ error: 'Failed to fetch comments' });
  }
});

// Add a comment to a song
app.post('/api/songs/:id/comments', async (req, res) => {
  try {
    const { comment } = req.body;

    // Validate comment
    if (!comment || comment.trim() === '') {
      return res.status(400).json({ error: 'Comment cannot be empty' });
    }

    // Get the user ID from token
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Not authorized, no token' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.id;

    // Verify the song exists
    const song = await Song.findById(req.params.id);
    if (!song) {
      return res.status(404).json({ error: 'Song not found' });
    }

    // Create the comment
    const newComment = await Comment.create({
      songId: req.params.id,
      userId,
      comment
    });

    // Return the comment with user info
    const populatedComment = await Comment.findById(newComment._id)
      .populate('userId', 'username');

    res.status(201).json(populatedComment);
  } catch (error) {
    console.error('Error adding comment:', error);
    res.status(500).json({ error: 'Failed to add comment' });
  }
});

// Delete a comment
app.delete('/api/comments/:id', async (req, res) => {
  try {
    // Get the user ID from token
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Not authorized, no token' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.id;

    // Find the comment
    const comment = await Comment.findById(req.params.id);

    if (!comment) {
      return res.status(404).json({ error: 'Comment not found' });
    }

    // Check if this user is the owner of the comment
    if (comment.userId.toString() !== userId) {
      return res.status(403).json({ error: 'Not authorized to delete this comment' });
    }

    // Delete the comment
    await Comment.findByIdAndDelete(req.params.id);

    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting comment:', error);
    res.status(500).json({ error: 'Failed to delete comment' });
  }
});

// Rating routes

// Get average rating for a song
app.get('/api/songs/:id/rating', async (req, res) => {
  try {
    const ratings = await Rating.find({ songId: req.params.id });

    if (ratings.length === 0) {
      return res.json({ averageRating: 0, totalRatings: 0 });
    }

    const sum = ratings.reduce((acc, curr) => acc + curr.rating, 0);
    const averageRating = sum / ratings.length;

    res.json({
      averageRating: Math.round(averageRating * 10) / 10, // Round to 1 decimal place
      totalRatings: ratings.length
    });
  } catch (error) {
    console.error('Error fetching song rating:', error);
    res.status(500).json({ error: 'Failed to fetch song rating' });
  }
});

// Get user's rating for a song
app.get('/api/songs/:id/myrating', async (req, res) => {
  try {
    // Get the user ID from token
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Not authorized, no token' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.id;

    const rating = await Rating.findOne({
      songId: req.params.id,
      userId
    });

    if (!rating) {
      return res.json({ rating: 0 });
    }

    res.json({ rating: rating.rating });
  } catch (error) {
    console.error('Error fetching user rating:', error);
    res.status(500).json({ error: 'Failed to fetch user rating' });
  }
});

// Rate a song
app.post('/api/songs/:id/rate', async (req, res) => {
  try {
    const { rating } = req.body;

    // Validate rating
    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ error: 'Rating must be between 1 and 5' });
    }

    // Get the user ID from token
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Not authorized, no token' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.id;

    // Verify the song exists
    const song = await Song.findById(req.params.id);
    if (!song) {
      return res.status(404).json({ error: 'Song not found' });
    }

    // Check if user already rated this song
    const existingRating = await Rating.findOne({
      songId: req.params.id,
      userId
    });

    if (existingRating) {
      // Update existing rating
      existingRating.rating = rating;
      existingRating.ratedAt = Date.now();
      await existingRating.save();

      // Get updated average
      const allRatings = await Rating.find({ songId: req.params.id });
      const sum = allRatings.reduce((acc, curr) => acc + curr.rating, 0);
      const averageRating = sum / allRatings.length;

      return res.json({
        success: true,
        message: 'Rating updated successfully',
        userRating: rating,
        averageRating: Math.round(averageRating * 10) / 10,
        totalRatings: allRatings.length
      });
    }

    // Create new rating
    await Rating.create({
      songId: req.params.id,
      userId,
      rating
    });

    // Get updated average
    const allRatings = await Rating.find({ songId: req.params.id });
    const sum = allRatings.reduce((acc, curr) => acc + curr.rating, 0);
    const averageRating = sum / allRatings.length;

    res.status(201).json({
      success: true,
      message: 'Rating added successfully',
      userRating: rating,
      averageRating: Math.round(averageRating * 10) / 10,
      totalRatings: allRatings.length
    });
  } catch (error) {
    console.error('Error rating song:', error);
    res.status(500).json({ error: 'Failed to rate song' });
  }
});

module.exports = app; 