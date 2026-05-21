const InvestmentProduct = require('../models/InvestmentProduct');
const UserInvestment = require('../models/UserInvestment');
const Wallet = require('../models/Wallet');
const Transaction = require('../models/Transaction');

exports.getProducts = async (req, res) => {
  try {
    const products = await InvestmentProduct.find({ isActive: true });
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getProductById = async (req, res) => {
  try {
    const product = await InvestmentProduct.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.json(product);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.createProduct = async (req, res) => {
  try {
    const { name, description, investmentAmount, dailyRoi, duration } = req.body;
    let image = '';
    if (req.file) image = req.file.path;

    const product = await InvestmentProduct.create({
      name, image, description, investmentAmount, dailyRoi, duration,
      createdBy: req.admin._id
    });
    res.status(201).json(product);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.updateProduct = async (req, res) => {
  try {
    const product = await InvestmentProduct.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!product) return res.status(404).json({ message: 'Product not found' });
    if (req.file) product.image = req.file.path;
    await product.save();
    res.json(product);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.deleteProduct = async (req, res) => {
  try {
    const product = await InvestmentProduct.findByIdAndDelete(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.json({ message: 'Product deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.purchaseProduct = async (req, res) => {
  try {
    const { productId } = req.body;
    const product = await InvestmentProduct.findById(productId);
    if (!product || !product.isActive) {
      return res.status(404).json({ message: 'Product not found or inactive' });
    }

    const wallet = await Wallet.findOne({ user: req.user._id });
    if (!wallet || wallet.balance < product.investmentAmount) {
      return res.status(400).json({ message: 'Insufficient balance' });
    }

    wallet.balance -= product.investmentAmount;
    wallet.totalInvested += product.investmentAmount;
    await wallet.save();

    const investment = await UserInvestment.create({
      user: req.user._id,
      product: product._id,
      amount: product.investmentAmount,
      dailyRoi: product.dailyRoi,
      duration: product.duration,
    });

    await Transaction.create({
      user: req.user._id,
      type: 'investment',
      amount: product.investmentAmount,
      status: 'completed',
      description: `Investment in ${product.name}`,
      reference: `INV-${Date.now()}`
    });

    if (req.io) {
      req.io.to(`user-${req.user._id}`).emit('investment-update', { investment, wallet });
    }

    res.status(201).json({ investment, wallet, message: 'Investment successful' });
  } catch (error) {
    console.error('Purchase error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getUserInvestments = async (req, res) => {
  try {
    const investments = await UserInvestment.find({ user: req.user._id })
      .populate('product')
      .sort({ createdAt: -1 });
    res.json(investments);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};
