import { useState } from 'react';
import Layout from '../components/Layout';
import ProtectedRoute from '../components/ProtectedRoute';
import { paymentAPI } from '../utils/api';
import { toast } from 'react-toastify';
import { FiCreditCard } from 'react-icons/fi';

export default function Deposit() {
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);

  const handleDeposit = async (e) => {
    e.preventDefault();
    if (!amount || Number(amount) < 100) {
      toast.error('Minimum deposit is ₦100');
      return;
    }
    setLoading(true);
    try {
      const res = await paymentAPI.initializeDeposit({ amount: Number(amount) });
      if (res.data.authorizationUrl) {
        window.location.href = res.data.authorizationUrl;
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to initialize deposit');
    } finally {
      setLoading(false);
    }
  };

  const quickAmounts = [3600, 10000, 15000, 30000, 50000, 80000, 100000, 500000, 1000000];

  return (
    <ProtectedRoute>
      <Layout>
        <div className="py-8 px-4 sm:px-6 lg:px-8">
          <div className="max-w-lg mx-auto">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Fund Your Wallet</h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">Choose an amount to deposit via Paystack</p>
            </div>

            <form onSubmit={handleDeposit} className="card">
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Quick Amount</label>
                <div className="flex flex-wrap gap-2">
                  {quickAmounts.map((amt) => (
                    <button key={amt} type="button" onClick={() => setAmount(amt.toString())} className={`px-4 py-2 rounded-lg border text-sm font-medium transition-colors ${Number(amount) === amt ? 'bg-indigo-600 text-white border-indigo-600' : 'border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:border-indigo-500'}`}>
                      ₦{amt.toLocaleString()}
                    </button>
                  ))}
                </div>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Or Enter Amount (₦)</label>
                <input type="number" className="input-field w-full" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="Enter amount" min="100" />
              </div>

              <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Payment Method</p>
                <div className="flex items-center gap-3 p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-600">
                  <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center shrink-0">
                    <FiCreditCard className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-900 dark:text-white">Paystack</p>
                    <p className="text-xs text-gray-500">Pay with card, bank transfer, or USSD</p>
                  </div>
                </div>
              </div>

              <button type="submit" disabled={loading} className="btn-primary w-full py-3">
                {loading ? 'Redirecting to Paystack...' : `Deposit ₦${Number(amount || 0).toLocaleString()}`}
              </button>

              <p className="text-xs text-gray-400 text-center mt-4">
                You will be redirected to Paystack to complete your payment. A unique reference will be auto-generated for verification.
              </p>
            </form>
          </div>
        </div>
      </Layout>
    </ProtectedRoute>
  );
}
