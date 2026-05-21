import { useState, useEffect } from 'react';
import AdminLayout from '../../components/AdminLayout';
import { adminAPI } from '../../utils/api';
import { toast } from 'react-toastify';
import { FiUsers, FiDollarSign, FiTrendingUp, FiArrowUpRight, FiPackage, FiCreditCard, FiCheck, FiX, FiSliders } from 'react-icons/fi';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [confirming, setConfirming] = useState(null);
  const [approvingWd, setApprovingWd] = useState(null);
  const [showLimitModal, setShowLimitModal] = useState(false);
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState('');
  const [limitValue, setLimitValue] = useState(0);

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

  const confirmPayment = async (transactionId) => {
    setConfirming(transactionId);
    try {
      await adminAPI.confirmDeposit(transactionId);
      toast.success('Payment confirmed');
      const statsRes = await adminAPI.getStats();
      setStats(prev => ({ ...prev, ...statsRes.data }));
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to confirm');
    } finally {
      setConfirming(null);
    }
  };

  const approveWithdrawal = async (id) => {
    setApprovingWd(id);
    try {
      await adminAPI.approveWithdrawal(id);
      toast.success('Withdrawal approved');
      const statsRes = await adminAPI.getStats();
      setStats(prev => ({ ...prev, ...statsRes.data }));
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to approve');
    } finally {
      setApprovingWd(null);
    }
  };

  const openLimitModal = async () => {
    try {
      const res = await adminAPI.getUsers({ page: 1, limit: 200 });
      setUsers(res.data.users || []);
    } catch (err) {
      toast.error('Failed to load users');
    }
    setSelectedUser('');
    setLimitValue(0);
    setShowLimitModal(true);
  };

  const handleSetLimit = async () => {
    if (!selectedUser) return toast.error('Select a user');
    try {
      await adminAPI.setPurchaseLimit(selectedUser, limitValue);
      toast.success('Purchase limit updated');
      setShowLimitModal(false);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update limit');
    }
  };

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
              <button onClick={openLimitModal} className="p-4 bg-purple-50 dark:bg-purple-900/50 rounded-xl text-center hover:shadow-md transition-shadow">
                <FiSliders className="w-6 h-6 text-purple-600 mx-auto mb-2" />
                <span className="text-sm font-medium text-gray-900 dark:text-white">Purchase Limit</span>
              </button>
            </div>
          </div>
        </div>

        {stats?.recentPayments?.length > 0 && (
          <div className="mt-8 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Pending Payments ({stats.pendingPayments})</h2>
              <a href="/admin/payments" className="text-sm text-indigo-600 hover:text-indigo-500 font-medium">View All</a>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-left text-sm text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-gray-700">
                    <th className="pb-3 font-medium">User</th>
                    <th className="pb-3 font-medium">Amount</th>
                    <th className="pb-3 font-medium">Reference</th>
                    <th className="pb-3 font-medium">Date</th>
                    <th className="pb-3 font-medium text-right">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.recentPayments.map((p) => (
                    <tr key={p._id} className="border-b border-gray-100 dark:border-gray-700">
                      <td className="py-3 text-sm text-gray-900 dark:text-white">{p.user?.firstName || p.user?.name} {p.user?.lastName || ''}</td>
                      <td className="py-3 text-sm font-bold text-gray-900 dark:text-white">₦{(p.amount || 0).toLocaleString()}</td>
                      <td className="py-3 text-sm text-gray-500 dark:text-gray-400 font-mono">{p.reference ? p.reference.slice(0, 16) + '...' : '-'}</td>
                      <td className="py-3 text-sm text-gray-500 dark:text-gray-400">{new Date(p.createdAt).toLocaleDateString()}</td>
                      <td className="py-3 text-right">
                        <button
                          onClick={() => confirmPayment(p._id)}
                          disabled={confirming === p._id}
                          className="px-3 py-1.5 text-xs font-medium bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
                        >
                          {confirming === p._id ? '...' : <><FiCheck className="w-3.5 h-3.5 inline mr-1" />Confirm</>}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
        {stats?.recentWithdrawals?.length > 0 && (
          <div className="mt-8 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Pending Withdrawals ({stats.pendingWithdrawals})</h2>
              <a href="/admin/withdrawals" className="text-sm text-indigo-600 hover:text-indigo-500 font-medium">View All</a>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-left text-sm text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-gray-700">
                    <th className="pb-3 font-medium">User</th>
                    <th className="pb-3 font-medium">Amount</th>
                    <th className="pb-3 font-medium">Bank</th>
                    <th className="pb-3 font-medium">Date</th>
                    <th className="pb-3 font-medium text-right">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.recentWithdrawals.map((w) => (
                    <tr key={w._id} className="border-b border-gray-100 dark:border-gray-700">
                      <td className="py-3 text-sm text-gray-900 dark:text-white">{w.user?.firstName || w.user?.name} {w.user?.lastName || ''}</td>
                      <td className="py-3 text-sm font-bold text-gray-900 dark:text-white">₦{(w.amount || 0).toLocaleString()}</td>
                      <td className="py-3 text-sm text-gray-500 dark:text-gray-400">{w.bankName || '-'}</td>
                      <td className="py-3 text-sm text-gray-500 dark:text-gray-400">{new Date(w.createdAt).toLocaleDateString()}</td>
                      <td className="py-3 text-right">
                        <button
                          onClick={() => approveWithdrawal(w._id)}
                          disabled={approvingWd === w._id}
                          className="px-3 py-1.5 text-xs font-medium bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
                        >
                          {approvingWd === w._id ? '...' : <><FiCheck className="w-3.5 h-3.5 inline mr-1" />Approve</>}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {showLimitModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowLimitModal(false)}>
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-md w-full p-6" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Set Purchase Limit</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">User</label>
                <select className="input-field" value={selectedUser} onChange={e => setSelectedUser(e.target.value)}>
                  <option value="">Select a user</option>
                  {users.map(u => (
                    <option key={u._id} value={u._id}>{u.name} ({u.email})</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Max Active Investments</label>
                <input type="number" className="input-field" min="0" value={limitValue} onChange={e => setLimitValue(Number(e.target.value))} placeholder="0 = unlimited" />
                <p className="text-xs text-gray-500 mt-1">Set to 0 for no limit</p>
              </div>
              <div className="flex gap-3 pt-2">
                <button onClick={() => setShowLimitModal(false)} className="flex-1 py-2.5 px-4 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                  Cancel
                </button>
                <button onClick={handleSetLimit} className="flex-1 py-2.5 px-4 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">
                  Save
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
