import Layout from '../components/Layout';
import ProtectedRoute from '../components/ProtectedRoute';
import { FiSend, FiMessageCircle, FiMail, FiMapPin } from 'react-icons/fi';

export default function Contact() {
  return (
    <ProtectedRoute>
      <Layout>
        <div className="py-8 px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Contact Us</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">Get in touch with us on Telegram</p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl">
            <div className="card">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Telegram</h2>
              <div className="space-y-4">
                <a
                  href="https://t.me/your_channel"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-4 p-4 bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 rounded-xl hover:shadow-md transition-shadow"
                >
                  <div className="w-14 h-14 rounded-full bg-blue-500 flex items-center justify-center shrink-0">
                    <FiSend className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <p className="font-bold text-gray-900 dark:text-white text-lg">Telegram Channel</p>
                    <p className="text-sm text-blue-600 dark:text-blue-400">Join our channel for updates, news, and announcements</p>
                  </div>
                </a>
                <a
                  href="https://t.me/your_admin"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-4 p-4 bg-sky-50 dark:bg-sky-900/30 border border-sky-200 dark:border-sky-800 rounded-xl hover:shadow-md transition-shadow"
                >
                  <div className="w-14 h-14 rounded-full bg-sky-500 flex items-center justify-center shrink-0">
                    <FiMessageCircle className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <p className="font-bold text-gray-900 dark:text-white text-lg">Admin Chat</p>
                    <p className="text-sm text-sky-600 dark:text-sky-400">Chat directly with the admin for support</p>
                  </div>
                </a>
              </div>
            </div>

            <div className="card">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Other Information</h2>
              <div className="space-y-4">
                <div className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-xl">
                  <div className="w-12 h-12 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center shrink-0">
                    <FiMail className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                  </div>
                  <div>
                    <p className="font-bold text-gray-900 dark:text-white">Email</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">support@xenderearnings.com</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-xl">
                  <div className="w-12 h-12 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center shrink-0">
                    <FiMapPin className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                  </div>
                  <div>
                    <p className="font-bold text-gray-900 dark:text-white">Location</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Lagos, Nigeria</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Layout>
    </ProtectedRoute>
  );
}
