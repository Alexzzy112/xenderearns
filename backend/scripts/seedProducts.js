const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const InvestmentProduct = require('../models/InvestmentProduct');

const products = [
  {
    name: 'iPhone 15 Pro',
    image: 'https://fdn2.gsmarena.com/vv/bigpic/apple-iphone-15-pro.jpg',
    description: 'Premium investment plan with guaranteed daily returns',
    investmentAmount: 3600,
    dailyRoi: 13.8889,
    duration: 30,
  },
  {
    name: 'iPhone 15',
    image: 'https://fdn2.gsmarena.com/vv/bigpic/apple-iphone-15.jpg',
    description: 'Premium investment plan with guaranteed daily returns',
    investmentAmount: 10000,
    dailyRoi: 15,
    duration: 30,
  },
  {
    name: 'iPhone 14 Pro',
    image: 'https://fdn2.gsmarena.com/vv/bigpic/apple-iphone-14-pro.jpg',
    description: 'Premium investment plan with guaranteed daily returns',
    investmentAmount: 15000,
    dailyRoi: 13.8889,
    duration: 30,
  },
  {
    name: 'iPhone 14',
    image: 'https://fdn2.gsmarena.com/vv/bigpic/apple-iphone-14.jpg',
    description: 'Premium investment plan with guaranteed daily returns',
    investmentAmount: 30000,
    dailyRoi: 13.8889,
    duration: 30,
  },
  {
    name: 'iPhone 13 Pro',
    image: 'https://fdn2.gsmarena.com/vv/bigpic/apple-iphone-13-pro.jpg',
    description: 'Premium investment plan with guaranteed daily returns',
    investmentAmount: 50000,
    dailyRoi: 13.8889,
    duration: 30,
  },
  {
    name: 'iPhone 13',
    image: 'https://fdn2.gsmarena.com/vv/bigpic/apple-iphone-13.jpg',
    description: 'Premium investment plan with guaranteed daily returns',
    investmentAmount: 80000,
    dailyRoi: 13.8889,
    duration: 30,
  },
  {
    name: 'iPhone SE',
    image: 'https://fdn2.gsmarena.com/vv/bigpic/apple-iphone-se-2022.jpg',
    description: 'Premium investment plan with guaranteed daily returns',
    investmentAmount: 100000,
    dailyRoi: 13.8889,
    duration: 30,
  },
  {
    name: 'iPhone 15 Pro Max',
    image: 'https://fdn2.gsmarena.com/vv/bigpic/apple-iphone-15-pro-max.jpg',
    description: 'Premium investment plan with guaranteed daily returns',
    investmentAmount: 500000,
    dailyRoi: 13.8889,
    duration: 30,
  },
  {
    name: 'iPhone 16 Pro Max',
    image: 'https://fdn2.gsmarena.com/vv/bigpic/apple-iphone-16-pro-max.jpg',
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
