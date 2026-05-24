const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const InvestmentProduct = require('../models/InvestmentProduct');

const products = [
  {
    name: 'iPhone 15 Pro',
    image: 'https://picsum.photos/seed/iphone15pro/400/400',
    description: 'Premium investment plan with guaranteed daily returns',
    investmentAmount: 3600,
    dailyRoi: 13.8889,
    duration: 30,
  },
  {
    name: 'iPhone 15',
    image: 'https://picsum.photos/seed/iphone15/400/400',
    description: 'Premium investment plan with guaranteed daily returns',
    investmentAmount: 10000,
    dailyRoi: 15,
    duration: 30,
  },
  {
    name: 'iPhone 14 Pro',
    image: 'https://picsum.photos/seed/iphone14pro/400/400',
    description: 'Premium investment plan with guaranteed daily returns',
    investmentAmount: 15000,
    dailyRoi: 13.8889,
    duration: 30,
  },
  {
    name: 'iPhone 14',
    image: 'https://picsum.photos/seed/iphone14/400/400',
    description: 'Premium investment plan with guaranteed daily returns',
    investmentAmount: 30000,
    dailyRoi: 13.8889,
    duration: 30,
  },
  {
    name: 'iPhone 13 Pro',
    image: 'https://picsum.photos/seed/iphone13pro/400/400',
    description: 'Premium investment plan with guaranteed daily returns',
    investmentAmount: 50000,
    dailyRoi: 13.8889,
    duration: 30,
  },
  {
    name: 'iPhone 13',
    image: 'https://picsum.photos/seed/iphone13/400/400',
    description: 'Premium investment plan with guaranteed daily returns',
    investmentAmount: 80000,
    dailyRoi: 13.8889,
    duration: 30,
  },
  {
    name: 'iPhone SE',
    image: 'https://picsum.photos/seed/iphonese/400/400',
    description: 'Premium investment plan with guaranteed daily returns',
    investmentAmount: 100000,
    dailyRoi: 13.8889,
    duration: 30,
  },
  {
    name: 'iPhone 15 Pro Max',
    image: 'https://picsum.photos/seed/iphone15promax/400/400',
    description: 'Premium investment plan with guaranteed daily returns',
    investmentAmount: 500000,
    dailyRoi: 13.8889,
    duration: 30,
  },
  {
    name: 'iPhone 16 Pro Max',
    image: 'https://picsum.photos/seed/iphone16promax/400/400',
    description: 'Premium investment plan with guaranteed daily returns',
    investmentAmount: 1000000,
    dailyRoi: 13.8889,
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
