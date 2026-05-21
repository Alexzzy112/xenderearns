const express = require('express');
const router = express.Router();
const { getUserEarnings, getEarningStats } = require('../controllers/earningController');
const { protect } = require('../middlewares/auth');

router.get('/', protect, getUserEarnings);
router.get('/stats', protect, getEarningStats);

module.exports = router;
