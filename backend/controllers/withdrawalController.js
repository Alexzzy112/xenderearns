const Withdrawal = require('../models/Withdrawal');
const Wallet = require('../models/Wallet');
const Transaction = require('../models/Transaction');
const UserInvestment = require('../models/UserInvestment');
const User = require('../models/User');
const { sendEmail } = require('../services/emailService');

exports.requestWithdrawal = async (req, res) => {
  try {
    const { amount, bankName, accountNumber, accountName } = req.body;

    const allowedDays = [1, 3, 5];
    const today = new Date().getDay();
    if (!allowedDays.includes(today)) {
      return res.status(400).json({ message: 'Withdrawals are only available on Monday, Wednesday, and Friday' });
    }

    const hasInvestment = await UserInvestment.findOne({
      user: req.user._id,
      status: { $in: ['active', 'completed'] }
    });
    if (!hasInvestment) {
      return res.status(400).json({ message: 'You must invest in a product before you can withdraw' });
    }

    const wallet = await Wallet.findOne({ user: req.user._id });
    if (!wallet) return res.status(404).json({ message: 'Wallet not found' });

    if (amount < 1500) {
      return res.status(400).json({ message: 'Minimum withdrawal is ₦1,500' });
    }

    const charge = Math.round(amount * 0.3);
    const netAmount = amount - charge;

    if (wallet.balance < amount) {
      return res.status(400).json({ message: 'Insufficient balance' });
    }

    wallet.balance -= amount;
    wallet.withdrawableBalance -= netAmount;
    wallet.totalWithdrawn += netAmount;
    await wallet.save();

    const withdrawal = await Withdrawal.create({
      user: req.user._id,
      amount: netAmount,
      charge,
      bankName,
      accountNumber,
      accountName,
    });

    await Transaction.create({
      user: req.user._id,
      type: 'withdrawal',
      amount: netAmount,
      status: 'pending',
      description: `Withdrawal to ${bankName} - ${accountNumber} (30% charge: ₦${charge.toLocaleString()})`,
      reference: `WTH-${Date.now()}`
    });

    if (req.io) {
      req.io.to(`user-${req.user._id}`).emit('wallet-update', { wallet });
    }

    res.status(201).json({ withdrawal, wallet, message: 'Withdrawal request submitted' });
  } catch (error) {
    console.error('Withdrawal error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getUserWithdrawals = async (req, res) => {
  try {
    const withdrawals = await Withdrawal.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json({ withdrawals });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getAllWithdrawals = async (req, res) => {
  try {
    const { status } = req.query;
    const filter = {};
    if (status) filter.status = status;

    const withdrawals = await Withdrawal.find(filter)
      .populate('user', 'firstName lastName email')
      .sort({ createdAt: -1 });
    res.json({ withdrawals });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.approveWithdrawal = async (req, res) => {
  try {
    const withdrawal = await Withdrawal.findById(req.params.id);
    if (!withdrawal) return res.status(404).json({ message: 'Withdrawal not found' });

    withdrawal.status = 'approved';
    withdrawal.processedBy = req.admin._id;
    withdrawal.processedAt = Date.now();
    await withdrawal.save();

    const transaction = await Transaction.findOne({
      user: withdrawal.user,
      type: 'withdrawal',
      amount: withdrawal.amount,
      status: 'pending'
    });
    if (transaction) {
      transaction.status = 'completed';
      await transaction.save();
    }

    const user = await User.findById(withdrawal.user);
    await sendEmail({
      to: user.email,
      subject: 'Withdrawal Approved - Xender Earnings',
      html: `<p>Your withdrawal of ₦${withdrawal.amount.toLocaleString()} has been approved.</p>`
    });

    res.json({ message: 'Withdrawal approved' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.rejectWithdrawal = async (req, res) => {
  try {
    const { adminNote } = req.body;
    const withdrawal = await Withdrawal.findById(req.params.id);
    if (!withdrawal) return res.status(404).json({ message: 'Withdrawal not found' });

    withdrawal.status = 'rejected';
    withdrawal.adminNote = adminNote;
    withdrawal.processedBy = req.admin._id;
    withdrawal.processedAt = Date.now();
    await withdrawal.save();

    const wallet = await Wallet.findOne({ user: withdrawal.user });
    wallet.balance += withdrawal.amount;
    await wallet.save();

    const transaction = await Transaction.findOne({
      user: withdrawal.user,
      type: 'withdrawal',
      amount: withdrawal.amount,
      status: 'pending'
    });
    if (transaction) {
      transaction.status = 'failed';
      await transaction.save();
    }

    const user = await User.findById(withdrawal.user);
    await sendEmail({
      to: user.email,
      subject: 'Withdrawal Rejected - Xender Earnings',
      html: `<p>Your withdrawal of ₦${withdrawal.amount.toLocaleString()} was rejected. Reason: ${adminNote || 'N/A'}</p>`
    });

    res.json({ message: 'Withdrawal rejected' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getAllWithdrawals = async (req, res) => {
  try {
    const { status } = req.query;
    const filter = {};
    if (status) filter.status = status;

    const withdrawals = await Withdrawal.find(filter)
      .populate('user', 'firstName lastName email')
      .sort({ createdAt: -1 });
    res.json(withdrawals);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};
