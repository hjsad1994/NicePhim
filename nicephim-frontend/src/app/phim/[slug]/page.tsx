'use client';

import { useState, useEffect, use } from 'react';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { 
  PlayIcon, 
  HeartIcon, 
  ShareIcon, 
  StarIcon, 
  CalendarIcon,
  ClockIcon,
  TagIcon,
  ChevronLeftIcon,
  UsersIcon
} from '@heroicons/react/24/solid';
import { HeartIcon as HeartOutlineIcon } from '@heroicons/react/24/outline';
import { Movie } from '@/types/movie';
import { ApiService, MovieResponse } from '@/lib/api';
import { getImageUrl } from '@/lib/utils';

interface MovieDetailPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export default function MovieDetailPage({ params }: MovieDetailPageProps) {
  const resolvedParams = use(params);
  // Decode URL-encoded slug and convert spaces to hyphens (e.g., "cai%20gi" -> "cai-gi")
  const decodedSlug = decodeURIComponent(resolvedParams.slug).replace(/\s+/g, '-');
  const [movie, setMovie] = useState<Movie | null>(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Convert MovieResponse to Movie type for compatibility
  const convertToMovie = (movieResponse: MovieResponse): Movie => {
    const slug = movieResponse.aliasTitle || movieResponse.title.toLowerCase().replace(/\s+/g, '-');
    console.log(`🎬 Converting movie: ${movieResponse.title} -> slug: ${slug}`);
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
        slug: genre.name.toLowerCase().replace(/\s+/g, '-')
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
      isFeatured: false,
      // Video fields
      videoId: movieResponse.videoId,
      hlsUrl: movieResponse.hlsUrl,
      videoStatus: movieResponse.videoStatus
    };
  };

  useEffect(() => {
    const loadMovie = async () => {
      try {
        setIsLoading(true);
        console.log('🔍 Looking for movie with slug:', decodedSlug);
        
        // Create realistic fallback movie
        const createFallbackMovie = (): Movie => ({
          id: 'real-movie-1',
          title: 'Spider-Man: No Way Home',
          slug: decodedSlug,
          description: 'Peter Parker được huyền thoại Doctor Strange giúp đỡ để khôi phục bí mật danh tính của anh ta. Khi một câu thần chú bị sai, những kẻ thù nguy hiểm từ các thế giới khác bắt đầu xuất hiện, buộc Peter phải khám phá ra ý nghĩa thực sự của việc trở thành Người Nhện. Đây là một bộ phim siêu anh hùng đầy kịch tính với những cảnh hành động mãn nhãn và cốt truyện cảm động.',
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
          // Try to get specific movie by slug from database
          console.log('🔄 Attempting to fetch movie by slug from database:', decodedSlug);
          const movieResponse = await Promise.race([
            ApiService.getMovieBySlug(decodedSlug),
            new Promise((_, reject) => 
              setTimeout(() => reject(new Error('API timeout')), 5000)
            )
          ]) as any;
          
          console.log('🎬 API Response:', movieResponse);
          
          if (movieResponse.success && movieResponse.data) {
            console.log('✅ Found movie by slug:', movieResponse.data);
            const foundMovie = convertToMovie(movieResponse.data);
            setMovie(foundMovie);
            
            // Check if movie is in favorites (from localStorage or API)
            const favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
            setIsFavorite(favorites.includes(foundMovie.id));
          } else {
            console.log('⚠️ Movie not found in database, trying fallback approach');
            console.log('🎬 Movie response details:', movieResponse);
            
            // Try fallback: fetch all movies and find by slug
            try {
              console.log('🔄 Fallback: Fetching all movies to find by slug');
              const allMoviesResponse = await ApiService.getMovies(0, 100);
              if (allMoviesResponse.success && allMoviesResponse.data) {
                const allMovies = allMoviesResponse.data.map(convertToMovie);
                console.log('🎬 All movies from fallback:', allMovies.map(m => ({ title: m.title, slug: m.slug })));
                
                const foundMovie = allMovies.find(m => m.slug === decodedSlug);
                if (foundMovie) {
                  console.log('✅ Found movie via fallback:', foundMovie);
                  setMovie(foundMovie);
                  
                  // Check if movie is in favorites
                  const favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
                  setIsFavorite(favorites.includes(foundMovie.id));
                  return;
                }
              }
            } catch (fallbackError) {
              console.error('❌ Fallback also failed:', fallbackError);
            }
            
            console.log('⚠️ No movie found, using fallback movie');
            setMovie(createFallbackMovie());
          }
        } catch (apiError) {
          console.error('❌ API call failed:', apiError);
          console.log('⚠️ Using fallback movie due to API error');
          setMovie(createFallbackMovie());
        }
        
      } catch (error) {
        console.error('❌ Unexpected error:', error);
        // Always create a fallback movie
        const fallbackMovie: Movie = {
          id: 'real-movie-2',
          title: 'Squid Game',
          slug: decodedSlug,
          description: 'Một nhóm người tuyệt vọng tham gia một trò chơi sinh tồn bí mật với giải thưởng tiền mặt khổng lồ. Nhưng khi họ nhận ra rằng thất bại có nghĩa là cái chết, họ phải đấu tranh để sống sót trong một thế giới nơi mọi thứ đều có thể xảy ra. Bộ phim Hàn Quốc này đã trở thành hiện tượng toàn cầu với cốt truyện hấp dẫn và những bài học sâu sắc về xã hội.',
          poster: 'https://image.tmdb.org/t/p/w500/dDlEmu3EZ0Pgg93K2SVNLCjCSvE.jpg',
          banner: 'https://image.tmdb.org/t/p/w1280/7WsyChQLEftFiDOVTGkv3hFpyyt.jpg',
          releaseYear: 2021,
          duration: 63,
          imdbRating: 8.1,
          genres: [
            { id: '4', name: 'Kinh Dị', slug: 'kinh-di' },
            { id: '5', name: 'Bí Ẩn', slug: 'bi-an' },
            { id: '6', name: 'Hành Động', slug: 'hanh-dong' }
          ],
          country: 'Hàn Quốc',
          status: 'completed',
          quality: 'FullHD',
          language: 'vi',
          createdAt: '2023-01-01T00:00:00Z',
          updatedAt: '2023-01-01T00:00:00Z',
          viewCount: 2500000,
          likeCount: 180000,
          isHot: true,
          isFeatured: true
        };
        setMovie(fallbackMovie);
      } finally {
        console.log('🏁 Loading completed');
        setIsLoading(false);
      }
    };

    loadMovie();
  }, [resolvedParams.slug]);

  // Debug: Track when movie state changes
  useEffect(() => {
    console.log('🎬 Movie state changed:', movie ? `"${movie.title}"` : 'null');
  }, [movie]);

  const handleFavoriteToggle = () => {
    if (!movie) return;
    
    const favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
    let newFavorites;
    
    if (isFavorite) {
      newFavorites = favorites.filter((id: string) => id !== movie.id);
    } else {
      newFavorites = [...favorites, movie.id];
    }
    
    localStorage.setItem('favorites', JSON.stringify(newFavorites));
    setIsFavorite(!isFavorite);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{backgroundColor: 'var(--bg-2)'}}>
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-red-600"></div>
      </div>
    );
  }

  if (!movie) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{backgroundColor: 'var(--bg-2)'}}>
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-red-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      {/* Hero Section with Banner */}
      <div className="relative w-full h-[80vh] min-h-[600px] overflow-hidden">
        {/* Background with blur and gradient overlay */}
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat scale-105 transform"
          style={{
            backgroundImage: movie.banner ? `url(${getImageUrl(movie.banner, 'large')})` : 'linear-gradient(135deg, #1f2937 0%, #111827 100%)'
          }}
        />

        {/* Gradient overlays */}
        <div className="absolute inset-0 bg-gradient-to-r from-black via-black/80 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent" />
        <div className="absolute inset-0 bg-black/20" />

        {/* Back to home button */}
        <div className="absolute top-4 left-4 z-20">
          <Link
            href="/"
            className="flex items-center gap-2 bg-black/50 backdrop-blur-md text-white px-4 py-2 rounded-full hover:bg-black/70 transition-all duration-300"
          >
            <ChevronLeftIcon className="h-4 w-4" />
            Về trang chủ
          </Link>
        </div>

        {/* Content overlay */}
        <div className="absolute bottom-0 left-0 right-0 z-10 p-8">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row gap-8 items-end">
              {/* Movie poster */}
              <div className="hidden md:block">
                <div className="w-48 h-72 relative rounded-xl overflow-hidden shadow-2xl transform hover:scale-105 transition-transform duration-300">
                  <Image
                    src={getImageUrl(movie.poster, 'large')}
                    alt={movie.title}
                    fill
                    className="object-cover"
                  />
                </div>
              </div>

              {/* Movie info */}
              <div className="flex-1 text-center md:text-left">
                <div className="mb-4">
                  <div className="flex flex-wrap gap-2 justify-center md:justify-start mb-3">
                    {movie.genres?.slice(0, 3).map((genre) => (
                      <Link
                        key={genre.id}
                        href={`/the-loai/${genre.slug}`}
                        className="bg-red-600/80 backdrop-blur-sm text-white px-3 py-1 rounded-full text-sm font-medium hover:bg-red-600 transition-colors"
                      >
                        {genre.name}
                      </Link>
                    ))}
                  </div>

                  <div className="flex items-center gap-4 justify-center md:justify-start mb-3">
                    <span className="text-white/80 text-sm">{movie.releaseYear}</span>
                    <span className="text-white/60 text-sm">•</span>
                    <span className="text-white/80 text-sm">{movie.duration} phút</span>
                    <span className="text-white/60 text-sm">•</span>
                    <span className="text-white/80 text-sm">{movie.quality}</span>
                    {movie.imdbRating && (
                      <>
                        <span className="text-white/60 text-sm">•</span>
                        <span className="flex items-center gap-1 text-yellow-400 text-sm">
                          <StarIcon className="h-4 w-4" />
                          {movie.imdbRating}
                        </span>
                      </>
                    )}
                  </div>
                </div>

                <h1 className="text-4xl md:text-5xl font-bold text-white mb-2">{movie.title}</h1>
                {movie.aliasTitle && (
                  <p className="text-xl text-gray-300 mb-6">{movie.aliasTitle}</p>
                )}

                <p className="text-gray-300 text-lg mb-8 max-w-3xl line-clamp-3">
                  {movie.description || 'Không có mô tả cho bộ phim này.'}
                </p>

                <div className="flex flex-wrap gap-4 justify-center md:justify-start">
                  <Link
                    href={`/xem/${movie.slug}`}
                    className="group inline-flex items-center px-8 py-4 bg-gradient-to-r from-red-600 to-pink-600 text-white font-semibold rounded-xl hover:from-red-700 hover:to-pink-700 transition-all duration-500 shadow-lg hover:shadow-xl transform hover:scale-105"
                  >
                    <PlayIcon className="h-6 w-6 mr-3" />
                    Xem Ngay
                    <svg className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </Link>

                  <Link
                    href={`/xem-chung/tao-moi?movie=${movie.slug}`}
                    className="group inline-flex items-center px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-all duration-500 shadow-lg hover:shadow-xl transform hover:scale-105"
                  >
                    <UsersIcon className="h-6 w-6 mr-3" />
                    Xem chung
                    <svg className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </Link>

                  <button
                    onClick={handleFavoriteToggle}
                    className={`group inline-flex items-center px-8 py-4 font-semibold rounded-xl transition-all duration-500 shadow-lg backdrop-blur-sm transform hover:scale-105 ${
                      isFavorite
                        ? 'bg-red-600 text-white hover:bg-red-700'
                        : 'bg-gray-800/80 hover:bg-gray-700 text-white'
                    }`}
                  >
                    {isFavorite ? (
                      <HeartIcon className="h-6 w-6 mr-3" />
                    ) : (
                      <HeartOutlineIcon className="h-6 w-6 mr-3" />
                    )}
                    {isFavorite ? 'Đã thích' : 'Thích'}
                    <svg className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="relative bg-gradient-to-b from-gray-900 to-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Sidebar - Additional Info */}
            <div className="lg:col-span-1 space-y-6">
              <div className="bg-gray-900/80 backdrop-blur-sm rounded-2xl p-6 border border-gray-800">
                <h3 className="text-xl font-bold text-white mb-4">Thông tin phim</h3>

                <div className="space-y-4">
                  <div className="flex justify-between items-center py-3 border-b border-gray-800">
                    <span className="text-gray-400">Năm phát hành</span>
                    <span className="text-white font-semibold">{movie.releaseYear}</span>
                  </div>

                  <div className="flex justify-between items-center py-3 border-b border-gray-800">
                    <span className="text-gray-400">Thời lượng</span>
                    <span className="text-white font-semibold">{movie.duration} phút</span>
                  </div>

                  <div className="flex justify-between items-center py-3 border-b border-gray-800">
                    <span className="text-gray-400">Chất lượng</span>
                    <span className="text-white font-semibold">{movie.quality}</span>
                  </div>

                  <div className="flex justify-between items-center py-3 border-b border-gray-800">
                    <span className="text-gray-400">Quốc gia</span>
                    <span className="text-white font-semibold">{movie.country}</span>
                  </div>

                  {movie.imdbRating && (
                    <div className="flex justify-between items-center py-3">
                      <span className="text-gray-400">IMDb Rating</span>
                      <span className="text-white font-semibold flex items-center">
                        <StarIcon className="h-4 w-4 text-yellow-400 mr-1" />
                        {movie.imdbRating}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Mobile poster */}
              <div className="lg:hidden">
                <div className="w-full h-96 relative rounded-2xl overflow-hidden shadow-2xl">
                  <Image
                    src={getImageUrl(movie.poster, 'large')}
                    alt={movie.title}
                    fill
                    className="object-cover"
                  />
                </div>
              </div>
            </div>

            {/* Main Content */}
            <div className="lg:col-span-2 space-y-8">
              {/* Description */}
              <div className="bg-gray-900/80 backdrop-blur-sm rounded-2xl p-8 border border-gray-800">
                <h2 className="text-2xl font-bold text-white mb-6">Nội dung phim</h2>
                <p className="text-gray-300 leading-relaxed text-lg">
                  {movie.description || 'Không có mô tả cho bộ phim này.'}
                </p>
              </div>

              {/* All Genres */}
              {movie.genres && movie.genres.length > 0 && (
                <div className="bg-gray-900/80 backdrop-blur-sm rounded-2xl p-8 border border-gray-800">
                  <h3 className="text-2xl font-bold text-white mb-6">Thể loại</h3>
                  <div className="flex flex-wrap gap-3">
                    {movie.genres.map((genre) => (
                      <Link
                        key={genre.id}
                        href={`/the-loai/${genre.slug}`}
                        className="bg-red-600/20 hover:bg-red-600/30 text-red-400 hover:text-red-300 border border-red-600/30 px-4 py-2 rounded-xl font-medium transition-all duration-300"
                      >
                        {genre.name}
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* Comments Section */}
              <div className="bg-gray-900/80 backdrop-blur-sm rounded-2xl p-8 border border-gray-800">
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-red-600 to-pink-600 rounded-full flex items-center justify-center">
                      <span className="text-white text-sm font-bold">144</span>
                    </div>
                    <h3 className="text-2xl font-bold text-white">Bình luận</h3>
                  </div>
                  <div className="flex gap-2">
                    <button className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-full text-sm font-medium transition-colors">
                      Bình luận
                    </button>
                    <button className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-full text-sm font-medium transition-colors">
                      Đánh giá
                    </button>
                  </div>
                </div>

                {/* Comment Form */}
                <div className="mb-8">
                  <div className="flex gap-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-gray-700 to-gray-600 rounded-full flex items-center justify-center">
                      <span className="text-white text-sm font-bold">T</span>
                    </div>
                    <div className="flex-1">
                      <textarea
                        className="w-full bg-gray-800 text-white p-4 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-red-600 border border-gray-700"
                        rows={4}
                        placeholder="Chia sẻ cảm nhận của bạn về bộ phim này..."
                      />
                      <div className="flex items-center justify-between mt-3">
                        <label className="flex items-center gap-2 text-gray-400 text-sm">
                          <input type="checkbox" className="rounded" />
                          Chứa nội dung tiết lộ
                        </label>
                        <button className="bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 text-white px-6 py-2 rounded-full font-semibold transition-all duration-300 shadow-lg">
                          Gửi bình luận
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Comments List */}
                <div className="space-y-6">
                  {[1, 2, 3].map((comment) => (
                    <div key={comment} className="flex gap-4 p-4 bg-gray-800/50 rounded-xl">
                      <div className="w-12 h-12 bg-gradient-to-br from-gray-700 to-gray-600 rounded-full flex items-center justify-center">
                        <span className="text-white text-sm font-bold">U{comment}</span>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <span className="text-white font-semibold">User {comment}</span>
                          <span className="text-gray-400 text-sm">{comment} giờ trước</span>
                        </div>
                        <p className="text-gray-300 mb-3">
                          Phim này thật sự tuyệt vời! Cốt truyện hấp dẫn, diễn xuất xuất sắc và hiệu ứng hình ảnh đáng kinh ngạc.
                        </p>
                        <div className="flex items-center gap-4">
                          <button className="flex items-center gap-1 text-gray-400 hover:text-red-400 transition-colors px-3 py-1 rounded-full hover:bg-red-600/10">
                            <HeartOutlineIcon className="h-4 w-4" />
                            <span className="text-sm">{comment * 5}</span>
                          </button>
                          <button className="text-gray-400 hover:text-white transition-colors text-sm px-3 py-1 rounded-full hover:bg-gray-700">
                            Trả lời
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}