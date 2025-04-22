const mongoose = require('mongoose');

const songSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  artist: {
    type: String,
    required: true,
    trim: true
  },
  album: {
    type: String,
    trim: true
  },
  audioUrl: {
    type: String,
    required: true
  },
  moodTags: [{
    type: String,
    enum: ['Happy', 'Sad', 'Energetic', 'Calm', 'Romantic', 'Melancholic', 'Chill']
  }],
  duration: {
    type: Number
  },
  coverImage: {
    type: String,
    default: 'default-cover.jpg'
  },
  uploadedAt: {
    type: Date,
    default: Date.now
  }
});

const Song = mongoose.model('Song', songSchema);

module.exports = Song; 