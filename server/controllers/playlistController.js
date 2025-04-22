const Playlist = require('../models/Playlist');
const User = require('../models/User');
const Song = require('../models/Song');

// @desc    Create a new playlist
// @route   POST /api/playlists
// @access  Private
const createPlaylist = async (req, res) => {
  try {
    const { name, description, moodTag } = req.body;

    const playlist = await Playlist.create({
      name,
      description,
      userId: req.user._id,
      moodTag,
      songIds: [],
    });

    // Add playlist to user's created playlists
    const user = await User.findById(req.user._id);
    user.createdPlaylists.push(playlist._id);
    await user.save();

    res.status(201).json(playlist);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Get all playlists for a user
// @route   GET /api/playlists
// @access  Private
const getUserPlaylists = async (req, res) => {
  try {
    const playlists = await Playlist.find({ userId: req.user._id });
    res.json(playlists);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Get playlist by ID
// @route   GET /api/playlists/:id
// @access  Private
const getPlaylistById = async (req, res) => {
  try {
    const playlist = await Playlist.findById(req.params.id)
      .populate('songIds');
    
    if (!playlist) {
      return res.status(404).json({ message: 'Playlist not found' });
    }

    // Check if the playlist belongs to the user
    if (playlist.userId.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    res.json(playlist);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Add song to playlist
// @route   POST /api/playlists/:id/songs
// @access  Private
const addSongToPlaylist = async (req, res) => {
  try {
    const { songId } = req.body;

    // Check if song exists
    const song = await Song.findById(songId);
    if (!song) {
      return res.status(404).json({ message: 'Song not found' });
    }

    const playlist = await Playlist.findById(req.params.id);
    if (!playlist) {
      return res.status(404).json({ message: 'Playlist not found' });
    }

    // Check if the playlist belongs to the user
    if (playlist.userId.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    // Check if song is already in playlist
    if (playlist.songIds.includes(songId)) {
      return res.status(400).json({ message: 'Song already in playlist' });
    }

    // Add song to playlist
    playlist.songIds.push(songId);
    await playlist.save();

    res.json({ message: 'Song added to playlist successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Remove song from playlist
// @route   DELETE /api/playlists/:id/songs/:songId
// @access  Private
const removeSongFromPlaylist = async (req, res) => {
  try {
    const playlist = await Playlist.findById(req.params.id);
    if (!playlist) {
      return res.status(404).json({ message: 'Playlist not found' });
    }

    // Check if the playlist belongs to the user
    if (playlist.userId.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    // Check if song is in playlist
    if (!playlist.songIds.includes(req.params.songId)) {
      return res.status(400).json({ message: 'Song not in playlist' });
    }

    // Remove song from playlist
    playlist.songIds = playlist.songIds.filter(
      (song) => song.toString() !== req.params.songId
    );
    await playlist.save();

    res.json({ message: 'Song removed from playlist successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Delete a playlist
// @route   DELETE /api/playlists/:id
// @access  Private
const deletePlaylist = async (req, res) => {
  try {
    const playlist = await Playlist.findById(req.params.id);
    
    if (!playlist) {
      return res.status(404).json({ message: 'Playlist not found' });
    }

    // Check if the playlist belongs to the user
    if (playlist.userId.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    // Remove playlist from user's created playlists
    const user = await User.findById(req.user._id);
    user.createdPlaylists = user.createdPlaylists.filter(
      (id) => id.toString() !== playlist._id.toString()
    );
    await user.save();

    // Delete the playlist
    await playlist.deleteOne();

    res.json({ message: 'Playlist removed' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

module.exports = {
  createPlaylist,
  getUserPlaylists,
  getPlaylistById,
  addSongToPlaylist,
  removeSongFromPlaylist,
  deletePlaylist,
}; 