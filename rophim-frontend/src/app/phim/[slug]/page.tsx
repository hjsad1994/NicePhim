'use client';

import { useState, useEffect } from 'react';
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
  ChevronLeftIcon
} from '@heroicons/react/24/solid';
import { HeartIcon as HeartOutlineIcon } from '@heroicons/react/24/outline';
import { Movie } from '@/types/movie';
import { mockMovies } from '@/lib/mockData';
import { getImageUrl } from '@/lib/utils';

interface MovieDetailPageProps {
  params: {
    slug: string;
  };
}

export default function MovieDetailPage({ params }: MovieDetailPageProps) {
  const [movie, setMovie] = useState<Movie | null>(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate API call to get movie by slug
    const foundMovie = mockMovies.find(m => m.slug === params.slug);
    
    if (foundMovie) {
      setMovie(foundMovie);
      // Check if movie is in favorites (from localStorage or API)
      const favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
      setIsFavorite(favorites.includes(foundMovie.id));
    }
    
    setIsLoading(false);
  }, [params.slug]);

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
    notFound();
  }

  return (
    <div className="min-h-screen" style={{backgroundColor: 'var(--bg-2)'}}>
      {/* Back Navigation */}
      <div className="sticky top-16 z-40 backdrop-blur-sm" style={{backgroundColor: 'var(--bg-2)/90'}}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Link 
            href="/"
            className="inline-flex items-center text-gray-300 hover:text-white transition-colors"
          >
            <ChevronLeftIcon className="h-5 w-5 mr-2" />
            Quay lại trang chủ
          </Link>
        </div>
      </div>

      {/* Movie Hero Section */}
      <div className="relative">
        {/* Background Image */}
        <div className="absolute inset-0 h-96 lg:h-[500px]">
          <Image
            src={getImageUrl(movie.banner || movie.poster, 'large')}
            alt={movie.title}
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
        </div>

        {/* Content */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-16">
          <div className="flex flex-col lg:flex-row gap-8 items-start">
            {/* Poster */}
            <div className="flex-shrink-0">
              <div className="w-64 h-96 lg:w-80 lg:h-[480px] relative rounded-xl overflow-hidden shadow-2xl">
                <Image
                  src={getImageUrl(movie.poster, 'large')}
                  alt={movie.title}
                  fill
                  className="object-cover"
                />
              </div>
            </div>

            {/* Movie Info */}
            <div className="flex-1 text-white space-y-6 lg:pt-8">
              {/* Title & Quality */}
              <div>
                <h1 className="text-3xl lg:text-5xl font-bold mb-2">{movie.title}</h1>
                {movie.originalTitle && (
                  <p className="text-xl text-gray-300 mb-4">{movie.originalTitle}</p>
                )}
                <div className="flex items-center gap-2 mb-4">
                  <span className="bg-red-600 text-white px-3 py-1 rounded-lg font-semibold">
                    {movie.quality}
                  </span>
                  {movie.isHot && (
                    <span className="bg-orange-500 text-white px-3 py-1 rounded-lg font-bold">
                      HOT
                    </span>
                  )}
                </div>
              </div>

              {/* Stats */}
              <div className="flex items-center gap-6 text-gray-300">
                {movie.imdbRating && (
                  <div className="flex items-center gap-2">
                    <StarIcon className="h-5 w-5 text-yellow-400" />
                    <span className="font-semibold">{movie.imdbRating}</span>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <CalendarIcon className="h-5 w-5" />
                  <span>{movie.releaseYear}</span>
                </div>
                {movie.duration && (
                  <div className="flex items-center gap-2">
                    <ClockIcon className="h-5 w-5" />
                    <span>{movie.duration}</span>
                  </div>
                )}
              </div>

              {/* Genres */}
              <div className="flex flex-wrap gap-2">
                {movie.genres.map((genre) => (
                  <Link
                    key={genre.id}
                    href={`/the-loai/${genre.slug}`}
                    className="bg-gray-700/50 hover:bg-gray-600/50 text-gray-200 px-3 py-1.5 rounded-lg text-sm transition-colors"
                  >
                    <TagIcon className="h-4 w-4 inline mr-1" />
                    {genre.name}
                  </Link>
                ))}
              </div>

              {/* Description */}
              {movie.description && (
                <p className="text-gray-300 text-lg leading-relaxed max-w-4xl">
                  {movie.description}
                </p>
              )}

              {/* Action Buttons */}
              <div className="flex items-center gap-4 pt-4">
                <Link
                  href={`/xem/${movie.slug}`}
                  className="flex items-center bg-red-600 hover:bg-red-700 text-white px-8 py-4 rounded-xl font-semibold text-lg transition-colors"
                >
                  <PlayIcon className="h-6 w-6 mr-3" />
                  Xem phim
                </Link>
                
                {/* Favorite Button - LARGE & PROMINENT */}
                <button
                  onClick={handleFavoriteToggle}
                  className={`flex items-center px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-300 ${
                    isFavorite 
                      ? 'bg-red-600 hover:bg-red-700 text-white' 
                      : 'bg-gray-700/80 hover:bg-gray-600/80 text-gray-200 hover:text-white'
                  }`}
                  aria-label={isFavorite ? 'Bỏ yêu thích' : 'Thêm vào yêu thích'}
                >
                  {isFavorite ? (
                    <HeartIcon className="h-6 w-6 mr-3 text-white" />
                  ) : (
                    <HeartOutlineIcon className="h-6 w-6 mr-3" />
                  )}
                  {isFavorite ? 'Đã yêu thích' : 'Yêu thích'}
                </button>

                <button className="flex items-center bg-gray-700/80 hover:bg-gray-600/80 text-gray-200 hover:text-white px-6 py-4 rounded-xl font-semibold transition-colors">
                  <ShareIcon className="h-5 w-5 mr-2" />
                  Chia sẻ
                </button>
              </div>

              {/* Additional Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-6 text-sm">
                <div>
                  <span className="text-gray-400">Đạo diễn:</span>
                  <span className="text-white ml-2">{movie.director || 'Đang cập nhật'}</span>
                </div>
                <div>
                  <span className="text-gray-400">Diễn viên:</span>
                  <span className="text-white ml-2">{movie.cast?.join(', ') || 'Đang cập nhật'}</span>
                </div>
                <div>
                  <span className="text-gray-400">Quốc gia:</span>
                  <span className="text-white ml-2">{movie.country}</span>
                </div>
                {movie.totalEpisodes && (
                  <div>
                    <span className="text-gray-400">Tập phim:</span>
                    <span className="text-white ml-2">
                      {movie.currentEpisodes}/{movie.totalEpisodes}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Related Movies Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h2 className="text-2xl font-bold text-white mb-8">Phim liên quan</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {mockMovies
            .filter(m => m.id !== movie.id && m.genres.some(g => movie.genres.some(mg => mg.id === g.id)))
            .slice(0, 6)
            .map((relatedMovie) => (
              <Link
                key={relatedMovie.id}
                href={`/phim/${relatedMovie.slug}`}
                className="group"
              >
                <div className="relative aspect-[2/3] rounded-lg overflow-hidden">
                  <Image
                    src={getImageUrl(relatedMovie.poster, 'medium')}
                    alt={relatedMovie.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300" />
                </div>
                <h3 className="text-white text-sm mt-2 line-clamp-2 group-hover:text-red-400 transition-colors">
                  {relatedMovie.title}
                </h3>
              </Link>
            ))}
        </div>
      </div>
    </div>
  );
}
