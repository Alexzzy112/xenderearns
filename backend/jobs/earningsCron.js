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

    for (const investment of activeInvestments) {
      const now = new Date();
      if (now > investment.endDate) {
        investment.status = 'completed';
        await investment.save();
        continue;
      }

      const lastEarning = await Earning.findOne({ investment: investment._id })
        .sort({ day: -1 });
      const currentDay = lastEarning ? lastEarning.day + 1 : 1;

      if (currentDay > investment.duration) {
        investment.status = 'completed';
        await investment.save();
        continue;
      }

      const dailyAmount = investment.amount * (investment.dailyRoi / 100);

      const earning = await Earning.create({
        user: investment.user,
        investment: investment._id,
        amount: dailyAmount,
        day: currentDay,
        isPaid: true,
      });

      const wallet = await Wallet.findOne({ user: investment.user });
      wallet.balance += dailyAmount;
      wallet.totalEarnings += dailyAmount;
      wallet.withdrawableBalance += dailyAmount;
      await wallet.save();

      investment.totalEarned += dailyAmount;
      investment.lastEarningDate = now;
      await investment.save();

      await Transaction.create({
        user: investment.user,
        type: 'earning',
        amount: dailyAmount,
        status: 'completed',
        description: `Daily earning day ${currentDay} for investment`,
        reference: `EARN-${investment._id}-${currentDay}`
      });

      const user = await User.findById(investment.user);
      if (user) {
        await sendEmail({
          to: user.email,
          subject: 'Daily Earning Credited - Xender Earnings',
          html: `<p>₦${dailyAmount.toLocaleString()} has been credited to your wallet (Day ${currentDay}).</p>`
        });
      }
    }

    console.log(`Earnings calculated for ${new Date().toISOString()}`);
  } catch (error) {
    console.error('Earnings cron error:', error);
  }
};

cron.schedule('0 0 * * *', calculateDailyEarnings);
console.log('Earnings cron job scheduled for midnight');

module.exports = { calculateDailyEarnings };
