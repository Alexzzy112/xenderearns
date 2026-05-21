const express = require('express');
const router = express.Router();
const { getProducts, getProductById, purchaseProduct, getUserInvestments } = require('../controllers/productController');
const { protect } = require('../middlewares/auth');

router.get('/', getProducts);
router.get('/:id', getProductById);
router.post('/purchase', protect, purchaseProduct);
router.get('/user/investments', protect, getUserInvestments);

module.exports = router;
