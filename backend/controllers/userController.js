const User = require('../models/User');
const Wallet = require('../models/Wallet');
const UserInvestment = require('../models/UserInvestment');

exports.updateProfile = async (req, res) => {
  try {
    const { firstName, lastName, phone } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { firstName, lastName, phone },
      { new: true }
    ).select('-password -verificationToken -resetPasswordToken');

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.addBankAccount = async (req, res) => {
  try {
    const { bankName, accountNumber, accountName } = req.body;
    const user = await User.findById(req.user._id);

    user.bankAccounts.push({
      bankName,
      accountNumber,
      accountName,
      isDefault: user.bankAccounts.length === 0,
    });
    await user.save();

    res.json(user.bankAccounts);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getBankAccounts = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    res.json(user.bankAccounts);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getDashboard = async (req, res) => {
  try {
    const wallet = await Wallet.findOne({ user: req.user._id });
    const investments = await UserInvestment.find({ user: req.user._id })
      .populate('product')
      .sort({ createdAt: -1 });
    const activeInvestments = investments.filter(inv => inv.status === 'active');

    res.json({ wallet, investments, activeInvestments: activeInvestments.length });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.uploadKyc = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'No file uploaded' });
    const user = await User.findById(req.user._id);
    user.kycDocument = req.file.path;
    user.isKycVerified = false;
    await user.save();
    res.json({ message: 'KYC document uploaded, pending verification' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.verifyKyc = async (req, res) => {
  try {
    const { userId, verified } = req.body;
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });
    user.isKycVerified = verified;
    await user.save();
    res.json({ message: `KYC ${verified ? 'verified' : 'rejected'}` });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};
