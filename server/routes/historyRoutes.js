const express = require('express');
const router = express.Router();
const {
  getUserHistory,
  clearUserHistory,
  deleteHistoryEntry
} = require('../controllers/historyController');
const { protect } = require('../middleware/authMiddleware');

// All history routes are protected
router.use(protect);

router.route('/')
  .get(getUserHistory)
  .delete(clearUserHistory);

router.route('/:id')
  .delete(deleteHistoryEntry);

module.exports = router; 