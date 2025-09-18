'use client';

import Link from 'next/link';
import { HeartIcon, ShareIcon, BellIcon, UserIcon, ChevronDownIcon, Cog6ToothIcon, ArrowRightOnRectangleIcon } from '@heroicons/react/24/outline';
import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';

export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const { user, isLoggedIn, logout } = useAuth();

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      setIsScrolled(scrollTop > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Handle logout
  const handleLogout = () => {
    logout();
    setIsUserMenuOpen(false);
    // Redirect to home page
    window.location.href = '/';
  };

  // Close user menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (!target.closest('.user-menu-container')) {
        setIsUserMenuOpen(false);
      }
    };

    if (isUserMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isUserMenuOpen]);

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      isScrolled 
        ? 'bg-black/90 backdrop-blur-md border-b border-gray-800 shadow-lg' 
        : 'bg-transparent backdrop-blur-none border-b border-transparent'
    }`}>
      <div className="w-[90%] mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center">
            <div className="text-2xl font-bold text-white">
              <span className="text-red-600">Nice</span>Phim
            </div>
          </Link>

          {/* Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            <Link href="/chu-de" className="text-gray-300 hover:text-white transition-colors">
              Chủ Đề
            </Link>
            <Link href="/the-loai" className="text-gray-300 hover:text-white transition-colors">
              Thể loại
            </Link>
            <Link href="/phim-le" className="text-gray-300 hover:text-white transition-colors">
              Phim Lẻ
            </Link>
            <Link href="/phim-bo" className="text-gray-300 hover:text-white transition-colors">
              Phim Bộ
            </Link>
            <Link href="/xem-chung" className="text-gray-300 hover:text-white transition-colors">
              Xem Chung
            </Link>
          </nav>

          {/* User Actions */}
          <div className="flex items-center space-x-4">
            {isLoggedIn ? (
              <>
                {/* Notifications */}
                <button className="relative text-gray-300 hover:text-white transition-colors">
                  <BellIcon className="h-6 w-6" />
                  <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    3
                  </span>
                </button>

                {/* Favorites */}
                <button className="text-gray-300 hover:text-white transition-colors">
                  <HeartIcon className="h-6 w-6" />
                </button>

                {/* Share */}
                <button className="text-gray-300 hover:text-white transition-colors">
                  <ShareIcon className="h-6 w-6" />
                </button>

                {/* User Profile */}
                <div className="relative user-menu-container">
                  <button 
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                    className="flex items-center space-x-2 text-gray-300 hover:text-white transition-colors"
                  >
                    <div className="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center">
                      <UserIcon className="h-5 w-5" />
                    </div>
                    <span className="hidden sm:block text-sm">{user?.username || 'Tài khoản'}</span>
                    <ChevronDownIcon className={`h-4 w-4 transition-transform ${isUserMenuOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {/* Dropdown Menu */}
                  {isUserMenuOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-gray-800 rounded-lg shadow-xl border border-gray-700 py-2 z-50">
                      <div className="px-4 py-2 border-b border-gray-700">
                        <p className="text-sm text-gray-300">Xin chào!</p>
                        <p className="text-sm font-medium text-white">{user?.username || 'Người dùng'}</p>
                      </div>
                      
                      <Link 
                        href="/admin" 
                        className="flex items-center px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-white transition-colors"
                        onClick={() => setIsUserMenuOpen(false)}
                      >
                        <Cog6ToothIcon className="h-4 w-4 mr-3" />
                        Quản trị viên
                      </Link>
                      
                      <Link 
                        href="/admin/movies" 
                        className="flex items-center px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-white transition-colors"
                        onClick={() => setIsUserMenuOpen(false)}
                      >
                        <Cog6ToothIcon className="h-4 w-4 mr-3" />
                        Quản lý phim
                      </Link>
                      
                      <Link 
                        href="/admin/movies/new" 
                        className="flex items-center px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-white transition-colors"
                        onClick={() => setIsUserMenuOpen(false)}
                      >
                        <Cog6ToothIcon className="h-4 w-4 mr-3" />
                        Thêm phim mới
                      </Link>
                      
                      <div className="border-t border-gray-700 mt-2 pt-2">
                        <button 
                          onClick={handleLogout}
                          className="flex items-center w-full px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-white transition-colors"
                        >
                          <ArrowRightOnRectangleIcon className="h-4 w-4 mr-3" />
                          Đăng xuất
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              /* Login/Register Buttons when not logged in */
              <div className="flex items-center space-x-3">
                <Link 
                  href="/dang-nhap" 
                  className="px-4 py-2 text-sm font-medium text-gray-300 hover:text-white transition-colors border border-gray-600 hover:border-gray-400 rounded-lg"
                >
                  Đăng nhập
                </Link>
                <Link 
                  href="/dang-ky" 
                  className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 transition-colors rounded-lg"
                >
                  Đăng ký
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}