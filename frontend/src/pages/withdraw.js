import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Layout from '../components/Layout';
import ProtectedRoute from '../components/ProtectedRoute';
import { withdrawalAPI, walletAPI, userAPI } from '../utils/api';
import { toast } from 'react-toastify';
import { FiPlus, FiTrash2 } from 'react-icons/fi';

export default function Withdraw() {
  const [wallet, setWallet] = useState(null);
  const [bankAccounts, setBankAccounts] = useState([]);
  const [withdrawals, setWithdrawals] = useState([]);
  const [form, setForm] = useState({ amount: '', bankAccount: '', password: '' });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showAddBank, setShowAddBank] = useState(false);
  const [bankForm, setBankForm] = useState({ bankName: '', accountNumber: '', accountName: '' });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [walletRes, bankRes, wdRes] = await Promise.all([
          walletAPI.getWallet(),
          userAPI.getBankAccounts(),
          withdrawalAPI.getUserWithdrawals(),
        ]);
        setWallet(walletRes.data.wallet);
        setBankAccounts(bankRes.data.accounts || []);
        setWithdrawals(wdRes.data.withdrawals || []);
      } catch (err) {
        toast.error('Failed to load data');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleAddBank = async (e) => {
    e.preventDefault();
    try {
      const res = await userAPI.addBankAccount(bankForm);
      setBankAccounts([...bankAccounts, res.data.account]);
      setShowAddBank(false);
      setBankForm({ bankName: '', accountNumber: '', accountName: '' });
      toast.success('Bank account added');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add bank account');
    }
  };

  const handleWithdraw = async (e) => {
    e.preventDefault();
    if (!form.amount || Number(form.amount) < 100) {
      toast.error('Minimum withdrawal is ₦100');
      return;
    }
    if (Number(form.amount) > (wallet?.withdrawalBalance || 0)) {
      toast.error('Insufficient withdrawal balance');
      return;
    }
    if (!form.bankAccount) {
      toast.error('Please select a bank account');
      return;
    }
    setSubmitting(true);
    try {
      await withdrawalAPI.request({
        amount: Number(form.amount),
        bankAccount: form.bankAccount,
        password: form.password,
      });
      toast.success('Withdrawal request submitted successfully');
      setForm({ amount: '', bankAccount: '', password: '' });
      const wdRes = await withdrawalAPI.getUserWithdrawals();
      setWithdrawals(wdRes.data.withdrawals || []);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Withdrawal failed');
    } finally {
      setSubmitting(false);
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

  return (
    <ProtectedRoute>
      <Layout>
        <div className="py-8 px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Withdraw Funds</h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">Withdrawable Balance: <span className="font-bold text-green-600">₦{(wallet?.withdrawalBalance || 0).toLocaleString()}</span></p>
            </div>

            <div className="card mb-8">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Bank Accounts</h2>
                <button onClick={() => setShowAddBank(!showAddBank)} className="text-indigo-600 hover:text-indigo-500 flex items-center gap-1 text-sm font-medium">
                  <FiPlus className="w-4 h-4" /> Add Bank
                </button>
              </div>

              {showAddBank && (
                <form onSubmit={handleAddBank} className="mb-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-xl">
                  <div className="grid sm:grid-cols-3 gap-3 mb-3">
                    <input type="text" className="input-field" placeholder="Bank Name" value={bankForm.bankName} onChange={(e) => setBankForm({ ...bankForm, bankName: e.target.value })} required />
                    <input type="text" className="input-field" placeholder="Account Number" value={bankForm.accountNumber} onChange={(e) => setBankForm({ ...bankForm, accountNumber: e.target.value })} required />
                    <input type="text" className="input-field" placeholder="Account Name" value={bankForm.accountName} onChange={(e) => setBankForm({ ...bankForm, accountName: e.target.value })} required />
                  </div>
                  <button type="submit" className="btn-primary py-2 px-4">Save Account</button>
                </form>
              )}

              {bankAccounts.length > 0 ? (
                <div className="space-y-2">
                  {bankAccounts.map((acc) => (
                    <label key={acc._id} className={`flex items-center p-3 rounded-lg border cursor-pointer ${form.bankAccount === acc._id ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-900/50' : 'border-gray-200 dark:border-gray-700'}`}>
                      <input type="radio" name="bankAccount" value={acc._id} checked={form.bankAccount === acc._id} onChange={(e) => setForm({ ...form, bankAccount: e.target.value })} className="mr-3" />
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">{acc.accountName}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{acc.bankName} - {acc.accountNumber}</p>
                      </div>
                    </label>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 dark:text-gray-400 text-center py-4">No bank accounts added yet</p>
              )}
            </div>

            <form onSubmit={handleWithdraw} className="card mb-8">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Request Withdrawal</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Amount (₦)</label>
                  <input type="number" className="input-field w-full" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} placeholder="Enter amount" min="100" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Account Password</label>
                  <input type="password" className="input-field w-full" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="Enter your password to confirm" required />
                </div>
                <button type="submit" disabled={submitting || !form.bankAccount} className="btn-primary w-full py-3">
                  {submitting ? 'Processing...' : 'Request Withdrawal'}
                </button>
              </div>
            </form>

            <div className="card">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Withdrawal History</h2>
              {withdrawals.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="text-left text-sm text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-gray-700">
                        <th className="pb-3 font-medium">Date</th>
                        <th className="pb-3 font-medium">Amount</th>
                        <th className="pb-3 font-medium">Bank</th>
                        <th className="pb-3 font-medium text-right">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {withdrawals.map((wd) => (
                        <tr key={wd._id} className="border-b border-gray-100 dark:border-gray-700">
                          <td className="py-3 text-sm text-gray-600 dark:text-gray-400">{new Date(wd.createdAt).toLocaleDateString()}</td>
                          <td className="py-3 text-sm font-bold text-gray-900 dark:text-white">₦{(wd.amount || 0).toLocaleString()}</td>
                          <td className="py-3 text-sm text-gray-600 dark:text-gray-400">{wd.bankAccount?.bankName}</td>
                          <td className="py-3 text-right">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${wd.status === 'approved' ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300' : wd.status === 'pending' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300' : 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300'}`}>
                              {wd.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-gray-500 dark:text-gray-400 text-center py-8">No withdrawal requests yet</p>
              )}
            </div>
          </div>
        </div>
      </Layout>
    </ProtectedRoute>
  );
}
