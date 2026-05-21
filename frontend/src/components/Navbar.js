import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '../context/AuthContext';
import { FiMenu, FiX, FiLogOut, FiUser, FiMoon, FiSun } from 'react-icons/fi';

export default function Navbar() {
  const { user, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    document.documentElement.classList.toggle('dark');
  };

  return (
    <nav className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="text-xl font-bold text-indigo-600">
              Xender Earnings
            </Link>
          </div>

          <div className="hidden md:flex items-center gap-4">
            <button onClick={toggleDarkMode} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700">
              {darkMode ? <FiSun /> : <FiMoon />}
            </button>

            {user ? (
              <>
                <Link href="/dashboard" className="text-gray-600 dark:text-gray-300 hover:text-indigo-600">Dashboard</Link>
                <Link href="/products" className="text-gray-600 dark:text-gray-300 hover:text-indigo-600">Invest</Link>
                <Link href="/wallet" className="text-gray-600 dark:text-gray-300 hover:text-indigo-600">Wallet</Link>
                <Link href="/contact" className="text-gray-600 dark:text-gray-300 hover:text-indigo-600">Contact Admin</Link>
                <Link href="/profile" className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700">
                  <FiUser className="text-lg" />
                </Link>
                <button onClick={logout} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700">
                  <FiLogOut className="text-lg text-red-500" />
                </button>
              </>
            ) : (
              <>
                <Link href="/login" className="text-gray-600 dark:text-gray-300 hover:text-indigo-600">Login</Link>
                <Link href="/register" className="btn-primary text-sm">Get Started</Link>
              </>
            )}
          </div>

          <div className="md:hidden flex items-center">
            <button onClick={() => setIsOpen(!isOpen)} className="p-2">
              {isOpen ? <FiX className="text-xl" /> : <FiMenu className="text-xl" />}
            </button>
          </div>
        </div>
      </div>

      {isOpen && (
        <div className="md:hidden border-t border-gray-200 dark:border-gray-700 px-4 py-3 space-y-2">
          {user ? (
            <>
              <Link href="/dashboard" className="block py-2" onClick={() => setIsOpen(false)}>Dashboard</Link>
              <Link href="/products" className="block py-2" onClick={() => setIsOpen(false)}>Invest</Link>
              <Link href="/wallet" className="block py-2" onClick={() => setIsOpen(false)}>Wallet</Link>
              <Link href="/contact" className="block py-2" onClick={() => setIsOpen(false)}>Contact Admin</Link>
              <Link href="/profile" className="block py-2" onClick={() => setIsOpen(false)}>Profile</Link>
              <button onClick={() => { logout(); setIsOpen(false); }} className="block py-2 text-red-500">Logout</button>
            </>
          ) : (
            <>
              <Link href="/login" className="block py-2" onClick={() => setIsOpen(false)}>Login</Link>
              <Link href="/register" className="block py-2" onClick={() => setIsOpen(false)}>Register</Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
}
