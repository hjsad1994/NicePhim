'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { MovieCard } from '@/components/movie/MovieCard';
import { ApiService, MovieResponse } from '@/lib/api';
import { Movie } from '@/types/movie';

export default function PhimMoiPage() {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [favoriteMovies, setFavoriteMovies] = useState<string[]>([]);

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
      isFeatured: false,
      videoId: movieResponse.videoId,
      hlsUrl: movieResponse.hlsUrl,
      videoStatus: movieResponse.videoStatus
    };
  };

  // Load movies from API
  useEffect(() => {
    const loadMovies = async () => {
      try {
        setIsLoading(true);
        const response = await ApiService.getMovies(0, 100); // Get first 100 movies
        
        if (response.success && response.data) {
          const convertedMovies = response.data.map(convertToMovie);
          
          // Sort by createdAt to show newest first
          const sortedMovies = convertedMovies.sort((a, b) => {
            const dateA = new Date(a.createdAt).getTime();
            const dateB = new Date(b.createdAt).getTime();
            return dateB - dateA; // Newest first
          });
          
          setMovies(sortedMovies);
        } else {
          console.error('Failed to load movies:', response.error);
          setMovies([]);
        }
      } catch (error) {
        console.error('Error loading movies:', error);
        setMovies([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadMovies();
  }, []);

  const handleFavoriteToggle = (movieId: string) => {
    setFavoriteMovies(prev => 
      prev.includes(movieId) 
        ? prev.filter(id => id !== movieId)
        : [...prev, movieId]
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-red-600 mx-auto mb-4"></div>
          <div className="text-white text-xl">Đang tải phim mới...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      <div className="w-[90%] mx-auto px-4 sm:px-6 lg:px-8 py-12 pt-24">
        {/* Header */}
        <div className="mb-8">
          <nav className="flex items-center space-x-2 text-sm text-gray-400 mb-4">
            <Link href="/" className="hover:text-red-400 transition-colors">
              Trang chủ
            </Link>
            <span>/</span>
            <span className="text-white">Phim Mới</span>
          </nav>
          
          <div className="flex items-center space-x-4 mb-6">
            <div className="w-1 h-8 bg-gradient-to-r from-red-600 to-pink-600 rounded"></div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
              🆕 Phim Mới Cập Nhật
            </h1>
          </div>
          
          <p className="text-gray-400 text-lg">
            Những bộ phim mới nhất được cập nhật liên tục từ database
          </p>
        </div>

        {/* Movies Grid */}
        <div className="border-2 border-gray-400/15 rounded-2xl bg-[#23242F] overflow-hidden">
          <div className="p-8">
            {movies.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-8 lg:gap-12">
                {movies.map((movie) => (
                  <MovieCard
                    key={movie.id}
                    movie={movie}
                    size="medium"
                    showDetails={true}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-20">
                <div className="text-6xl mb-4">🎬</div>
                <h3 className="text-xl font-semibold text-white mb-2">Chưa có phim nào</h3>
                <p className="text-gray-400 text-lg mb-6">
                  Hãy thêm phim mới từ trang quản trị
                </p>
                <Link
                  href="/admin/movies/upload"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-red-600 to-pink-600 text-white font-semibold rounded-xl hover:from-red-700 hover:to-pink-700 transition-all duration-300"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Thêm Phim Mới
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Stats */}
        {movies.length > 0 && (
          <div className="mt-8 flex items-center justify-between">
            <p className="text-gray-400">
              Hiển thị <span className="text-white font-semibold">{movies.length}</span> phim mới cập nhật
            </p>
            <div className="flex items-center gap-2 text-sm text-gray-400">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span>Cập nhật từ database</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
