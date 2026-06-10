import { useState, useEffect } from 'react';
import AdminLayout from '../../components/AdminLayout';
import { adminAPI, productAPI } from '../../utils/api';
import { toast } from 'react-toastify';
import { FiPlus, FiEdit2, FiTrash2, FiImage } from 'react-icons/fi';

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: '', description: '', investmentAmount: '', dailyRoi: 13.89, duration: 30 });
  const [imageFile, setImageFile] = useState(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await productAPI.getProducts();
        setProducts(res.data || []);
      } catch (err) {
        toast.error('Failed to load products');
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  const openCreate = () => {
    setEditing(null);
    setForm({ name: '', description: '', investmentAmount: '', dailyRoi: 13.89, duration: 30 });
    setImageFile(null);
    setShowForm(true);
  };

  const openEdit = (product) => {
    setEditing(product._id);
    setForm({ name: product.name || '', description: product.description || '', investmentAmount: product.investmentAmount || '', dailyRoi: product.dailyRoi || 13.89, duration: product.duration || 30 });
    setImageFile(null);
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = new FormData();
    Object.entries(form).forEach(([key, val]) => data.append(key, val));
    if (imageFile) data.append('image', imageFile);
    try {
      if (editing) {
        await adminAPI.updateProduct(editing, data);
        toast.success('Product updated');
      } else {
        await adminAPI.createProduct(data);
        toast.success('Product created');
      }
      setShowForm(false);
      const res = await productAPI.getProducts();
      setProducts(Array.isArray(res.data) ? res.data : (res.data.products || []));
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save product');
    }
  };

  const handleDelete = async (productId) => {
    if (!confirm('Are you sure you want to delete this product?')) return;
    try {
      await adminAPI.deleteProduct(productId);
      setProducts(products.filter(p => p._id !== productId));
      toast.success('Product deleted');
    } catch (err) {
      toast.error('Failed to delete product');
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
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Investment Products</h1>
          <button onClick={openCreate} className="btn-primary flex items-center gap-2 px-4 py-2">
            <FiPlus className="w-5 h-5" /> Add Product
          </button>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div></div>
          ) : products.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-left text-sm text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50">
                    <th className="p-4 font-medium">Product</th>
                      <th className="p-4 font-medium">Amount</th>
                        <th className="p-4 font-medium">Daily ROI</th>
                    <th className="p-4 font-medium">Duration</th>
                    <th className="p-4 font-medium">Investors</th>
                    <th className="p-4 font-medium text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((p) => (
                    <tr key={p._id} className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          {p.image && <img src={p.image} alt={p.name} className="w-10 h-10 rounded-lg object-cover" />}
                          <span className="font-medium text-gray-900 dark:text-white">{p.name}</span>
                        </div>
                      </td>
                      <td className="p-4 text-sm font-bold text-gray-900 dark:text-white">₦{(p.investmentAmount || 0).toLocaleString()}</td>
                        <td className="p-4 text-sm font-bold text-green-600">{p.dailyRoi}%</td>
                      <td className="p-4 text-sm text-gray-600 dark:text-gray-400">{p.duration} days</td>
                      <td className="p-4 text-sm text-gray-600 dark:text-gray-400">{p.investorCount || 0}</td>
                      <td className="p-4 text-right">
                        <button onClick={() => openEdit(p)} className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/50 rounded-lg"><FiEdit2 className="w-4 h-4" /></button>
                        <button onClick={() => handleDelete(p._id)} className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/50 rounded-lg"><FiTrash2 className="w-4 h-4" /></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500 dark:text-gray-400">
              <FiImage className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>No products yet</p>
              <button onClick={openCreate} className="text-indigo-600 hover:text-indigo-500 font-medium mt-2">Create your first product</button>
            </div>
          )}
        </div>

        {showForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">{editing ? 'Edit Product' : 'Create Product'}</h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Product Name</label>
                  <input type="text" className="input-field w-full" value={form.name} onChange={(e) => setForm({...form, name: e.target.value})} required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Description</label>
                  <textarea className="input-field w-full" rows="3" value={form.description} onChange={(e) => setForm({...form, description: e.target.value})} required></textarea>
                </div>
                <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Investment Amount (₦)</label>
                      <input type="number" className="input-field w-full" value={form.investmentAmount} onChange={(e) => setForm({...form, investmentAmount: e.target.value})} required />
                    </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Daily ROI (%)</label>
                      <input type="number" step="0.01" className="input-field w-full" value={form.dailyRoi} onChange={(e) => setForm({...form, dailyRoi: Number(e.target.value)})} required />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Duration (days)</label>
                    <input type="number" className="input-field w-full" value={form.duration} onChange={(e) => setForm({...form, duration: Number(e.target.value)})} required />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Product Image</label>
                  <input type="file" accept="image/*" className="input-field w-full" onChange={(e) => setImageFile(e.target.files[0])} />
                </div>
                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={() => setShowForm(false)} className="btn-secondary flex-1 py-2">Cancel</button>
                  <button type="submit" className="btn-primary flex-1 py-2">{editing ? 'Update' : 'Create'} Product</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
