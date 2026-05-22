const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dns = require('dns');

dns.setServers(['8.8.8.8', '1.1.1.1']);

const app = express();

let cached = global._mongoCache;
if (!cached) cached = global._mongoCache = { conn: null, promise: null };

const connectDB = async () => {
  if (cached.conn) return cached.conn;
  if (!cached.promise) {
    cached.promise = mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 9000,
      connectTimeoutMS: 9000,
    }).then(m => m);
  }
  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    throw e;
  }
  return cached.conn;
};

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/api/health', async (req, res) => {
  const uri = process.env.MONGODB_URI || '';
  let mongo = 'disconnected';
  let dbError = null;

  try {
    await connectDB();
    mongo = mongoose.connection.readyState === 1 ? 'connected' : 'connecting';
  } catch (e) {
    dbError = e.message;
    console.error('Health DB error:', e.message);
  }

  const payload = {
    status: 'ok',
    env: process.env.ENV || 'not set',
    mongo,
    mongoUriPrefix: uri.substring(0, 30) + '...'
  };
  if (dbError) payload.dbError = dbError;

  res.json(payload);
});

app.use(async (req, res, next) => {
  try {
    await connectDB();
  } catch (e) {
    console.error('DB connect error:', e.message);
    const isProd = process.env.ENV === 'PRODUCTION';
    return res.status(500).json({ 
      message: isProd ? 'Database connection failed' : 'Database connection failed: ' + e.message 
    });
  }
  req.io = { to: () => ({ emit: () => {} }) };
  next();
});

app.use('/api/auth', require('../backend/routes/authRoutes'));
app.use('/api/products', require('../backend/routes/productRoutes'));
app.use('/api/payments', require('../backend/routes/paymentRoutes'));
app.use('/api/wallet', require('../backend/routes/walletRoutes'));
app.use('/api/withdrawals', require('../backend/routes/withdrawalRoutes'));
app.use('/api/earnings', require('../backend/routes/earningRoutes'));
app.use('/api/admin', require('../backend/routes/adminRoutes'));
app.use('/api/users', require('../backend/routes/userRoutes'));

app.use((err, req, res, next) => {
  console.error('Unhandled error:', err?.message || err);
  res.status(500).json({ message: err?.message || 'Internal server error' });
});

module.exports = app;
