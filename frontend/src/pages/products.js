import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import ProtectedRoute from '../components/ProtectedRoute';
import { productAPI } from '../utils/api';
import { toast } from 'react-toastify';
import { FiTrendingUp, FiClock, FiDollarSign, FiCheck } from 'react-icons/fi';

export default function Products() {
  const [products, setProducts] = useState([]);
  const [userInvestments, setUserInvestments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [prodRes, investRes] = await Promise.all([
          productAPI.getProducts(),
          productAPI.getUserInvestments(),
        ]);
        setProducts(prodRes.data || []);
        setUserInvestments(investRes.data.investments || []);
      } catch (err) {
        toast.error('Failed to load products');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handlePurchase = async (product) => {
    setPurchasing(product._id);
    try {
      const res = await productAPI.purchase(product._id);
      toast.success(`Invested ₦${product.investmentAmount.toLocaleString()} successfully!`);
      setUserInvestments([...userInvestments, res.data.investment]);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Purchase failed');
    } finally {
      setPurchasing(null);
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
        <div className="py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Investment Products</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">Choose a plan and start earning daily returns</p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product) => {
              const dailyEarning = product.investmentAmount * (product.dailyRoi / 100);
              return (
                <div key={product._id} className="card hover:shadow-xl transition-shadow overflow-hidden">
                  {product.image && (
                    <img src={product.image} alt={product.name} className="w-full h-48 object-cover" />
                  )}
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">{product.name}</h3>
                    <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">{product.description}</p>

                    <div className="mt-4 p-4 bg-indigo-50 dark:bg-indigo-900/30 rounded-xl">
                      <p className="text-sm text-gray-600 dark:text-gray-400">Investment Amount</p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">₦{product.investmentAmount.toLocaleString()}</p>
                    </div>

                    <div className="mt-3 p-4 bg-green-50 dark:bg-green-900/30 rounded-xl">
                      <p className="text-sm text-gray-600 dark:text-gray-400">Daily Earnings</p>
                      <p className="text-2xl font-bold text-green-600">₦{Math.round(dailyEarning).toLocaleString()}<span className="text-sm font-normal text-gray-500">/day</span></p>
                    </div>

                    <div className="mt-4 space-y-2">
                      <div className="flex items-center gap-2 text-sm">
                        <FiTrendingUp className="w-4 h-4 text-indigo-600" />
                        <span className="text-gray-600 dark:text-gray-400">Daily ROI:</span>
                        <span className="font-bold text-indigo-600">{product.dailyRoi}%</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <FiClock className="w-4 h-4 text-blue-600" />
                        <span className="text-gray-600 dark:text-gray-400">Duration:</span>
                        <span className="font-bold text-gray-900 dark:text-white">{product.duration} days</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <FiDollarSign className="w-4 h-4 text-green-600" />
                        <span className="text-gray-600 dark:text-gray-400">Total Return:</span>
                        <span className="font-bold text-green-600">₦{Math.round(product.investmentAmount + dailyEarning * product.duration).toLocaleString()}</span>
                      </div>
                    </div>

                    <button
                      onClick={() => handlePurchase(product)}
                      disabled={purchasing === product._id}
                      className="btn-primary w-full mt-4 py-3 flex items-center justify-center gap-2"
                    >
                      {purchasing === product._id ? (
                        'Processing...'
                      ) : (
                        <>
                          <FiCheck className="w-5 h-5" />
                          Invest ₦{product.investmentAmount.toLocaleString()}
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {userInvestments.length > 0 && (
            <div className="mt-12">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Your Investments</h2>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {userInvestments.map((inv) => (
                  <div key={inv._id} className="border border-gray-200 dark:border-gray-700 rounded-xl p-4">
                    <h3 className="font-bold text-gray-900 dark:text-white">{inv.product?.name}</h3>
                    <p className="text-sm text-gray-500 mt-1">Amount: ₦{(inv.amount || 0).toLocaleString()}</p>
                    <p className="text-sm text-green-600 font-bold">Daily: ₦{Math.round(inv.amount * (inv.dailyRoi || 0) / 100).toLocaleString()}</p>
                    <p className="text-sm text-gray-500">{inv.remainingDays || 0} days remaining</p>
                    <span className={`inline-block mt-2 px-3 py-1 rounded-full text-xs font-medium ${inv.status === 'active' ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300' : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'}`}>
                      {inv.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </Layout>
    </ProtectedRoute>
  );
}
