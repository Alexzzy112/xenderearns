import { useState, useEffect } from 'react';
import Link from 'next/link';
import Layout from '../components/Layout';
import ProtectedRoute from '../components/ProtectedRoute';
import StatsCard from '../components/StatsCard';
import { walletAPI } from '../utils/api';
import { FiDollarSign, FiTrendingUp, FiArrowUpRight, FiCopy } from 'react-icons/fi';
import { toast } from 'react-toastify';

export default function Wallet() {
  const [wallet, setWallet] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWallet = async () => {
      try {
        const [walletRes, txRes] = await Promise.all([
          walletAPI.getWallet(),
          walletAPI.getTransactions(),
        ]);
        setWallet(walletRes.data.wallet);
        setTransactions(txRes.data.transactions || []);
      } catch (err) {
        toast.error('Failed to load wallet');
      } finally {
        setLoading(false);
      }
    };
    fetchWallet();
  }, []);

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard');
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

  return (
    <ProtectedRoute>
      <Layout>
        <div className="py-8 px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">My Wallet</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">Manage your funds and view transactions</p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatsCard icon={<FiDollarSign className="w-6 h-6" />} label="Wallet Balance" value={`₦${(wallet?.balance || 0).toLocaleString()}`} color="indigo" />
            <StatsCard icon={<FiTrendingUp className="w-6 h-6" />} label="Total Earnings" value={`₦${(wallet?.totalEarnings || 0).toLocaleString()}`} color="green" />
            <StatsCard icon={<FiArrowUpRight className="w-6 h-6" />} label="Total Invested" value={`₦${(wallet?.totalInvested || 0).toLocaleString()}`} color="blue" />
            <StatsCard icon={<FiDollarSign className="w-6 h-6" />} label="Withdrawal Balance" value={`₦${(wallet?.withdrawalBalance || 0).toLocaleString()}`} color="yellow" />
          </div>

          {wallet?.virtualAccount && (
            <div className="card mb-8">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Your Virtual Account</h2>
              <div className="bg-indigo-50 dark:bg-indigo-900/50 rounded-xl p-6">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Bank Name</p>
                    <p className="text-lg font-bold text-gray-900 dark:text-white">{wallet.virtualAccount.bankName}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Account Number</p>
                    <div className="flex items-center gap-2">
                      <p className="text-lg font-bold text-gray-900 dark:text-white">{wallet.virtualAccount.accountNumber}</p>
                      <button onClick={() => copyToClipboard(wallet.virtualAccount.accountNumber)} className="text-indigo-600 hover:text-indigo-500">
                        <FiCopy className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Account Name</p>
                    <p className="text-lg font-bold text-gray-900 dark:text-white">{wallet.virtualAccount.accountName}</p>
                  </div>
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-4">Transfer any amount to this account and it will be automatically credited to your wallet.</p>
              </div>
            </div>
          )}

          <div className="flex gap-4 mb-8">
            <Link href="/deposit" className="btn-primary px-6 py-3">Fund Wallet</Link>
            <Link href="/withdraw" className="btn-secondary px-6 py-3">Withdraw</Link>
          </div>

          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Recent Transactions</h2>
              <Link href="/transactions" className="text-indigo-600 hover:text-indigo-500 text-sm font-medium">View All</Link>
            </div>
            {transactions.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="text-left text-sm text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-gray-700">
                      <th className="pb-3 font-medium">Date</th>
                      <th className="pb-3 font-medium">Description</th>
                      <th className="pb-3 font-medium">Type</th>
                      <th className="pb-3 font-medium text-right">Amount</th>
                      <th className="pb-3 font-medium text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {transactions.slice(0, 10).map((tx) => (
                      <tr key={tx._id} className="border-b border-gray-100 dark:border-gray-700">
                        <td className="py-3 text-sm text-gray-600 dark:text-gray-400">{new Date(tx.createdAt).toLocaleDateString()}</td>
                        <td className="py-3 text-sm font-medium text-gray-900 dark:text-white capitalize">{tx.description || tx.type}</td>
                        <td className="py-3">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${tx.type === 'credit' ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300' : 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300'}`}>
                            {tx.type}
                          </span>
                        </td>
                        <td className={`py-3 text-sm font-bold text-right ${tx.type === 'credit' ? 'text-green-600' : 'text-red-600'}`}>
                          {tx.type === 'credit' ? '+' : '-'}₦{(tx.amount || 0).toLocaleString()}
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
            ) : (
              <p className="text-gray-500 dark:text-gray-400 text-center py-8">No transactions yet</p>
            )}
          </div>
        </div>
      </Layout>
    </ProtectedRoute>
  );
}
