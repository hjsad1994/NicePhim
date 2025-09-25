'use client';

import Link from 'next/link';
import { 
  HomeIcon,
  FilmIcon,
  UserGroupIcon,
  Cog6ToothIcon,
  ChartBarIcon,
  PlusIcon,
  TagIcon
} from '@heroicons/react/24/outline';

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const navigation = [
    { name: 'Về trang chủ', href: '/', icon: HomeIcon },
    { name: 'Dashboard', href: '/admin', icon: ChartBarIcon },
    { name: 'Quản lý phim', href: '/admin/movies', icon: FilmIcon },
    { name: 'Thêm phim mới', href: '/admin/movies/upload', icon: PlusIcon },
    { name: 'Quản lý thể loại', href: '/admin/genres', icon: TagIcon },
  ];

  return (
    <div className="min-h-screen" style={{backgroundColor: 'var(--bg-2)'}}>
      {/* Sidebar */}
      <div className="fixed inset-y-0 left-0 z-50 w-64 shadow-lg" style={{backgroundColor: 'var(--bg-4)'}}>
        {/* Logo */}
        <div className="flex items-center justify-center h-16 border-b" style={{borderColor: 'var(--bg-3)'}}>
          <h1 className="text-xl font-bold text-red-400">NicePhim Admin</h1>
        </div>

        {/* Navigation */}
        <nav className="mt-8">
          <div className="px-4 space-y-2">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors hover:bg-opacity-20 hover:bg-white"
                style={{
                  color: 'var(--color-text-secondary)',
                  backgroundColor: 'transparent'
                }}
              >
                <item.icon className="mr-3 h-5 w-5 group-hover:text-red-400" style={{color: 'var(--color-text-muted)'}} />
                {item.name}
              </Link>
            ))}
          </div>
        </nav>
      </div>

      {/* Main content */}
      <div className="ml-64">
        {/* Top bar */}
        <header className="shadow-sm border-b" style={{backgroundColor: 'var(--bg-5)', borderColor: 'var(--bg-3)'}}>
          <div className="px-6 py-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold" style={{color: 'var(--color-text-primary)'}}>Admin Panel</h2>
              <div className="flex items-center space-x-4">
                <div className="relative group">
                  <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center cursor-pointer transition-all duration-300 group-hover:scale-110">
                    <span className="text-white font-medium text-sm">A</span>
                  </div>

                  {/* Profile Dropdown */}
                  <div className="absolute right-0 mt-2 w-64 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 transform group-hover:translate-y-0 translate-y-2 z-50">
                    <div className="bg-gray-900/80 backdrop-blur-sm rounded-2xl p-6 border border-gray-800">
                      <h3 className="text-xl font-bold text-white mb-4">Thông tin cá nhân</h3>
                      <div className="space-y-3">
                        <div className="flex items-center space-x-3">
                          <div className="w-12 h-12 bg-red-500 rounded-full flex items-center justify-center">
                            <span className="text-white font-medium text-lg">A</span>
                          </div>
                          <div>
                            <p className="text-white font-medium">Admin</p>
                            <p className="text-gray-400 text-sm">admin@nicephim.com</p>
                          </div>
                        </div>
                        <div className="border-t border-gray-800 pt-3">
                          <p className="text-gray-400 text-sm">Vai trò</p>
                          <p className="text-white font-medium">Quản trị viên</p>
                        </div>
                        <div className="border-t border-gray-800 pt-3">
                          <p className="text-gray-400 text-sm">Ngày tham gia</p>
                          <p className="text-white font-medium">01/01/2024</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
