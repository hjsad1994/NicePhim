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
      <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16">
        {/* Section Header */}
        {showHeader && (
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-white">{title}</h2>
            {viewAllLink && (
              <Link
                href={viewAllLink}
                className="flex items-center text-red-400 hover:text-red-300 transition-colors"
              >
                <span className="text-sm font-medium">Xem tất cả</span>
                <ChevronRightIcon className="h-4 w-4 ml-1" />
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
