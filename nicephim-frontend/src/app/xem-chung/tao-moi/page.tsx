'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect, use } from 'react';

// Add particle state type
interface Particle {
  key: number;
  left: number;
  top: number;
  delay: number;
  duration: number;
}
import { useRouter } from 'next/navigation';
import { ApiService, MovieResponse } from '@/lib/api';
import { Movie } from '@/types/movie';
import { useAuth } from '@/hooks/useAuth';

interface TaoPhongXemChungPageProps {
  searchParams: Promise<{
    movie?: string;
  }>;
}

export default function TaoPhongXemChungPage({ searchParams }: TaoPhongXemChungPageProps) {
  const router = useRouter();
  const resolvedSearchParams = use(searchParams);
  const { user, isLoggedIn } = useAuth();
  const [particles, setParticles] = useState<Particle[]>([]);
  const [movie, setMovie] = useState<Movie | null>(null);
  const [movies, setMovies] = useState<Movie[]>([]); // Store all movies for poster selection
  const [isLoading, setIsLoading] = useState(true);
  const [roomName, setRoomName] = useState<string>('');
  const [autoStart, setAutoStart] = useState<boolean>(false);
  const [privateOnly, setPrivateOnly] = useState<boolean>(false);
  const [isCreating, setIsCreating] = useState<boolean>(false);
  const [broadcastStartTimeType, setBroadcastStartTimeType] = useState<string>('now');

  useEffect(() => {
    // Create particles only on client side to avoid hydration mismatch
    const newParticles = [...Array(15)].map((_, i) => ({
      key: i,
      left: Math.random() * 100,
      top: Math.random() * 100,
      delay: Math.random() * 3,
      duration: 2 + Math.random() * 3
    }));
    setParticles(newParticles);
  }, []);

  // Convert MovieResponse to Movie type for compatibility
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
      duration: 120, // Default duration in minutes
      imdbRating: movieResponse.imdbRating,
      genres: (movieResponse.genres || []).map(genre => ({
        id: genre.genreId,
        name: genre.name,
        slug: genre.name.toLowerCase().split(' ').join('-')
      })),
      country: 'Vietnam', // Default country
      status: 'completed' as const,
      quality: 'HD', // Default quality
      language: 'vi', // Default language
      createdAt: movieResponse.createdAt,
      updatedAt: movieResponse.updatedAt || movieResponse.createdAt,
      viewCount: 0, // Default view count
      likeCount: 0, // Default like count
      isHot: false,
      isFeatured: false
    };
  };

  // Load movie data
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);

        // Create realistic fallback movie
        const createFallbackMovie = (): Movie => ({
          id: 'watch-together-movie',
          title: 'Spider-Man: No Way Home',
          slug: 'spider-man-no-way-home',
          description: 'Peter Parker được huyền thoại Doctor Strange giúp đỡ để khôi phục bí mật danh tính của anh ta. Khi một câu thần chú bị sai, những kẻ thù nguy hiểm từ các thế giới khác bắt đầu xuất hiện, buộc Peter phải khám phá ra ý nghĩa thực sự của việc trở thành Người Nhện.',
          poster: 'https://image.tmdb.org/t/p/w500/1g0dhYtq4irTY1GPXvft6k4YLjm.jpg',
          banner: 'https://image.tmdb.org/t/p/w1280/14QbnygCuTO0vl7CAFmPf1fgZfV.jpg',
          releaseYear: 2021,
          duration: 148,
          imdbRating: 8.4,
          genres: [
            { id: '1', name: 'Hành Động', slug: 'hanh-dong' },
            { id: '2', name: 'Phiêu Lưu', slug: 'phieu-luu' },
            { id: '3', name: 'Khoa Học Viễn Tưởng', slug: 'khoa-hoc-vien-tuong' }
          ],
          country: 'Hoa Kỳ',
          status: 'completed',
          quality: 'FullHD',
          language: 'vi',
          createdAt: '2023-01-01T00:00:00Z',
          updatedAt: '2023-01-01T00:00:00Z',
          viewCount: 1250000,
          likeCount: 45000,
          isHot: true,
          isFeatured: true
        });

        try {
          // Try to get movies from database
          const moviesResponse = await Promise.race([
            ApiService.getMovies(0, 100),
            new Promise((_, reject) =>
              setTimeout(() => reject(new Error('API timeout')), 5000)
            )
          ]) as PromiseSettledResult<unknown>[];

          if (moviesResponse.success && moviesResponse.data && moviesResponse.data.length > 0) {
            // Convert MovieResponse to Movie
            const convertedMovies = moviesResponse.data.map(convertToMovie);
            setMovies(convertedMovies); // Store all movies for poster selection

            // If movie slug is provided in search params, find that specific movie
            if (resolvedSearchParams.movie) {
              const foundMovie = convertedMovies.find(m => m.slug === resolvedSearchParams.movie);
              if (foundMovie) {
                setMovie(foundMovie);
                setRoomName('Cùng xem ' + foundMovie.title + ' nhé');
              } else {
                setMovie(convertedMovies[0]);
                setRoomName('Cùng xem ' + convertedMovies[0].title + ' nhé');
              }
            } else {
              // Use first movie if no specific movie requested
              setMovie(convertedMovies[0]);
              setRoomName('Cùng xem ' + convertedMovies[0].title + ' nhé');
            }
          } else {
            console.log('No movies in database, using fallback');
            setMovie(createFallbackMovie());
            setRoomName('Cùng xem Spider-Man: No Way Home nhé');
          }
        } catch (apiError) {
          console.error('API call failed:', apiError);
          setMovie(createFallbackMovie());
          setRoomName('Cùng xem Spider-Man: No Way Home nhé');
        }

      } catch (error) {
        console.error('Unexpected error:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [resolvedSearchParams.movie]);

  
  // Generate posters from available movies in database
  const posters = movies.length > 0 ? movies.slice(0, 6).map((m) => ({
    alt: m.title,
    src: m.poster,
    movie: m, // Store movie object for selection
    id: m.id
  })) : [
    // Fallback posters if no movies in database
    {
      alt: 'poster 1',
      src: movie?.poster || 'https://image.tmdb.org/t/p/w500/1g0dhYtq4irTY1GPXvft6k4YLjm.jpg',
      movie: movie,
      id: 'fallback-1'
    },
    {
      alt: 'poster 2',
      src: movie?.banner || 'https://image.tmdb.org/t/p/w1280/14QbnygCuTO0vl7CAFmPf1fgZfV.jpg',
      movie: movie,
      id: 'fallback-2'
    },
    {
      alt: 'poster 3',
      src: 'https://image.tmdb.org/t/p/w500/dDlEmu3EZ0Pgg93K2SVNLCjCSvE.jpg',
      movie: movie,
      id: 'fallback-3'
    },
  ];
  const [activePoster, setActivePoster] = useState<number>(0);

  // Handle poster selection - update the selected movie when user clicks a poster
  const handlePosterSelect = (index: number) => {
    setActivePoster(index);
    const selectedPoster = posters[index];
    if (selectedPoster.movie) {
      setMovie(selectedPoster.movie);
      setRoomName('Cùng xem ' + selectedPoster.movie.title + ' nhé');
    }
  };

  const handleCreate = async () => {
    if (!roomName || roomName.length < 10) {
      alert('Vui lòng nhập tên phòng có ít nhất 10 ký tự');
      return;
    }

    if (!movie) {
      alert('Vui lòng chọn phim để tạo phòng');
      return;
    }

    if (!isLoggedIn || !user) {
      alert('Vui lòng đăng nhập trước khi tạo phòng xem chung');
      router.push('/dang-nhap');
      return;
    }

    console.log('Selected movie:', movie);
    console.log('Movie ID:', movie.id);
    if (!movie.id) {
      alert('Phim được chọn không có ID hợp lệ');
      return;
    }

    setIsCreating(true);

    try {
      // Use authenticated user's username
      const currentUser = user.username;

      // Create room data structure
      const roomId = 'room_' + Date.now();
      const selectedPoster = posters[activePoster];

      const roomData = {
        id: roomId,
        name: roomName,
        movie: movie,
        poster: selectedPoster.src,
        autoStart,
        isPrivate: privateOnly,
        broadcastStartTimeType,
        createdBy: user.id, // Use user ID (UUID) instead of username
        creator: currentUser, // Store username separately for display
        createdAt: new Date().toISOString(),
        hlsUrl: movie.hlsUrl || `http://localhost:8080/videos/${movie.id}/master.m3u8`
      };

      // Check if movie ID is a valid UUID format, if not, don't send movieId
      let movieIdToSend = null;
      console.log('🎬 Movie ID validation:', { id: movie.id, type: typeof movie.id });

      if (movie.id) {
        // Try to validate as UUID (accept both with and without hyphens)
        const uuidWithHyphens = movie.id.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i);
        const uuidWithoutHyphens = movie.id.match(/^[0-9a-f]{32}$/i);

        if (uuidWithHyphens) {
          movieIdToSend = movie.id;
          console.log('✅ Movie ID is valid UUID with hyphens:', movie.id);
        } else if (uuidWithoutHyphens) {
          // Format UUID without hyphens to proper format
          movieIdToSend = movie.id.match(/([0-9a-f]{8})([0-9a-f]{4})([0-9a-f]{4})([0-9a-f]{4})([0-9a-f]{12})/i);
          if (movieIdToSend) {
            movieIdToSend = `${movieIdToSend[1]}-${movieIdToSend[2]}-${movieIdToSend[3]}-${movieIdToSend[4]}-${movieIdToSend[5]}`;
            console.log('✅ Formatted UUID without hyphens to:', movieIdToSend);
          }
        } else {
          console.log('❌ Movie ID is not a valid UUID format:', movie.id);
        }
      }

      // Call backend API to create room
      const requestData = {
        name: roomName,
        username: currentUser,
        movieId: movieIdToSend,
        broadcastStartTimeType: broadcastStartTimeType
      };

      console.log('Sending room creation request:', requestData);

      const response = await fetch('http://localhost:8080/api/rooms', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Backend error response:', errorData);
        throw new Error(errorData.error || 'Failed to create room');
      }

      const backendRoom = await response.json();

      // Save room to localStorage with backend room ID and proper creator info
      try {
        const existingRooms = JSON.parse(localStorage.getItem('watchTogetherRooms') || '[]');
        const roomWithBackendId = {
          ...roomData,
          id: backendRoom.room_id,
          backendRoomId: backendRoom.room_id,
          createdBy: backendRoom.created_by || user.id, // Use backend created_by (UUID) or user.id as fallback
          creator: user.username
        };
        existingRooms.push(roomWithBackendId);
        localStorage.setItem('watchTogetherRooms', JSON.stringify(existingRooms));
        console.log('Room saved to localStorage:', roomWithBackendId);
      } catch (error) {
        console.error('Error saving room to localStorage:', error);
      }

      // Calculate broadcast time for display
      let broadcastTimeText = 'Bắt đầu ngay';
      if (broadcastStartTimeType !== 'now') {
        const minutes = parseInt(broadcastStartTimeType);
        broadcastTimeText = `Bắt đầu sau ${minutes} phút`;
      }

      // Show success message
      alert('Đã tạo phòng "' + roomName + '" thành công!' +
            '\n\nPhim: ' + movie.title +
            '\nLoại phòng: ' + (privateOnly ? 'Riêng tư' : 'Công khai') +
            '\n' + broadcastTimeText +
            '\nMã phòng: ' + backendRoom.room_id);

      // Redirect to the newly created room
      setTimeout(() => {
        router.push(`/xem-chung/phong/${backendRoom.room_id}`);
      }, 500);

    } catch (error) {
      alert('Đã xảy ra lỗi khi tạo phòng. Vui lòng thử lại!');
      console.error('Room creation error:', error);
    } finally {
      setIsCreating(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-red-600 mx-auto mb-4"></div>
          <div className="text-white text-xl">Đang tải thông tin phim...</div>
        </div>
      </div>
    );
  }

  if (!movie) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="text-center">
          <div className="text-6xl mb-4">🎬</div>
          <h1 className="text-2xl font-bold text-white mb-4">Không thể tải thông tin phim</h1>
          <p className="text-gray-400 mb-6">Vui lòng thử lại sau</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black relative overflow-hidden">
      {/* Modern Gradient Background */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-rose-600/10 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-pink-600/5 rounded-full blur-3xl animate-pulse delay-2000"></div>

      <div className="relative w-[90%] mx-auto px-4 sm:px-6 lg:px-8 py-8 z-10">
        {/* Modern Minimalist Header */}
        <div className="mb-12 pt-24">
          <div className="max-w-3xl mx-auto text-center">
            <Link
              href={`/phim/${movie.slug}`}
              className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-8 group"
            >
              <svg className="w-5 h-5 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              <span>Quay lại</span>
            </Link>
            
            <h1 className="text-5xl md:text-6xl font-black mb-4 tracking-tight">
              <span className="bg-gradient-to-r from-rose-500 via-pink-500 to-purple-500 bg-clip-text text-transparent">
                Tạo Phòng
              </span>
            </h1>
            <p className="text-xl text-gray-400 font-light">
              Cùng xem phim với bạn bè, mọi lúc mọi nơi
            </p>
          </div>
        </div>

        <div className="max-w-5xl mx-auto">
          {/* Main content */}
          <div className="space-y-6">
            {/* Enhanced Movie Card */}
            <div className="border-2 border-gray-400/15 rounded-2xl overflow-hidden bg-[#23242F]">
              <div className="relative p-6">
                <div className="flex gap-6">
                  {/* Enhanced Poster */}
                  <div className="relative group">
                    <div className="absolute -inset-1 bg-gradient-to-r from-red-500 to-purple-500 rounded-lg blur opacity-25 group-hover:opacity-40 transition duration-1000 group-hover:duration-200"></div>
                    <div className="relative w-[160px] h-[240px] overflow-hidden rounded-lg border-2 border-gray-400/20 shadow-2xl">
                      <Image
                        alt={movie.title}
                        src={movie.poster}
                        fill
                        className="object-cover transform group-hover:scale-105 transition-transform duration-500"
                        sizes="160px"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    </div>
                  </div>

                  {/* Enhanced Info */}
                  <div className="flex-1">
                    <h2 className="text-2xl font-bold text-white mb-3 group-hover:text-red-400 transition-colors">
                      <Link
                        title={movie.title}
                        href={`/phim/${movie.slug}`}
                        className="hover:text-red-400 transition-colors"
                      >
                        {movie.title}
                      </Link>
                    </h2>

                    {movie.releaseYear && (
                      <div className="text-red-400 font-semibold mb-4">{movie.releaseYear}</div>
                    )}

                    <div className="space-y-3">
                      {/* Enhanced Tags */}
                      <div className="flex flex-wrap gap-2">
                        <div className="px-3 py-1 rounded-full bg-gradient-to-r from-red-500/20 to-red-600/20 border border-red-500/30 text-white text-sm font-medium">
                          {movie.quality}
                        </div>
                        {movie.releaseYear && (
                          <div className="px-3 py-1 rounded-full bg-gray-600/40 border border-gray-500/30 text-white text-sm">
                            {movie.releaseYear}
                          </div>
                        )}
                        {movie.imdbRating && (
                          <div className="px-3 py-1 rounded-full bg-gradient-to-r from-yellow-500/20 to-yellow-600/20 border border-yellow-500/30 text-white text-sm font-medium flex items-center gap-1">
                            <span>⭐</span>
                            {movie.imdbRating}
                          </div>
                        )}
                      </div>

                      {/* Enhanced Genres */}
                      <div className="flex flex-wrap gap-2">
                        {movie.genres.map((genre) => (
                          <Link
                            key={genre.id}
                            href={`/the-loai/${genre.slug}`}
                            className="px-3 py-1 rounded-lg border border-gray-400/30 text-gray-200 text-sm hover:bg-white/10 hover:border-white/50 transition-all duration-300"
                          >
                            {genre.name}
                          </Link>
                        ))}
                      </div>

                      {/* Enhanced Description */}
                      <p className="text-gray-300/90 text-sm leading-relaxed line-clamp-3">
                        {movie.description}
                      </p>

                      {/* Enhanced Duration */}
                      <div className="flex items-center gap-2 pt-2">
                        <div className="w-8 h-8 rounded-full bg-red-500/20 border border-red-500/30 flex items-center justify-center">
                          <svg className="w-4 h-4 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                        <span className="text-white font-medium">{movie.duration} phút</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Enhanced Room Creation Form */}
            <div className="border-2 border-gray-400/15 rounded-2xl overflow-hidden bg-[#23242F]">
              <div className="relative p-6 space-y-8">
                {/* 1. Room Name */}
                <div className="group">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-r from-red-500/20 to-red-600/20 border border-red-500/30 flex items-center justify-center">
                      <span className="text-red-400 font-bold text-sm">1</span>
                    </div>
                    <h3 className="text-white font-semibold text-lg">Tên phòng</h3>
                  </div>
                  <div className="relative">
                    <input
                      className={`w-full px-4 py-4 rounded-xl bg-black/30 border-2 text-white placeholder:text-gray-400 outline-none transition-all duration-300 text-lg ${
                        roomName.length > 0 && roomName.length < 10
                          ? 'border-red-500/50 focus:border-red-500/70'
                          : 'border-gray-400/30 focus:border-red-500/50'
                      } focus:bg-black/40`}
                      placeholder="Nhập tên phòng của bạn..."
                      maxLength={100}
                      minLength={10}
                      type="text"
                      value={roomName}
                      onChange={(e) => setRoomName(e.target.value)}
                    />
                    <div className={`absolute right-3 top-1/2 -translate-y-1/2 text-sm ${
                      roomName.length > 0 && roomName.length < 10
                        ? 'text-red-400'
                        : 'text-gray-400'
                    }`}>
                      {roomName.length}/100
                    </div>
                    {roomName.length > 0 && roomName.length < 10 && (
                      <div className="absolute -bottom-6 left-0 text-red-400 text-sm">
                        Tên phòng cần ít nhất 10 ký tự
                      </div>
                    )}
                  </div>
                </div>

                {/* 1.5 User Authentication Status */}
                <div className="group">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500/20 to-blue-600/20 border border-blue-500/30 flex items-center justify-center">
                      <span className="text-blue-400 font-bold text-sm">1.5</span>
                    </div>
                    <h3 className="text-white font-semibold text-lg">Tài khoản</h3>
                    {!isLoggedIn && (
                      <span className="text-red-400 text-sm ml-auto">Bắt buộc</span>
                    )}
                  </div>

                  {isLoggedIn && user ? (
                    <div className="p-4 bg-green-500/10 border border-green-500/30 rounded-xl">
                      <div className="flex items-center gap-3 text-green-400">
                        <div className="w-10 h-10 rounded-full bg-green-500/20 border border-green-500/30 flex items-center justify-center">
                          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <div>
                          <div className="font-medium">Đã đăng nhập</div>
                          <div className="text-sm">{user.username}</div>
                          {user.display_name && (
                            <div className="text-sm text-green-300">{user.display_name}</div>
                          )}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl">
                      <div className="flex items-center gap-3 text-red-400">
                        <div className="w-10 h-10 rounded-full bg-red-500/20 border border-red-500/30 flex items-center justify-center">
                          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <div>
                          <div className="font-medium">Chưa đăng nhập</div>
                          <div className="text-sm">Bạn cần đăng nhập để tạo phòng xem chung</div>
                          <button
                            onClick={() => router.push('/dang-nhap')}
                            className="mt-2 px-4 py-2 bg-red-500/20 hover:bg-red-500/30 border border-red-500/50 text-white rounded-lg transition-all duration-300 text-sm font-medium"
                          >
                            Đăng nhập ngay
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* 2. Poster Selection */}
                <div className="group">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-500/20 to-purple-600/20 border border-purple-500/30 flex items-center justify-center">
                      <span className="text-purple-400 font-bold text-sm">2</span>
                    </div>
                    <h3 className="text-white font-semibold text-lg">Chọn poster hiển thị</h3>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    {posters.map((p, idx) => (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => handlePosterSelect(idx)}
                        className={`relative group/poster overflow-hidden rounded-xl border-2 transition-all duration-300 ${
                          activePoster === idx
                            ? 'border-red-500/50 ring-2 ring-red-500/30'
                            : 'border-gray-400/30 hover:border-white/50'
                        }`}
                      >
                        <Image
                          alt={p.alt}
                          src={p.src}
                          width={120}
                          height={120}
                          className="w-full h-24 object-cover transform group-hover/poster:scale-110 transition-transform duration-300"
                        />
                        {/* Movie title overlay */}
                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-2">
                          <p className="text-white text-xs font-medium truncate leading-tight">
                            {p.movie?.title || p.alt}
                          </p>
                        </div>
                        {activePoster === idx && (
                          <div className="absolute inset-0 bg-red-500/20 flex items-center justify-center">
                            <div className="w-6 h-6 rounded-full bg-red-500 flex items-center justify-center">
                              <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                            </div>
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 3. Broadcast Time */}
                <div className="group">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500/20 to-blue-600/20 border border-blue-500/30 flex items-center justify-center">
                      <span className="text-blue-400 font-bold text-sm">3</span>
                    </div>
                    <h3 className="text-white font-semibold text-lg">Thời gian bắt đầu phát</h3>
                  </div>
                  <p className="text-gray-400 mb-4 text-sm">Chọn thời gian để bắt đầu phát phim tự động. Tất cả người tham gia sẽ đồng bộ với thời gian phát này.</p>

                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { value: 'now', label: 'Bắt đầu ngay' },
                      { value: '5', label: 'Sau 5 phút' },
                      { value: '10', label: 'Sau 10 phút' },
                      { value: '15', label: 'Sau 15 phút' },
                      { value: '30', label: 'Sau 30 phút' },
                    ].map((option) => (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => setBroadcastStartTimeType(option.value)}
                        className={`p-4 rounded-xl border-2 transition-all duration-300 text-center h-full ${
                          broadcastStartTimeType === option.value
                            ? 'border-red-500/50 bg-red-500/10'
                            : 'border-gray-400/30 bg-black/20 hover:border-white/50 hover:bg-white/5'
                        }`}
                      >
                        <div className="text-white font-medium text-sm">{option.label}</div>
                        {broadcastStartTimeType === option.value && (
                          <div className="mt-2">
                            <div className="w-6 h-6 rounded-full bg-red-500 flex items-center justify-center mx-auto">
                              <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                            </div>
                          </div>
                        )}
                      </button>
                    ))}
                  </div>

                  {broadcastStartTimeType !== 'now' && (
                    <div className="mt-4 p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-xl">
                      <div className="flex items-center gap-2 text-yellow-400">
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                        </svg>
                        <span className="font-medium">Phát trực tiếp theo lịch</span>
                      </div>
                      <p className="text-yellow-300 text-sm mt-1">
                        Phim sẽ tự động bắt đầu sau {broadcastStartTimeType} phút. Tất cả người tham gia sẽ được đồng bộ thời gian.
                      </p>
                    </div>
                  )}
                </div>

                {/* 4. Privacy */}
                <div className="group">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-r from-green-500/20 to-green-600/20 border border-green-500/30 flex items-center justify-center">
                      <span className="text-green-400 font-bold text-sm">4</span>
                    </div>
                    <h3 className="text-white font-semibold text-lg">Quyền riêng tư</h3>
                  </div>
                  <button
                    type="button"
                    onClick={() => setPrivateOnly((v) => !v)}
                    className="flex items-center gap-4 p-4 rounded-xl bg-black/20 border border-gray-400/30 hover:bg-black/30 transition-all duration-300 w-full"
                  >
                    <div className={`relative w-14 h-7 rounded-full transition-colors duration-300 ${
                      privateOnly ? 'bg-gradient-to-r from-green-500 to-green-600' : 'bg-gray-600'
                    }`}>
                      <span className={`absolute top-0.5 left-0.5 w-6 h-6 rounded-full bg-white transition-all duration-300 shadow-lg ${
                        privateOnly ? 'translate-x-7' : ''
                      }`}></span>
                    </div>
                    <div className="flex-1 text-left">
                      <div className="text-white font-medium">Chỉ bạn bè có thể tham gia</div>
                      <div className="text-gray-400 text-sm">
                        {privateOnly ? 'Chỉ người có link mời mới tham gia được' : 'Bất kỳ ai cũng có thể tham gia phòng'}
                      </div>
                    </div>
                  </button>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-4 pt-4">
                  <button
                    onClick={handleCreate}
                    disabled={!roomName || roomName.length < 10 || !isLoggedIn || isCreating}
                    className="flex-1 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 disabled:from-gray-600 disabled:to-gray-700 text-white font-semibold py-4 px-8 rounded-xl transition-all duration-300 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none shadow-lg hover:shadow-xl"
                  >
                    <div className="flex items-center justify-center gap-2">
                      {isCreating ? (
                        <>
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                          Đang tạo phòng...
                        </>
                      ) : (
                        <>
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                          </svg>
                          Tạo phòng ngay
                        </>
                      )}
                    </div>
                  </button>
                  <Link
                    href={`/phim/${movie.slug}`}
                    className="px-8 py-4 rounded-xl border-2 border-gray-400/30 text-white hover:bg-white/10 transition-all duration-300 font-medium"
                  >
                    Huỷ bỏ
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}