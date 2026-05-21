import { useState } from 'react';
import Layout from '../components/Layout';
import ProtectedRoute from '../components/ProtectedRoute';
import { paymentAPI } from '../utils/api';
import { toast } from 'react-toastify';
import { FiCheck, FiCopy, FiRefreshCw } from 'react-icons/fi';

export default function Deposit() {
  const [amount, setAmount] = useState('');
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
      const res = await paymentAPI.initializeDeposit({ amount: Number(amount) });
      setPaymentInfo({ reference: res.data.reference, bankDetails: res.data.bankDetails });
      toast.success('Deposit request created. Transfer to the account below.');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to process deposit');
    } finally {
      setLoading(false);
    }
  };

  const [verifying, setVerifying] = useState(false);
  const [verified, setVerified] = useState(false);

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied!');
  };

  const handleVerifyPayment = async () => {
    setVerifying(true);
    try {
      const res = await paymentAPI.verifyDeposit(paymentInfo.reference);
      if (res.data.status === 'completed') {
        setVerified(true);
        toast.success('Payment confirmed! Your wallet has been credited.');
      } else {
        toast.info('Payment is still pending. Admin will confirm shortly.');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Verification failed');
    } finally {
      setVerifying(false);
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
              <p className="text-gray-600 dark:text-gray-400 mt-1">Choose an amount and transfer to the account below</p>
            </div>

            {paymentInfo ? (
              <div className="card text-center">
                <div className="w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FiCheck className="w-8 h-8 text-green-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Transfer to This Account</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">Send exactly <strong>₦{Number(amount).toLocaleString()}</strong> to the account below</p>

                <div className="bg-indigo-50 dark:bg-indigo-900/50 rounded-xl p-6 mb-6 text-left space-y-4">
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">Bank</p>
                    <p className="text-lg font-bold text-gray-900 dark:text-white">{paymentInfo.bankDetails.bankName}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">Account Number</p>
                    <div className="flex items-center gap-2">
                      <p className="text-lg font-bold text-gray-900 dark:text-white">{paymentInfo.bankDetails.accountNumber}</p>
                      <button onClick={() => copyToClipboard(paymentInfo.bankDetails.accountNumber)} className="p-1.5 bg-indigo-100 dark:bg-indigo-800 rounded-lg hover:bg-indigo-200 dark:hover:bg-indigo-700 transition-colors">
                        <FiCopy className="w-4 h-4 text-indigo-600" />
                      </button>
                    </div>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">Account Name</p>
                    <p className="text-lg font-bold text-gray-900 dark:text-white">{paymentInfo.bankDetails.accountName}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">Amount</p>
                    <p className="text-lg font-bold text-green-600">₦{Number(amount).toLocaleString()}</p>
                  </div>
                </div>

                {verified ? (
                  <div className="bg-green-50 dark:bg-green-900/30 rounded-xl p-4 mb-6">
                    <p className="text-green-700 dark:text-green-300 font-bold">Payment Verified Successfully!</p>
                    <p className="text-sm text-green-600 dark:text-green-400 mt-1">₦{Number(amount).toLocaleString()} has been credited to your wallet.</p>
                  </div>
                ) : (
                  <>
                    <div className="bg-yellow-50 dark:bg-yellow-900/30 rounded-xl p-4 mb-6 text-left">
                      <p className="text-sm text-yellow-700 dark:text-yellow-300 font-medium mb-1">Reference: {paymentInfo.reference}</p>
                      <p className="text-xs text-yellow-600 dark:text-yellow-400">Use this reference when contacting support. Your wallet will be credited after admin confirms your payment.</p>
                    </div>

                    <button onClick={handleVerifyPayment} disabled={verifying} className="btn-primary w-full py-3 mb-3 flex items-center justify-center gap-2">
                      {verifying ? 'Verifying...' : <><FiRefreshCw className="w-5 h-5" /> I have made Payment</>}
                    </button>
                  </>
                )}

                <button onClick={() => window.location.href = '/dashboard'} className="btn-secondary w-full py-3">
                  Close
                </button>
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
