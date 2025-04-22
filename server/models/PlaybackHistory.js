const mongoose = require('mongoose');

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

module.exports = PlaybackHistory; 