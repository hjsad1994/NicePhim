import Link from 'next/link';
import Image from 'next/image';
import { StarIcon } from '@heroicons/react/24/solid';
import { Movie } from '@/types/movie';
import { getImageUrl } from '@/lib/utils';

interface MovieCardProps {
  movie: Movie;
  size?: 'small' | 'medium' | 'large';
  showDetails?: boolean;
}

export function MovieCard({ 
  movie, 
  size = 'medium', 
  showDetails = true
}: MovieCardProps) {
  const sizeClasses = {
    small: {
      container: 'w-32 sm:w-36',
      title: 'text-xs',
    },
    medium: {
      container: 'w-40 sm:w-48',
      title: 'text-sm',
    },
    large: {
      container: 'w-48 sm:w-56',
      title: 'text-base',
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

  return (
    <div className={`group relative ${classes.container} animate-slide-up`}>
      {/* Card Container */}
      <div className="relative bg-gray-800/80 rounded-lg overflow-hidden backdrop-blur-sm border border-gray-700/30">
        {/* Poster - click to detail */}
        <Link href={`/phim/${movie.slug}`} className="block">
          <div className="relative aspect-square bg-gray-800 rounded-lg overflow-hidden">
            <Image
              src={getImageUrl(movie.poster, size)}
              alt={movie.title}
              fill
              className="object-cover"
              sizes={size === 'small' ? '144px' : size === 'medium' ? '192px' : '224px'}
            />

            {/* Quality Badge */}
            <div className="absolute top-2 left-2">
              <span className="bg-red-600 text-white text-xs px-2 py-1 rounded font-medium">
                {movie.quality}
              </span>
            </div>

            {/* Hot Badge */}
            {movie.isHot && (
              <div className="absolute top-2 right-2">
                <span className="bg-orange-500 text-white text-xs px-2 py-1 rounded font-bold">
                  HOT
                </span>
              </div>
            )}

            {/* Episodes Badges */}
            <div className="absolute bottom-2 right-2 flex gap-1">
              {getEpisodesData().subtitled > 0 && (
                <span className="bg-gray-600 text-white text-xs px-2 py-1 rounded font-medium">
                  PĐ.{getEpisodesData().subtitled}
                </span>
              )}
              {getEpisodesData().dubbed > 0 && (
                <span className="bg-green-600 text-white text-xs px-2 py-1 rounded font-medium">
                  TM.{getEpisodesData().dubbed}
                </span>
              )}
            </div>
          </div>
        </Link>

        {/* Static Info below poster */}
        {showDetails && (
          <div className="p-3 space-y-1">
            <h3 className={`font-medium text-white line-clamp-2 ${classes.title}`}>
              {movie.title}
            </h3>
            <div className="flex items-center justify-between text-gray-400 text-xs">
              <span>{movie.releaseYear}</span>
              {movie.imdbRating && (
                <div className="flex items-center space-x-1">
                  <StarIcon className="h-3 w-3 text-yellow-400" />
                  <span>{movie.imdbRating}</span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}