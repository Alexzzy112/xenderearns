const mongoose = require('mongoose');

const userInvestmentSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'InvestmentProduct', required: true },
  amount: { type: Number, required: true },
  dailyRoi: { type: Number, required: true },
  duration: { type: Number, required: true },
  startDate: { type: Date, default: Date.now },
  endDate: { type: Date },
  status: { type: String, enum: ['active', 'completed', 'cancelled'], default: 'active' },
  totalEarned: { type: Number, default: 0 },
  lastEarningDate: { type: Date },
}, { timestamps: true });

userInvestmentSchema.pre('save', function (next) {
  if (!this.endDate) {
    const end = new Date(this.startDate);
    end.setDate(end.getDate() + this.duration);
    this.endDate = end;
  }
  next();
});

module.exports = mongoose.model('UserInvestment', userInvestmentSchema);
