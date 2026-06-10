const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  firstName: { type: String, required: true, trim: true },
  lastName: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  phone: { type: String, required: true, trim: true },
  password: { type: String, required: true, minlength: 6 },
  isVerified: { type: Boolean, default: false },
  isActive: { type: Boolean, default: true },
  isKycVerified: { type: Boolean, default: false },
  kycDocument: { type: String },
  referralCode: { type: String, unique: true },
  referredBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  referralEarnings: { type: Number, default: 0 },
  bankAccounts: [{
    bankName: String,
    accountNumber: String,
    accountName: String,
    isDefault: { type: Boolean, default: false }
  }],
  maxActiveInvestments: { type: Number, default: 0 },
  verificationToken: String,
  verificationTokenExpires: Date,
  resetPasswordToken: String,
  resetPasswordExpires: Date,
}, { timestamps: true });

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.comparePassword = async function (candidatePassword) {
  if (!this.password) return false;
  try {
    return bcrypt.compare(candidatePassword, this.password);
  } catch {
    return false;
  }
};

userSchema.methods.generateReferralCode = function () {
  return this.firstName.substring(0, 3).toUpperCase() + Math.random().toString(36).substring(2, 8).toUpperCase();
};

module.exports = mongoose.model('User', userSchema);
