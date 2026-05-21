const UserInvestment = require('../models/UserInvestment');
const Earning = require('../models/Earning');

exports.getUserEarnings = async (req, res) => {
  try {
    const earnings = await Earning.find({ user: req.user._id })
      .populate('investment')
      .sort({ date: -1 });
    res.json(earnings);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getEarningStats = async (req, res) => {
  try {
    const totalEarnings = await Earning.aggregate([
      { $match: { user: req.user._id } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);

    const todayEarnings = await Earning.aggregate([
      {
        $match: {
          user: req.user._id,
          date: { $gte: new Date(new Date().setHours(0, 0, 0, 0)) }
        }
      },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);

    res.json({
      totalEarnings: totalEarnings[0]?.total || 0,
      todayEarnings: todayEarnings[0]?.total || 0,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};
