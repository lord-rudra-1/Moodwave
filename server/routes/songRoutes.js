const express = require('express');
const router = express.Router();
const { 
  getSongs,
  getSongsByMood,
  getSongById,
  likeSong,
  unlikeSong,
  recordPlayback
} = require('../controllers/songController');
const { 
  createRating,
  getSongRatings,
  deleteRating,
  addComment,
  getSongComments,
  deleteComment
} = require('../controllers/ratingController');
const { protect } = require('../middleware/authMiddleware');

// Public routes
router.get('/', getSongs);
router.get('/mood/:mood', getSongsByMood);
router.get('/:id', getSongById);
router.get('/:id/ratings', getSongRatings);
router.get('/:id/comments', getSongComments);

// Protected routes
router.post('/:id/like', protect, likeSong);
router.delete('/:id/like', protect, unlikeSong);
router.post('/:id/play', protect, recordPlayback);
router.post('/:id/ratings', protect, createRating);
router.delete('/:id/ratings', protect, deleteRating);
router.post('/:id/comments', protect, addComment);
router.delete('/:songId/comments/:commentId', protect, deleteComment);

module.exports = router; 