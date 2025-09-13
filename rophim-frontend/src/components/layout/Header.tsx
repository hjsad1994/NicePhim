'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Menu, MenuButton, MenuItem, MenuItems, Transition } from '@headlessui/react';
import {
  UserIcon,
  BellIcon,
  ChevronDownIcon
} from '@heroicons/react/24/outline';
import { ROUTES, MOVIE_GENRES, COUNTRIES } from '@/constants';

export function Header() {
  const [searchQuery, setSearchQuery] = useState('');
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  // Check for logged in user on component mount
  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      try {
        setUser(JSON.parse(userData));
      } catch (error) {
        console.error('Error parsing user data:', error);
        localStorage.removeItem('user');
      }
    }
    setIsLoading(false);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('user');
    setUser(null);
    router.push('/');
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.location.href = `/tim-kiem?q=${encodeURIComponent(searchQuery.trim())}`;
    }
  };

  return (
    <header className="sticky top-0 z-50" style={{backgroundColor: 'var(--bg-4)'}}>
      <div className="w-[90%] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Left Section: Logo + Search */}
          <div className="flex items-center space-x-6">
            {/* Logo */}
            <Link href={ROUTES.HOME} className="flex items-center space-x-2 flex-shrink-0">
              <div className="w-8 h-8 bg-red-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">N</span>
              </div>
              <span className="text-white font-bold text-xl">NicePhim</span>
            </Link>

            {/* Search Bar */}
            <form onSubmit={handleSearch} className="hidden md:flex">
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Tìm kiếm phim..."
                  className="px-4 py-2 w-64 lg:w-80 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                />
              </div>
            </form>
          </div>

          {/* Center Section: Navigation Menu */}
          <nav className="hidden lg:flex items-center space-x-6">
            {/* Chủ đề Dropdown */}
            <Menu as="div" className="relative">
              <MenuButton className="flex items-center text-gray-300 hover:text-white transition-colors">
                Chủ đề
                <ChevronDownIcon className="ml-1 h-4 w-4" />
              </MenuButton>
              <Transition
                enter="transition ease-out duration-100"
                enterFrom="transform opacity-0 scale-95"
                enterTo="transform opacity-100 scale-100"
                leave="transition ease-in duration-75"
                leaveFrom="transform opacity-100 scale-100"
                leaveTo="transform opacity-0 scale-95"
              >
                <MenuItems className="absolute left-0 mt-2 w-56 origin-top-left rounded-md bg-gray-800 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-50">
                  <div className="py-1">
                    {MOVIE_GENRES.map((genre) => (
                      <MenuItem key={genre.id}>
                        <Link
                          href={`/the-loai/${genre.slug}`}
                          className="block px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-white"
                        >
                          {genre.name}
                        </Link>
                      </MenuItem>
                    ))}
                  </div>
                </MenuItems>
              </Transition>
            </Menu>

            {/* Thể loại Dropdown */}
            <Menu as="div" className="relative">
              <MenuButton className="flex items-center text-gray-300 hover:text-white transition-colors">
                Thể loại
                <ChevronDownIcon className="ml-1 h-4 w-4" />
              </MenuButton>
              <Transition
                enter="transition ease-out duration-100"
                enterFrom="transform opacity-0 scale-95"
                enterTo="transform opacity-100 scale-100"
                leave="transition ease-in duration-75"
                leaveFrom="transform opacity-100 scale-100"
                leaveTo="transform opacity-0 scale-95"
              >
                <MenuItems className="absolute left-0 mt-2 w-56 origin-top-left rounded-md bg-gray-800 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-50">
                  <div className="py-1">
                    {MOVIE_GENRES.map((genre) => (
                      <MenuItem key={genre.id}>
                        <Link
                          href={`/the-loai/${genre.slug}`}
                          className="block px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-white"
                        >
                          {genre.name}
                        </Link>
                      </MenuItem>
                    ))}
                  </div>
                </MenuItems>
              </Transition>
            </Menu>

            {/* Phim lẻ */}
            <Link href="/phim-le" className="text-gray-300 hover:text-white transition-colors">
              Phim lẻ
            </Link>

            {/* Phim bộ */}
            <Link href="/phim-bo" className="text-gray-300 hover:text-white transition-colors">
              Phim bộ
            </Link>

            {/* Xem chung */}
            <Link href="/xem-chung" className="text-gray-300 hover:text-white transition-colors">
              Xem chung
            </Link>

            {/* Quốc gia Dropdown */}
            <Menu as="div" className="relative">
              <MenuButton className="flex items-center text-gray-300 hover:text-white transition-colors">
                Quốc gia
                <ChevronDownIcon className="ml-1 h-4 w-4" />
              </MenuButton>
              <Transition
                enter="transition ease-out duration-100"
                enterFrom="transform opacity-0 scale-95"
                enterTo="transform opacity-100 scale-100"
                leave="transition ease-in duration-75"
                leaveFrom="transform opacity-100 scale-100"
                leaveTo="transform opacity-0 scale-95"
              >
                <MenuItems className="absolute left-0 mt-2 w-48 origin-top-left rounded-md bg-gray-800 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-50">
                  <div className="py-1">
                    {COUNTRIES.map((country) => (
                      <MenuItem key={country.id}>
                        <Link
                          href={`/quoc-gia/${country.id}`}
                          className="block px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-white"
                        >
                          {country.name}
                        </Link>
                      </MenuItem>
                    ))}
                  </div>
                </MenuItems>
              </Transition>
            </Menu>

            {/* Diễn viên */}
            <Link href="/dien-vien" className="text-gray-300 hover:text-white transition-colors">
              Diễn viên
            </Link>

            {/* Lịch chiếu */}
            <Link href="/lich-chieu" className="text-gray-300 hover:text-white transition-colors">
              Lịch chiếu
            </Link>
          </nav>

          {/* Right Section: Auth Links */}
          <div className="flex items-center space-x-4">
            {!isLoading && (
              <>
                {user ? (
                  // Logged in user menu
                  <Menu as="div" className="relative">
                    <MenuButton className="flex items-center text-white hover:text-gray-300 transition-colors">
                      <UserIcon className="h-6 w-6 mr-2" />
                      <span className="text-sm font-medium">
                        Chào {user.display_name || user.username}
                      </span>
                      <ChevronDownIcon className="ml-1 h-4 w-4" />
                    </MenuButton>
                    <Transition
                      enter="transition ease-out duration-100"
                      enterFrom="transform opacity-0 scale-95"
                      enterTo="transform opacity-100 scale-100"
                      leave="transition ease-in duration-75"
                      leaveFrom="transform opacity-100 scale-100"
                      leaveTo="transform opacity-0 scale-95"
                    >
                      <MenuItems className="absolute right-0 mt-2 w-48 origin-top-right rounded-md bg-gray-800 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-50">
                        <div className="py-1">
                          <MenuItem>
                            <Link
                              href={ROUTES.PROFILE}
                              className="block px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-white"
                            >
                              Tài khoản của tôi
                            </Link>
                          </MenuItem>
                          <MenuItem>
                            <Link
                              href="/admin"
                              className="block px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-white"
                            >
                              Quản trị hệ thống
                            </Link>
                          </MenuItem>
                          <MenuItem>
                            <Link
                              href="/thong-bao"
                              className="block px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-white"
                            >
                              Thông báo
                            </Link>
                          </MenuItem>
                          <MenuItem>
                            <button
                              onClick={handleLogout}
                              className="block w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-white"
                            >
                              Đăng xuất
                            </button>
                          </MenuItem>
                        </div>
                      </MenuItems>
                    </Transition>
                  </Menu>
                ) : (
                  // Not logged in - show auth links
                  <>
                    <Link
                      href={ROUTES.SIGN_UP}
                      className="text-gray-300 hover:text-white transition-colors text-sm font-medium"
                    >
                      Đăng ký
                    </Link>
                    <Link
                      href={ROUTES.SIGN_IN}
                      className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors text-sm font-medium"
                    >
                      Đăng nhập
                    </Link>
                  </>
                )}
              </>
            )}

            {/* Notification Icon - only show when logged in */}
            {user && (
              <Link
                href="/thong-bao"
                className="text-gray-300 hover:text-white p-2 rounded-md transition-colors relative"
                aria-label="Thông báo"
              >
                <BellIcon className="h-6 w-6" />
                {/* Notification Badge */}
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  3
                </span>
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
