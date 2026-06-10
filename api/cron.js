const mongoose = require('mongoose');
const path = require('path');
const dns = require('dns');

dns.setServers(['8.8.8.8', '1.1.1.1']);

require('dotenv').config({ path: path.join(__dirname, '..', 'backend', '.env') });

const UserInvestment = require('../backend/models/UserInvestment');
const Earning = require('../backend/models/Earning');
const Wallet = require('../backend/models/Wallet');
const Transaction = require('../backend/models/Transaction');

const calculateDailyEarnings = async () => {
  const activeInvestments = await UserInvestment.find({ status: 'active' });
  let processedCount = 0;

  for (const investment of activeInvestments) {
    const now = new Date();
    if (now > investment.endDate) {
      investment.status = 'completed';
      await investment.save();
      continue;
    }

    const hoursSincePurchase = (now - new Date(investment.startDate)) / (1000 * 60 * 60);
    if (hoursSincePurchase < 24) continue;

    const daysSinceStart = Math.floor((now - new Date(investment.startDate)) / (1000 * 60 * 60 * 24));
    const maxDay = Math.min(daysSinceStart, investment.duration);

    const paidDays = await Earning.find({ investment: investment._id })
      .select('day')
      .lean();
    const paidDaySet = new Set(paidDays.map(e => e.day));

    const wallet = await Wallet.findOne({ user: investment.user });

    for (let day = 1; day <= maxDay; day++) {
      if (paidDaySet.has(day)) continue;

      const dailyAmount = investment.amount * (investment.dailyRoi / 100);

      await Earning.create({
        user: investment.user,
        investment: investment._id,
        amount: dailyAmount,
        day,
        isPaid: true,
      });

      if (wallet) {
        wallet.balance += dailyAmount;
        wallet.totalEarnings += dailyAmount;
        wallet.withdrawableBalance += dailyAmount;
      }

      investment.totalEarned += dailyAmount;

      await Transaction.create({
        user: investment.user,
        type: 'earning',
        amount: dailyAmount,
        status: 'completed',
        description: `Daily earning day ${day} for investment`,
        reference: `EARN-${investment._id}-${day}`
      });

      processedCount++;
    }

    investment.lastEarningDate = now;
    if (wallet) await wallet.save();
    await investment.save();

    if (maxDay >= investment.duration) {
      investment.status = 'completed';
      await investment.save();
    }
  }

  console.log(`[Vercel Cron] Processed ${processedCount} earning days at ${new Date().toISOString()}`);
};

module.exports = async (req, res) => {
  if (process.env.CRON_SECRET && req.headers.authorization !== `Bearer ${process.env.CRON_SECRET}`) {
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
