const express = require('express');
const router = express.Router();
const { initializeDeposit, verifyDeposit, paystackWebhook, createVirtualAccount } = require('../controllers/paymentController');
const { protect } = require('../middlewares/auth');

router.post('/initialize', protect, initializeDeposit);
router.post('/verify', protect, verifyDeposit);
router.post('/webhook/paystack', paystackWebhook);
router.post('/virtual-account', protect, createVirtualAccount);

module.exports = router;
