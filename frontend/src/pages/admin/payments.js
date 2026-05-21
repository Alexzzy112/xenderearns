import { useState, useEffect } from 'react';
import AdminLayout from '../../components/AdminLayout';
import { adminAPI } from '../../utils/api';
import { toast } from 'react-toastify';
import { FiDollarSign } from 'react-icons/fi';

export default function AdminPayments() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    const fetchPayments = async () => {
      setLoading(true);
      try {
        const res = await adminAPI.getPayments({ status: filter !== 'all' ? filter : undefined });
        setPayments(res.data.payments || []);
      } catch (err) {
        toast.error('Failed to load payments');
      } finally {
        setLoading(false);
      }
    };
    fetchPayments();
  }, [filter]);

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
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Payments</h1>
          <div className="flex gap-2">
            {['all', 'pending', 'completed', 'failed'].map((f) => (
              <button key={f} onClick={() => setFilter(f)} className={`px-3 py-1.5 rounded-lg text-sm font-medium capitalize ${filter === f ? 'bg-indigo-600 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'}`}>
                {f}
              </button>
            ))}
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div></div>
          ) : payments.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-left text-sm text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50">
                    <th className="p-4 font-medium">Date</th>
                    <th className="p-4 font-medium">User</th>
                    <th className="p-4 font-medium">Email</th>
                    <th className="p-4 font-medium">Amount</th>
                    <th className="p-4 font-medium">Reference</th>
                    <th className="p-4 font-medium text-right">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {payments.map((p) => (
                    <tr key={p._id} className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                      <td className="p-4 text-sm text-gray-600 dark:text-gray-400">{new Date(p.createdAt).toLocaleDateString()}</td>
                      <td className="p-4 text-sm font-medium text-gray-900 dark:text-white">{p.user?.firstName || p.user?.name || 'N/A'} {p.user?.lastName || ''}</td>
                      <td className="p-4 text-sm text-gray-600 dark:text-gray-400">{p.user?.email || 'N/A'}</td>
                      <td className="p-4 text-sm font-bold text-gray-900 dark:text-white">₦{(p.amount || 0).toLocaleString()}</td>
                      <td className="p-4 text-sm text-gray-500 dark:text-gray-400 font-mono">{p.reference || '-'}</td>
                      <td className="p-4 text-right">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${p.status === 'completed' || p.status === 'successful' ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300' : p.status === 'pending' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300' : 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300'}`}>
                          {p.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500 dark:text-gray-400">
              <FiDollarSign className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>No payments found</p>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
