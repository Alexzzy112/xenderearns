const Admin = require('../models/Admin');
const User = require('../models/User');
const Wallet = require('../models/Wallet');
const Transaction = require('../models/Transaction');
const Withdrawal = require('../models/Withdrawal');
const InvestmentProduct = require('../models/InvestmentProduct');
const UserInvestment = require('../models/UserInvestment');
const jwt = require('jsonwebtoken');

const generateToken = (id) => jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '7d' });

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const admin = await Admin.findOne({ email });
    if (!admin || !(await admin.comparePassword(password))) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    const token = generateToken(admin._id);
    res.json({ token, admin: { id: admin._id, name: admin.name, email: admin.email } });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getUsers = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const users = await User.find()
      .select('-password -verificationToken -resetPasswordToken')
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    const total = await User.countDocuments();
    res.json({ users, total, page: parseInt(page), pages: Math.ceil(total / limit) });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.toggleUserStatus = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    user.isActive = !user.isActive;
    await user.save();
    res.json({ message: `User ${user.isActive ? 'activated' : 'suspended'}`, user });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getDashboardStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const activeInvestments = await UserInvestment.countDocuments({ status: 'active' });
    const totalDeposits = await Transaction.aggregate([
      { $match: { type: 'deposit', status: 'completed' } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);
    const totalWithdrawals = await Transaction.aggregate([
      { $match: { type: 'withdrawal', status: 'completed' } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);
    const totalInvested = await UserInvestment.aggregate([
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);
    const pendingWithdrawals = await Withdrawal.countDocuments({ status: 'pending' });
    const pendingPayments = await Transaction.countDocuments({ type: 'deposit', status: 'pending' });
    const recentPayments = await Transaction.find({ type: 'deposit', status: 'pending' })
      .populate('user', 'firstName lastName email')
      .sort({ createdAt: -1 })
      .limit(5);
    const recentWithdrawals = await Withdrawal.find({ status: 'pending' })
      .populate('user', 'firstName lastName email')
      .sort({ createdAt: -1 })
      .limit(5);

    res.json({
      totalUsers,
      activeInvestments,
      totalDeposits: totalDeposits[0]?.total || 0,
      totalWithdrawals: totalWithdrawals[0]?.total || 0,
      totalInvested: totalInvested[0]?.total || 0,
      pendingWithdrawals,
      pendingPayments,
      recentPayments,
      recentWithdrawals,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getAllPayments = async (req, res) => {
  try {
    const filter = { type: 'deposit' };
    if (req.query.status && req.query.status !== 'all') {
      filter.status = req.query.status;
    }
    const payments = await Transaction.find(filter)
      .populate('user', 'firstName lastName email')
      .sort({ createdAt: -1 });
    res.json({ payments });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.deletePayment = async (req, res) => {
  try {
    const transaction = await Transaction.findByIdAndDelete(req.params.id);
    if (!transaction) return res.status(404).json({ message: 'Payment not found' });
    res.json({ message: 'Payment deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    await Promise.all([
      Wallet.deleteOne({ user: user._id }),
      UserInvestment.deleteMany({ user: user._id }),
      Transaction.deleteMany({ user: user._id }),
      Withdrawal.deleteMany({ user: user._id }),
      User.findByIdAndDelete(user._id),
    ]);
    res.json({ message: 'User and all associated data deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.reverseWithdrawal = async (req, res) => {
  try {
    const withdrawal = await Withdrawal.findById(req.params.id);
    if (!withdrawal) return res.status(404).json({ message: 'Withdrawal not found' });
    if (withdrawal.status !== 'approved') return res.status(400).json({ message: 'Only approved withdrawals can be reversed' });

    const wallet = await Wallet.findOne({ user: withdrawal.user });
    if (wallet) {
      wallet.balance += withdrawal.amount;
      wallet.withdrawableBalance += withdrawal.amount;
      wallet.totalWithdrawn = Math.max(0, wallet.totalWithdrawn - withdrawal.amount);
      await wallet.save();
    }

    withdrawal.status = 'rejected';
    withdrawal.adminNote = 'Reversed by admin';
    await withdrawal.save();

    await Transaction.create({
      user: withdrawal.user,
      type: 'withdrawal',
      amount: withdrawal.amount,
      status: 'failed',
      description: `Withdrawal reversed by admin`,
      reference: `REV-${Date.now()}`
    });

    res.json({ message: 'Withdrawal reversed and funds returned' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getInvestmentStats = async (req, res) => {
  try {
    const investments = await UserInvestment.find()
      .populate('user', 'firstName lastName email')
      .populate('product', 'name')
      .sort({ createdAt: -1 });
    res.json(investments);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.setUserPurchaseLimit = async (req, res) => {
  try {
    const { userId, maxActiveInvestments } = req.body;
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });
    user.maxActiveInvestments = maxActiveInvestments;
    await user.save();
    res.json({ message: 'Purchase limit updated', user: { id: user._id, maxActiveInvestments: user.maxActiveInvestments } });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.seedAdmin = async (req, res) => {
  try {
    const existing = await Admin.findOne({ email: 'admin@xender.com' });
    if (existing) return res.json({ message: 'Admin already exists' });

    await Admin.create({
      name: 'Super Admin',
      email: 'admin@xender.com',
      password: 'admin123',
      role: 'superadmin',
    });
    res.json({ message: 'Admin created. Email: admin@xender.com, Password: admin123' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};
