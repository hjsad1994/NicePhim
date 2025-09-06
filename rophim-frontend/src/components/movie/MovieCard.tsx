import Link from 'next/link';
import Image from 'next/image';
import { PlayIcon, EyeIcon, HeartIcon, StarIcon } from '@heroicons/react/24/solid';
import { HeartIcon as HeartOutlineIcon } from '@heroicons/react/24/outline';
import { Movie } from '@/types/movie';
import { formatViewCount, getImageUrl } from '@/lib/utils';

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
  const sizeClasses = {
    small: {
      container: 'w-32 sm:w-36',
      image: 'h-44 sm:h-48',
      title: 'text-xs',
    },
    medium: {
      container: 'w-40 sm:w-48',
      image: 'h-56 sm:h-64',
      title: 'text-sm',
    },
    large: {
      container: 'w-48 sm:w-56',
      image: 'h-64 sm:h-72',
      title: 'text-base',
    },
  };

  const classes = sizeClasses[size];

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onFavoriteToggle?.(movie.id);
  };

  return (
    <div className={`group relative ${classes.container} animate-slide-up`}>
      <Link href={`/phim/${movie.slug}`} className="block">
        {/* Movie Poster */}
        <div className={`relative ${classes.image} bg-gray-800 rounded-lg overflow-hidden`}>
          <Image
            src={getImageUrl(movie.poster, size)}
            alt={movie.title}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            sizes={size === 'small' ? '144px' : size === 'medium' ? '192px' : '224px'}
          />
          
          {/* Overlay */}
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300" />
          
          {/* Play Button */}
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <div className="w-12 h-12 bg-red-600 rounded-full flex items-center justify-center shadow-lg">
              <PlayIcon className="h-5 w-5 text-white ml-1" />
            </div>
          </div>

          {/* Quality Badge */}
          <div className="absolute top-2 left-2">
            <span className="bg-red-600 text-white text-xs px-2 py-1 rounded font-medium">
              {movie.quality}
            </span>
          </div>

          {/* Episode Count (for series) */}
          {movie.totalEpisodes && (
            <div className="absolute top-2 right-2">
              <span className="bg-black/70 text-white text-xs px-2 py-1 rounded">
                {movie.currentEpisodes}/{movie.totalEpisodes}
              </span>
            </div>
          )}

          {/* Hot Badge */}
          {movie.isHot && (
            <div className="absolute top-2 right-2">
              <span className="bg-orange-500 text-white text-xs px-2 py-1 rounded font-bold">
                HOT
              </span>
            </div>
          )}

          {/* Favorite Button */}
          {onFavoriteToggle && (
            <button
              onClick={handleFavoriteClick}
              className="absolute bottom-2 right-2 p-1.5 bg-black/50 hover:bg-black/70 rounded-full transition-colors"
              aria-label={isFavorite ? 'Bỏ yêu thích' : 'Yêu thích'}
            >
              {isFavorite ? (
                <HeartIcon className="h-4 w-4 text-red-500" />
              ) : (
                <HeartOutlineIcon className="h-4 w-4 text-white" />
              )}
            </button>
          )}
        </div>

        {/* Movie Info */}
        {showDetails && (
          <div className="mt-3 space-y-1">
            <h3 className={`font-medium text-white group-hover:text-red-400 transition-colors line-clamp-2 ${classes.title}`}>
              {movie.title}
            </h3>
            
            <div className="flex items-center justify-between text-gray-400 text-xs">
              <span>{movie.releaseYear}</span>
              <div className="flex items-center space-x-2">
                {movie.imdbRating && (
                  <div className="flex items-center space-x-1">
                    <StarIcon className="h-3 w-3 text-yellow-400" />
                    <span>{movie.imdbRating}</span>
                  </div>
                )}
                <div className="flex items-center space-x-1">
                  <EyeIcon className="h-3 w-3" />
                  <span>{formatViewCount(movie.viewCount)}</span>
                </div>
              </div>
            </div>

            {/* Genres */}
            <div className="flex flex-wrap gap-1">
              {movie.genres.slice(0, 2).map((genre) => (
                <span
                  key={genre.id}
                  className="text-xs text-gray-400 bg-gray-800 px-2 py-0.5 rounded"
                >
                  {genre.name}
                </span>
              ))}
            </div>
          </div>
        )}
      </Link>
    </div>
  );
}
