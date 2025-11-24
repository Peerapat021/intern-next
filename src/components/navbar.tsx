'use client';

import Link from 'next/link';
import { signOut, useSession } from 'next-auth/react';
import { FaUser, FaSignOutAlt, FaHome } from 'react-icons/fa';
import { usePathname } from 'next/navigation';

const navItems = [
  { name: 'หน้าแรก', href: '/', icon: <FaHome /> }, 
  { name: 'รายการสั่งซื้อ', href: '/cart' },
  { name: 'หมวดหมู่', href: '/category' },
];

export default function Nav() {
  const { data: session } = useSession();
  const pathname = usePathname();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white dark:bg-gray-900 shadow-lg border-b border-gray-200 dark:border-gray-800">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo / Title */}
          <div className="flex items-center">
            <Link href="/admin" className="flex items-center gap-3">
              <div className="text-2xl font-bold text-gray-800 dark:text-white">
                Product List
              </div>
            </Link>
          </div>

          {/* Desktop Menu */}
          <div className="hidden sm:flex items-center gap-1">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  pathname === item.href
                    ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
                    : 'text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800'
                }`}
              >
                {item.icon}
                <span>{item.name}</span>
              </Link>
            ))}
          </div>

          {/* Right side - User & Logout */}
          <div className="flex items-center gap-3">
            {session?.user ? (
              <>
                {/* User Info (เหมือนใน Sidebar) */}
                <div className="hidden sm:flex items-center gap-3 px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-800">
                  <FaUser className="text-gray-600 dark:text-gray-300" />
                  <div>
                    <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                      {session.user.name}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Admin</p>
                  </div>
                </div>

                {/* Logout Button */}
                <button
                  onClick={() => signOut({ callbackUrl: '/login' })}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg transition-colors"
                >
                  <FaSignOutAlt />
                  <span className="hidden sm:inline">ออกจากระบบ</span>
                </button>
              </>
            ) : (
              <Link
                href="/login"
                className="px-5 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
              >
                เข้าสู่ระบบ
              </Link>
            )}
          </div>

          {/* Mobile Menu (ถ้าต้องการเพิ่มในอนาคต) */}
          {/* <button className="sm:hidden">Menu</button> */}
        </div>
      </div>

      {/* Mobile Bottom Navigation (ถ้าต้องการให้เหมือนแอป) */}
      <div className="sm:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800">
        <div className="flex justify-around py-2">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center gap-1 px-4 py-2 rounded-lg ${
                pathname === item.href
                  ? 'text-blue-600 dark:text-blue-400'
                  : 'text-gray-600 dark:text-gray-400'
              }`}
            >
              {item.icon}
              <span className="text-xs">{item.name}</span>
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
}