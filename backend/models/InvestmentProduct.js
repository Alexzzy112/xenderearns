const mongoose = require('mongoose');

const investmentProductSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  image: { type: String },
  description: { type: String, required: true },
  investmentAmount: { type: Number, required: true },
  dailyRoi: { type: Number, required: true },
  duration: { type: Number, required: true },
  totalReturn: { type: Number },
  isActive: { type: Boolean, default: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin' },
}, { timestamps: true });

investmentProductSchema.pre('save', function (next) {
  this.totalReturn = this.investmentAmount * (1 + (this.dailyRoi / 100) * this.duration);
  next();
});

module.exports = mongoose.model('InvestmentProduct', investmentProductSchema);
