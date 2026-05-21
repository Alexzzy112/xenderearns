const express = require('express');
const router = express.Router();
const { updateProfile, addBankAccount, getBankAccounts, getDashboard, uploadKyc } = require('../controllers/userController');
const { protect } = require('../middlewares/auth');
const { upload } = require('../utils/upload');

router.use(protect);
router.put('/profile', updateProfile);
router.get('/dashboard', getDashboard);
router.post('/bank-accounts', addBankAccount);
router.get('/bank-accounts', getBankAccounts);
router.post('/kyc', upload.single('kyc'), uploadKyc);

module.exports = router;
