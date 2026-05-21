const Wallet = require('../models/Wallet');
const Transaction = require('../models/Transaction');
const User = require('../models/User');
const { sendEmail } = require('../services/emailService');

const BANK_DETAILS = {
  bankName: 'Moniepoint Microfinance Bank',
  accountNumber: '6480276802',
  accountName: 'Kwoku Azamu',
};

exports.initializeDeposit = async (req, res) => {
  try {
    const { amount } = req.body;
    if (!amount || amount < 100) {
      return res.status(400).json({ message: 'Minimum deposit is ₦100' });
    }

    const reference = `DEP-${Date.now()}-${req.user._id}`;

    await Transaction.create({
      user: req.user._id,
      type: 'deposit',
      amount,
      status: 'pending',
      reference,
      description: 'Wallet deposit via bank transfer'
    });

    res.json({ reference, bankDetails: BANK_DETAILS });
  } catch (error) {
    console.error('Deposit init error:', error.message);
    res.status(500).json({ message: 'Payment initialization failed' });
  }
};

exports.confirmDeposit = async (req, res) => {
  try {
    const { transactionId } = req.body;
    const transaction = await Transaction.findById(transactionId);
    if (!transaction) return res.status(404).json({ message: 'Transaction not found' });
    if (transaction.status !== 'pending') return res.status(400).json({ message: 'Transaction already processed' });

    const wallet = await Wallet.findOne({ user: transaction.user });
    wallet.balance += transaction.amount;
    await wallet.save();

    transaction.status = 'completed';
    await transaction.save();

    const user = await User.findById(transaction.user);
    const populatedWallet = await Wallet.findOne({ user: user._id });

    if (req.io) {
      req.io.to(`user-${user._id}`).emit('wallet-update', { wallet: populatedWallet });
    }

    try {
      await sendEmail({
        to: user.email,
        subject: 'Deposit Successful - Xender Earnings',
        html: `<p>₦${transaction.amount.toLocaleString()} has been credited to your wallet.</p>`
      });
    } catch (emailErr) {
      console.error('Failed to send deposit email:', emailErr.message);
    }

    res.json({ message: 'Deposit confirmed', status: 'completed', wallet: populatedWallet });
  } catch (error) {
    console.error('Confirm deposit error:', error);
    res.status(500).json({ message: 'Failed to confirm deposit' });
  }
};

exports.verifyDeposit = async (req, res) => {
  try {
    const { reference } = req.body;
    const transaction = await Transaction.findOne({ reference });
    if (!transaction) return res.status(404).json({ message: 'Transaction not found' });

    const wallet = await Wallet.findOne({ user: transaction.user });

    res.json({ status: transaction.status, transaction, wallet });
  } catch (error) {
    console.error('Verify error:', error.message);
    res.status(500).json({ message: 'Verification failed' });
  }
};

exports.paystackWebhook = async (req, res) => {
  res.sendStatus(200);
};

exports.createVirtualAccount = async (req, res) => {
  res.status(400).json({ message: 'Not available' });
};
