import { useState, useEffect } from 'react';
import AdminLayout from '../../components/AdminLayout';
import { adminAPI } from '../../utils/api';
import { toast } from 'react-toastify';
import { FiSearch, FiToggleLeft, FiToggleRight, FiTrash2, FiEye, FiXCircle } from 'react-icons/fi';

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [showInvestModal, setShowInvestModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [investments, setInvestments] = useState([]);
  const [loadingInvest, setLoadingInvest] = useState(false);
  const [cancellingId, setCancellingId] = useState(null);

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      try {
        const res = await adminAPI.getUsers({ page, search, limit: 20 });
        setUsers(res.data.users || []);
      } catch (err) {
        toast.error('Failed to load users');
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, [page, search]);

  const toggleStatus = async (userId, currentStatus) => {
    try {
      await adminAPI.toggleUserStatus(userId);
      setUsers(users.map(u => u._id === userId ? { ...u, status: currentStatus === 'active' ? 'suspended' : 'active' } : u));
      toast.success(`User ${currentStatus === 'active' ? 'suspended' : 'activated'}`);
    } catch (err) {
      toast.error('Failed to update user');
    }
  };

  const deleteUser = async (userId) => {
    if (!confirm('Are you sure you want to permanently delete this user and all their data?')) return;
    try {
      await adminAPI.deleteUser(userId);
      toast.success('User deleted');
      setUsers(users.filter(u => u._id !== userId));
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete user');
    }
  };

  const openInvestModal = async (user) => {
    setSelectedUser(user);
    setLoadingInvest(true);
    setShowInvestModal(true);
    try {
      const res = await adminAPI.getUserInvestments(user._id);
      setInvestments(res.data.investments || []);
    } catch (err) {
      toast.error('Failed to load investments');
    } finally {
      setLoadingInvest(false);
    }
  };

  const cancelInvestment = async (investmentId) => {
    if (!confirm('Cancel this investment and refund the user?')) return;
    setCancellingId(investmentId);
    try {
      await adminAPI.cancelInvestment(investmentId);
      toast.success('Investment cancelled and refunded');
      setInvestments(investments.map(inv => inv._id === investmentId ? { ...inv, status: 'cancelled' } : inv));
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to cancel');
    } finally {
      setCancellingId(null);
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

  return (
    <AdminLayout>
      <div className="py-8 px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Manage Users</h1>
          <div className="relative">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input type="text" className="input-field pl-10" placeholder="Search users..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
            </div>
          ) : users.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-left text-sm text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50">
                    <th className="p-4 font-medium">Name</th>
                    <th className="p-4 font-medium">Email</th>
                    <th className="p-4 font-medium">Phone</th>
                    <th className="p-4 font-medium">Products</th>
                    <th className="p-4 font-medium">Invested</th>
                    <th className="p-4 font-medium">Earnings</th>
                    <th className="p-4 font-medium">Status</th>
                    <th className="p-4 font-medium text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => (
                    <tr key={u._id} className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                      <td className="p-4 text-sm font-medium text-gray-900 dark:text-white">{u.name}</td>
                      <td className="p-4 text-sm text-gray-600 dark:text-gray-400">{u.email}</td>
                      <td className="p-4 text-sm text-gray-600 dark:text-gray-400">{u.phone || '-'}</td>
                      <td className="p-4 text-sm">
                        <span className="font-bold text-gray-900 dark:text-white">{u.totalPurchased || 0}</span>
                        {u.activePurchased > 0 && <span className="text-xs text-green-600 ml-1">({u.activePurchased} active)</span>}
                      </td>
                      <td className="p-4 text-sm font-bold text-gray-900 dark:text-white">₦{(u.totalInvested || 0).toLocaleString()}</td>
                      <td className="p-4 text-sm font-bold text-green-600">₦{(u.totalEarnings || 0).toLocaleString()}</td>
                      <td className="p-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${u.status === 'active' ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300' : 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300'}`}>
                          {u.status}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button onClick={() => openInvestModal(u)} className="p-2 text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/50 rounded-lg" title="Manage Investments">
                            <FiEye className="w-5 h-5" />
                          </button>
                          <button onClick={() => toggleStatus(u._id, u.status)} className={`p-2 rounded-lg ${u.status === 'active' ? 'text-red-600 hover:bg-red-50 dark:hover:bg-red-900/50' : 'text-green-600 hover:bg-green-50 dark:hover:bg-green-900/50'}`} title={u.status === 'active' ? 'Suspend' : 'Activate'}>
                            {u.status === 'active' ? <FiToggleRight className="w-5 h-5" /> : <FiToggleLeft className="w-5 h-5" />}
                          </button>
                          <button onClick={() => deleteUser(u._id)} className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/50 rounded-lg" title="Delete User">
                            <FiTrash2 className="w-5 h-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-center py-12 text-gray-500 dark:text-gray-400">No users found</p>
          )}
        </div>
      </div>

      {showInvestModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowInvestModal(false)}>
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-2xl w-full max-h-[80vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                Investments - {selectedUser?.name}
              </h3>
              <button onClick={() => setShowInvestModal(false)} className="text-gray-400 hover:text-gray-600 text-xl">&times;</button>
            </div>
            <div className="p-6">
              {loadingInvest ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                </div>
              ) : investments.length > 0 ? (
                <div className="space-y-3">
                  {investments.map(inv => (
                    <div key={inv._id} className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-xl">
                      <div>
                        <p className="font-bold text-gray-900 dark:text-white">{inv.product?.name || 'N/A'}</p>
                        <p className="text-sm text-gray-500">₦{(inv.amount || 0).toLocaleString()} invested</p>
                        <p className="text-xs text-gray-400">{new Date(inv.createdAt).toLocaleDateString()}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${inv.status === 'active' ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300' : inv.status === 'completed' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300' : 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300'}`}>
                          {inv.status}
                        </span>
                        {inv.status === 'active' && (
                          <button
                            onClick={() => cancelInvestment(inv._id)}
                            disabled={cancellingId === inv._id}
                            className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/50 rounded-lg disabled:opacity-50"
                            title="Cancel Investment"
                          >
                            {cancellingId === inv._id ? <span className="animate-spin inline-block w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full"></span> : <FiXCircle className="w-5 h-5" />}
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center py-12 text-gray-500 dark:text-gray-400">No investments found for this user</p>
              )}
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
