const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const InvestmentProduct = require('../models/InvestmentProduct');

const products = [
  {
    name: 'Starter Plan',
    image: 'https://picsum.photos/seed/starter/400/400',
    description: 'Guaranteed daily returns for 30 days',
    investmentAmount: 3600,
    dailyRoi: 13.8889,
    duration: 30,
  },
  {
    name: 'Basic Plan',
    image: 'https://picsum.photos/seed/basic/400/400',
    description: 'Guaranteed daily returns for 30 days',
    investmentAmount: 8000,
    dailyRoi: 13.875,
    duration: 30,
  },
  {
    name: 'Standard Plan',
    image: 'https://picsum.photos/seed/standard/400/400',
    description: 'Guaranteed daily returns for 30 days',
    investmentAmount: 12000,
    dailyRoi: 13.8333,
    duration: 30,
  },
  {
    name: 'Growth Plan',
    image: 'https://picsum.photos/seed/growth/400/400',
    description: 'Guaranteed daily returns for 30 days',
    investmentAmount: 15000,
    dailyRoi: 13.8667,
    duration: 30,
  },
  {
    name: 'Advanced Plan',
    image: 'https://picsum.photos/seed/advanced/400/400',
    description: 'Guaranteed daily returns for 30 days',
    investmentAmount: 30000,
    dailyRoi: 13.8667,
    duration: 30,
  },
  {
    name: 'Premium Plan',
    image: 'https://picsum.photos/seed/premium/400/400',
    description: 'Guaranteed daily returns for 30 days',
    investmentAmount: 50000,
    dailyRoi: 13.88,
    duration: 30,
  },
  {
    name: 'Elite Plan',
    image: 'https://picsum.photos/seed/elite/400/400',
    description: 'Guaranteed daily returns for 30 days',
    investmentAmount: 80000,
    dailyRoi: 13.8875,
    duration: 30,
  },
  {
    name: 'VIP Plan',
    image: 'https://picsum.photos/seed/vip/400/400',
    description: 'Guaranteed daily returns for 30 days',
    investmentAmount: 100000,
    dailyRoi: 13.88,
    duration: 30,
  },
  {
    name: 'Platinum Plan',
    image: 'https://picsum.photos/seed/platinum/400/400',
    description: 'Guaranteed daily returns for 30 days',
    investmentAmount: 500000,
    dailyRoi: 13.888,
    duration: 30,
  },
  {
    name: 'Diamond Plan',
    image: 'https://picsum.photos/seed/diamond/400/400',
    description: 'Guaranteed daily returns for 30 days',
    investmentAmount: 1000000,
    dailyRoi: 13.888,
    duration: 30,
  },
];

async function seed() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB connected');

    await InvestmentProduct.deleteMany({});
    console.log('Cleared existing products');

    const created = await InvestmentProduct.insertMany(products);
    console.log(`Seeded ${created.length} products:`);
    created.forEach(p => {
      const daily = p.investmentAmount * (p.dailyRoi / 100);
      console.log(`  ${p.name} - ₦${p.investmentAmount.toLocaleString()} (₦${Math.round(daily).toLocaleString()}/day)`);
    });

    await mongoose.disconnect();
    console.log('Done');
    process.exit(0);
  } catch (error) {
    console.error('Seed error:', error);
    process.exit(1);
  }
}

seed();
