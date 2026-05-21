import Link from 'next/link';
import Layout from '../components/Layout';
import { useAuth } from '../context/AuthContext';
import { FiTrendingUp, FiShield, FiDollarSign, FiBarChart2, FiUsers, FiClock } from 'react-icons/fi';

export default function Home() {
  const { user } = useAuth();

  return (
    <Layout>
      <div className="min-h-screen">
        <section className="relative bg-gradient-to-br from-indigo-600 via-purple-600 to-indigo-800 text-white">
          <div className="absolute inset-0 bg-black opacity-20"></div>
          <div className="relative max-w-7xl mx-auto px-4 py-24 sm:px-6 lg:px-8">
            <div className="text-center">
              <h1 className="text-4xl sm:text-6xl font-bold mb-6">
                Earn Daily with <span className="text-yellow-300">Xender Earnings</span>
              </h1>
              <p className="text-xl sm:text-2xl mb-8 text-indigo-100 max-w-3xl mx-auto">
                Invest in our curated products and earn up to 30% daily ROI. 
                Start building your financial freedom today.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                {user ? (
                  <Link href="/dashboard" className="bg-yellow-400 text-gray-900 px-8 py-4 rounded-xl font-bold text-lg hover:bg-yellow-300 transition-all transform hover:scale-105">
                    Go to Dashboard
                  </Link>
                ) : (
                  <>
                    <Link href="/register" className="bg-yellow-400 text-gray-900 px-8 py-4 rounded-xl font-bold text-lg hover:bg-yellow-300 transition-all transform hover:scale-105">
                      Get Started
                    </Link>
                    <Link href="/login" className="border-2 border-white text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-white hover:text-indigo-600 transition-all">
                      Sign In
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        </section>

        <section className="py-20 bg-white dark:bg-gray-900">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4">
                Why Choose Xender Earnings?
              </h2>
              <p className="text-xl text-gray-600 dark:text-gray-400">
                We provide a seamless investment experience with guaranteed daily returns
              </p>
            </div>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="card text-center hover:shadow-xl transition-shadow">
                <div className="w-16 h-16 bg-indigo-100 dark:bg-indigo-900 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FiTrendingUp className="w-8 h-8 text-indigo-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Daily ROI</h3>
                <p className="text-gray-600 dark:text-gray-400">Earn up to 30% daily returns on your investments. Watch your money grow every single day.</p>
              </div>
              <div className="card text-center hover:shadow-xl transition-shadow">
                <div className="w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FiShield className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Secure Platform</h3>
                <p className="text-gray-600 dark:text-gray-400">Your investments are protected with enterprise-grade security. We use encryption and secure payment gateways.</p>
              </div>
              <div className="card text-center hover:shadow-xl transition-shadow">
                <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FiDollarSign className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Easy Withdrawals</h3>
                <p className="text-gray-600 dark:text-gray-400">Withdraw your earnings anytime. Simple process with support for Nigerian bank transfers.</p>
              </div>
            </div>
          </div>
        </section>

        <section className="py-20 bg-gray-50 dark:bg-gray-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4">
                How It Works
              </h2>
              <p className="text-xl text-gray-600 dark:text-gray-400">
                Start earning in 3 simple steps
              </p>
            </div>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-20 h-20 bg-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4 text-white text-2xl font-bold">1</div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Create Account</h3>
                <p className="text-gray-600 dark:text-gray-400">Sign up for free and verify your email to get started.</p>
              </div>
              <div className="text-center">
                <div className="w-20 h-20 bg-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4 text-white text-2xl font-bold">2</div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Choose a Plan</h3>
                <p className="text-gray-600 dark:text-gray-400">Browse our investment products and select the one that suits you.</p>
              </div>
              <div className="text-center">
                <div className="w-20 h-20 bg-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4 text-white text-2xl font-bold">3</div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Earn Daily</h3>
                <p className="text-gray-600 dark:text-gray-400">Sit back and watch your earnings grow daily. Withdraw anytime.</p>
              </div>
            </div>
          </div>
        </section>

        <section className="py-20 bg-white dark:bg-gray-900">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4">
                Platform Statistics
              </h2>
            </div>
            <div className="grid md:grid-cols-4 gap-6">
              <div className="card text-center">
                <FiUsers className="w-10 h-10 text-indigo-600 mx-auto mb-3" />
                <div className="text-3xl font-bold text-gray-900 dark:text-white">10,000+</div>
                <div className="text-gray-600 dark:text-gray-400">Active Users</div>
              </div>
              <div className="card text-center">
                <FiDollarSign className="w-10 h-10 text-green-600 mx-auto mb-3" />
                <div className="text-3xl font-bold text-gray-900 dark:text-white">₦50M+</div>
                <div className="text-gray-600 dark:text-gray-400">Total Invested</div>
              </div>
              <div className="card text-center">
                <FiBarChart2 className="w-10 h-10 text-blue-600 mx-auto mb-3" />
                <div className="text-3xl font-bold text-gray-900 dark:text-white">₦15M+</div>
                <div className="text-gray-600 dark:text-gray-400">Earnings Paid</div>
              </div>
              <div className="card text-center">
                <FiClock className="w-10 h-10 text-yellow-600 mx-auto mb-3" />
                <div className="text-3xl font-bold text-gray-900 dark:text-white">24/7</div>
                <div className="text-gray-600 dark:text-gray-400">Support</div>
              </div>
            </div>
          </div>
        </section>

        <footer className="bg-gray-900 text-white py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid md:grid-cols-3 gap-8">
              <div>
                <h3 className="text-xl font-bold mb-4">Xender Earnings</h3>
                <p className="text-gray-400">Your trusted investment platform for daily earnings.</p>
              </div>
              <div>
                <h3 className="text-xl font-bold mb-4">Quick Links</h3>
                <ul className="space-y-2 text-gray-400">
                  <li><Link href="/" className="hover:text-white">Home</Link></li>
                  <li><Link href="/login" className="hover:text-white">Login</Link></li>
                  <li><Link href="/register" className="hover:text-white">Register</Link></li>
                </ul>
              </div>
              <div>
                <h3 className="text-xl font-bold mb-4">Contact</h3>
                <ul className="space-y-2 text-gray-400">
                  <li>support@xenderearnings.com</li>
                  <li>Lagos, Nigeria</li>
                </ul>
              </div>
            </div>
            <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
              <p>&copy; 2026 Xender Earnings Platform. All rights reserved.</p>
            </div>
          </div>
        </footer>
      </div>
    </Layout>
  );
}
