import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import ProtectedRoute from '../components/ProtectedRoute';
import { userAPI } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import { FiUser, FiMail, FiPhone, FiCopy, FiShare2, FiSend } from 'react-icons/fi';

export default function Profile() {
  const { user, logout } = useAuth();
  const [form, setForm] = useState({ name: '', email: '', phone: '' });
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    if (user) {
      setForm({ name: user.name || '', email: user.email || '', phone: user.phone || '' });
    }
  }, [user]);

  const APP_URL = 'https://xenderearns.vercel.app';

  const copyReferral = () => {
    if (user?.referralCode) {
      navigator.clipboard.writeText(user.referralCode);
      toast.success('Referral code copied');
    }
  };

  const shareReferralLink = () => {
    if (user?.referralCode) {
      const link = `${APP_URL}/register?ref=${user.referralCode}`;
      navigator.clipboard.writeText(link);
      toast.success('Referral link copied to clipboard');
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await userAPI.updateProfile({ name: form.name, phone: form.phone });
      toast.success('Profile updated successfully');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ProtectedRoute>
      <Layout>
        <div className="py-8 px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mx-auto">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">My Profile</h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">Manage your account information</p>
            </div>

            <div className="card mb-8">
              <div className="flex items-center gap-4 mb-6 pb-6 border-b border-gray-200 dark:border-gray-700">
                <div className="w-20 h-20 bg-indigo-100 dark:bg-indigo-900 rounded-full flex items-center justify-center">
                  <FiUser className="w-8 h-8 text-indigo-600" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{user?.name}</h2>
                  <p className="text-gray-600 dark:text-gray-400">{user?.email}</p>
                </div>
              </div>

              {user?.referralCode && (
                <div className="mb-6 p-4 bg-indigo-50 dark:bg-indigo-900/30 rounded-xl border border-indigo-200 dark:border-indigo-800">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Your Referral Code</p>
                      <p className="text-2xl font-bold text-indigo-600 dark:text-indigo-400 mt-1 tracking-wider">{user.referralCode}</p>
                      <p className="text-xs text-gray-500 mt-1">Share your code and earn 35% commission on their purchases</p>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={copyReferral} className="p-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors" title="Copy referral code">
                        <FiCopy className="w-5 h-5" />
                      </button>
                      <button onClick={shareReferralLink} className="p-3 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors" title="Copy referral link">
                        <FiShare2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                  <div className="mt-3 pt-3 border-t border-indigo-200 dark:border-indigo-700">
                    <p className="text-xs text-gray-500 mb-2">Referral link: <span className="text-indigo-600 font-mono text-xs break-all">{APP_URL}/register?ref={user.referralCode}</span></p>
                  </div>
                </div>
              )}

              <a href="https://t.me/xenderinvest" target="_blank" rel="noopener noreferrer" className="mb-6 flex items-center gap-3 p-3 bg-blue-50 dark:bg-blue-900/30 rounded-xl border border-blue-200 dark:border-blue-800 hover:shadow-md transition-shadow">
                <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center shrink-0">
                  <FiSend className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-900 dark:text-white">Telegram Channel</p>
                  <p className="text-xs text-blue-600 dark:text-blue-400">Join for updates</p>
                </div>
              </a>

              <form onSubmit={handleUpdate} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Full Name</label>
                  <input type="text" className="input-field w-full" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Email</label>
                  <input type="email" className="input-field w-full" value={form.email} disabled />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Phone Number</label>
                  <input type="tel" className="input-field w-full" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} required />
                </div>
                <button type="submit" disabled={loading} className="btn-primary py-2 px-6">
                  {loading ? 'Saving...' : 'Save Changes'}
                </button>
              </form>
            </div>
          </div>
        </div>
      </Layout>
    </ProtectedRoute>
  );
}
