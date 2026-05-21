const mongoose = require('mongoose');
const path = require('path');

require('dotenv').config({ path: path.join(__dirname, '..', 'backend', '.env') });

const UserInvestment = require('../backend/models/UserInvestment');
const Earning = require('../backend/models/Earning');
const Wallet = require('../backend/models/Wallet');
const Transaction = require('../backend/models/Transaction');

const calculateDailyEarnings = async () => {
  const activeInvestments = await UserInvestment.find({ status: 'active' });

  for (const investment of activeInvestments) {
    const now = new Date();
    if (now > investment.endDate) {
      investment.status = 'completed';
      await investment.save();
      continue;
    }

    const hoursSincePurchase = (now - new Date(investment.startDate)) / (1000 * 60 * 60);
    if (hoursSincePurchase < 24) continue;

    const lastEarning = await Earning.findOne({ investment: investment._id })
      .sort({ day: -1 });
    const currentDay = lastEarning ? lastEarning.day + 1 : 1;

    if (currentDay > investment.duration) {
      investment.status = 'completed';
      await investment.save();
      continue;
    }

    const alreadyPaidToday = lastEarning && lastEarning.day === currentDay;
    if (alreadyPaidToday) continue;

    const dailyAmount = investment.amount * (investment.dailyRoi / 100);

    const earning = await Earning.create({
      user: investment.user,
      investment: investment._id,
      amount: dailyAmount,
      day: currentDay,
      isPaid: true,
    });

    const wallet = await Wallet.findOne({ user: investment.user });
    if (wallet) {
      wallet.balance += dailyAmount;
      wallet.totalEarnings += dailyAmount;
      wallet.withdrawableBalance += dailyAmount;
      await wallet.save();
    }

    investment.totalEarned += dailyAmount;
    investment.lastEarningDate = now;
    await investment.save();

    await Transaction.create({
      user: investment.user,
      type: 'earning',
      amount: dailyAmount,
      status: 'completed',
      description: `Daily earning day ${currentDay}`,
      reference: `EARN-${investment._id}-${currentDay}`
    });
  }
};

module.exports = async (req, res) => {
  if (req.headers.authorization !== `Bearer ${process.env.CRON_SECRET}`) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  let cached = global._mongoCache;
  if (!cached) cached = global._mongoCache = { conn: null, promise: null };

  try {
    if (!cached.conn) {
      if (!cached.promise) {
        cached.promise = mongoose.connect(process.env.MONGODB_URI).then(m => m);
      }
      cached.conn = await cached.promise;
    }

    await calculateDailyEarnings();
    res.json({ message: 'Earnings calculated successfully' });
  } catch (error) {
    console.error('Cron error:', error);
    res.status(500).json({ message: 'Cron failed' });
  }
};
