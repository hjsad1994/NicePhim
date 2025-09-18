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
      <div className="min-h-screen flex items-center justify-center" style={{backgroundColor: 'var(--bg-2)'}}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-red-600 mx-auto mb-4"></div>
          <div className="text-white text-xl">Đang tải video...</div>
        </div>
      </div>
    );
  }

  if (error || !movie) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{backgroundColor: 'var(--bg-2)'}}>
        <div className="text-center max-w-2xl mx-auto px-4">
          <div className="text-6xl mb-4">🎬</div>
          <h1 className="text-2xl font-bold text-white mb-4">Không thể tải video</h1>
          <p className="text-gray-400 mb-6">{error || 'Phim không tồn tại'}</p>
          
          {error && error.includes('backend') && (
            <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-4 mb-6">
              <h3 className="text-red-400 font-semibold mb-2">Hướng dẫn khắc phục:</h3>
              <ul className="text-red-300 text-sm text-left space-y-1">
                <li>• Đảm bảo backend đang chạy tại http://localhost:8080</li>
                <li>• Kiểm tra kết nối mạng</li>
                <li>• Thử tải lại trang sau vài giây</li>
                <li>• Liên hệ quản trị viên nếu vấn đề vẫn tiếp diễn</li>
              </ul>
            </div>
          )}
          
          <div className="space-y-2">
            <a 
              href="/" 
              className="inline-block bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg transition-colors"
            >
              Về trang chủ
            </a>
            <div className="text-gray-500 text-sm">
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
    <div className="min-h-screen" style={{backgroundColor: 'var(--bg-2)'}}>
      {/* Video Player Section */}
      <div className="w-full pt-12 px-5">
        <VideoPlayer 
          movie={movie}
          videoSources={videoSources}
          hlsUrl={hlsUrl}
        />
      </div>

      {/* Content Below Video */}
      <div className="w-[90%] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
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