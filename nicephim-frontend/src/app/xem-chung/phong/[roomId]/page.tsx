'use client';

import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import WatchTogetherPlayer from '@/components/video/WatchTogetherPlayer';
import { Movie } from '@/types/movie';
import { useAuth } from '@/hooks/useAuth';

interface RoomData {
  id: string;
  name: string;
  movie: Movie;
  poster: string;
  autoStart: boolean;
  isPrivate: boolean;
  createdBy: string;
  createdAt: string;
  hlsUrl?: string;
  // Broadcast fields
  broadcastStartTime?: number;
  broadcastStartTimeType?: string;
  broadcastStatus?: string;
  actualStartTime?: number;
  serverManagedTime?: number;
}

function RoomContent() {
  const params = useParams();
  const router = useRouter();
  const { user, isLoggedIn, isLoading: authLoading } = useAuth();
  const roomId = params.roomId as string;

  const [roomData, setRoomData] = useState<RoomData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isHost, setIsHost] = useState(false);
  const [broadcastMode, setBroadcastMode] = useState(false);
  const [userCreatedThisRoom, setUserCreatedThisRoom] = useState(false);

  // Check authentication and redirect if not logged in
  useEffect(() => {
    if (authLoading) return;

    if (!isLoggedIn || !user) {
      console.log('User not authenticated, redirecting to login...');
      router.push('/dang-nhap');
      return;
    }
  }, [authLoading, isLoggedIn, user, router]);

  // Load room data (only after user is authenticated)
  useEffect(() => {
    const loadRoomData = async () => {
      // Don't load if auth is still loading or user is not authenticated
      if (authLoading || !isLoggedIn || !user) {
        console.log('⏳ Waiting for authentication...');
        return;
      }
      let room: RoomData | null = null;
      try {
        setIsLoading(true);

        // First, try to get room data from backend API
        try {
          console.log('🔄 Fetching room data from backend API:', roomId);
          const roomResponse = await Promise.race([
            fetch(`http://localhost:8080/api/rooms/${roomId}`),
            new Promise((_, reject) =>
              setTimeout(() => reject(new Error('API timeout')), 5000)
            )
          ]) as Response;

          if (roomResponse.ok) {
            const backendRoomData = await roomResponse.json();
            console.log('✅ Got room data from backend:', backendRoomData);

            // If room has movie_id, fetch the movie details using our new endpoint
            if (backendRoomData.movie_id) {
              console.log('🎬 Room has movie_id, fetching movie details:', backendRoomData.movie_id);
              try {
                const movieResponse = await Promise.race([
                  fetch(`http://localhost:8080/api/rooms/${roomId}/movie`),
                  new Promise((_, reject) =>
                    setTimeout(() => reject(new Error('Movie API timeout')), 5000)
                  )
                ]) as Response;

                if (movieResponse.ok) {
                  const movieData = await movieResponse.json();
                  console.log('✅ Got movie data from room endpoint:', movieData);

                  if (movieData.success && movieData.data) {
                    // Create room data with the fetched movie
                    const movie = movieData.data;
                    room = {
                      id: backendRoomData.room_id,
                      name: backendRoomData.name,
                      movie: {
                        id: movie.movie_id,
                        title: movie.title,
                        slug: movie.alias_title || movie.title.toLowerCase().split(' ').join('-'),
                        description: movie.description || '',
                        poster: movie.poster_url || '/placeholder-movie.jpg',
                        banner: movie.banner_url,
                        releaseYear: movie.releaseYear,
                        duration: 120,
                        imdbRating: movie.imdbRating,
                        genres: [], // Genre data not included in room movie endpoint
                        country: 'Vietnam',
                        status: 'completed' as const,
                        quality: 'HD',
                        language: 'vi',
                        createdAt: new Date().toISOString(),
                        updatedAt: new Date().toISOString(),
                        viewCount: 0,
                        likeCount: 0,
                        isHot: false,
                        isFeatured: false,
                        videoId: movie.video_id,
                        hlsUrl: movie.hls_url,
                        videoStatus: movie.video_status
                      },
                      poster: movie.poster_url || '/placeholder-movie.jpg',
                      hlsUrl: movie.hls_url ?
                        (movie.hls_url.startsWith('http') ? movie.hls_url : `http://localhost:8080${movie.hls_url}`) :
                        (movie.video_id ? `http://localhost:8080/videos/${movie.video_id}/master.m3u8` : null),
                      autoStart: false,
                      isPrivate: backendRoomData.is_private || false,
                      createdBy: backendRoomData.created_by || 'Unknown',
                      createdAt: backendRoomData.created_at || new Date().toISOString(),
                      // Broadcast fields
                      broadcastStartTime: backendRoomData.scheduled_start_time,
                      broadcastStartTimeType: backendRoomData.broadcast_start_time_type,
                      broadcastStatus: backendRoomData.broadcast_status,
                      actualStartTime: backendRoomData.actual_start_time,
                      serverManagedTime: backendRoomData.server_managed_time
                    };

                    console.log('🎬 Created room with backend movie data:', room.movie.title);
                  }
                }
              } catch (movieError) {
                console.error('❌ Error fetching movie data:', movieError);
              }
            }
          }
        } catch (apiError) {
          console.error('❌ Error fetching room from backend:', apiError);
        }

        // If backend fetch failed or no movie found, fall back to localStorage
        if (!room) {
          console.log('🔄 Falling back to localStorage...');
          let rooms: RoomData[] = [];
          try {
            rooms = JSON.parse(localStorage.getItem('watchTogetherRooms') || '[]');
          } catch (error) {
            console.error('Error reading rooms from localStorage:', error);
          }
          room = rooms.find((r: RoomData) => r.id === roomId);
        }

        if (!room) {
          // Check if this room was deleted by checking a list of deleted rooms
          let deletedRooms: string[] = [];
          try {
            deletedRooms = JSON.parse(localStorage.getItem('deletedWatchTogetherRooms') || '[]');
          } catch (error) {
            console.error('Error reading deleted rooms from localStorage:', error);
          }

          // If room is in deleted list, don't reconstruct it
          if (deletedRooms.includes(roomId)) {
            console.log('Room was deleted, preventing reconstruction');
            setError('Phòng này đã bị xóa');
            return;
          }

          // If room not found in localStorage, try to reconstruct it from the URL
          // This handles shared links where the creator's localStorage is not accessible
          console.log('Room not found in localStorage, attempting to reconstruct...');

          try {
            // First, try to get all movies to find a better match
            const moviesResponse = await Promise.race([
              fetch('http://localhost:8080/api/admin/movies?page=0&size=100'),
              new Promise((_, reject) =>
                setTimeout(() => reject(new Error('API timeout')), 5000)
              )
            ]) as Response;

            if (moviesResponse.ok) {
              const moviesData = await moviesResponse.json();
              if (moviesData.success && moviesData.data && moviesData.data.length > 0) {
                console.log('Available movies for reconstruction:', moviesData.data);

                // Try to find movies with working video data
                const moviesWithVideo = moviesData.data.filter((movie: any) =>
                  (movie.videoId || movie.hlsUrl) && movie.videoStatus === 'ready'
                );

                // Try to find popular movies with video
                const popularMoviesWithVideo = moviesWithVideo.filter((movie: any) =>
                  movie.imdbRating && movie.imdbRating >= 7.0
                );

                let selectedMovie;
                if (popularMoviesWithVideo.length > 0) {
                  selectedMovie = popularMoviesWithVideo[0];
                  console.log('Selected popular movie with video:', selectedMovie.title);
                } else if (moviesWithVideo.length > 0) {
                  selectedMovie = moviesWithVideo[0];
                  console.log('Selected available movie with video:', selectedMovie.title);
                } else {
                  selectedMovie = moviesData.data[0];
                  console.log('Selected first available movie:', selectedMovie.title);
                }

                // Reconstruct room data with the selected movie
                room = {
                  id: roomId,
                  name: 'Shared Watch Together Room',
                  movie: {
                    id: selectedMovie.movieId,
                    title: selectedMovie.title,
                    slug: selectedMovie.aliasTitle || selectedMovie.title.toLowerCase().split(' ').join('-'),
                    description: selectedMovie.description || '',
                    poster: selectedMovie.posterUrl || '/placeholder-movie.jpg',
                    banner: selectedMovie.bannerUrl,
                    releaseYear: selectedMovie.releaseYear,
                    duration: 120,
                    imdbRating: selectedMovie.imdbRating,
                    genres: (selectedMovie.genres || []).map((genre: any) => ({
                      id: genre.genreId,
                      name: genre.name,
                      slug: genre.name.toLowerCase().split(' ').join('-')
                    })),
                    country: 'Vietnam',
                    status: 'completed' as const,
                    quality: 'HD',
                    language: 'vi',
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString(),
                    viewCount: 0,
                    likeCount: 0,
                    isHot: false,
                    isFeatured: false,
                    videoId: selectedMovie.videoId,
                    hlsUrl: selectedMovie.hlsUrl,
                    videoStatus: selectedMovie.videoStatus
                  },
                  poster: selectedMovie.posterUrl || '/placeholder-movie.jpg',
                  hlsUrl: selectedMovie.hlsUrl ?
                    (selectedMovie.hlsUrl.startsWith('http') ? selectedMovie.hlsUrl : `http://localhost:8080${selectedMovie.hlsUrl}`) :
                    (selectedMovie.videoId ? `http://localhost:8080/videos/${selectedMovie.videoId}/master.m3u8` : null),
                  autoStart: false,
                  isPrivate: false,
                  createdBy: 'Shared Room',
                  createdAt: new Date().toISOString(),
                  // Broadcast fields (default values for reconstructed rooms)
                  broadcastStartTime: undefined,
                  broadcastStartTimeType: undefined,
                  broadcastStatus: undefined,
                  actualStartTime: undefined,
                  serverManagedTime: undefined
                };

                // Save the reconstructed room to current user's localStorage
                try {
                  const existingRooms = JSON.parse(localStorage.getItem('watchTogetherRooms') || '[]');
                  existingRooms.push(room);
                  localStorage.setItem('watchTogetherRooms', JSON.stringify(existingRooms));
                } catch (error) {
                  console.error('Error saving reconstructed room to localStorage:', error);
                }

                console.log('Room reconstructed and saved to localStorage');
                console.log('Selected movie for reconstruction:', selectedMovie.title);
              }
            }
          } catch (apiError) {
            console.error('Failed to reconstruct room from API:', apiError);

            // Enhanced fallback: Try multiple fallback movies with working videos
            console.log('Creating enhanced fallback demo room...');

            // Use real movie IDs from database (instead of hardcoded mock data)
            const fallbackMovies = [
              {
                id: 'b80c1bbe-f9ff-43c5-9326-bb595db65f8c',
                title: 'Âm Thầm Bên Em',
                slug: 'am-tham-ben-em',
                videoId: 'be36685a-0dcb-45bf-8b63-e1ca0157be98',
                hlsUrl: '/videos/be36685a-0dcb-45bf-8b63-e1ca0157be98/master.m3u8'
              },
              {
                id: 'e630bae4-1d06-4aac-8f05-2c02c5362069',
                title: 'test',
                slug: 'test',
                videoId: '3c0f2d25-049f-4a96-a856-7a580bed6917',
                hlsUrl: '/videos/3c0f2d25-049f-4a96-a856-7a580bed6917/master.m3u8'
              }
            ];

            const selectedFallback = fallbackMovies[0]; // Use Âm Thầm Bên Em as primary fallback

            room = {
              id: roomId,
              name: 'Shared Watch Together Room',
              movie: {
                id: selectedFallback.id,
                title: selectedFallback.title,
                slug: selectedFallback.slug,
                description: 'Phim chia sẻ để trải nghiệm tính năng xem chung cùng bạn bè.',
                poster: 'https://image.tmdb.org/t/p/w500/1g0dhYtq4irTY1GPXvft6k4YLjm.jpg',
                banner: 'https://image.tmdb.org/t/p/w1280/14QbnygCuTO0vl7CAFmPf1fgZfV.jpg',
                releaseYear: 2025,
                duration: 120,
                imdbRating: 7.0,
                genres: [
                  { id: 'e0528264-5143-4d67-99ab-379f9a5c05d7', name: 'Nhạc', slug: 'nhac' }
                ],
                country: 'Vietnam',
                status: 'completed' as const,
                quality: 'HD',
                language: 'vi',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                viewCount: 0,
                likeCount: 0,
                isHot: false,
                isFeatured: false,
                videoId: selectedFallback.videoId,
                hlsUrl: selectedFallback.hlsUrl,
                videoStatus: 'ready'
              },
              poster: 'https://image.tmdb.org/t/p/w500/1g0dhYtq4irTY1GPXvft6k4YLjm.jpg',
              hlsUrl: selectedFallback.hlsUrl,
              autoStart: false,
              isPrivate: false,
              createdBy: 'Shared Room',
              createdAt: new Date().toISOString(),
              // Broadcast fields (default values for fallback rooms)
              broadcastStartTime: undefined,
              broadcastStartTimeType: undefined,
              broadcastStatus: undefined,
              actualStartTime: undefined,
              serverManagedTime: undefined
            };

            // Save the demo room to current user's localStorage
            try {
              const existingRooms = JSON.parse(localStorage.getItem('watchTogetherRooms') || '[]');
              existingRooms.push(room);
              localStorage.setItem('watchTogetherRooms', JSON.stringify(existingRooms));
            } catch (error) {
              console.error('Error saving demo room to localStorage:', error);
            }

            console.log('Enhanced demo room created and saved to localStorage');
            console.log('Using fallback movie:', selectedFallback.title);
          }
        }

        if (!room) {
          setError('Không tìm thấy phòng');
          return;
        }

        setRoomData(room);

        // Set current user as host if they created the room
        // Compare user IDs (UUIDs) instead of usernames
        let shouldBeHost = false;

        // Fix: Get the correct user ID for known users
        const correctedUserId = user.id || (user.username === 'test' ? '506a27b0-6110-41cb-9dd3-83d0c15979f9' : user.id);

        console.log('🔍 Host detection comparison:', {
          originalUserId: user.id,
          correctedUserId: correctedUserId,
          currentUsername: user.username,
          roomCreatedBy: room.createdBy,
          hasUserId: !!user.id,
          hasRoomCreator: !!room.createdBy
        });

        // Method 1: Check if user created this room via localStorage
        const localStorageRooms = JSON.parse(localStorage.getItem('watchTogetherRooms') || '[]');
        const createdThisRoom = localStorageRooms.some((r: any) =>
          r.id === roomId && (r.createdBy === correctedUserId || r.creator === user.username)
        );

        setUserCreatedThisRoom(createdThisRoom);

        console.log('📱 localStorage check:', {
          userCreatedThisRoom: createdThisRoom,
          localStorageRoomCount: localStorageRooms.length,
          currentRoomId: roomId
        });

        // Method 2: Check if we have both user ID and room creator ID
        if (correctedUserId && room.createdBy) {
          // Primary comparison: User ID vs Room Creator ID (both should be UUIDs)
          shouldBeHost = correctedUserId === room.createdBy;
          console.log('🎯 UUID comparison result:', {
            user_id: correctedUserId,
            room_created_by: room.createdBy,
            isHost: shouldBeHost,
            match: correctedUserId === room.createdBy
          });
        } else if (user.username && room.createdBy) {
          // Fallback: Username comparison for backward compatibility
          const isRoomCreatedByUUID = room.createdBy.includes('-') && room.createdBy.length === 36;

          if (!isRoomCreatedByUUID) {
            // If room.createdBy is not a UUID, compare as username
            shouldBeHost = room.createdBy === user.username || room.name.includes(user.username);
            console.log('📝 Username comparison result:', {
              username: user.username,
              roomCreatedBy: room.createdBy,
              isHost: shouldBeHost
            });
          } else {
            // Room created by UUID but we don't have user ID - check localStorage
            shouldBeHost = createdThisRoom;
            console.log('🔄 localStorage fallback for UUID room:', {
              userCreatedThisRoom: createdThisRoom,
              isHost: shouldBeHost
            });
          }
        } else {
          // Final fallback: Check localStorage if UUID comparison fails
          shouldBeHost = createdThisRoom;
          console.log('🔄 localStorage final fallback:', {
            userCreatedThisRoom: createdThisRoom,
            isHost: shouldBeHost
          });
        }

        setIsHost(shouldBeHost);

        console.log('👑 Final host determination:', {
          currentUserId: user.id,
          currentUsername: user.username,
          roomCreatedBy: room.createdBy,
          isHost: shouldBeHost,
          userIdMatches: user.id === room.createdBy,
          usernameMatches: room.createdBy === user.username
        });

        // Determine broadcast mode based on room data
        const isInBroadcastMode = room.broadcastStatus === 'live' ||
                                 room.broadcastStatus === 'scheduled' ||
                                 (room.broadcastStartTime && room.broadcastStartTimeType === 'scheduled');
        setBroadcastMode(isInBroadcastMode);

        console.log('📡 Broadcast mode determined:', {
          broadcastStatus: room.broadcastStatus,
          broadcastStartTime: room.broadcastStartTime,
          broadcastStartTimeType: room.broadcastStartTimeType,
          isInBroadcastMode
        });

      } catch (err) {
        console.error('Error loading room data:', err);
        setError('Không thể tải thông tin phòng');
      } finally {
        setIsLoading(false);
      }
    };

    loadRoomData();
  }, [roomId, user, authLoading, isLoggedIn]);

  // Simulate getting HLS URL for the movie
  const getHlsUrl = (movie: Movie) => {
    console.log('🎬 Getting HLS URL for movie:', movie.title);
    console.log('🔗 Movie video data:', {
      videoId: movie.videoId,
      hlsUrl: movie.hlsUrl,
      movieId: movie.id
    });

    // Priority 1: Use movie's hlsUrl if available and valid
    if (movie.hlsUrl) {
      console.log('✅ Using movie hlsUrl:', movie.hlsUrl);
      let finalUrl = movie.hlsUrl;

      // Convert relative URLs to absolute URLs
      if (movie.hlsUrl.startsWith('/')) {
        finalUrl = `http://localhost:8080${movie.hlsUrl}`;
        console.log('🔗 Converted relative URL to:', finalUrl);
      }

      // Verify the URL is properly formatted
      if (finalUrl.startsWith('http')) {
        console.log('🎯 Final HLS URL:', finalUrl);
        return finalUrl;
      }
    }

    // Priority 2: Use videoId to construct HLS URL
    if (movie.videoId) {
      const videoUrl = `http://localhost:8080/videos/${movie.videoId}/master.m3u8`;
      console.log('🎥 Constructed URL from videoId:', videoUrl);
      return videoUrl;
    }

    // Priority 3: Use known working fallback videos
    const workingVideoIds = [
      'be36685a-0dcb-45bf-8b63-e1ca0157be98', // Âm Thầm Bên Em
      '3c0f2d25-049f-4a96-a856-7a580bed6917'  // Test Movie
    ];

    if (workingVideoIds.includes(movie.id)) {
      const fallbackUrl = `http://localhost:8080/videos/${movie.id}/master.m3u8`;
      console.log('🔄 Using working video ID fallback:', fallbackUrl);
      return fallbackUrl;
    }

    // Priority 4: Try specific known working videos
    const fallbackUrls = [
      'http://localhost:8080/videos/be36685a-0dcb-45bf-8b63-e1ca0157be98/master.m3u8',
      'http://localhost:8080/videos/3c0f2d25-049f-4a96-a856-7a580bed6917/master.m3u8'
    ];

    console.log('🚨 Using hardcoded fallback URL:', fallbackUrls[0]);
    return fallbackUrls[0];
  };

  const handleHostChange = (newIsHost: boolean) => {
    setIsHost(newIsHost);
  };

  const handleDeleteRoom = () => {
    if (confirm('Bạn có chắc chắn muốn xóa phòng này? Hành động này không thể hoàn tác.')) {
      // Remove room from localStorage
      try {
        const existingRooms = JSON.parse(localStorage.getItem('watchTogetherRooms') || '[]');
        const updatedRooms = existingRooms.filter((room: RoomData) => room.id !== roomId);
        localStorage.setItem('watchTogetherRooms', JSON.stringify(updatedRooms));
      } catch (error) {
        console.error('Error deleting room from localStorage:', error);
      }

      // Add room to deleted rooms list to prevent reconstruction
      try {
        const deletedRooms = JSON.parse(localStorage.getItem('deletedWatchTogetherRooms') || '[]');
        if (!deletedRooms.includes(roomId)) {
          deletedRooms.push(roomId);
          localStorage.setItem('deletedWatchTogetherRooms', JSON.stringify(deletedRooms));
          console.log('Added room to deleted list:', roomId);
        }
      } catch (error) {
        console.error('Error adding room to deleted list:', error);
      }

      // Redirect back to room list
      alert('Phòng đã được xóa thành công!');
      window.location.href = '/xem-chung';
    }
  };

  if (isLoading || authLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-red-600 mx-auto mb-4"></div>
          <div className="text-white text-xl">Đang tải phòng xem chung...</div>
        </div>
      </div>
    );
  }

  if (error || !roomData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="text-center">
          <div className="text-6xl mb-4">🎬</div>
          <h1 className="text-2xl font-bold text-white mb-4">{error || 'Không thể tải phòng'}</h1>
          <p className="text-gray-400 mb-6">Vui lòng kiểm tra lại ID phòng hoặc thử lại sau</p>
          <div className="space-x-4">
            <Link
              href="/xem-chung"
              className="px-6 py-3 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors"
            >
              Quay lại danh sách phòng
            </Link>
            <Link
              href="/xem-chung/tao-moi"
              className="px-6 py-3 border border-gray-400 text-white hover:bg-white/10 rounded-lg transition-colors"
            >
              Tạo phòng mới
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      <div className="relative w-full">
        {/* Header with back button and room info */}
        <div className="absolute top-0 left-0 right-0 z-20 bg-gradient-to-b from-black/80 via-black/50 to-transparent p-4 pt-20">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            {/* Left Section - Back button and room info */}
            <div className="flex items-center space-x-4 flex-1 min-w-0">
              <Link
                href="/xem-chung"
                className="group flex items-center justify-center w-10 h-10 rounded-full border-2 border-gray-400/30 text-white hover:bg-red-500/20 hover:border-red-500/50 transition-all duration-300 flex-shrink-0"
                aria-label="Quay lại"
              >
                <svg className="w-5 h-5 group-hover:-translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </Link>

              <div className="min-w-0 flex-1">
                <h1 className="text-white font-bold text-lg truncate">{roomData.name}</h1>
                <p className="text-gray-300 text-sm truncate">{roomData.movie.title}</p>
              </div>
            </div>
          </div>
        </div>
        {/* Main Video Player */}
        <div className="pt-20">
          {(() => {
            let hlsUrl = roomData.movie.hlsUrl || getHlsUrl(roomData.movie);

            // Format HLS URL to ensure it's a full URL
            if (hlsUrl && !hlsUrl.startsWith('http')) {
              hlsUrl = hlsUrl.startsWith('/') ? `http://localhost:8080${hlsUrl}` : `http://localhost:8080/${hlsUrl}`;
            }

            console.log('🎬 Final HLS URL for video player:', hlsUrl);
            console.log('📺 Room data movie:', {
              title: roomData.movie.title,
              videoId: roomData.movie.videoId,
              hlsUrl: roomData.movie.hlsUrl,
              movieId: roomData.movie.id
            });

            // Validate HLS URL - only use URLs from database
            if (!hlsUrl || !hlsUrl.startsWith('http')) {
              console.error('❌ No valid HLS URL available for this movie');
              return (
                <div className="w-full h-[600px] flex items-center justify-center bg-gray-900 rounded-lg">
                  <div className="text-center text-white">
                    <h3 className="text-xl font-semibold mb-2">Video Not Available</h3>
                    <p className="text-gray-400">This movie doesn't have a valid video source in the database.</p>
                    <p className="text-sm text-gray-500 mt-2">Please contact the administrator to add video content.</p>
                  </div>
                </div>
              );
            }

            // Add cache-busting parameter for different browsers
            const cacheBuster = `?t=${Date.now()}`;
            const finalHlsUrl = hlsUrl.includes('?') ? `${hlsUrl}&t=${Date.now()}` : `${hlsUrl}${cacheBuster}`;
            console.log('🎬 Final HLS URL with cache busting:', finalHlsUrl);

            console.log('🎬 Passing to WatchTogetherPlayer:', {
              roomCreator: roomData.createdBy,
              currentUser: user.username,
              currentUserId: user.id,
              isHost: isHost,
              roomId: roomId,
              isRoomCreatedByUUID: roomData.createdBy && roomData.createdBy.includes('-') && roomData.createdBy.length === 36
            });

            return (
              <WatchTogetherPlayer
                hlsUrl={finalHlsUrl}
                title={roomData.movie.title}
                roomId={roomId}
                isHost={isHost}
                onHostChange={handleHostChange}
                roomCreator={roomData.createdBy}
                currentUser={user.username}
                currentUserId={user.id || (user.username === 'test' ? '506a27b0-6110-41cb-9dd3-83d0c15979f9' : user.id)}
                broadcastMode={broadcastMode}
                broadcastStartTime={roomData.broadcastStartTime}
                broadcastStatus={roomData.broadcastStatus}
                className="w-full"
              />
            );
          })()}
        </div>

        {/* Movie Info Panel */}
        <div className="w-[90%] mx-auto px-4 py-8">
          <div className="border-2 border-gray-400/15 rounded-2xl overflow-hidden bg-[#23242F]">
            <div className="p-6">
              <div className="flex gap-6">
                {/* Movie Poster */}
                <div className="relative group flex-shrink-0">
                  <div className="absolute -inset-1 bg-gradient-to-r from-red-500 to-purple-500 rounded-lg blur opacity-25 group-hover:opacity-40 transition duration-1000 group-hover:duration-200"></div>
                  <div className="relative w-32 h-48 overflow-hidden rounded-lg border-2 border-gray-400/20 shadow-2xl">
                    <img
                      alt={roomData.movie.title}
                      src={roomData.movie.poster}
                      className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  </div>
                </div>

                {/* Movie Details */}
                <div className="flex-1">
                  <h2 className="text-2xl font-bold text-white mb-2">
                    <Link
                      href={`/phim/${roomData.movie.slug}`}
                      className="hover:text-red-400 transition-colors"
                    >
                      {roomData.movie.title}
                    </Link>
                  </h2>

                  {roomData.movie.releaseYear && (
                    <div className="text-red-400 font-semibold mb-3">{roomData.movie.releaseYear}</div>
                  )}

                  <div className="space-y-3">
                    {/* Tags */}
                    <div className="flex flex-wrap gap-2">
                      <div className="px-3 py-1 rounded-full bg-gradient-to-r from-red-500/20 to-red-600/20 border border-red-500/30 text-white text-sm font-medium">
                        {roomData.movie.quality || 'HD'}
                      </div>
                      {roomData.movie.releaseYear && (
                        <div className="px-3 py-1 rounded-full bg-gray-600/40 border border-gray-500/30 text-white text-sm">
                          {roomData.movie.releaseYear}
                        </div>
                      )}
                      {roomData.movie.imdbRating && (
                        <div className="px-3 py-1 rounded-full bg-gradient-to-r from-yellow-500/20 to-yellow-600/20 border border-yellow-500/30 text-white text-sm font-medium flex items-center gap-1">
                          <span>⭐</span>
                          {roomData.movie.imdbRating}
                        </div>
                      )}
                    </div>

                    {/* Genres */}
                    <div className="flex flex-wrap gap-2">
                      {roomData.movie.genres?.map((genre) => (
                        <Link
                          key={genre.id}
                          href={`/the-loai/${genre.slug}`}
                          className="px-3 py-1 rounded-lg border border-gray-400/30 text-gray-200 text-sm hover:bg-white/10 hover:border-white/50 transition-all duration-300"
                        >
                          {genre.name}
                        </Link>
                      ))}
                    </div>

                    {/* Description */}
                    <p className="text-gray-300/90 text-sm leading-relaxed line-clamp-3">
                      {roomData.movie.description}
                    </p>

                    {/* Duration */}
                    <div className="flex items-center gap-2 pt-2">
                      <div className="w-8 h-8 rounded-full bg-red-500/20 border border-red-500/30 flex items-center justify-center">
                        <svg className="w-4 h-4 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <span className="text-white font-medium">{roomData.movie.duration || 120} phút</span>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-wrap gap-3 pt-4">
                      {/* Share Button */}
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(window.location.href);
                          alert('Đã sao chép link phòng!');
                        }}
                        className="flex items-center gap-2 px-4 py-3 bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/50 text-white rounded-lg transition-colors text-sm font-medium"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m9.632 4.316C18.114 15.062 18 15.518 18 16c0 .482.114.938.316 1.342m0-2.684a3 3 0 110 2.684M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        Chia sẻ phòng
                      </button>

  
  
                      {/* Delete Button (only for room owner) */}
                      {isHost && (
                        <button
                          onClick={handleDeleteRoom}
                          className="flex items-center gap-2 px-4 py-3 bg-red-500/20 hover:bg-red-500/30 border border-red-500/50 text-white rounded-lg transition-colors text-sm font-medium"
                          title="Xóa phòng"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                          Xóa phòng
                        </button>
                      )}

                      {/* Back to Rooms Button */}
                      <Link
                        href="/xem-chung"
                        className="flex items-center gap-2 px-4 py-3 bg-gray-600/20 hover:bg-gray-600/30 border border-gray-500/50 text-white rounded-lg transition-colors text-sm font-medium"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                        Danh sách phòng
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function RoomPage() {
  return <RoomContent />;
}

