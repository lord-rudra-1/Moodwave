const mongoose = require('mongoose');

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

module.exports = Playlist; 