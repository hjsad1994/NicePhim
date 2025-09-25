'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ApiService, MovieResponse } from '@/lib/api';
import { Movie } from '@/types/movie';

interface Room {
  id: string;
  name: string;
  movie: Movie;
  creator: string;
  isPrivate: boolean;
  autoStart: boolean;
  createdAt: string;
  participants: number;
}

export default function QuanLyXemChungPage() {
  const router = useRouter();
  const [rooms, setRooms] = useState<Room[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState('');

  // Convert MovieResponse to Movie type
  const convertToMovie = (movieResponse: MovieResponse): Movie => {
    const slug = movieResponse.aliasTitle || movieResponse.title.toLowerCase().split(' ').join('-');
    return {
      id: movieResponse.movieId,
      title: movieResponse.title,
      slug: slug,
      description: movieResponse.description || '',
      poster: movieResponse.posterUrl || '/placeholder-movie.jpg',
      banner: movieResponse.bannerUrl,
      releaseYear: movieResponse.releaseYear || new Date().getFullYear(),
      duration: 120,
      imdbRating: movieResponse.imdbRating,
      genres: (movieResponse.genres || []).map(genre => ({
        id: genre.genreId,
        name: genre.name,
        slug: genre.name.toLowerCase().split(' ').join('-')
      })),
      country: 'Vietnam',
      status: 'completed' as const,
      quality: 'HD',
      language: 'vi',
      createdAt: movieResponse.createdAt,
      updatedAt: movieResponse.updatedAt || movieResponse.createdAt,
      viewCount: 0,
      likeCount: 0,
      isHot: false,
      isFeatured: false
    };
  };

  const loadRooms = async () => {
    try {
      setIsLoading(true);

      // Try to load rooms from localStorage first
      let savedRooms: Room[] = [];
      try {
        const roomsData = localStorage.getItem('watchTogetherRooms');
        if (roomsData) {
          savedRooms = JSON.parse(roomsData);
          console.log('📋 Loaded rooms from localStorage:', savedRooms);
        }
      } catch (error) {
        console.error('❌ Error reading rooms from localStorage:', error);
      }

      // Filter rooms that belong to current user or add sample rooms if none exist
      const currentUser = user || localStorage.getItem('watchTogetherUser');
      const userRooms = savedRooms.filter(room =>
        room.creator === currentUser || room.createdBy === currentUser
      );

      // If no rooms found for user, show empty state (no fallback)
      if (userRooms.length === 0) {
        console.log('📋 No rooms found for user:', currentUser);
        setRooms([]);
      } else {
        setRooms(userRooms);
        console.log('📋 Set user rooms:', userRooms);
      }
    } catch (error) {
      console.error('Error loading rooms:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Load user from localStorage
    const savedUser = localStorage.getItem('watchTogetherUser');
    if (savedUser) {
      setUser(savedUser);
    } else {
      // If no user set, redirect to create room page
      router.push('/xem-chung/tao-moi');
    }
  }, [router]);

  useEffect(() => {
    if (user) {
      loadRooms();
    }
  }, [user]);

  const joinRoom = (roomId: string) => {
    // In a real app, this would join the WebSocket room
    router.push(`/xem-chung/phong/${roomId}`);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-red-600 mx-auto mb-4"></div>
          <div className="text-white text-xl">Đang tải phòng xem chung...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      <div className="relative w-[90%] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <nav className="flex items-center space-x-2 text-sm text-gray-400 mb-4">
            <Link href="/" className="hover:text-red-400 transition-colors">
              Trang chủ
            </Link>
            <span>/</span>
            <Link href="/xem-chung" className="hover:text-red-400 transition-colors">
              Xem chung
            </Link>
            <span>/</span>
            <span className="text-white">Quản lý</span>
          </nav>

          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-4xl font-bold text-white mb-2 bg-gradient-to-r from-red-400 to-pink-400 bg-clip-text text-transparent">
                Phòng xem chung của bạn
              </h1>
              <p className="text-gray-400">Quản lý các phòng xem phim đã tạo và tham gia</p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={loadRooms}
                className="px-4 py-3 bg-gray-600/20 hover:bg-gray-600/30 border border-gray-500/50 text-white rounded-xl transition-all duration-300 flex items-center gap-2"
                title="Làm mới danh sách phòng"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Làm mới
              </button>
              <Link
                href="/xem-chung/tao-moi"
                className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300 transform hover:scale-[1.02] shadow-lg hover:shadow-xl flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Tạo phòng mới
              </Link>
            </div>
          </div>
        </div>

        {/* User Info */}
        <div className="bg-[#23242F] border border-gray-400/20 rounded-2xl p-6 mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center">
                <span className="text-white font-bold text-lg">{user.charAt(0).toUpperCase()}</span>
              </div>
              <div>
                <h2 className="text-white font-semibold text-lg">{user}</h2>
                <p className="text-gray-400 text-sm">Đã tham gia {rooms.length} phòng</p>
              </div>
            </div>
            <button
              onClick={() => {
                localStorage.removeItem('watchTogetherUser');
                router.push('/xem-chung/tao-moi');
              }}
              className="px-4 py-2 border border-gray-400/30 text-white hover:bg-white/10 rounded-lg transition-colors text-sm"
            >
              Đổi tên người dùng
            </button>
          </div>
        </div>

        {/* Rooms List */}
        {rooms.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🎬</div>
            <h3 className="text-xl font-semibold text-white mb-2">Chưa có phòng nào</h3>
            <p className="text-gray-400 mb-6">Hãy tạo phòng mới hoặc tham gia phòng có sẵn</p>
            <Link
              href="/xem-chung/tao-moi"
              className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300 inline-flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Tạo phòng đầu tiên
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {rooms.map((room) => (
              <div
                key={room.id}
                className="border-2 border-gray-400/15 rounded-2xl overflow-hidden bg-[#23242F] hover:border-red-500/30 transition-all duration-300 group"
              >
                {/* Room Header */}
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-white mb-2 group-hover:text-red-400 transition-colors">
                        {room.name}
                      </h3>
                      <div className="flex items-center gap-4 text-sm text-gray-400">
                        <span className="flex items-center gap-1">
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                          </svg>
                          {room.creator}
                        </span>
                        <span className="flex items-center gap-1">
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
                          </svg>
                          {room.participants} người
                        </span>
                      </div>
                    </div>
                    {room.isPrivate && (
                      <div className="px-2 py-1 bg-green-500/20 border border-green-500/30 rounded-full text-green-400 text-xs font-medium">
                        Riêng tư
                      </div>
                    )}
                  </div>

                  {/* Movie Info */}
                  <div className="flex gap-4 mb-4">
                    <div className="relative w-20 h-28 rounded-lg overflow-hidden flex-shrink-0">
                      <img
                        src={room.movie.poster}
                        alt={room.movie.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1">
                      <h4 className="text-white font-medium mb-1">{room.movie.title}</h4>
                      <p className="text-gray-400 text-sm mb-2 line-clamp-2">
                        {room.movie.description}
                      </p>
                      <div className="flex items-center gap-2 text-xs text-gray-400">
                        <span>{room.movie.duration} phút</span>
                        <span>•</span>
                        <span>{room.movie.releaseYear}</span>
                        <span>•</span>
                        <span className="text-yellow-400">⭐ {room.movie.imdbRating}</span>
                      </div>
                    </div>
                  </div>

                  {/* Room Actions */}
                  <div className="flex items-center justify-between pt-4 border-t border-gray-400/20">
                    <div className="flex items-center gap-2 text-xs text-gray-400">
                      {room.autoStart ? (
                        <span className="flex items-center gap-1 text-blue-400">
                          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                          </svg>
                          Tự động bắt đầu
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-gray-400">
                          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 00-1 1v2a1 1 0 102 0V9a1 1 0 00-1-1zm6 0a1 1 0 00-1 1v2a1 1 0 102 0V9a1 1 0 00-1-1z" clipRule="evenodd" />
                          </svg>
                          Thủ công
                        </span>
                      )}
                    </div>
                    <button
                      onClick={() => joinRoom(room.id)}
                      className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-medium py-2 px-4 rounded-lg transition-all duration-300 text-sm flex items-center gap-2"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Tham gia phòng
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

