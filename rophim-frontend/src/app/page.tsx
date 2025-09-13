'use client';

import { useState, useEffect } from 'react';
import { Hero } from '@/components/movie/Hero';
import { MovieSection } from '@/components/movie/MovieSection';
import { InterestSection } from '@/components/movie/InterestSection';
import { UnifiedBottomBlock } from '@/components/movie/UnifiedBottomBlock';
import { ApiService, MovieResponse, GenreResponse } from '@/lib/api';
import { Movie } from '@/types/movie';
import { 
  featuredMovies, 
  trendingMovies,
  favoriteMoviesList,
  hotGenres
} from '@/lib/mockData';

export default function Home() {
  const [favoriteMovies, setFavoriteMovies] = useState<string[]>([]);
  const [genres, setGenres] = useState<GenreResponse[]>([]);
  const [moviesByGenre, setMoviesByGenre] = useState<{ [genreId: string]: MovieResponse[] }>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const handleFavoriteToggle = (movieId: string) => {
    setFavoriteMovies(prev => 
      prev.includes(movieId) 
        ? prev.filter(id => id !== movieId)
        : [...prev, movieId]
    );
  };

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);
        console.log('🚀 Starting to load data from database...');

        // Load genres from database
        console.log('📋 Loading genres from database...');
        const genresResponse = await ApiService.getGenres();
        console.log('📋 Genres response:', genresResponse);
        
        if (genresResponse.success && genresResponse.data) {
          setGenres(genresResponse.data);
          console.log('✅ Genres loaded from database:', genresResponse.data);
          
          // Load all movies first, then group by genre
          console.log('🎬 Loading all movies...');
          const allMoviesResponse = await ApiService.getMovies(0, 50); // Load more movies
          console.log('🎬 All movies response:', allMoviesResponse);
          
          if (allMoviesResponse.success && allMoviesResponse.data) {
            const moviesData: { [genreId: string]: MovieResponse[] } = {};
            
            // Initialize empty arrays for each genre
            genresResponse.data.forEach(genre => {
              moviesData[genre.genreId] = [];
            });
            
            // For each movie, use its embedded genres to assign to appropriate genre groups
            for (const movie of allMoviesResponse.data) {
              console.log(`🎬 Processing movie: ${movie.title}`, movie.genres);
              
              // Debug slug generation
              const generatedSlug = movie.aliasTitle || movie.title.toLowerCase().replace(/\s+/g, '-');
              console.log(`🔗 Movie slug: "${generatedSlug}" (aliasTitle: "${movie.aliasTitle}", title: "${movie.title}")`);
              
              if (movie.genres && movie.genres.length > 0) {
                // Use genres that are already included in MovieResponse
                movie.genres.forEach(movieGenre => {
                  if (moviesData[movieGenre.genreId]) {
                    moviesData[movieGenre.genreId].push(movie);
                    console.log(`✅ Added ${movie.title} to genre ${movieGenre.name}`);
                  }
                });
              } else {
                console.log(`⚠️ Movie ${movie.title} has no genres assigned`);
              }
            }
            
            console.log('🎬 Final grouped movies data:', moviesData);
            setMoviesByGenre(moviesData);
          } else {
            console.log('⚠️ No movies found in database');
            setMoviesByGenre({});
          }
        } else {
          console.error('❌ Failed to load genres from database:', genresResponse);
          setError('Không thể tải thể loại từ database');
        }
      } catch (err) {
        console.error('❌ Error loading data from database:', err);
        setError(err instanceof Error ? err.message : 'Có lỗi xảy ra khi tải dữ liệu từ database');
      } finally {
        setLoading(false);
        console.log('🏁 Data loading from database completed');
      }
    };

    loadData();
  }, []);

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
      isFeatured: false
    };
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{backgroundColor: 'var(--bg-2)'}}>
        <div className="text-white text-xl">Đang tải dữ liệu từ database...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{backgroundColor: 'var(--bg-2)'}}>
        <div className="text-red-400 text-xl">Lỗi: {error}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{backgroundColor: 'var(--bg-2)'}}>
      {/* 1. Hero Section - Giữ nguyên */}
      <Hero movies={featuredMovies} />

      {/* Movie Sections - Hiển thị phim theo thể loại từ database */}
      <div style={{backgroundColor: 'var(--bg-3)'}} className="border-2 border-gray-400/15 rounded-lg">
        {genres.slice(0, 2).map((genre, index) => {
          const movies = moviesByGenre[genre.genreId] || [];
          const convertedMovies = movies.map(convertToMovie);
          
          if (convertedMovies.length === 0) {
            return (
              <div key={genre.genreId} className={index > 0 ? "py-8 border-t border-gray-400/50" : "py-8"}>
                <div className="w-[90%] mx-auto px-4 sm:px-6 lg:px-8">
                  <h2 className="text-2xl font-bold text-white mb-6">🎬 {genre.name}</h2>
                  <div className="text-center py-12">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-700 rounded-full mb-4">
                      <span className="text-2xl">🎬</span>
                    </div>
                    <p className="text-gray-400 text-lg mb-2">Chưa có phim nào trong thể loại này</p>
                    <p className="text-gray-500 text-sm">Hãy quay lại sau để xem những bộ phim mới!</p>
                  </div>
                </div>
              </div>
            );
          }
          
          return (
            <div key={genre.genreId} className={index > 0 ? "py-8 border-t border-gray-400/50" : "py-8"}>
              <MovieSection
                title={`🎬 ${genre.name}`}
                movies={convertedMovies}
                viewAllLink={`/the-loai/${genre.name.toLowerCase().replace(/\s+/g, '-')}`}
                onFavoriteToggle={handleFavoriteToggle}
                favoriteMovies={favoriteMovies}
              />
            </div>
          );
        })}
      </div>

      {/* 2. Bạn đang quan tâm gì? - Section chủ đề phim từ database */}
      <InterestSection genres={genres} />

      {/* More Movie Sections - Hiển thị thêm phim theo thể loại từ database */}
      <div style={{backgroundColor: 'var(--bg-2)'}} className="border-2 border-gray-400/15 rounded-lg mt-2">
        {genres.slice(2, 4).map((genre, index) => {
          const movies = moviesByGenre[genre.genreId] || [];
          const convertedMovies = movies.map(convertToMovie);
          
          if (convertedMovies.length === 0) {
            return (
              <div key={genre.genreId} className={index > 0 ? "py-8 border-t border-gray-400/50" : "py-8"}>
                <div className="w-[90%] mx-auto px-4 sm:px-6 lg:px-8">
                  <h2 className="text-2xl font-bold text-white mb-6">🎭 {genre.name}</h2>
                  <div className="text-center py-12">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-700 rounded-full mb-4">
                      <span className="text-2xl">🎭</span>
                    </div>
                    <p className="text-gray-400 text-lg mb-2">Chưa có phim nào trong thể loại này</p>
                    <p className="text-gray-500 text-sm">Hãy quay lại sau để xem những bộ phim mới!</p>
                  </div>
                </div>
              </div>
            );
          }
          
          return (
            <div key={genre.genreId} className={index > 0 ? "py-8 border-t border-gray-400/50" : "py-8"}>
              <MovieSection
                title={`🎭 ${genre.name}`}
                movies={convertedMovies}
                viewAllLink={`/the-loai/${genre.name.toLowerCase().replace(/\s+/g, '-')}`}
                onFavoriteToggle={handleFavoriteToggle}
                favoriteMovies={favoriteMovies}
              />
            </div>
          );
        })}
      </div>

      {/* 3. Unified Bottom Block - Comments + 3 Rankings */}
      <UnifiedBottomBlock 
        trendingMovies={trendingMovies}
        favoriteMovies={favoriteMoviesList}
        hotGenres={hotGenres}
      />
    </div>
  );
}