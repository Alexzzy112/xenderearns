const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const InvestmentProduct = require('../models/InvestmentProduct');

const imageMap = {
  'iPhone 15 Pro': 'https://fdn2.gsmarena.com/vv/bigpic/apple-iphone-15-pro.jpg',
  'iPhone 15': 'https://fdn2.gsmarena.com/vv/bigpic/apple-iphone-15.jpg',
  'iPhone 14 Pro': 'https://fdn2.gsmarena.com/vv/bigpic/apple-iphone-14-pro.jpg',
  'iPhone 14': 'https://fdn2.gsmarena.com/vv/bigpic/apple-iphone-14.jpg',
  'iPhone 13 Pro': 'https://fdn2.gsmarena.com/vv/bigpic/apple-iphone-13-pro.jpg',
  'iPhone 13': 'https://fdn2.gsmarena.com/vv/bigpic/apple-iphone-13.jpg',
  'iPhone SE': 'https://fdn2.gsmarena.com/vv/bigpic/apple-iphone-se-2022.jpg',
  'iPhone 15 Pro Max': 'https://fdn2.gsmarena.com/vv/bigpic/apple-iphone-15-pro-max.jpg',
  'iPhone 16 Pro Max': 'https://fdn2.gsmarena.com/vv/bigpic/apple-iphone-16-pro-max.jpg',
};

async function updateImages() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB connected');

    let updated = 0;
    for (const [name, image] of Object.entries(imageMap)) {
      const result = await InvestmentProduct.updateOne({ name }, { $set: { image } });
      if (result.modifiedCount > 0) {
        console.log(`  Updated: ${name}`);
        updated++;
      } else {
        const existing = await InvestmentProduct.findOne({ name });
        if (!existing) {
          console.log(`  Not found: ${name}`);
        } else {
          console.log(`  Already up-to-date: ${name}`);
        }
      }
    }

    console.log(`\nDone. ${updated} products updated.`);
    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('Migration error:', error);
    process.exit(1);
  }
}

updateImages();
