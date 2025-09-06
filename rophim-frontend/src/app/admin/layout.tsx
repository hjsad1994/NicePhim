import Link from 'next/link';
import { 
  HomeIcon,
  FilmIcon,
  UserGroupIcon,
  Cog6ToothIcon,
  ChartBarIcon,
  PlusIcon
} from '@heroicons/react/24/outline';

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const navigation = [
    { name: 'Dashboard', href: '/admin', icon: HomeIcon },
    { name: 'Quản lý phim', href: '/admin/movies', icon: FilmIcon },
    { name: 'Thêm phim mới', href: '/admin/movies/new', icon: PlusIcon },
    { name: 'Người dùng', href: '/admin/users', icon: UserGroupIcon },
    { name: 'Thống kê', href: '/admin/analytics', icon: ChartBarIcon },
    { name: 'Cài đặt', href: '/admin/settings', icon: Cog6ToothIcon },
  ];

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg">
        {/* Logo */}
        <div className="flex items-center justify-center h-16 border-b border-gray-200">
          <h1 className="text-xl font-bold text-red-600">NicePhim Admin</h1>
        </div>

        {/* Navigation */}
        <nav className="mt-8">
          <div className="px-4 space-y-2">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="group flex items-center px-3 py-2 text-sm font-medium text-gray-700 rounded-md hover:bg-red-50 hover:text-red-600 transition-colors"
              >
                <item.icon className="mr-3 h-5 w-5 text-gray-400 group-hover:text-red-500" />
                {item.name}
              </Link>
            ))}
          </div>
        </nav>
      </div>

      {/* Main content */}
      <div className="ml-64">
        {/* Top bar */}
        <header className="bg-white shadow-sm border-b border-gray-200">
          <div className="px-6 py-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-800">Admin Panel</h2>
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-600">Xin chào, Admin</span>
                <div className="w-8 h-8 bg-red-600 rounded-full flex items-center justify-center">
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
