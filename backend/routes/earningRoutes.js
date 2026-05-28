const express = require('express');
const router = express.Router();
const { getUserEarnings, getEarningStats, triggerEarnings } = require('../controllers/earningController');
const { protect } = require('../middlewares/auth');
const { adminProtect } = require('../middlewares/adminAuth');

router.get('/', protect, getUserEarnings);
router.get('/stats', protect, getEarningStats);
router.post('/trigger', adminProtect, triggerEarnings);

module.exports = router;
