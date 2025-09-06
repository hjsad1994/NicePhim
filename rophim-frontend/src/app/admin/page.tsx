import { 
  FilmIcon,
  UserGroupIcon,
  EyeIcon,
  HeartIcon
} from '@heroicons/react/24/outline';

export default function AdminDashboard() {
  const stats = [
    {
      name: 'Tổng phim',
      value: '1,234',
      icon: FilmIcon,
      change: '+12%',
      changeType: 'increase'
    },
    {
      name: 'Người dùng',
      value: '5,678',
      icon: UserGroupIcon,
      change: '+5%',
      changeType: 'increase'
    },
    {
      name: 'Lượt xem hôm nay',
      value: '12,345',
      icon: EyeIcon,
      change: '+8%',
      changeType: 'increase'
    },
    {
      name: 'Phim yêu thích',
      value: '2,890',
      icon: HeartIcon,
      change: '+15%',
      changeType: 'increase'
    }
  ];

  const recentMovies = [
    {
      id: 1,
      title: 'Spider-Man: No Way Home',
      status: 'active',
      views: '1.2M',
      uploadDate: '2024-01-15'
    },
    {
      id: 2,
      title: 'The Batman',
      status: 'active',
      views: '890K',
      uploadDate: '2024-01-14'
    },
    {
      id: 3,
      title: 'Squid Game',
      status: 'pending',
      views: '2.1M',
      uploadDate: '2024-01-13'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600">Tổng quan hệ thống NicePhim</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <div key={stat.name} className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <stat.icon className="h-8 w-8 text-red-600" />
              </div>
              <div className="ml-4 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    {stat.name}
                  </dt>
                  <dd className="flex items-baseline">
                    <div className="text-2xl font-semibold text-gray-900">
                      {stat.value}
                    </div>
                    <div className={`ml-2 flex items-baseline text-sm font-semibold ${
                      stat.changeType === 'increase' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {stat.change}
                    </div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Movies */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Phim mới nhất</h3>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {recentMovies.map((movie) => (
                <div key={movie.id} className="flex items-center justify-between">
                  <div className="flex-1">
                    <h4 className="text-sm font-medium text-gray-900">{movie.title}</h4>
                    <p className="text-sm text-gray-500">
                      {movie.views} lượt xem • {movie.uploadDate}
                    </p>
                  </div>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    movie.status === 'active' 
                      ? 'bg-green-100 text-green-800'
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {movie.status === 'active' ? 'Hoạt động' : 'Chờ duyệt'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Thao tác nhanh</h3>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              <button className="w-full flex items-center justify-center px-4 py-3 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 transition-colors">
                <FilmIcon className="mr-2 h-5 w-5" />
                Thêm phim mới
              </button>
              <button className="w-full flex items-center justify-center px-4 py-3 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 transition-colors">
                <UserGroupIcon className="mr-2 h-5 w-5" />
                Quản lý người dùng
              </button>
              <button className="w-full flex items-center justify-center px-4 py-3 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 transition-colors">
                <EyeIcon className="mr-2 h-5 w-5" />
                Xem thống kê
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
