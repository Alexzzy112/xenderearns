import { useState, useEffect } from 'react';
import AdminLayout from '../../components/AdminLayout';
import { adminAPI } from '../../utils/api';
import { FiUsers, FiDollarSign, FiTrendingUp, FiArrowUpRight, FiPackage, FiCreditCard } from 'react-icons/fi';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [statsRes, investRes] = await Promise.all([
          adminAPI.getStats(),
          adminAPI.getInvestmentStats(),
        ]);
        setStats({ ...statsRes.data, investmentStats: investRes.data });
      } catch (err) {
        console.error('Failed to load admin stats');
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const checkAuth = () => {
    if (typeof window !== 'undefined' && !localStorage.getItem('adminToken')) {
      window.location.href = '/admin/login';
      return false;
    }
    return true;
  };

  if (!checkAuth()) return null;

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="py-8 px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">Admin Dashboard</h1>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900 rounded-full flex items-center justify-center">
                <FiUsers className="w-6 h-6 text-indigo-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Total Users</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats?.totalUsers || 0}</p>
              </div>
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
                <FiDollarSign className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Total Deposits</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">₦{(stats?.totalDeposits || 0).toLocaleString()}</p>
              </div>
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                <FiPackage className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Active Investments</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats?.activeInvestments || 0}</p>
              </div>
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-yellow-100 dark:bg-yellow-900 rounded-full flex items-center justify-center">
                <FiCreditCard className="w-6 h-6 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Pending Withdrawals</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats?.pendingWithdrawals || 0}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Investment Statistics</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-indigo-50 dark:bg-indigo-900/50 rounded-lg">
                <span className="text-gray-700 dark:text-gray-300">Total Invested</span>
                <span className="font-bold text-gray-900 dark:text-white">₦{(stats?.investmentStats?.totalInvested || 0).toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between p-4 bg-green-50 dark:bg-green-900/50 rounded-lg">
                <span className="text-gray-700 dark:text-gray-300">Total ROI Paid</span>
                <span className="font-bold text-green-600">₦{(stats?.investmentStats?.totalROIPaid || 0).toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between p-4 bg-blue-50 dark:bg-blue-900/50 rounded-lg">
                <span className="text-gray-700 dark:text-gray-300">Active Products</span>
                <span className="font-bold text-gray-900 dark:text-white">{stats?.investmentStats?.activeProducts || 0}</span>
              </div>
              <div className="flex items-center justify-between p-4 bg-yellow-50 dark:bg-yellow-900/50 rounded-lg">
                <span className="text-gray-700 dark:text-gray-300">Avg. Daily ROI</span>
                <span className="font-bold text-yellow-600">{stats?.investmentStats?.avgDailyROI || 0}%</span>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Quick Actions</h2>
            <div className="grid grid-cols-2 gap-4">
              <a href="/admin/users" className="p-4 bg-indigo-50 dark:bg-indigo-900/50 rounded-xl text-center hover:shadow-md transition-shadow">
                <FiUsers className="w-6 h-6 text-indigo-600 mx-auto mb-2" />
                <span className="text-sm font-medium text-gray-900 dark:text-white">Manage Users</span>
              </a>
              <a href="/admin/products" className="p-4 bg-green-50 dark:bg-green-900/50 rounded-xl text-center hover:shadow-md transition-shadow">
                <FiPackage className="w-6 h-6 text-green-600 mx-auto mb-2" />
                <span className="text-sm font-medium text-gray-900 dark:text-white">Products</span>
              </a>
              <a href="/admin/payments" className="p-4 bg-blue-50 dark:bg-blue-900/50 rounded-xl text-center hover:shadow-md transition-shadow">
                <FiDollarSign className="w-6 h-6 text-blue-600 mx-auto mb-2" />
                <span className="text-sm font-medium text-gray-900 dark:text-white">Payments</span>
              </a>
              <a href="/admin/withdrawals" className="p-4 bg-yellow-50 dark:bg-yellow-900/50 rounded-xl text-center hover:shadow-md transition-shadow">
                <FiTrendingUp className="w-6 h-6 text-yellow-600 mx-auto mb-2" />
                <span className="text-sm font-medium text-gray-900 dark:text-white">Withdrawals</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
