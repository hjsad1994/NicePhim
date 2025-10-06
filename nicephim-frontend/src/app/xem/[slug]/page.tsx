'use client';

import { useState, useEffect, use } from 'react';
import { VideoPlayer } from '@/components/video/VideoPlayer';
import { VideoComments } from '@/components/video/VideoComments';
import { RelatedMovies } from '@/components/video/RelatedMovies';
import { MovieInfo } from '@/components/video/MovieInfo';
import { ApiService, MovieResponse } from '@/lib/api';
import { Movie } from '@/types/movie';

interface WatchPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export default function WatchPage({ params }: WatchPageProps) {
  const resolvedParams = use(params);
  // Decode URL-encoded slug and convert spaces to hyphens (e.g., "cai%20gi" -> "cai-gi")
  const decodedSlug = decodeURIComponent(resolvedParams.slug).replace(/\s+/g, '-');
  const [movie, setMovie] = useState<Movie | null>(null);
  const [relatedMovies, setRelatedMovies] = useState<Movie[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Convert MovieResponse to Movie type for compatibility
  const convertToMovie = (movieResponse: MovieResponse): Movie => {
    const slug = movieResponse.aliasTitle || movieResponse.title.toLowerCase().replace(/\s+/g, '-');
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
      // Add video data for HLS streaming
      videoId: movieResponse.videoId,
      hlsUrl: movieResponse.hlsUrl,
      videoStatus: movieResponse.videoStatus
    };
  };

  useEffect(() => {
    const loadMovie = async () => {
      try {
        setIsLoading(true);
        console.log('🎬 Loading movie for video player:', decodedSlug);
        
        // Create realistic fallback movie for video player
        const createFallbackMovie = (): Movie => ({
          id: 'video-movie-1',
          title: 'Spider-Man: No Way Home',
          slug: decodedSlug,
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
            
            // Get related movies by fetching all movies and filtering by genres
            try {
              const allMoviesResponse = await ApiService.getMovies(0, 100);
              if (allMoviesResponse.success && allMoviesResponse.data) {
                const allMovies = allMoviesResponse.data.map(convertToMovie);
                const related = allMovies
                  .filter(m => m.id !== foundMovie.id && 
                    m.genres.some(g => foundMovie.genres.some(mg => mg.id === g.id)))
                  .slice(0, 8);
                setRelatedMovies(related);
              }
            } catch (relatedError) {
              console.log('⚠️ Could not fetch related movies:', relatedError);
              setRelatedMovies([]);
            }
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
                  
                  // Get related movies
                  const related = allMovies
                    .filter(m => m.id !== foundMovie.id && 
                      m.genres.some(g => foundMovie.genres.some(mg => mg.id === g.id)))
                    .slice(0, 8);
                  setRelatedMovies(related);
                  return;
                }
              }
            } catch (fallbackError) {
              console.error('❌ Fallback also failed:', fallbackError);
            }
            
            setError(`Không tìm thấy phim với slug: ${decodedSlug}. Vui lòng kiểm tra lại URL hoặc đảm bảo backend đang chạy.`);
            return;
          }
        } catch (apiError) {
          console.error('❌ API call failed:', apiError);
          if (apiError instanceof Error && apiError.message.includes('Failed to fetch')) {
            setError('Không thể kết nối đến server. Vui lòng đảm bảo backend đang chạy tại http://localhost:8080');
          } else {
            setError(`Lỗi khi tải dữ liệu phim: ${apiError instanceof Error ? apiError.message : 'Lỗi không xác định'}`);
          }
          return;
        }
        
      } catch (error) {
        console.error('❌ Unexpected error:', error);
        setError('Có lỗi xảy ra khi tải phim');
      } finally {
        setIsLoading(false);
      }
    };

    loadMovie();
  }, [decodedSlug]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-black via-gray-900 to-black">
        <div className="text-center">
          <div className="relative mb-8">
            <div className="w-32 h-32 bg-gradient-to-br from-red-600 to-pink-600 rounded-full flex items-center justify-center mx-auto">
              <div className="animate-spin rounded-full h-24 w-24 border-b-2 border-white"></div>
            </div>
            <div className="absolute -inset-4 bg-gradient-to-r from-red-600 to-pink-600 rounded-full blur-xl opacity-50 animate-pulse"></div>
          </div>
          <div className="text-white text-xl font-medium mb-2">Đang tải video...</div>
          <div className="text-gray-400 text-sm">Vui lòng chờ trong giây lát</div>
        </div>
      </div>
    );
  }

  if (error || !movie) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-black via-gray-900 to-black">
        <div className="text-center max-w-2xl mx-auto px-6">
          <div className="relative mb-8">
            <div className="w-24 h-24 bg-gradient-to-br from-red-600 to-pink-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <span className="text-4xl">🎬</span>
            </div>
            <div className="absolute -inset-2 bg-gradient-to-r from-red-600 to-pink-600 rounded-full blur-xl opacity-30"></div>
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-white via-gray-300 to-white bg-clip-text text-transparent mb-4">
            Không thể tải video
          </h1>
          <p className="text-gray-400 text-lg mb-8 leading-relaxed">{error || 'Phim không tồn tại'}</p>

          {error && error.includes('backend') && (
            <div className="bg-red-900/20 backdrop-blur-sm border border-red-500/30 rounded-2xl p-6 mb-8">
              <h3 className="text-red-400 font-semibold mb-4 flex items-center">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                Hướng dẫn khắc phục:
              </h3>
              <ul className="text-red-300 text-sm text-left space-y-2 ml-6">
                <li className="flex items-start">
                  <span className="mr-2">•</span>
                  Đảm bảo backend đang chạy tại http://localhost:8080
                </li>
                <li className="flex items-start">
                  <span className="mr-2">•</span>
                  Kiểm tra kết nối mạng
                </li>
                <li className="flex items-start">
                  <span className="mr-2">•</span>
                  Thử tải lại trang sau vài giây
                </li>
                <li className="flex items-start">
                  <span className="mr-2">•</span>
                  Liên hệ quản trị viên nếu vấn đề vẫn tiếp diễn
                </li>
              </ul>
            </div>
          )}

          <div className="space-y-4">
            <a
              href="/"
              className="inline-flex items-center px-8 py-3 bg-gradient-to-r from-red-600 to-pink-600 text-white font-medium rounded-xl hover:from-red-700 hover:to-pink-700 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              Về trang chủ
            </a>
            <div className="text-gray-500 text-sm bg-gray-800/50 backdrop-blur-sm rounded-lg px-4 py-2">
              URL hiện tại: /xem/{decodedSlug}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Mock video sources with different qualities (fallback)
  const videoSources = [
    { quality: '360p', url: 'https://sample-videos.com/zip/10/mp4/mp4-360p.mp4' },
    { quality: '720p', url: 'https://sample-videos.com/zip/10/mp4/mp4-720p.mp4' },
    { quality: '1080p', url: 'https://sample-videos.com/zip/10/mp4/mp4-1080p.mp4' },
  ];

  // Check if movie has uploaded video data
  const hasUploadedVideo = movie.videoId && movie.hlsUrl && movie.videoStatus === 'ready';
  const hlsUrl = hasUploadedVideo ? `http://localhost:8080${movie.hlsUrl}` : null;
  
  console.log('🎬 Movie video data:', {
    videoId: movie.videoId,
    hlsUrl: movie.hlsUrl,
    videoStatus: movie.videoStatus,
    hasUploadedVideo,
    fullHlsUrl: hlsUrl
  });

  return (
    <div className="min-h-screen bg-black relative overflow-hidden">
      {/* Modern Gradient Background */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-rose-600/10 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-pink-600/5 rounded-full blur-3xl animate-pulse delay-2000"></div>

      {/* Video Player Section */}
      <div className="relative w-full pt-20 pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <VideoPlayer
            movie={movie}
            videoSources={videoSources}
            hlsUrl={hlsUrl}
          />
        </div>
      </div>

      {/* Content Below Video */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Movie Info */}
            <MovieInfo movie={movie} />

            {/* Comments Section */}
            <VideoComments movieId={movie.id} />
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <RelatedMovies movies={relatedMovies} />
          </div>
        </div>
      </div>
    </div>
  );
}