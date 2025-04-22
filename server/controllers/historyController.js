const PlaybackHistory = require('../models/PlaybackHistory');

// @desc    Get playback history for a user
// @route   GET /api/history
// @access  Private
const getUserHistory = async (req, res) => {
  try {
    const history = await PlaybackHistory.find({ userId: req.user._id })
      .populate('songId')
      .sort({ playedAt: -1 });

    res.json(history);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Clear all playback history for a user
// @route   DELETE /api/history
// @access  Private
const clearUserHistory = async (req, res) => {
  try {
    await PlaybackHistory.deleteMany({ userId: req.user._id });
    res.json({ message: 'Playback history cleared' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Delete a single playback history entry
// @route   DELETE /api/history/:id
// @access  Private
const deleteHistoryEntry = async (req, res) => {
  try {
    const history = await PlaybackHistory.findById(req.params.id);

    if (!history) {
      return res.status(404).json({ message: 'History entry not found' });
    }

    // Check if history belongs to user
    if (history.userId.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    await history.deleteOne();
    res.json({ message: 'History entry removed' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

module.exports = {
  getUserHistory,
  clearUserHistory,
  deleteHistoryEntry,
}; 