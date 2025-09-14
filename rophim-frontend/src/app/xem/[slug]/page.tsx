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
        console.log('🎬 Loading movie for video player:', resolvedParams.slug);
        
        // Create realistic fallback movie for video player
        const createFallbackMovie = (): Movie => ({
          id: 'video-movie-1',
          title: 'Spider-Man: No Way Home',
          slug: resolvedParams.slug,
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
          ]) as any;
          
          if (moviesResponse.success && moviesResponse.data && moviesResponse.data.length > 0) {
            // Convert MovieResponse to Movie and find by slug
            const movies = moviesResponse.data.map(convertToMovie);
            console.log('🎬 All movies from API:', movies);
            console.log('🎬 Looking for slug:', resolvedParams.slug);
            
            const foundMovie = movies.find(m => m.slug === resolvedParams.slug);
            
            if (foundMovie) {
              console.log('✅ Found movie for video player:', foundMovie);
              setMovie(foundMovie);
              
              // Get related movies (same genres)
              const related = movies
                .filter(m => m.id !== foundMovie.id && 
                  m.genres.some(g => foundMovie.genres.some(mg => mg.id === g.id)))
                .slice(0, 8);
              setRelatedMovies(related);
            } else {
              console.log('⚠️ Movie not found, using fallback');
              setMovie(createFallbackMovie());
              setRelatedMovies([]);
            }
          } else {
            console.log('⚠️ No movies in database, using fallback');
            setMovie(createFallbackMovie());
            setRelatedMovies([]);
          }
        } catch (apiError) {
          console.error('❌ API call failed:', apiError);
          console.log('⚠️ Using fallback movie for video player');
          setMovie(createFallbackMovie());
          setRelatedMovies([]);
        }
        
      } catch (error) {
        console.error('❌ Unexpected error:', error);
        setError('Có lỗi xảy ra khi tải phim');
      } finally {
        setIsLoading(false);
      }
    };

    loadMovie();
  }, [resolvedParams.slug]);

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
        <div className="text-center">
          <div className="text-6xl mb-4">🎬</div>
          <h1 className="text-2xl font-bold text-white mb-4">Không thể tải video</h1>
          <p className="text-gray-400 mb-6">{error || 'Phim không tồn tại'}</p>
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
      <div className="w-full">
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