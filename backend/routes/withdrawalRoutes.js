const express = require('express');
const router = express.Router();
const { requestWithdrawal, getUserWithdrawals } = require('../controllers/withdrawalController');
const { protect } = require('../middlewares/auth');

router.post('/', protect, requestWithdrawal);
router.get('/', protect, getUserWithdrawals);

module.exports = router;
