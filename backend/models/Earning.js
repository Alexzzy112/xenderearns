const mongoose = require('mongoose');

const earningSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  investment: { type: mongoose.Schema.Types.ObjectId, ref: 'UserInvestment', required: true },
  amount: { type: Number, required: true },
  day: { type: Number, required: true },
  date: { type: Date, default: Date.now },
  isPaid: { type: Boolean, default: false },
}, { timestamps: true });

earningSchema.index({ user: 1, investment: 1 });

module.exports = mongoose.model('Earning', earningSchema);
