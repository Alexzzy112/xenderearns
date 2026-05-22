import { useState, useEffect } from 'react';
import Link from 'next/link';
import Layout from '../components/Layout';
import ProtectedRoute from '../components/ProtectedRoute';
import StatsCard from '../components/StatsCard';
import { userAPI, earningAPI, productAPI } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { FiDollarSign, FiTrendingUp, FiBriefcase, FiArrowUpRight, FiClock, FiCopy, FiShare2, FiSend, FiMessageCircle } from 'react-icons/fi';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { toast } from 'react-toastify';

export default function Dashboard() {
  const { user } = useAuth();
  const [dashboard, setDashboard] = useState(null);
  const [earnings, setEarnings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState(null);

  const fetchData = async () => {
    try {
      const [dashRes, earnRes] = await Promise.all([
        userAPI.getDashboard(),
        earningAPI.getEarnings(),
      ]);
      setDashboard(dashRes.data);
      setEarnings(earnRes.data.earnings || []);
    } catch (err) {
      console.error('Failed to load dashboard', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handlePurchase = async (productId) => {
    setPurchasing(productId);
    try {
      await productAPI.purchase(productId);
      toast.success('Investment successful!');
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Purchase failed');
    } finally {
      setPurchasing(null);
    }
  };

  if (loading) {
    return (
      <ProtectedRoute>
        <Layout>
          <div className="flex items-center justify-center min-h-screen">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          </div>
        </Layout>
      </ProtectedRoute>
    );
  }

  const chartData = earnings.slice(-7).map(e => ({
    date: new Date(e.createdAt).toLocaleDateString(),
    amount: e.amount,
  }));

  return (
    <ProtectedRoute>
      <Layout>
        <div className="py-8 px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Welcome back, {user?.name}!</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">Here's your investment overview</p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatsCard icon={<FiDollarSign className="w-6 h-6" />} label="Wallet Balance" value={`₦${(dashboard?.wallet?.balance || 0).toLocaleString()}`} color="indigo" />
            <StatsCard icon={<FiBriefcase className="w-6 h-6" />} label="Total Invested" value={`₦${(dashboard?.wallet?.totalInvested || 0).toLocaleString()}`} color="blue" />
            <StatsCard icon={<FiTrendingUp className="w-6 h-6" />} label="Total Earnings" value={`₦${(dashboard?.wallet?.totalEarnings || 0).toLocaleString()}`} color="green" />
            <StatsCard icon={<FiArrowUpRight className="w-6 h-6" />} label="Active Investments" value={dashboard?.activeInvestments || 0} color="yellow" />
          </div>

          {user?.referralCode && (
            <div className="mb-8 p-4 bg-indigo-50 dark:bg-indigo-900/30 rounded-xl border border-indigo-200 dark:border-indigo-800">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Your Referral Code</p>
                  <p className="text-2xl font-bold text-indigo-600 dark:text-indigo-400 mt-1 tracking-wider">{user.referralCode}</p>
                  <p className="text-xs text-gray-500 mt-1">Share your link and earn 35% commission on their purchases</p>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => { navigator.clipboard.writeText(user.referralCode); toast.success('Referral code copied'); }} className="p-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors" title="Copy referral code">
                    <FiCopy className="w-5 h-5" />
                  </button>
                  <button onClick={() => { if (typeof window !== 'undefined') { const link = `${window.location.origin}/register?ref=${user.referralCode}`; navigator.clipboard.writeText(link); toast.success('Referral link copied'); } }} className="p-3 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors" title="Copy referral link">
                    <FiShare2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
              <div className="mt-3 pt-3 border-t border-indigo-200 dark:border-indigo-700 flex gap-3">
                <a href="https://t.me/xenderinvest" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white text-sm rounded-xl hover:bg-blue-600 transition-colors">
                  <FiSend className="w-4 h-4" /> Telegram Channel
                </a>
                <a href="https://t.me/xenderCEO" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-4 py-2 bg-sky-500 text-white text-sm rounded-xl hover:bg-sky-600 transition-colors">
                  <FiMessageCircle className="w-4 h-4" /> Admin Chat
                </a>
              </div>
            </div>
          )}

          <div className="grid lg:grid-cols-2 gap-8 mb-8">
            <div className="card">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Earnings Chart (7 days)</h2>
              {chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-700" />
                    <XAxis dataKey="date" className="text-xs" />
                    <YAxis className="text-xs" />
                    <Tooltip />
                    <Line type="monotone" dataKey="amount" stroke="#6366f1" strokeWidth={2} dot={{ fill: '#6366f1' }} />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-gray-500 dark:text-gray-400 text-center py-12">No earnings data yet</p>
              )}
            </div>

            <div className="card">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Recent Transactions</h2>
              {dashboard?.recentTransactions?.length > 0 ? (
                <div className="space-y-3">
                  {dashboard.recentTransactions.map((tx) => (
                    <div key={tx._id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${tx.type === 'credit' ? 'bg-green-100 dark:bg-green-900' : 'bg-red-100 dark:bg-red-900'}`}>
                          <FiDollarSign className={`w-5 h-5 ${tx.type === 'credit' ? 'text-green-600' : 'text-red-600'}`} />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white capitalize">{tx.description || tx.type}</p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">{new Date(tx.createdAt).toLocaleDateString()}</p>
                        </div>
                      </div>
                      <span className={`font-bold ${tx.type === 'credit' ? 'text-green-600' : 'text-red-600'}`}>
                        {tx.type === 'credit' ? '+' : '-'}₦{(tx.amount || 0).toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 dark:text-gray-400 text-center py-12">No transactions yet</p>
              )}
              <Link href="/transactions" className="block text-center mt-4 text-indigo-600 hover:text-indigo-500 font-medium">
                View All Transactions
              </Link>
            </div>
          </div>

          <div className="card">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Active Investments</h2>
            {dashboard?.activeInvestments?.length > 0 ? (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {dashboard.activeInvestments.map((inv) => (
                  <div key={inv._id} className="border border-gray-200 dark:border-gray-700 rounded-xl p-4">
                    <h3 className="font-bold text-gray-900 dark:text-white">{inv.product?.name}</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Invested: ₦{(inv.amount || 0).toLocaleString()}</p>
                    <div className="flex items-center gap-2 mt-2 text-sm text-green-600">
                      <FiTrendingUp className="w-4 h-4" />
                      <span>₦{(inv.dailyEarning || 0).toLocaleString()}/day</span>
                    </div>
                    <div className="flex items-center gap-2 mt-1 text-sm text-gray-500">
                      <FiClock className="w-4 h-4" />
                      <span>{(inv.remainingDays || 0)} days left</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-500 dark:text-gray-400 mb-4">You have no active investments</p>
                <Link href="/products" className="btn-primary inline-block px-6 py-3">Browse Investment Products</Link>
              </div>
            )}
          </div>

          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Available Investment Plans</h2>
              <Link href="/products" className="text-sm text-indigo-600 hover:text-indigo-500 font-medium">View All</Link>
            </div>
            {dashboard?.products?.length > 0 ? (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {dashboard.products.slice(0, 6).map((product) => {
                  const dailyEarning = product.investmentAmount * (product.dailyRoi / 100);
                  return (
                    <div key={product._id} className="border border-gray-200 dark:border-gray-700 rounded-xl p-4 hover:shadow-md transition-shadow">
                      <h3 className="font-bold text-gray-900 dark:text-white">{product.name}</h3>
                      <div className="mt-2 p-3 bg-indigo-50 dark:bg-indigo-900/30 rounded-lg">
                        <p className="text-xs text-gray-500">Investment</p>
                        <p className="text-lg font-bold">₦{product.investmentAmount.toLocaleString()}</p>
                      </div>
                      <div className="mt-2 p-3 bg-green-50 dark:bg-green-900/30 rounded-lg">
                        <p className="text-xs text-gray-500">Daily Earnings</p>
                        <p className="text-lg font-bold text-green-600">₦{Math.round(dailyEarning).toLocaleString()}<span className="text-xs font-normal text-gray-500">/day</span></p>
                      </div>
                      <button
                        onClick={() => handlePurchase(product._id)}
                        disabled={purchasing === product._id}
                        className="w-full mt-3 py-2 rounded-lg text-sm font-medium bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50 transition-colors"
                      >
                        {purchasing === product._id ? 'Processing...' : 'Invest Now'}
                      </button>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-gray-500 dark:text-gray-400 text-center py-8">No investment plans available</p>
            )}
          </div>

        </div>
      </Layout>
    </ProtectedRoute>
  );
}
