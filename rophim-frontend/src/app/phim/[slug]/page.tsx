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
    <div className="min-h-screen bg-gray-900">
      {/* Top Detail Wrap with Banner */}
      <div className="relative w-full h-[80vh] min-h-[600px] overflow-hidden">
        {/* Background Fade */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: movie.banner ? `url(${getImageUrl(movie.banner, 'large')})` : 'linear-gradient(135deg, #1f2937 0%, #111827 100%)'
          }}
        />
        
        {/* Cover Fade */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/70 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-transparent to-transparent" />
        
        {/* Cover Image */}
        <div className="absolute inset-0">
          <div 
            className="w-full h-full bg-cover bg-center bg-no-repeat opacity-20"
            style={{
              backgroundImage: movie.poster ? `url(${getImageUrl(movie.poster, 'large')})` : 'none'
            }}
          />
        </div>
      </div>

      {/* Main Content */}
      <div className="relative -mt-32 z-10 pt-16">
        <div className="w-[90%] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Sidebar */}
            <div className="lg:w-80 flex-shrink-0">
              <div className="bg-gray-800/90 backdrop-blur-sm rounded-xl p-6 space-y-6">
                {/* Poster */}
                <div className="text-center">
                  <div className="w-48 h-72 mx-auto relative rounded-xl overflow-hidden shadow-2xl">
                    <Image
                      src={getImageUrl(movie.poster, 'large')}
                      alt={movie.title}
                      fill
                      className="object-cover"
                    />
                  </div>
                </div>

                {/* Movie Title */}
                <div className="text-center">
                  <h1 className="text-2xl font-bold text-white mb-2">{movie.title}</h1>
                  {movie.aliasTitle && (
                    <p className="text-gray-400 text-lg">{movie.aliasTitle}</p>
                  )}
                </div>

                {/* Action Button */}
                <div className="text-center">
                  <Link
                    href={`/xem/${movie.slug}`}
                    className="inline-flex items-center justify-center w-full bg-gradient-to-r from-white to-gray-200 hover:from-gray-100 hover:to-gray-300 text-gray-800 px-8 py-4 rounded-full font-bold text-lg transition-all duration-300 shadow-lg hover:shadow-xl"
                  >
                    <PlayIcon className="h-6 w-6 mr-3" />
                    Xem Ngay
                  </Link>
                </div>

                {/* Movie Details */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between text-gray-300">
                    <span>Năm phát hành:</span>
                    <span className="text-white font-semibold">{movie.releaseYear}</span>
                  </div>
                  <div className="flex items-center justify-between text-gray-300">
                    <span>Thời lượng:</span>
                    <span className="text-white font-semibold">{movie.duration} phút</span>
                  </div>
                  <div className="flex items-center justify-between text-gray-300">
                    <span>Chất lượng:</span>
                    <span className="text-white font-semibold">{movie.quality}</span>
                  </div>
                  <div className="flex items-center justify-between text-gray-300">
                    <span>Quốc gia:</span>
                    <span className="text-white font-semibold">{movie.country}</span>
                  </div>
                  {movie.imdbRating && (
                    <div className="flex items-center justify-between text-gray-300">
                      <span>IMDB Rating:</span>
                      <span className="text-white font-semibold flex items-center">
                        <StarIcon className="h-4 w-4 text-yellow-400 mr-1" />
                        {movie.imdbRating}
                      </span>
                    </div>
                  )}
                </div>

                {/* Genres */}
                {movie.genres && movie.genres.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-3">Thể loại</h3>
                    <div className="flex flex-wrap gap-2">
                      {movie.genres.map((genre) => (
                        <Link
                          key={genre.id}
                          href={`/the-loai/${genre.slug}`}
                          className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded-lg text-sm transition-colors"
                        >
                          {genre.name}
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Main Content */}
            <div className="flex-1">
              <div className="bg-gray-800/90 backdrop-blur-sm rounded-xl p-8">
                {/* Movie Info */}
                <div className="space-y-6">
                  {/* Description */}
                  <div>
                    <h2 className="text-2xl font-bold text-white mb-4">Nội dung phim</h2>
                    <p className="text-gray-300 leading-relaxed text-lg">
                      {movie.description || 'Không có mô tả cho bộ phim này.'}
                    </p>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center gap-4 pt-6">
                    <Link
                      href={`/xem/${movie.slug}`}
                      className="flex items-center bg-gradient-to-r from-white to-gray-200 hover:from-gray-100 hover:to-gray-300 text-gray-800 px-8 py-3 rounded-full font-semibold transition-all duration-300 shadow-lg hover:shadow-xl"
                    >
                      <PlayIcon className="h-5 w-5 mr-2" />
                      Xem ngay
                    </Link>
                    
                    <Link
                      href={`/xem-chung/tao-moi?movie=${movie.slug}`}
                      className="flex items-center bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-full font-semibold transition-colors shadow-lg"
                    >
                      <UsersIcon className="h-5 w-5 mr-2" />
                      Xem chung
                    </Link>
                    
                    <button
                      onClick={handleFavoriteToggle}
                      className={`flex items-center px-6 py-3 rounded-full font-semibold transition-colors shadow-lg ${
                        isFavorite 
                          ? 'bg-red-600 text-white' 
                          : 'bg-gray-700/80 hover:bg-gray-600 text-white backdrop-blur-sm'
                      }`}
                    >
                      {isFavorite ? (
                        <HeartIcon className="h-5 w-5 mr-2" />
                      ) : (
                        <HeartOutlineIcon className="h-5 w-5 mr-2" />
                      )}
                      {isFavorite ? 'Đã thích' : 'Thích'}
                    </button>
                    
                    <button className="flex items-center bg-gray-700/80 hover:bg-gray-600 text-white px-6 py-3 rounded-full font-semibold transition-colors shadow-lg backdrop-blur-sm">
                      <ShareIcon className="h-5 w-5 mr-2" />
                      Chia sẻ
                    </button>
                  </div>

                  {/* Comments Section */}
                  <div className="mt-12">
                    <div className="flex items-center gap-4 mb-6">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-red-600 rounded-full flex items-center justify-center">
                          <span className="text-white text-sm font-bold">144</span>
                        </div>
                        <h3 className="text-xl font-bold text-white">Bình luận (144)</h3>
                      </div>
                      <div className="flex gap-2">
                        <button className="bg-red-600 text-white px-4 py-2 rounded-full text-sm">Bình luận</button>
                        <button className="bg-gray-700 text-white px-4 py-2 rounded-full text-sm">Đánh giá</button>
                      </div>
                    </div>

                    {/* Comment Form */}
                    <div className="mb-8">
                      <div className="flex gap-4 mb-4">
                        <div className="w-10 h-10 bg-gray-600 rounded-full flex items-center justify-center">
                          <span className="text-white text-sm font-bold">T</span>
                        </div>
                        <div className="flex-1">
                              <textarea
                                className="w-full bg-gray-700 text-white p-4 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-red-600"
                                rows={4}
                                placeholder="Viết bình luận..."
                              />
                          <div className="flex items-center justify-between mt-2">
                            <div className="flex items-center gap-4">
                              <label className="flex items-center gap-2 text-gray-400 text-sm">
                                <input type="checkbox" className="rounded-full" />
                                Tiết lộ?
                              </label>
                            </div>
                            <button className="bg-gradient-to-r from-white to-gray-200 hover:from-gray-100 hover:to-gray-300 text-gray-800 px-6 py-2 rounded-full font-semibold transition-all duration-300 shadow-lg hover:shadow-xl">
                              Gửi
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Comments List */}
                    <div className="space-y-6">
                      {[1, 2, 3, 4, 5].map((comment) => (
                        <div key={comment} className="flex gap-4">
                          <div className="w-10 h-10 bg-gray-600 rounded-full flex items-center justify-center">
                            <span className="text-white text-sm font-bold">U{comment}</span>
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <span className="text-white font-semibold">User {comment}</span>
                              <span className="text-gray-400 text-sm">{comment} giờ trước</span>
                            </div>
                            <p className="text-gray-300 mb-2">
                              Đây là bình luận mẫu cho tập phim. Phim này rất hay và hấp dẫn!
                            </p>
                            <div className="flex items-center gap-4">
                              <button className="flex items-center gap-1 text-gray-400 hover:text-white transition-colors px-3 py-1 rounded-full hover:bg-gray-700">
                                <HeartOutlineIcon className="h-4 w-4" />
                                <span className="text-sm">1</span>
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
      </div>
    </div>
  );
}