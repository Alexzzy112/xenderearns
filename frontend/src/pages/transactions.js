import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import ProtectedRoute from '../components/ProtectedRoute';
import { walletAPI } from '../utils/api';
import { FiFilter } from 'react-icons/fi';
import { toast } from 'react-toastify';

export default function Transactions() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    const fetchTx = async () => {
      setLoading(true);
      try {
        const params = { page, limit: 20 };
        if (filter !== 'all') params.type = filter;
        const res = await walletAPI.getTransactions(params);
        setTransactions(res.data.transactions || []);
        setTotalPages(res.data.totalPages || 1);
      } catch (err) {
        toast.error('Failed to load transactions');
      } finally {
        setLoading(false);
      }
    };
    fetchTx();
  }, [filter, page]);

  return (
    <ProtectedRoute>
      <Layout>
        <div className="py-8 px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Transaction History</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">View all your financial activities</p>
          </div>

          <div className="card">
            <div className="flex items-center gap-2 mb-6">
              <FiFilter className="w-5 h-5 text-gray-500" />
                  {['all', 'deposit', 'withdrawal', 'earning'].map((f) => (
                <button key={f} onClick={() => { setFilter(f); setPage(1); }} className={`px-4 py-2 rounded-lg text-sm font-medium capitalize ${filter === f ? 'bg-indigo-600 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'}`}>
                  {f}
                </button>
              ))}
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
              </div>
            ) : transactions.length > 0 ? (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="text-left text-sm text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-gray-700">
                        <th className="pb-3 font-medium">Date</th>
                        <th className="pb-3 font-medium">Description</th>
                        <th className="pb-3 font-medium">Reference</th>
                        <th className="pb-3 font-medium">Type</th>
                        <th className="pb-3 font-medium text-right">Amount</th>
                        <th className="pb-3 font-medium text-right">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {transactions.map((tx) => (
                        <tr key={tx._id} className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                          <td className="py-3 text-sm text-gray-600 dark:text-gray-400">{new Date(tx.createdAt).toLocaleDateString()}</td>
                          <td className="py-3 text-sm font-medium text-gray-900 dark:text-white capitalize">{tx.description || tx.type}</td>
                          <td className="py-3 text-sm text-gray-500 dark:text-gray-400">{tx.reference || '-'}</td>
                          <td className="py-3">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${['deposit', 'earning', 'referral_bonus', 'investment_return'].includes(tx.type) ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300' : 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300'}`}>
                              {tx.type}
                            </span>
                          </td>
                          <td className={`py-3 text-sm font-bold text-right ${['deposit', 'earning', 'referral_bonus', 'investment_return'].includes(tx.type) ? 'text-green-600' : 'text-red-600'}`}>
                            {['deposit', 'earning', 'referral_bonus', 'investment_return'].includes(tx.type) ? '+' : '-'}₦{(tx.amount || 0).toLocaleString()}
                          </td>
                          <td className="py-3 text-right">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${tx.status === 'completed' || tx.status === 'successful' ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300' : tx.status === 'pending' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300' : 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300'}`}>
                              {tx.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {totalPages > 1 && (
                  <div className="flex items-center justify-center gap-2 mt-6">
                    <button disabled={page === 1} onClick={() => setPage(p => p - 1)} className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-sm disabled:opacity-50">Previous</button>
                    <span className="text-sm text-gray-600 dark:text-gray-400">Page {page} of {totalPages}</span>
                    <button disabled={page === totalPages} onClick={() => setPage(p => p + 1)} className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-sm disabled:opacity-50">Next</button>
                  </div>
                )}
              </>
            ) : (
              <p className="text-gray-500 dark:text-gray-400 text-center py-12">No transactions found</p>
            )}
          </div>
        </div>
      </Layout>
    </ProtectedRoute>
  );
}
