import Link from 'next/link';
import { ChevronRightIcon } from '@heroicons/react/24/outline';
import { MovieCard } from './MovieCard';
import { Movie } from '@/types/movie';

interface MovieSectionProps {
  title: string;
  movies: Movie[];
  viewAllLink?: string;
  showDetails?: boolean;
  showHeader?: boolean;
  size?: 'small' | 'medium' | 'large';
  onFavoriteToggle?: (movieId: string) => void;
  favoriteMovies?: string[];
}

export function MovieSection({
  title,
  movies,
  viewAllLink,
  showDetails = true,
  showHeader = true,
  size = 'medium',
  onFavoriteToggle,
  favoriteMovies = [],
}: MovieSectionProps) {
  if (movies.length === 0) return null;

  return (
    <section className="py-8">
      <div className="w-[90%] mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        {showHeader && (
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-white">{title}</h2>
            {viewAllLink && (
              <Link
                href={viewAllLink}
                className="group flex items-center transition-colors relative"
              >
                {/* Chevron Icon with white circular background */}
                <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center transition-transform duration-200 group-hover:translate-x-1 shadow-md">
                  <ChevronRightIcon className="h-4 w-4 text-gray-800" />
                </div>
                
                {/* Hover text */}
                <span className="absolute left-10 opacity-0 group-hover:opacity-100 transition-all duration-200 text-sm font-medium whitespace-nowrap text-red-400 group-hover:text-red-300">
                  Xem thêm
                </span>
              </Link>
            )}
          </div>
        )}

        {/* Movies Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 sm:gap-6">
          {movies.map((movie) => (
            <MovieCard
              key={movie.id}
              movie={movie}
              size={size}
              showDetails={showDetails}
              isFavorite={favoriteMovies.includes(movie.id)}
              onFavoriteToggle={onFavoriteToggle}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
