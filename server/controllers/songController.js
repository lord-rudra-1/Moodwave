const Song = require('../models/Song');
const User = require('../models/User');
const PlaybackHistory = require('../models/PlaybackHistory');

// @desc    Get all songs
// @route   GET /api/songs
// @access  Public
const getSongs = async (req, res) => {
  try {
    const songs = await Song.find({});
    res.json(songs);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Get songs by mood
// @route   GET /api/songs/mood/:mood
// @access  Public
const getSongsByMood = async (req, res) => {
  try {
    const { mood } = req.params;
    const songs = await Song.find({ moodTags: mood });
    res.json(songs);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Get song by ID
// @route   GET /api/songs/:id
// @access  Public
const getSongById = async (req, res) => {
  try {
    const song = await Song.findById(req.params.id);
    
    if (song) {
      res.json(song);
    } else {
      res.status(404).json({ message: 'Song not found' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Like a song
// @route   POST /api/songs/:id/like
// @access  Private
const likeSong = async (req, res) => {
  try {
    const song = await Song.findById(req.params.id);
    
    if (!song) {
      return res.status(404).json({ message: 'Song not found' });
    }

    const user = await User.findById(req.user._id);
    
    // Check if song is already liked
    if (user.likedSongs.includes(song._id)) {
      return res.status(400).json({ message: 'Song already liked' });
    }

    // Add song to liked songs
    user.likedSongs.push(song._id);
    await user.save();

    res.json({ message: 'Song liked successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Unlike a song
// @route   DELETE /api/songs/:id/like
// @access  Private
const unlikeSong = async (req, res) => {
  try {
    const song = await Song.findById(req.params.id);
    
    if (!song) {
      return res.status(404).json({ message: 'Song not found' });
    }

    const user = await User.findById(req.user._id);
    
    // Check if song is liked
    if (!user.likedSongs.includes(song._id)) {
      return res.status(400).json({ message: 'Song not liked' });
    }

    // Remove song from liked songs
    user.likedSongs = user.likedSongs.filter(
      (likedSong) => likedSong.toString() !== song._id.toString()
    );
    await user.save();

    res.json({ message: 'Song unliked successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Record song playback
// @route   POST /api/songs/:id/play
// @access  Private
const recordPlayback = async (req, res) => {
  try {
    const song = await Song.findById(req.params.id);
    
    if (!song) {
      return res.status(404).json({ message: 'Song not found' });
    }

    // Create playback record
    await PlaybackHistory.create({
      userId: req.user._id,
      songId: song._id,
    });

    res.json({ message: 'Playback recorded successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

module.exports = {
  getSongs,
  getSongsByMood,
  getSongById,
  likeSong,
  unlikeSong,
  recordPlayback,
}; 