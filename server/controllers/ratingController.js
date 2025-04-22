const Rating = require('../models/Rating');
const Comment = require('../models/Comment');
const Song = require('../models/Song');

// @desc    Create or update a rating
// @route   POST /api/songs/:id/ratings
// @access  Private
const createRating = async (req, res) => {
  try {
    const { rating, review } = req.body;
    const songId = req.params.id;

    // Check if song exists
    const song = await Song.findById(songId);
    if (!song) {
      return res.status(404).json({ message: 'Song not found' });
    }

    // Check if rating already exists
    const existingRating = await Rating.findOne({
      userId: req.user._id,
      songId,
    });

    if (existingRating) {
      // Update existing rating
      existingRating.rating = rating;
      existingRating.review = review;
      existingRating.ratedAt = Date.now();

      const updatedRating = await existingRating.save();
      res.json(updatedRating);
    } else {
      // Create new rating
      const newRating = await Rating.create({
        userId: req.user._id,
        songId,
        rating,
        review,
      });

      res.status(201).json(newRating);
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Get all ratings for a song
// @route   GET /api/songs/:id/ratings
// @access  Public
const getSongRatings = async (req, res) => {
  try {
    const songId = req.params.id;

    // Check if song exists
    const song = await Song.findById(songId);
    if (!song) {
      return res.status(404).json({ message: 'Song not found' });
    }

    const ratings = await Rating.find({ songId })
      .populate('userId', 'username');

    res.json(ratings);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Delete a rating
// @route   DELETE /api/songs/:id/ratings
// @access  Private
const deleteRating = async (req, res) => {
  try {
    const songId = req.params.id;

    // Check if rating exists
    const rating = await Rating.findOne({
      userId: req.user._id,
      songId,
    });

    if (!rating) {
      return res.status(404).json({ message: 'Rating not found' });
    }

    await rating.deleteOne();
    res.json({ message: 'Rating removed' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Add a comment to a song
// @route   POST /api/songs/:id/comments
// @access  Private
const addComment = async (req, res) => {
  try {
    const { comment } = req.body;
    const songId = req.params.id;

    // Check if song exists
    const song = await Song.findById(songId);
    if (!song) {
      return res.status(404).json({ message: 'Song not found' });
    }

    const newComment = await Comment.create({
      songId,
      userId: req.user._id,
      comment,
    });

    // Populate user data
    const populatedComment = await Comment.findById(newComment._id)
      .populate('userId', 'username');

    res.status(201).json(populatedComment);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Get all comments for a song
// @route   GET /api/songs/:id/comments
// @access  Public
const getSongComments = async (req, res) => {
  try {
    const songId = req.params.id;

    // Check if song exists
    const song = await Song.findById(songId);
    if (!song) {
      return res.status(404).json({ message: 'Song not found' });
    }

    const comments = await Comment.find({ songId })
      .populate('userId', 'username')
      .sort({ createdAt: -1 });

    res.json(comments);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Delete a comment
// @route   DELETE /api/songs/:songId/comments/:commentId
// @access  Private
const deleteComment = async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.commentId);

    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }

    // Check if comment belongs to user
    if (comment.userId.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    await comment.deleteOne();
    res.json({ message: 'Comment removed' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

module.exports = {
  createRating,
  getSongRatings,
  deleteRating,
  addComment,
  getSongComments,
  deleteComment,
}; 