const express = require('express');
const router = express.Router();
const {
  createPlaylist,
  getUserPlaylists,
  getPlaylistById,
  addSongToPlaylist,
  removeSongFromPlaylist,
  deletePlaylist
} = require('../controllers/playlistController');
const { protect } = require('../middleware/authMiddleware');

// All playlist routes are protected
router.use(protect);

router.route('/')
  .post(createPlaylist)
  .get(getUserPlaylists);

router.route('/:id')
  .get(getPlaylistById)
  .delete(deletePlaylist);

router.route('/:id/songs')
  .post(addSongToPlaylist);

router.route('/:id/songs/:songId')
  .delete(removeSongFromPlaylist);

module.exports = router; 