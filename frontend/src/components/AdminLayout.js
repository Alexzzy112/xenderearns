import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { FiGrid, FiUsers, FiPackage, FiDollarSign, FiArrowUpRight, FiLogOut, FiMenu, FiX } from 'react-icons/fi';
import AdBanner from './AdBanner';

const sidebarLinks = [
  { href: '/admin/dashboard', label: 'Dashboard', icon: <FiGrid /> },
  { href: '/admin/users', label: 'Users', icon: <FiUsers /> },
  { href: '/admin/products', label: 'Products', icon: <FiPackage /> },
  { href: '/admin/payments', label: 'Payments', icon: <FiDollarSign /> },
  { href: '/admin/withdrawals', label: 'Withdrawals', icon: <FiArrowUpRight /> },
];

export default function AdminLayout({ children }) {
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    router.push('/admin/login');
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex">
      <aside className={`fixed inset-y-0 left-0 z-30 w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 transform transition-transform lg:translate-x-0 lg:static ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="p-6">
          <h1 className="text-xl font-bold text-indigo-600">Xender Admin</h1>
        </div>
        <nav className="px-4 space-y-1">
          {sidebarLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                router.pathname === link.href
                  ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600'
                  : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
              }`}
            >
              {link.icon}
              {link.label}
            </Link>
          ))}
          <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors">
            <FiLogOut />
            Logout
          </button>
        </nav>
      </aside>

      <div className="flex-1 flex flex-col">
        <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4 lg:hidden">
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700">
            {sidebarOpen ? <FiX className="text-xl" /> : <FiMenu className="text-xl" />}
          </button>
        </header>
        <main className="flex-1 p-6">
          {children}
        </main>
        <AdBanner />
      </div>
    </div>
  );
}
