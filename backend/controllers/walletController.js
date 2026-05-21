const Wallet = require('../models/Wallet');
const Transaction = require('../models/Transaction');
const UserInvestment = require('../models/UserInvestment');

exports.getWallet = async (req, res) => {
  try {
    const wallet = await Wallet.findOne({ user: req.user._id });
    if (!wallet) {
      const newWallet = await Wallet.create({ user: req.user._id });
      return res.json({ wallet: newWallet });
    }
    const hasInvestment = await UserInvestment.findOne({
      user: req.user._id,
      status: { $in: ['active', 'completed'] }
    });
    if (hasInvestment && wallet.withdrawableBalance < wallet.balance) {
      wallet.withdrawableBalance = wallet.balance;
      await wallet.save();
    }
    res.json({ wallet });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getTransactions = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const transactions = await Transaction.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Transaction.countDocuments({ user: req.user._id });

    res.json({
      transactions,
      page,
      pages: Math.ceil(total / limit),
      total
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};
