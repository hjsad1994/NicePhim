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
    { name: 'Dashboard', href: '/admin', icon: HomeIcon },
    { name: 'Quản lý phim', href: '/admin/movies', icon: FilmIcon },
    { name: 'Thêm phim mới', href: '/admin/movies/upload', icon: PlusIcon },
    { name: 'Quản lý thể loại', href: '/admin/genres', icon: TagIcon },
    { name: 'Người dùng', href: '/admin/users', icon: UserGroupIcon },
    { name: 'Thống kê', href: '/admin/analytics', icon: ChartBarIcon },
    { name: 'Cài đặt', href: '/admin/settings', icon: Cog6ToothIcon },
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
                <span className="text-sm" style={{color: 'var(--color-text-secondary)'}}>Xin chào, Admin</span>
                <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center">
                  <span className="text-white font-medium text-sm">A</span>
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
