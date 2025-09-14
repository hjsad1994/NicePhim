'use client';

import { useState, useEffect, use } from 'react';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { MovieSection } from '@/components/movie/MovieSection';
import { ApiService, MovieResponse, GenreResponse } from '@/lib/api';
import { Movie } from '@/types/movie';

interface TheLoaiPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export default function TheLoaiPage({ params }: TheLoaiPageProps) {
  const resolvedParams = use(params);
  const [genre, setGenre] = useState<GenreResponse | null>(null);
  const [movies, setMovies] = useState<Movie[]>([]);
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
      isFeatured: false
    };
  };

  useEffect(() => {
    const loadGenreData = async () => {
      try {
        setIsLoading(true);
        console.log('🎬 Loading genre data for slug:', resolvedParams.slug);
        
        // Create fallback genre
        const createFallbackGenre = (): GenreResponse => ({
          genreId: 'fallback-genre',
          name: 'Hành Động'
        });

        try {
          // Load genres from database
          const genresResponse = await Promise.race([
            ApiService.getGenres(),
            new Promise((_, reject) => 
              setTimeout(() => reject(new Error('API timeout')), 5000)
            )
          ]) as any;
          
          let selectedGenre: GenreResponse;
          
          if (genresResponse.success && genresResponse.data && genresResponse.data.length > 0) {
            console.log('📋 Available genres:', genresResponse.data.map(g => ({ name: g.name, slug: g.name.toLowerCase().replace(/\s+/g, '-') })));
            console.log('🔍 Looking for slug:', resolvedParams.slug);
            
            // Find genre by slug - try multiple matching strategies
            let foundGenre = genresResponse.data.find((g: GenreResponse) => 
              g.name.toLowerCase().replace(/\s+/g, '-') === resolvedParams.slug
            );
            
            // If not found, try case-insensitive matching
            if (!foundGenre) {
              foundGenre = genresResponse.data.find((g: GenreResponse) => 
                g.name.toLowerCase().replace(/\s+/g, '-') === resolvedParams.slug.toLowerCase()
              );
            }
            
            // If still not found, try partial matching
            if (!foundGenre) {
              foundGenre = genresResponse.data.find((g: GenreResponse) => 
                resolvedParams.slug.toLowerCase().includes(g.name.toLowerCase()) ||
                g.name.toLowerCase().includes(resolvedParams.slug.toLowerCase())
              );
            }
            
            if (foundGenre) {
              selectedGenre = foundGenre;
              setGenre(foundGenre);
              console.log('✅ Found genre:', foundGenre);
            } else {
              console.log('⚠️ Genre not found, using first available genre');
              // Use first available genre instead of fallback
              selectedGenre = genresResponse.data[0];
              setGenre(genresResponse.data[0]);
            }
          } else {
            console.log('⚠️ No genres in database, using fallback');
            selectedGenre = createFallbackGenre();
            setGenre(createFallbackGenre());
          }

          // Load movies from database
          const moviesResponse = await Promise.race([
            ApiService.getMovies(0, 100),
            new Promise((_, reject) => 
              setTimeout(() => reject(new Error('API timeout')), 5000)
            )
          ]) as any;
          
          if (moviesResponse.success && moviesResponse.data && moviesResponse.data.length > 0) {
            // Convert movies and filter by genre
            const allMovies = moviesResponse.data.map(convertToMovie);
            
            console.log('🎬 All movies:', allMovies.map(m => ({ title: m.title, genres: m.genres.map(g => g.name) })));
            console.log('🎯 Looking for genre:', selectedGenre.name);
            
            const genreMovies = allMovies.filter(movie => 
              movie.genres.some(movieGenre => 
                movieGenre.name.toLowerCase() === selectedGenre.name.toLowerCase()
              )
            );
            
            setMovies(genreMovies);
            console.log(`🎬 Found ${genreMovies.length} movies for genre ${selectedGenre.name}`);
          } else {
            console.log('⚠️ No movies in database');
            setMovies([]);
          }
        } catch (apiError) {
          console.error('❌ API call failed:', apiError);
          setGenre(createFallbackGenre());
          setMovies([]);
        }
        
      } catch (error) {
        console.error('❌ Unexpected error:', error);
        setError('Có lỗi xảy ra khi tải dữ liệu');
      } finally {
        setIsLoading(false);
      }
    };

    loadGenreData();
  }, [resolvedParams.slug]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{backgroundColor: 'var(--bg-2)'}}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-red-600 mx-auto mb-4"></div>
          <div className="text-white text-xl">Đang tải thể loại...</div>
        </div>
      </div>
    );
  }

  if (error || !genre) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{backgroundColor: 'var(--bg-2)'}}>
      <div className="text-center">
        <h1 className="text-2xl font-bold text-white mb-4">Thể loại không tìm thấy</h1>
        <p className="text-gray-400 mb-6">{error || 'Thể loại này không tồn tại'}</p>
        <Link
          href="/"
          className="inline-flex items-center px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors"
        >
          ← Quay lại trang chủ
        </Link>
      </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{backgroundColor: 'var(--bg-2)'}}>
      <div className="w-[90%] mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white mb-4">
            Phim {genre.name}
          </h1>
          <p className="text-gray-300 text-lg">
            Khám phá những bộ phim {genre.name} hay nhất
          </p>
          <div className="mt-4 text-gray-400">
            Tìm thấy {movies.length} bộ phim
          </div>
        </div>

        {/* Movies Grid */}
        {movies.length > 0 ? (
          <MovieSection
            title=""
            movies={movies}
            showHeader={false}
          />
        ) : (
          <div className="text-center py-16">
            <h3 className="text-2xl font-semibold text-white mb-2">
              Chưa có phim {genre.name}
            </h3>
            <p className="text-gray-400 mb-6">
              Chúng tôi đang cập nhật thêm phim {genre.name} mới. Hãy quay lại sau nhé!
            </p>
            <div className="space-y-4">
              <p className="text-gray-500 text-sm">
                Mẹo: Hãy thử các thể loại khác hoặc quay lại sau để xem phim mới!
              </p>
            </div>
          </div>
        )}

        {/* Back Navigation */}
        <div className="text-center mt-12">
          <Link
            href="/"
            className="inline-flex items-center px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors mr-4"
          >
            ← Quay lại trang chủ
          </Link>
          <Link
            href="/chu-de"
            className="inline-flex items-center px-6 py-3 border border-gray-600 text-gray-300 hover:bg-gray-700 rounded-lg font-medium transition-colors"
          >
            Xem thêm chủ đề
          </Link>
        </div>
      </div>
    </div>
  );
}