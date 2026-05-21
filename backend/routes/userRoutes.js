const express = require('express');
const router = express.Router();
const { updateProfile, addBankAccount, getBankAccounts, getDashboard } = require('../controllers/userController');
const { protect } = require('../middlewares/auth');

router.use(protect);
router.put('/profile', updateProfile);
router.get('/dashboard', getDashboard);
router.post('/bank-accounts', addBankAccount);
router.get('/bank-accounts', getBankAccounts);

module.exports = router;
