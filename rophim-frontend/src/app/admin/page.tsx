'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ApiService } from '@/lib/api';
import {
  FilmIcon,
  UserGroupIcon,
  EyeIcon,
  HeartIcon,
  TagIcon
} from '@heroicons/react/24/outline';

export default function AdminDashboard() {
  const router = useRouter();
  const [stats, setStats] = useState({
    totalMovies: 0,
    recentMovies: [] as any[]
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await ApiService.getMovies(0, 5); // Get first 5 movies
        if (response.success) {
          setStats({
            totalMovies: response.pagination?.total || 0,
            recentMovies: response.data || []
          });
        }
      } catch (error) {
        console.error('Failed to fetch stats:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, []);

  const dashboardStats = [
    {
      name: 'Tổng phim',
      value: isLoading ? '-' : stats.totalMovies.toString(),
      icon: FilmIcon,
      change: '+12%',
      changeType: 'increase'
    },
    {
      name: 'Người dùng',
      value: '-',
      icon: UserGroupIcon,
      change: '+5%',
      changeType: 'increase'
    },
    {
      name: 'Lượt xem hôm nay',
      value: '-',
      icon: EyeIcon,
      change: '+8%',
      changeType: 'increase'
    },
    {
      name: 'Phim yêu thích',
      value: '-',
      icon: HeartIcon,
      change: '+15%',
      changeType: 'increase'
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
        {dashboardStats.map((stat) => (
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
                    {stat.value !== '-' && (
                      <div className={`ml-2 flex items-baseline text-sm font-semibold ${
                        stat.changeType === 'increase' ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {stat.change}
                      </div>
                    )}
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
            {isLoading ? (
              <div className="text-center text-gray-500">Đang tải...</div>
            ) : stats.recentMovies.length > 0 ? (
              <div className="space-y-4">
                {stats.recentMovies.map((movie) => (
                  <div key={movie.movieId} className="flex items-center justify-between">
                    <div className="flex-1">
                      <h4 className="text-sm font-medium text-gray-900">{movie.title}</h4>
                      <p className="text-sm text-gray-500">
                        {movie.aliasTitle && `${movie.aliasTitle} • `}
                        {new Date(movie.createdAt).toLocaleDateString('vi-VN')}
                      </p>
                    </div>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      movie.isSeries
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-green-100 text-green-800'
                    }`}>
                      {movie.isSeries ? 'Phim bộ' : 'Phim lẻ'}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center text-gray-500">
                Chưa có phim nào
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Thao tác nhanh</h3>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              <button
                onClick={() => router.push('/admin/movies/upload')}
                className="w-full flex items-center justify-center px-4 py-3 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 transition-colors"
              >
                <FilmIcon className="mr-2 h-5 w-5" />
                Thêm phim mới
              </button>
              <button
                onClick={() => router.push('/admin/movies')}
                className="w-full flex items-center justify-center px-4 py-3 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 transition-colors"
              >
                <FilmIcon className="mr-2 h-5 w-5" />
                Quản lý phim
              </button>
              <button
                onClick={() => router.push('/admin/users')}
                className="w-full flex items-center justify-center px-4 py-3 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 transition-colors"
              >
                <UserGroupIcon className="mr-2 h-5 w-5" />
                Quản lý người dùng
              </button>
              <button
                onClick={() => router.push('/admin/genres')}
                className="w-full flex items-center justify-center px-4 py-3 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 transition-colors"
              >
                <TagIcon className="mr-2 h-5 w-5" />
                Quản lý thể loại
              </button>
              <button
                onClick={() => router.push('/admin/analytics')}
                className="w-full flex items-center justify-center px-4 py-3 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 transition-colors"
              >
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
