const cron = require('node-cron');
const UserInvestment = require('../models/UserInvestment');
const Earning = require('../models/Earning');
const Wallet = require('../models/Wallet');
const Transaction = require('../models/Transaction');
const User = require('../models/User');
const { sendEmail } = require('../services/emailService');

const calculateDailyEarnings = async () => {
  try {
    const activeInvestments = await UserInvestment.find({ status: 'active' });
    let processedCount = 0;

    for (const investment of activeInvestments) {
      const now = new Date();
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

      if (maxDay >= investment.duration || now > investment.endDate) {
        investment.status = 'completed';
        await investment.save();
      }
    }

    console.log(`[Earnings Cron] Processed ${processedCount} earning days at ${new Date().toISOString()}`);
  } catch (error) {
    console.error('Earnings cron error:', error);
  }
};

cron.schedule('*/30 * * * *', calculateDailyEarnings);
console.log('Earnings cron job scheduled (every 30 minutes)');

module.exports = { calculateDailyEarnings };
