'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { PlayIcon, StarIcon, HeartIcon, ClockIcon, EyeIcon } from '@heroicons/react/24/outline';
import { StarIcon as StarSolidIcon, HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid';
import { Movie } from '@/types/movie';
import { getImageUrl, truncateText } from '@/lib/utils';

interface MovieCardProps {
  movie: Movie;
  size?: 'small' | 'medium' | 'large';
  showDetails?: boolean;
  isFavorite?: boolean;
  onFavoriteToggle?: (movieId: string) => void;
}

export function MovieCard({
  movie,
  size = 'medium',
  showDetails = true,
  isFavorite = false,
  onFavoriteToggle
}: MovieCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);

  const sizeClasses = {
    small: {
      container: 'w-40 sm:w-44',
      title: 'text-xs',
      description: 'text-xs',
    },
    medium: {
      container: 'w-48 sm:w-56',
      title: 'text-sm',
      description: 'text-sm',
    },
    large: {
      container: 'w-56 sm:w-64',
      title: 'text-base',
      description: 'text-base',
    },
  };

  const classes = sizeClasses[size];

  // Get episodes data for separate badges
  const getEpisodesData = () => {
    const episodes = movie.availableEpisodes;
    if (!episodes) return { subtitled: 0, dubbed: 0 };

    return {
      subtitled: episodes.subtitled ? episodes.subtitled.length : 0,
      dubbed: episodes.dubbed ? episodes.dubbed.length : 0
    };
  };

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (onFavoriteToggle) {
      onFavoriteToggle(movie.id);
    }
  };

  return (
    <div
      className={`group relative ${classes.container} animate-slide-up transform transition-all duration-500 hover:scale-105`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Card Container */}
      <div className="relative bg-gradient-to-br from-gray-800/80 via-gray-800/60 to-gray-900/80 rounded-2xl overflow-hidden backdrop-blur-sm border border-gray-700/30 hover:border-gray-600/50 transition-all duration-500 shadow-xl hover:shadow-2xl">
        {/* Poster with enhanced effects */}
        <Link href={`/phim/${movie.slug}`} className="block relative">
          <div className="relative aspect-square bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl overflow-hidden">
            {/* Image */}
            <Image
              src={imageError ? '/placeholder-movie.jpg' : getImageUrl(movie.poster, size)}
              alt={movie.title}
              fill
              className={`object-cover transition-all duration-700 ${isHovered ? 'scale-110' : 'scale-100'}`}
              sizes={size === 'small' ? '176px' : size === 'medium' ? '224px' : '256px'}
              onError={() => setImageError(true)}
            />

            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

            {/* Floating Particles on hover */}
            {isHovered && (
              <div className="absolute inset-0 overflow-hidden">
                {[...Array(6)].map((_, i) => (
                  <div
                    key={i}
                    className="absolute w-1 h-1 bg-white/30 rounded-full animate-pulse"
                    style={{
                      left: `${Math.random() * 100}%`,
                      top: `${Math.random() * 100}%`,
                      animationDelay: `${Math.random() * 1}s`,
                      animationDuration: `${1 + Math.random() * 1}s`
                    }}
                  />
                ))}
              </div>
            )}

            {/* Enhanced Quality Badge */}
            <div className="absolute top-3 left-3">
              <span className="bg-gradient-to-r from-red-600 to-pink-600 text-white text-xs px-3 py-1.5 rounded-full font-bold shadow-lg backdrop-blur-sm border border-red-500/30">
                {movie.quality}
              </span>
            </div>

            {/* Enhanced Hot Badge */}
            {movie.isHot && (
              <div className="absolute top-3 right-3">
                <span className="bg-gradient-to-r from-orange-500 to-red-500 text-white text-xs px-3 py-1.5 rounded-full font-bold shadow-lg backdrop-blur-sm border border-orange-500/30 animate-pulse">
                  HOT
                </span>
              </div>
            )}

            {/* Favorite Button */}
            {onFavoriteToggle && (
              <button
                onClick={handleFavoriteClick}
                className={`absolute top-3 right-3 ${movie.isHot ? 'top-12' : ''} p-2 rounded-full backdrop-blur-sm transition-all duration-300 ${
                  isFavorite
                    ? 'bg-red-600/80 text-white shadow-lg'
                    : 'bg-black/60 text-gray-300 hover:bg-red-600/60 hover:text-white'
                }`}
              >
                {isFavorite ? (
                  <HeartSolidIcon className="h-4 w-4" />
                ) : (
                  <HeartIcon className="h-4 w-4" />
                )}
              </button>
            )}

            {/* Enhanced Episodes Badges */}
            <div className="absolute bottom-3 right-3 flex gap-2">
              {getEpisodesData().subtitled > 0 && (
                <span className="bg-gray-700/80 backdrop-blur-sm text-white text-xs px-2 py-1 rounded-full font-medium border border-gray-600/50">
                  PĐ.{getEpisodesData().subtitled}
                </span>
              )}
              {getEpisodesData().dubbed > 0 && (
                <span className="bg-green-600/80 backdrop-blur-sm text-white text-xs px-2 py-1 rounded-full font-medium border border-green-500/50">
                  TM.{getEpisodesData().dubbed}
                </span>
              )}
            </div>

            {/* Play Button Overlay */}
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-500">
              <div className="bg-gradient-to-r from-red-600 to-pink-600 rounded-full p-4 transform scale-0 group-hover:scale-110 transition-all duration-500 shadow-2xl">
                <PlayIcon className="h-6 w-6 text-white" />
              </div>
            </div>

            {/* Movie Info Overlay on hover */}
            {isHovered && (
              <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/90 via-black/70 to-transparent transform translate-y-full group-hover:translate-y-0 transition-transform duration-500">
                <div className="space-y-2">
                  <div className="flex items-center space-x-4 text-xs text-gray-300">
                    <div className="flex items-center space-x-1">
                      <ClockIcon className="h-3 w-3" />
                      <span>{movie.duration || 120} phút</span>
                    </div>
                    {movie.viewCount !== undefined && (
                      <div className="flex items-center space-x-1">
                        <EyeIcon className="h-3 w-3" />
                        <span>{movie.viewCount.toLocaleString()}</span>
                      </div>
                    )}
                  </div>
                  <p className="text-xs text-gray-400 line-clamp-2">
                    {truncateText(movie.description || '', 80)}
                  </p>
                </div>
              </div>
            )}
          </div>
        </Link>

        {/* Enhanced Info Section */}
        {showDetails && (
          <div className="p-4 space-y-3 bg-gradient-to-b from-gray-800/40 to-gray-900/40 backdrop-blur-sm">
            <h3 className={`font-bold text-white line-clamp-2 ${classes.title} group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-red-400 group-hover:to-pink-400 transition-all duration-300`}>
              {movie.title}
            </h3>

            {/* Genre Tags */}
            {movie.genres && movie.genres.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {movie.genres.slice(0, 2).map((genre) => (
                  <span
                    key={genre.id}
                    className="text-xs px-2 py-1 bg-gray-700/60 text-gray-300 rounded-full hover:bg-gray-600/60 transition-colors"
                  >
                    {genre.name}
                  </span>
                ))}
              </div>
            )}

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <span className="text-sm text-gray-400">{movie.releaseYear}</span>
                {movie.country && (
                  <span className="text-xs text-gray-500">•</span>
                )}
                <span className="text-sm text-gray-400">{movie.country}</span>
              </div>

              {movie.imdbRating && (
                <div className="flex items-center space-x-1.5 bg-gray-700/60 px-2 py-1 rounded-full">
                  <StarSolidIcon className="h-3 w-3 text-yellow-400" />
                  <span className="text-xs font-medium text-white">{movie.imdbRating}</span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Glow effect on hover */}
      {isHovered && (
        <div className="absolute inset-0 bg-gradient-to-r from-red-600/20 via-pink-600/20 to-purple-600/20 rounded-2xl blur-xl -z-10 animate-pulse" />
      )}
    </div>
  );
}