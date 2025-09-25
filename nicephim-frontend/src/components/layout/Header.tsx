'use client';

import Link from 'next/link';
import { HeartIcon, ShareIcon, BellIcon, UserIcon, ChevronDownIcon, Cog6ToothIcon, ArrowRightOnRectangleIcon, MagnifyingGlassIcon, Bars3Icon } from '@heroicons/react/24/outline';
import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { SearchModal } from './SearchModal';

export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const { user, isLoggedIn, logout } = useAuth();

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      setIsScrolled(scrollTop > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Handle logout
  const handleLogout = () => {
    logout();
    setIsUserMenuOpen(false);
    window.location.href = '/';
  };

  // Close menus when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (!target.closest('.user-menu-container') && !target.closest('.mobile-menu-container')) {
        setIsUserMenuOpen(false);
        setIsMobileMenuOpen(false);
      }
    };

    if (isUserMenuOpen || isMobileMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isUserMenuOpen, isMobileMenuOpen]);

  return (
    <>
      {/* Header */}
      <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? 'bg-black/90 backdrop-blur-md border-b border-gray-800/50 shadow-lg'
          : 'bg-transparent backdrop-blur-none border-b border-transparent'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center space-x-2">
              <div className="relative">
                <div className="w-8 h-8 bg-gradient-to-br from-red-600 to-pink-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-lg">N</span>
                </div>
                <div className="absolute -inset-1 bg-gradient-to-r from-red-600 to-pink-600 rounded-lg blur opacity-50 animate-pulse"></div>
              </div>
              <div className="text-xl font-bold bg-gradient-to-r from-white via-gray-300 to-white bg-clip-text text-transparent">
                NicePhim
              </div>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-8">
              {[
                { href: "/chu-de", label: "Chủ Đề" },
                { href: "/the-loai", label: "Thể Loại" },
                { href: "/phim-le", label: "Phim Lẻ" },
                { href: "/phim-bo", label: "Phim Bộ" },
                { href: "/xem-chung", label: "Xem Chung" }
              ].map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="text-gray-300 hover:text-white transition-all duration-300 relative group"
                >
                  {item.label}
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-red-600 to-pink-600 transition-all duration-300 group-hover:w-full"></span>
                </Link>
              ))}
            </nav>

            {/* User Actions */}
            <div className="flex items-center space-x-4">
              {/* Search Button */}
              <button
                onClick={() => setIsSearchOpen(true)}
                className="text-gray-400 hover:text-white transition-colors p-2 rounded-lg hover:bg-gray-800/50"
              >
                <MagnifyingGlassIcon className="h-5 w-5" />
              </button>

              {isLoggedIn ? (
                <>
                  {/* Notifications */}
                  <button className="relative text-gray-400 hover:text-white transition-colors p-2 rounded-lg hover:bg-gray-800/50">
                    <BellIcon className="h-5 w-5" />
                    <span className="absolute top-1 right-1 bg-red-600 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                      3
                    </span>
                  </button>

                  {/* Favorites */}
                  <Link href="/yeu-thich" className="text-gray-400 hover:text-white transition-colors p-2 rounded-lg hover:bg-gray-800/50">
                    <HeartIcon className="h-5 w-5" />
                  </Link>

                  {/* User Profile */}
                  <div className="relative user-menu-container">
                    <button
                      onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                      className="flex items-center space-x-3 text-gray-300 hover:text-white transition-colors p-2 rounded-lg hover:bg-gray-800/50"
                    >
                      <div className="w-8 h-8 bg-gradient-to-br from-white to-gray-300 rounded-full flex items-center justify-center">
                        <UserIcon className="h-4 w-4 text-gray-800" />
                      </div>
                      <span className="hidden sm:block text-sm font-medium">{user?.username || 'Tài khoản'}</span>
                      <ChevronDownIcon className={`h-4 w-4 transition-transform ${isUserMenuOpen ? 'rotate-180' : ''}`} />
                    </button>

                    {/* Dropdown Menu */}
                    {isUserMenuOpen && (
                      <div className="absolute right-0 mt-2 w-72 bg-white/8.5 backdrop-blur-xl rounded-2xl border border-white/15 shadow-2xl p-6 z-50">
                        <h3 className="text-xl font-bold text-white mb-4 drop-shadow-lg">Thông tin cá nhân</h3>

                        <div className="space-y-4">
                          {/* User Info */}
                          <div className="flex items-center space-x-3">
                            <div className="w-12 h-12 bg-gradient-to-br from-white to-gray-300 rounded-full flex items-center justify-center shadow-lg">
                              <UserIcon className="h-6 w-6 text-gray-800" />
                            </div>
                            <div>
                              <p className="text-white font-medium text-lg drop-shadow-md">{user?.username || 'Người dùng'}</p>
                              <p className="text-gray-200 text-sm drop-shadow-sm">{user?.email || 'user@nicephim.com'}</p>
                            </div>
                          </div>

                          {/* Admin Links */}
                          <div className="border-t border-white/20 pt-4">
                            <div className="space-y-2">
                              <Link
                                href="/admin"
                                className="flex items-center px-3 py-2 text-sm text-white hover:bg-white/20 hover:text-white transition-colors rounded-lg"
                                onClick={() => setIsUserMenuOpen(false)}
                              >
                                <Cog6ToothIcon className="h-4 w-4 mr-3 text-white" />
                                Quản trị viên
                              </Link>

                              <Link
                                href="/admin/movies"
                                className="flex items-center px-3 py-2 text-sm text-white hover:bg-white/20 hover:text-white transition-colors rounded-lg"
                                onClick={() => setIsUserMenuOpen(false)}
                              >
                                <Cog6ToothIcon className="h-4 w-4 mr-3 text-white" />
                                Quản lý phim
                              </Link>

                              <Link
                                href="/admin/movies/new"
                                className="flex items-center px-3 py-2 text-sm text-white hover:bg-white/20 hover:text-white transition-colors rounded-lg"
                                onClick={() => setIsUserMenuOpen(false)}
                              >
                                <Cog6ToothIcon className="h-4 w-4 mr-3 text-white" />
                                Thêm phim mới
                              </Link>
                            </div>
                          </div>

                          {/* Logout */}
                          <div className="border-t border-white/20 pt-4">
                            <button
                              onClick={handleLogout}
                              className="flex items-center w-full px-3 py-2 text-sm text-red-300 hover:bg-red-500/20 hover:text-red-200 transition-colors rounded-lg"
                            >
                              <ArrowRightOnRectangleIcon className="h-4 w-4 mr-3 text-red-300" />
                              Đăng xuất
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                /* Login/Register Buttons */
                <div className="hidden sm:flex items-center space-x-3">
                  <Link
                    href="/dang-nhap"
                    className="px-4 py-2 text-sm font-medium text-gray-300 hover:text-white transition-all duration-300 border border-gray-600 hover:border-gray-400 rounded-lg hover:bg-gray-800/50"
                  >
                    Đăng nhập
                  </Link>
                  <Link
                    href="/dang-ky"
                    className="px-4 py-2 text-sm font-medium bg-gradient-to-r from-red-600 to-pink-600 text-white hover:from-red-700 hover:to-pink-700 transition-all duration-300 rounded-lg shadow-lg hover:shadow-xl"
                  >
                    Đăng ký
                  </Link>
                </div>
              )}

              {/* Mobile Menu Button */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="md:hidden text-gray-400 hover:text-white transition-colors p-2 rounded-lg hover:bg-gray-800/50"
              >
                <Bars3Icon className="h-6 w-6" />
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden bg-black/95 backdrop-blur-md border-t border-gray-800/50">
            <div className="px-4 py-4 space-y-2">
              {[
                { href: "/chu-de", label: "Chủ Đề" },
                { href: "/the-loai", label: "Thể Loại" },
                { href: "/phim-le", label: "Phim Lẻ" },
                { href: "/phim-bo", label: "Phim Bộ" },
                { href: "/xem-chung", label: "Xem Chung" }
              ].map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="block px-4 py-3 text-gray-300 hover:text-white hover:bg-gray-800/50 rounded-lg transition-colors"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {item.label}
                </Link>
              ))}

              {!isLoggedIn && (
                <div className="pt-4 border-t border-gray-800/50 space-y-3">
                  <Link
                    href="/dang-nhap"
                    className="block w-full px-4 py-3 text-center text-sm font-medium text-gray-300 hover:text-white border border-gray-600 hover:border-gray-400 rounded-lg hover:bg-gray-800/50 transition-colors"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Đăng nhập
                  </Link>
                  <Link
                    href="/dang-ky"
                    className="block w-full px-4 py-3 text-center text-sm font-medium bg-gradient-to-r from-red-600 to-pink-600 text-white hover:from-red-700 hover:to-pink-700 transition-colors rounded-lg"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Đăng ký
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </header>

      {/* Search Modal */}
      <SearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </>
  );
}