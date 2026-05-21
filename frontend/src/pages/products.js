import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import ProtectedRoute from '../components/ProtectedRoute';
import { productAPI } from '../utils/api';
import { toast } from 'react-toastify';
import { FiTrendingUp, FiClock, FiDollarSign } from 'react-icons/fi';

export default function Products() {
  const [products, setProducts] = useState([]);
  const [userInvestments, setUserInvestments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [purchaseAmount, setPurchaseAmount] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [prodRes, investRes] = await Promise.all([
          productAPI.getProducts(),
          productAPI.getUserInvestments(),
        ]);
        setProducts(prodRes.data.products || []);
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
    if (!purchaseAmount || Number(purchaseAmount) < product.minAmount) {
      toast.error(`Minimum investment is ₦${product.minAmount?.toLocaleString()}`);
      return;
    }
    setPurchasing(product._id);
    try {
      const res = await productAPI.purchase(product._id, { amount: Number(purchaseAmount) });
      toast.success('Investment purchased successfully!');
      setUserInvestments([...userInvestments, res.data.investment]);
      setSelectedProduct(null);
      setPurchaseAmount('');
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
        <div className="py-8 px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Investment Products</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">Choose a product and start earning daily</p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product) => (
              <div key={product._id} className="card hover:shadow-xl transition-shadow">
                {product.image && (
                  <img src={product.image} alt={product.name} className="w-full h-48 object-cover rounded-t-xl -mt-6 -mx-6 mb-4" style={{ width: 'calc(100% + 3rem)' }} />
                )}
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">{product.name}</h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm mt-2">{product.description}</p>
                <div className="mt-4 space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <FiDollarSign className="w-4 h-4 text-indigo-600" />
                    <span className="text-gray-600 dark:text-gray-400">Min Investment:</span>
                    <span className="font-bold text-gray-900 dark:text-white">₦{(product.minAmount || 0).toLocaleString()}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <FiTrendingUp className="w-4 h-4 text-green-600" />
                    <span className="text-gray-600 dark:text-gray-400">Daily ROI:</span>
                    <span className="font-bold text-green-600">{product.dailyROI}%</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <FiClock className="w-4 h-4 text-blue-600" />
                    <span className="text-gray-600 dark:text-gray-400">Duration:</span>
                    <span className="font-bold text-gray-900 dark:text-white">{product.duration} days</span>
                  </div>
                </div>
                <button onClick={() => setSelectedProduct(product)} className="btn-primary w-full mt-4 py-2">
                  Invest Now
                </button>
              </div>
            ))}
          </div>

          {userInvestments.length > 0 && (
            <div className="mt-12">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Your Investments</h2>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {userInvestments.map((inv) => (
                  <div key={inv._id} className="border border-gray-200 dark:border-gray-700 rounded-xl p-4">
                    <h3 className="font-bold text-gray-900 dark:text-white">{inv.product?.name}</h3>
                    <p className="text-sm text-gray-500 mt-1">Amount: ₦{(inv.amount || 0).toLocaleString()}</p>
                    <p className="text-sm text-green-600">Daily: ₦{(inv.dailyEarning || 0).toLocaleString()}</p>
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

        {selectedProduct && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 max-w-md w-full">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Invest in {selectedProduct.name}</h2>
              <p className="text-gray-600 dark:text-gray-400 mb-6">Enter the amount you want to invest</p>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Investment Amount (₦)</label>
                <input type="number" className="input-field w-full" value={purchaseAmount} onChange={(e) => setPurchaseAmount(e.target.value)} placeholder={`Minimum: ₦${selectedProduct.minAmount?.toLocaleString()}`} min={selectedProduct.minAmount} />
              </div>
              <div className="bg-indigo-50 dark:bg-indigo-900/50 rounded-lg p-4 mb-6">
                <p className="text-sm text-gray-600 dark:text-gray-400">Daily ROI: <span className="font-bold text-green-600">{selectedProduct.dailyROI}%</span></p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Duration: <span className="font-bold">{selectedProduct.duration} days</span></p>
                {purchaseAmount && (
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    Daily earning: <span className="font-bold text-green-600">₦{(Number(purchaseAmount) * selectedProduct.dailyROI / 100).toLocaleString()}</span>
                  </p>
                )}
              </div>
              <div className="flex gap-3">
                <button onClick={() => { setSelectedProduct(null); setPurchaseAmount(''); }} className="btn-secondary flex-1 py-2">Cancel</button>
                <button onClick={() => handlePurchase(selectedProduct)} disabled={purchasing === selectedProduct._id} className="btn-primary flex-1 py-2">
                  {purchasing === selectedProduct._id ? 'Processing...' : 'Confirm Investment'}
                </button>
              </div>
            </div>
          </div>
        )}
      </Layout>
    </ProtectedRoute>
  );
}
