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
    const { page = 1, limit = 20, search } = req.query;
    const query = {};
    if (search) {
      query.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }
    const users = await User.find(query)
      .select('-password -verificationToken -resetPasswordToken')
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    const userIds = users.map(u => u._id);
    const [investmentCounts, walletData] = await Promise.all([
      UserInvestment.aggregate([
        { $match: { user: { $in: userIds } } },
        { $group: { _id: '$user', total: { $sum: 1 }, active: { $sum: { $cond: [{ $eq: ['$status', 'active'] }, 1, 0] } } } }
      ]),
      Wallet.find({ user: { $in: userIds } }).select('user totalInvested totalEarnings')
    ]);

    const countMap = {};
    investmentCounts.forEach(c => { countMap[c._id.toString()] = { total: c.total, active: c.active }; });
    const walletMap = {};
    walletData.forEach(w => { walletMap[w.user.toString()] = w; });

    const usersWithCounts = users.map(u => ({
      ...u.toObject(),
      name: `${u.firstName} ${u.lastName}`,
      status: u.isActive ? 'active' : 'suspended',
      totalPurchased: countMap[u._id.toString()]?.total || 0,
      activePurchased: countMap[u._id.toString()]?.active || 0,
      totalInvested: walletMap[u._id.toString()]?.totalInvested || 0,
      totalEarnings: walletMap[u._id.toString()]?.totalEarnings || 0,
    }));

    const total = await User.countDocuments(query);
    res.json({ users: usersWithCounts, total, page: parseInt(page), pages: Math.ceil(total / limit) });
  } catch (error) {
    console.error('Get users error:', error);
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
    const [totalInvested, totalEarnings, activeProducts, roiData] = await Promise.all([
      UserInvestment.aggregate([
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ]),
      Wallet.aggregate([
        { $group: { _id: null, total: { $sum: '$totalEarnings' } } }
      ]),
      InvestmentProduct.countDocuments({ isActive: true }),
      InvestmentProduct.aggregate([
        { $match: { isActive: true } },
        { $group: { _id: null, avg: { $avg: '$dailyRoi' } } }
      ])
    ]);

    const investments = await UserInvestment.find()
      .populate('user', 'firstName lastName email')
      .populate('product', 'name')
      .sort({ createdAt: -1 });

    res.json({
      investments,
      totalInvested: totalInvested[0]?.total || 0,
      totalROIPaid: totalEarnings[0]?.total || 0,
      activeProducts,
      avgDailyROI: roiData[0]?.avg ? Math.round(roiData[0].avg * 100) / 100 : 0,
    });
  } catch (error) {
    console.error('Investment stats error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getUserInvestments = async (req, res) => {
  try {
    const investments = await UserInvestment.find({ user: req.params.id })
      .populate('product', 'name')
      .sort({ createdAt: -1 });
    res.json({ investments });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.cancelInvestment = async (req, res) => {
  try {
    const investment = await UserInvestment.findById(req.params.id).populate('product', 'name');
    if (!investment) return res.status(404).json({ message: 'Investment not found' });
    if (investment.status !== 'active') return res.status(400).json({ message: 'Investment is not active' });

    investment.status = 'cancelled';
    await investment.save();

    const wallet = await Wallet.findOne({ user: investment.user });
    if (wallet) {
      wallet.balance += investment.amount;
      wallet.totalInvested = Math.max(0, wallet.totalInvested - investment.amount);
      await wallet.save();
    }

    await Transaction.create({
      user: investment.user,
      type: 'refund',
      amount: investment.amount,
      status: 'completed',
      description: `Investment in ${investment.product.name} cancelled by admin`,
      reference: `CNL-${Date.now()}`
    });

    res.json({ message: 'Investment cancelled and funds refunded', investment });
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
    const existing = await Admin.findOne({ email: 'azamukwokusilas2@gmail.com' });
    if (existing) return res.json({ message: 'Admin already exists' });

    await Admin.create({
      name: 'Super Admin',
      email: 'azamukwokusilas2@gmail.com',
      password: 'Alexzzy11@',
      role: 'superadmin',
    });
    res.json({ message: 'Admin created. Email: azamukwokusilas2@gmail.com, Password: Alexzzy11@' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};
