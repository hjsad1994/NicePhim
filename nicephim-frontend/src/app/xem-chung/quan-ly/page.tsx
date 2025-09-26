'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ApiService, MovieResponse } from '@/lib/api';
import { Movie } from '@/types/movie';

interface Room {
  id: string;
  backendRoomId?: string;
  name: string;
  movie: Movie;
  creator: string;
  createdBy: string;
  isPrivate: boolean;
  autoStart: boolean;
  broadcastStartTimeType?: string;
  scheduledStartTime?: number;
  broadcastStatus?: string;
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

      const currentUser = user || localStorage.getItem('watchTogetherUser');
      if (!currentUser) {
        setRooms([]);
        return;
      }

      // Load rooms from backend API
      try {
        console.log('🔄 Loading rooms for user:', currentUser);
        const response = await fetch(`http://localhost:8080/api/rooms/user/${currentUser}`);
        console.log('Rooms API response status:', response.status);

        if (response.ok) {
          const data = await response.json();
          console.log('Rooms API response data:', data);

          if (data.success && data.data) {
            // Convert backend rooms to frontend format
            const backendRooms = data.data.map((backendRoom: any) => {
              // Create a fallback movie if no movie data
              const fallbackMovie: Movie = {
                id: backendRoom.movie_id || 'default-movie',
                title: 'Unknown Movie',
                slug: 'unknown-movie',
                description: '',
                poster: '/placeholder-movie.jpg',
                releaseYear: 2023,
                duration: 120,
                imdbRating: 0,
                genres: [],
                country: 'Unknown',
                status: 'completed',
                quality: 'HD',
                language: 'vi',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                viewCount: 0,
                likeCount: 0,
                isHot: false,
                isFeatured: false
              };

              return {
                id: backendRoom.room_id,
                backendRoomId: backendRoom.room_id,
                name: backendRoom.name,
                movie: fallbackMovie,
                creator: currentUser,
                createdBy: currentUser,
                isPrivate: backendRoom.is_private || false,
                autoStart: backendRoom.broadcast_status === 'scheduled',
                broadcastStartTimeType: backendRoom.broadcast_start_time_type,
                scheduledStartTime: backendRoom.scheduled_start_time,
                broadcastStatus: backendRoom.broadcast_status,
                createdAt: backendRoom.created_at,
                participants: 0 // TODO: Get actual participant count
              };
            });

            setRooms(backendRooms);
            console.log('📋 Loaded rooms from backend:', backendRooms);
            return;
          } else {
            console.warn('Backend API returned success:false or no data:', data);
          }
        } else {
          console.warn('Backend API returned non-200 status:', response.status);
          try {
            const errorText = await response.text();
            console.error('Backend API error response:', errorText);
          } catch (e) {
            console.error('Could not read error response body');
          }
        }
      } catch (error) {
        console.error('Error loading rooms from backend:', error);
        // Log more details about the error
        if (error instanceof Error) {
          console.error('Error details:', error.message, error.stack);
        }
      }

      // Fallback to localStorage if backend fails
      let savedRooms: Room[] = [];
      try {
        const roomsData = localStorage.getItem('watchTogetherRooms');
        if (roomsData) {
          savedRooms = JSON.parse(roomsData);
        }
      } catch (error) {
        console.error('Error reading rooms from localStorage:', error);
      }

      const userRooms = savedRooms.filter(room =>
        room.creator === currentUser || room.createdBy === currentUser
      );

      setRooms(userRooms);
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

  const deleteRoom = async (roomId: string, backendRoomId?: string) => {
    if (!confirm('Bạn có chắc chắn muốn xóa phòng này? Hành động này không thể hoàn tác.')) {
      return;
    }

    try {
      // Try to delete from backend first
      if (backendRoomId) {
        const response = await fetch(`http://localhost:8080/api/rooms/${backendRoomId}?username=${user}`, {
          method: 'DELETE',
        });

        if (response.ok) {
          // Remove from local state
          setRooms(prev => prev.filter(room => room.id !== roomId));

          // Remove from localStorage
          try {
            const savedRooms = JSON.parse(localStorage.getItem('watchTogetherRooms') || '[]');
            const updatedRooms = savedRooms.filter((room: any) => room.id !== roomId && room.backendRoomId !== backendRoomId);
            localStorage.setItem('watchTogetherRooms', JSON.stringify(updatedRooms));
          } catch (error) {
            console.error('Error updating localStorage:', error);
          }

          alert('Đã xóa phòng thành công!');
          return;
        } else {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to delete room');
        }
      } else {
        // If no backend ID, just remove from localStorage
        try {
          const savedRooms = JSON.parse(localStorage.getItem('watchTogetherRooms') || '[]');
          const updatedRooms = savedRooms.filter((room: any) => room.id !== roomId);
          localStorage.setItem('watchTogetherRooms', JSON.stringify(updatedRooms));

          setRooms(prev => prev.filter(room => room.id !== roomId));
          alert('Đã xóa phòng thành công!');
        } catch (error) {
          console.error('Error deleting room from localStorage:', error);
          alert('Đã xảy ra lỗi khi xóa phòng');
        }
      }
    } catch (error) {
      console.error('Error deleting room:', error);
      alert('Đã xảy ra lỗi khi xóa phòng: ' + (error as Error).message);
    }
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

                  {/* Room Status */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    {room.isPrivate && (
                      <div className="px-2 py-1 bg-green-500/20 border border-green-500/30 rounded-full text-green-400 text-xs font-medium">
                        🔒 Riêng tư
                      </div>
                    )}

                    {room.broadcastStartTimeType && room.broadcastStartTimeType !== 'now' && (
                      <div className="px-2 py-1 bg-yellow-500/20 border border-yellow-500/30 rounded-full text-yellow-400 text-xs font-medium">
                        ⏰ Bắt đầu sau {room.broadcastStartTimeType} phút
                      </div>
                    )}

                    {room.broadcastStatus === 'live' && (
                      <div className="px-2 py-1 bg-red-500/20 border border-red-500/30 rounded-full text-red-400 text-xs font-medium">
                        📺 Đang phát
                      </div>
                    )}

                    {room.broadcastStatus === 'scheduled' && (
                      <div className="px-2 py-1 bg-blue-500/20 border border-blue-500/30 rounded-full text-blue-400 text-xs font-medium">
                        ⏳ Đã lên lịch
                      </div>
                    )}
                  </div>

                  {/* Room Actions */}
                  <div className="flex items-center justify-between pt-4 border-t border-gray-400/20">
                    <div className="flex items-center gap-2 text-xs text-gray-400">
                      {room.creator === user ? (
                        <span className="flex items-center gap-1 text-purple-400">
                          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                          Bạn tạo phòng này
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-gray-400">
                          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-6-3a2 2 0 11-4 0 2 2 0 014 0zm-2 4a5 5 0 00-4.546 2.916A5.986 5.986 0 005 10a6 6 0 0012 0c0 .35-.029.693-.084 1.016A5 5 0 0010 11z" clipRule="evenodd" />
                          </svg>
                          Người tham gia
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      {room.creator === user && (
                        <button
                          onClick={() => deleteRoom(room.id, room.backendRoomId)}
                          className="px-3 py-2 bg-red-500/20 hover:bg-red-500/30 border border-red-500/50 text-red-400 rounded-lg transition-all duration-300 text-sm flex items-center gap-2"
                          title="Xóa phòng"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                          Xóa
                        </button>
                      )}
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
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

