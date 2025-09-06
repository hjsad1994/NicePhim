'use client';

import Link from 'next/link';
import { UserIcon } from '@heroicons/react/24/outline';
import { ROUTES } from '@/constants';

export function Header() {

  return (
    <>
      <header className="border-b border-gray-800 sticky top-0 z-50" style={{backgroundColor: 'var(--bg-4)'}}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo - Hết bên trái */}
            <Link href={ROUTES.HOME} className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-red-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">N</span>
              </div>
              <span className="text-white font-bold text-xl">NicePhim</span>
            </Link>

            {/* Icon cá nhân - Hết bên phải */}
            <div className="flex items-center">
              <Link
                href={ROUTES.PROFILE}
                className="text-gray-300 hover:text-white p-2 rounded-md transition-colors"
                aria-label="Tài khoản"
              >
                <UserIcon className="h-6 w-6" />
              </Link>
            </div>
          </div>
        </div>

      </header>

    </>
  );
}
