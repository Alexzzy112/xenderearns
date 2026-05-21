import { useState } from 'react';
import Layout from '../components/Layout';
import ProtectedRoute from '../components/ProtectedRoute';
import { paymentAPI } from '../utils/api';
import { toast } from 'react-toastify';
import { FiCreditCard, FiCheck, FiDollarSign } from 'react-icons/fi';

export default function Deposit() {
  const [amount, setAmount] = useState('');
  const [gateway, setGateway] = useState('paystack');
  const [loading, setLoading] = useState(false);
  const [paymentInfo, setPaymentInfo] = useState(null);

  const handleDeposit = async (e) => {
    e.preventDefault();
    if (!amount || Number(amount) < 100) {
      toast.error('Minimum deposit is ₦100');
      return;
    }
    setLoading(true);
    try {
      const res = await paymentAPI.initializeDeposit({ amount: Number(amount), gateway });
      if (res.data.authorizationUrl) {
        window.location.href = res.data.authorizationUrl;
      } else if (res.data.paymentInfo) {
        setPaymentInfo(res.data.paymentInfo);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to initialize deposit');
    } finally {
      setLoading(false);
    }
  };

  const quickAmounts = [1000, 5000, 10000, 50000, 100000];

  return (
    <ProtectedRoute>
      <Layout>
        <div className="py-8 px-4 sm:px-6 lg:px-8">
          <div className="max-w-lg mx-auto">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Fund Your Wallet</h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">Choose an amount and payment method</p>
            </div>

            {paymentInfo ? (
              <div className="card text-center">
                <div className="w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FiCheck className="w-8 h-8 text-green-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Payment Instructions</h2>
                <div className="bg-indigo-50 dark:bg-indigo-900/50 rounded-xl p-6 mb-6 text-left">
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Bank: <span className="font-bold text-gray-900 dark:text-white">{paymentInfo.bankName}</span></p>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Account: <span className="font-bold text-gray-900 dark:text-white">{paymentInfo.accountNumber}</span></p>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Name: <span className="font-bold text-gray-900 dark:text-white">{paymentInfo.accountName}</span></p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Amount: <span className="font-bold text-gray-900 dark:text-white">₦{Number(amount).toLocaleString()}</span></p>
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Your wallet will be credited automatically after payment confirmation.</p>
              </div>
            ) : (
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

                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Payment Method</label>
                  <div className="grid grid-cols-3 gap-3">
                    <button type="button" onClick={() => setGateway('paystack')} className={`p-4 rounded-xl border text-center transition-colors ${gateway === 'paystack' ? 'bg-indigo-50 dark:bg-indigo-900/50 border-indigo-600' : 'border-gray-200 dark:border-gray-700 hover:border-indigo-300'}`}>
                      <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center mx-auto mb-2">
                        <FiCreditCard className="w-5 h-5 text-purple-600" />
                      </div>
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Paystack</span>
                    </button>
                    <button type="button" onClick={() => setGateway('flutterwave')} className={`p-4 rounded-xl border text-center transition-colors ${gateway === 'flutterwave' ? 'bg-indigo-50 dark:bg-indigo-900/50 border-indigo-600' : 'border-gray-200 dark:border-gray-700 hover:border-indigo-300'}`}>
                      <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mx-auto mb-2">
                        <FiCreditCard className="w-5 h-5 text-blue-600" />
                      </div>
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Flutterwave</span>
                    </button>
                    <button type="button" onClick={() => setGateway('monnify')} className={`p-4 rounded-xl border text-center transition-colors ${gateway === 'monnify' ? 'bg-indigo-50 dark:bg-indigo-900/50 border-indigo-600' : 'border-gray-200 dark:border-gray-700 hover:border-indigo-300'}`}>
                      <div className="w-10 h-10 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-2">
                        <FiDollarSign className="w-5 h-5 text-green-600" />
                      </div>
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Monnify</span>
                    </button>
                  </div>
                </div>

                <button type="submit" disabled={loading} className="btn-primary w-full py-3">
                  {loading ? 'Processing...' : `Deposit ₦${Number(amount || 0).toLocaleString()}`}
                </button>
              </form>
            )}
          </div>
        </div>
      </Layout>
    </ProtectedRoute>
  );
}
