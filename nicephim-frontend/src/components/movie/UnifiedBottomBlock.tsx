'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  MinusIcon,
  FireIcon,
  HeartIcon as HeartSolid,
  SparklesIcon,
  FilmIcon
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid';
import { Movie } from '@/types/movie';
import { getImageUrl } from '@/lib/utils';

interface UnifiedBottomBlockProps {
  trendingMovies: Array<Movie & { trend: 'up' | 'down' | 'stable' }>;
  favoriteMovies: Array<Movie & { trend: 'up' | 'down' | 'stable' }>;
  hotGenres: Array<{
    id: string;
    name: string;
    movieCount: number;
    thumbnail: string;
    trending: boolean;
    trend: 'up' | 'down' | 'stable';
  }>;
}

export function UnifiedBottomBlock({
  trendingMovies,
  favoriteMovies,
  hotGenres
}: UnifiedBottomBlockProps) {
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);

  // Helper function to render trend indicator
  const renderTrendIndicator = (trend: 'up' | 'down' | 'stable') => {
    switch (trend) {
      case 'up':
        return <ArrowTrendingUpIcon className="h-4 w-4 text-green-400" />;
      case 'down':
        return <ArrowTrendingDownIcon className="h-4 w-4 text-red-400" />;
      case 'stable':
        return <MinusIcon className="h-4 w-4 text-gray-400" />;
    }
  };

  const getGenreGradient = (index: number) => {
    const gradients = [
      'from-red-600 to-pink-600',
      'from-purple-600 to-blue-600',
      'from-green-600 to-teal-600',
      'from-yellow-600 to-orange-600',
      'from-indigo-600 to-purple-600',
      'from-pink-600 to-rose-600'
    ];
    return gradients[index % gradients.length];
  };

  return (
    <section className="relative py-20 bg-gradient-to-b from-gray-900 via-black to-black overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-orange-600/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-red-600/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-r from-orange-600/10 via-red-600/10 to-pink-600/10 rounded-full blur-3xl animate-pulse"></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-white via-orange-300 to-white bg-clip-text text-transparent mb-4">
            Bảng Xếp Hạng
          </h2>
          <p className="text-xl md:text-2xl text-gray-400 max-w-2xl mx-auto">
            Khám phá phim trending, yêu thích và thể loại đang hot nhất hiện nay
          </p>
        </div>

        {/* Rankings Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Sôi nổi nhất */}
          <div
            className="relative bg-gradient-to-br from-gray-800/80 via-gray-800/60 to-gray-900/80 rounded-2xl backdrop-blur-sm border border-gray-700/30 overflow-hidden transition-all duration-300 hover:border-orange-500/50"
            onMouseEnter={() => setHoveredCard('trending')}
            onMouseLeave={() => setHoveredCard(null)}
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-orange-600/20 to-red-600/20 p-6 border-b border-gray-700/30">
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <FireIcon className="h-8 w-8 text-orange-400" />
                  <div className="absolute inset-0 bg-orange-400/20 rounded-full blur-lg animate-pulse"></div>
                </div>
                <h3 className="text-2xl font-bold text-white">Sôi nổi nhất</h3>
              </div>
              <p className="text-gray-400 text-sm mt-2">Phim đang được xem nhiều nhất</p>
            </div>

            {/* Content */}
            <div className="p-6 space-y-4">
              {trendingMovies.slice(0, 5).map((movie, index) => (
                <div
                  key={movie.id}
                  className="group relative flex items-center space-x-4 p-3 rounded-xl bg-gray-700/30 hover:bg-gray-700/50 transition-colors duration-200"
                >
                  {/* Rank Number */}
                  <div className="flex-shrink-0">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-lg ${
                      index === 0 ? 'bg-gradient-to-r from-yellow-500 to-orange-500 text-white' :
                      index === 1 ? 'bg-gradient-to-r from-gray-400 to-gray-500 text-white' :
                      index === 2 ? 'bg-gradient-to-r from-orange-700 to-red-700 text-white' :
                      'bg-gray-600 text-gray-300'
                    }`}>
                      {index + 1}
                    </div>
                  </div>

                  {/* Trend Indicator */}
                  <div className="flex-shrink-0">
                    {renderTrendIndicator(movie.trend)}
                  </div>

                  {/* Movie Thumbnail */}
                  <div className="flex-shrink-0 relative">
                    <Image
                      alt={movie.title}
                      src={getImageUrl(movie.poster, 'small')}
                      width={48}
                      height={60}
                      className="rounded-lg object-cover w-12 h-15"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent rounded-lg opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>

                  {/* Movie Info */}
                  <div className="flex-1 min-w-0">
                    <Link
                      href={`/phim/${movie.slug}`}
                      className="text-white font-medium text-sm hover:text-orange-400 transition-colors line-clamp-2 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-orange-400 group-hover:to-red-400"
                    >
                      {movie.title}
                    </Link>
                    <div className="flex items-center space-x-2 mt-1">
                      <span className="text-xs text-gray-500">{movie.releaseYear}</span>
                      {movie.imdbRating && (
                        <span className="text-xs text-orange-400">★ {movie.imdbRating}</span>
                      )}
                    </div>
                  </div>

                  </div>
              ))}

              {/* View More */}
              <Link
                href="/trending"
                className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-orange-600/20 to-red-600/20 border border-orange-500/30 rounded-lg text-orange-400 text-sm font-medium hover:from-orange-600/30 hover:to-red-600/30 hover:border-orange-500/50 transition-colors duration-200"
              >
                Xem tất cả
                <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
          </div>

          {/* Yêu thích nhất */}
          <div
            className="relative bg-gradient-to-br from-gray-800/80 via-gray-800/60 to-gray-900/80 rounded-2xl backdrop-blur-sm border border-gray-700/30 overflow-hidden transition-all duration-300 hover:border-red-500/50"
            onMouseEnter={() => setHoveredCard('favorites')}
            onMouseLeave={() => setHoveredCard(null)}
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-red-600/20 to-pink-600/20 p-6 border-b border-gray-700/30">
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <HeartSolidIcon className="h-8 w-8 text-red-400" />
                  <div className="absolute inset-0 bg-red-400/20 rounded-full blur-lg animate-pulse"></div>
                </div>
                <h3 className="text-2xl font-bold text-white">Yêu thích nhất</h3>
              </div>
              <p className="text-gray-400 text-sm mt-2">Phim được yêu thích nhất bởi cộng đồng</p>
            </div>

            {/* Content */}
            <div className="p-6 space-y-4">
              {favoriteMovies.slice(0, 5).map((movie, index) => (
                <div
                  key={movie.id}
                  className="group relative flex items-center space-x-4 p-3 rounded-xl bg-gray-700/30 hover:bg-gray-700/50 transition-colors duration-200"
                >
                  {/* Rank Number */}
                  <div className="flex-shrink-0">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-lg ${
                      index === 0 ? 'bg-gradient-to-r from-pink-500 to-red-500 text-white' :
                      index === 1 ? 'bg-gradient-to-r from-red-400 to-pink-400 text-white' :
                      index === 2 ? 'bg-gradient-to-r from-rose-600 to-pink-600 text-white' :
                      'bg-gray-600 text-gray-300'
                    }`}>
                      {index + 1}
                    </div>
                  </div>

                  {/* Trend Indicator */}
                  <div className="flex-shrink-0">
                    {renderTrendIndicator(movie.trend)}
                  </div>

                  {/* Movie Thumbnail */}
                  <div className="flex-shrink-0 relative">
                    <Image
                      alt={movie.title}
                      src={getImageUrl(movie.poster, 'small')}
                      width={48}
                      height={60}
                      className="rounded-lg object-cover w-12 h-15"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent rounded-lg opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>

                  {/* Movie Info */}
                  <div className="flex-1 min-w-0">
                    <Link
                      href={`/phim/${movie.slug}`}
                      className="text-white font-medium text-sm hover:text-red-400 transition-colors line-clamp-2 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-red-400 group-hover:to-pink-400"
                    >
                      {movie.title}
                    </Link>
                    <div className="flex items-center space-x-2 mt-1">
                      <span className="text-xs text-gray-500">{movie.releaseYear}</span>
                      {movie.imdbRating && (
                        <span className="text-xs text-red-400">★ {movie.imdbRating}</span>
                      )}
                    </div>
                  </div>

                  {/* Heart Icon */}
                  <HeartSolidIcon className="h-4 w-4 text-red-400 opacity-60" />

                </div>
              ))}

              {/* View More */}
              <Link
                href="/favorites"
                className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-red-600/20 to-pink-600/20 border border-red-500/30 rounded-lg text-red-400 text-sm font-medium hover:from-red-600/30 hover:to-pink-600/30 hover:border-red-500/50 transition-colors duration-200"
              >
                Xem tất cả
                <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
          </div>

          {/* Thể loại Hot */}
          <div
            className="relative bg-gradient-to-br from-gray-800/80 via-gray-800/60 to-gray-900/80 rounded-2xl backdrop-blur-sm border border-gray-700/30 overflow-hidden transition-all duration-300 hover:border-yellow-500/50"
            onMouseEnter={() => setHoveredCard('genres')}
            onMouseLeave={() => setHoveredCard(null)}
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-yellow-600/20 to-orange-600/20 p-6 border-b border-gray-700/30">
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <SparklesIcon className="h-8 w-8 text-yellow-400" />
                  <div className="absolute inset-0 bg-yellow-400/20 rounded-full blur-lg animate-pulse"></div>
                </div>
                <h3 className="text-2xl font-bold text-white">Thể loại Hot</h3>
              </div>
              <p className="text-gray-400 text-sm mt-2">Các thể loại phim đang thịnh hành nhất</p>
            </div>

            {/* Content */}
            <div className="p-6 space-y-4">
              {hotGenres.map((genre, index) => (
                <div
                  key={genre.id}
                  className="group relative flex items-center space-x-4 p-3 rounded-xl bg-gray-700/30 hover:bg-gray-700/50 transition-colors duration-200"
                >
                  {/* Rank Number */}
                  <div className="flex-shrink-0">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-lg ${
                      index === 0 ? 'bg-gradient-to-r from-yellow-500 to-orange-500 text-white' :
                      index === 1 ? 'bg-gradient-to-r from-orange-400 to-yellow-400 text-white' :
                      index === 2 ? 'bg-gradient-to-r from-yellow-600 to-orange-600 text-white' :
                      'bg-gray-600 text-gray-300'
                    }`}>
                      {index + 1}
                    </div>
                  </div>

                  {/* Trend Indicator */}
                  <div className="flex-shrink-0">
                    {renderTrendIndicator(genre.trend)}
                  </div>

                  {/* Genre Icon */}
                  <div className="flex-shrink-0">
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${getGenreGradient(index)} flex items-center justify-center`}>
                      <FilmIcon className="h-6 w-6 text-white" />
                    </div>
                  </div>

                  {/* Genre Info */}
                  <div className="flex-1 min-w-0">
                    <Link
                      href={`/the-loai/${genre.id}`}
                      className="text-white font-medium text-sm hover:text-yellow-400 transition-colors line-clamp-2 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-yellow-400 group-hover:to-orange-400"
                    >
                      {genre.name}
                    </Link>
                    <div className="flex items-center space-x-2 mt-1">
                      <span className="text-xs text-gray-500">{genre.movieCount} phim</span>
                      {genre.trending && (
                        <span className="text-xs text-yellow-400">🔥 Trending</span>
                      )}
                    </div>
                  </div>

                    </div>
              ))}

              {/* View More */}
              <Link
                href="/genres"
                className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-yellow-600/20 to-orange-600/20 border border-yellow-500/30 rounded-lg text-yellow-400 text-sm font-medium hover:from-yellow-600/30 hover:to-orange-600/30 hover:border-yellow-500/50 transition-colors duration-200"
              >
                Xem tất cả
                <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
