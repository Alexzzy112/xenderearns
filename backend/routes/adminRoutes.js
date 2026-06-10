const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const productController = require('../controllers/productController');
const withdrawalController = require('../controllers/withdrawalController');
const paymentController = require('../controllers/paymentController');
const { adminProtect } = require('../middlewares/adminAuth');
const { upload } = require('../utils/upload');

router.post('/login', adminController.login);
router.get('/seed', adminController.seedAdmin);

router.use(adminProtect);
router.get('/users', adminController.getUsers);
router.put('/users/:id/toggle-status', adminController.toggleUserStatus);
router.put('/users/purchase-limit', adminController.setUserPurchaseLimit);
router.delete('/users/:id', adminController.deleteUser);
router.get('/stats', adminController.getDashboardStats);
router.get('/payments', adminController.getAllPayments);
router.delete('/payments/:id', adminController.deletePayment);
router.put('/payments/confirm', paymentController.confirmDeposit);
router.post('/refresh-images', adminController.refreshProductImages);
router.get('/investment-stats', adminController.getInvestmentStats);
router.get('/users/:id/investments', adminController.getUserInvestments);
router.put('/investments/:id/cancel', adminController.cancelInvestment);

router.post('/products', upload.single('image'), productController.createProduct);
router.put('/products/:id', upload.single('image'), productController.updateProduct);
router.delete('/products/:id', productController.deleteProduct);

router.get('/withdrawals', withdrawalController.getAllWithdrawals);
router.put('/withdrawals/:id/approve', withdrawalController.approveWithdrawal);
router.put('/withdrawals/:id/reject', withdrawalController.rejectWithdrawal);
router.put('/withdrawals/:id/reverse', adminController.reverseWithdrawal);


module.exports = router;
