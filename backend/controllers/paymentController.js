const axios = require('axios');
const crypto = require('crypto');
const Wallet = require('../models/Wallet');
const Transaction = require('../models/Transaction');
const User = require('../models/User');

exports.initializeDeposit = async (req, res) => {
  try {
    const { amount } = req.body;
    if (!amount || amount < 100) {
      return res.status(400).json({ message: 'Minimum deposit is ₦100' });
    }

    const reference = `DEP-${Date.now()}-${req.user._id}`;

    const response = await axios.post(
      'https://api.paystack.co/transaction/initialize',
      {
        email: req.user.email,
        amount: amount * 100,
        reference,
        callback_url: `${process.env.APP_URL}/wallet`,
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    await Transaction.create({
      user: req.user._id,
      type: 'deposit',
      amount,
      status: 'pending',
      reference,
      description: 'Wallet deposit'
    });

    res.json({ authorizationUrl: response.data.data.authorization_url, reference });
  } catch (error) {
    console.error('Deposit init error:', error.response?.data || error.message);
    res.status(500).json({ message: 'Payment initialization failed' });
  }
};

exports.verifyDeposit = async (req, res) => {
  try {
    const { reference } = req.body;
    const response = await axios.get(
      `https://api.paystack.co/transaction/verify/${reference}`,
      {
        headers: { Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}` }
      }
    );

    const data = response.data.data;
    if (data.status === 'success') {
      const amount = data.amount / 100;
      const transaction = await Transaction.findOne({ reference });
      if (!transaction || transaction.status === 'completed') {
        return res.json({ message: 'Already processed', status: 'completed' });
      }

      const wallet = await Wallet.findOne({ user: transaction.user });
      wallet.balance += amount;
      await wallet.save();

      transaction.status = 'completed';
      await transaction.save();

      const user = await User.findById(transaction.user);
      const populatedWallet = await Wallet.findOne({ user: user._id });

      if (req.io) {
        req.io.to(`user-${user._id}`).emit('wallet-update', { wallet: populatedWallet });
      }

      await sendEmail({
        to: user.email,
        subject: 'Deposit Successful - Xender Earnings',
        html: `<p>₦${amount.toLocaleString()} has been credited to your wallet.</p>`
      });

      res.json({ message: 'Payment verified', status: 'completed', wallet: populatedWallet });
    } else {
      res.json({ message: 'Payment not successful', status: data.status });
    }
  } catch (error) {
    console.error('Verify error:', error.response?.data || error.message);
    res.status(500).json({ message: 'Verification failed' });
  }
};

exports.paystackWebhook = async (req, res) => {
  try {
    const hash = crypto.createHmac('sha512', process.env.PAYSTACK_SECRET_KEY)
      .update(JSON.stringify(req.body))
      .digest('hex');

    if (hash !== req.headers['x-paystack-signature']) {
      return res.status(401).json({ message: 'Invalid signature' });
    }

    const event = req.body;
    if (event.event === 'charge.success') {
      const reference = event.data.reference;
      const amount = event.data.amount / 100;

      const transaction = await Transaction.findOne({ reference });
      if (transaction && transaction.status === 'pending') {
        const wallet = await Wallet.findOne({ user: transaction.user });
        wallet.balance += amount;
        await wallet.save();

        transaction.status = 'completed';
        await transaction.save();

        const user = await User.findById(transaction.user);
        if (user) {
          await sendEmail({
            to: user.email,
            subject: 'Deposit Successful - Xender Earnings',
            html: `<p>₦${amount.toLocaleString()} has been credited to your wallet.</p>`
          });
        }
      }
    }

    res.sendStatus(200);
  } catch (error) {
    console.error('Webhook error:', error);
    res.sendStatus(500);
  }
};

exports.createVirtualAccount = async (req, res) => {
  try {
    const response = await axios.post(
      'https://api.paystack.co/dedicated_account',
      {
        customer: { email: req.user.email },
        preferred_bank: 'wema-bank',
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    res.json(response.data.data);
  } catch (error) {
    console.error('Virtual account error:', error.response?.data || error.message);
    res.status(500).json({ message: 'Failed to create virtual account' });
  }
};
