'use client';

import Link from 'next/link';
import Image from 'next/image';
import { PlayIcon, ClockIcon } from '@heroicons/react/24/solid';
import { Movie } from '@/types/movie';
import { getImageUrl } from '@/lib/utils';

interface RelatedMoviesProps {
  movies: Movie[];
}

export function RelatedMovies({ movies }: RelatedMoviesProps) {
  return (
    <div className="bg-gray-900 rounded-lg p-6">
      <h3 className="text-xl font-bold text-white mb-6">Phim liên quan</h3>
      
      <div className="space-y-4">
        {movies.map((movie) => (
          <Link
            key={movie.id}
            href={`/xem/${movie.slug}`}
            className="flex space-x-3 group hover:bg-gray-800 rounded-lg p-2 transition-colors"
          >
            {/* Thumbnail */}
            <div className="relative w-24 h-16 flex-shrink-0 rounded overflow-hidden">
              <Image
                src={getImageUrl(movie.poster, 'small')}
                alt={movie.title}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-300"
                sizes="96px"
              />
              <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <PlayIcon className="h-5 w-5 text-white" />
              </div>
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <h4 className="font-medium text-white group-hover:text-red-400 transition-colors line-clamp-2">
                {movie.title}
              </h4>
              <div className="flex items-center space-x-2 text-sm text-gray-400 mt-1">
                <span>{movie.releaseYear}</span>
                <span>•</span>
                <div className="flex items-center">
                  <ClockIcon className="h-3 w-3 mr-1" />
                  <span>{movie.duration}</span>
                </div>
              </div>
              <div className="flex items-center space-x-2 mt-1">
                <span className="bg-red-600 text-white text-xs px-2 py-0.5 rounded">
                  {movie.quality}
                </span>
                {movie.imdbRating && (
                  <div className="flex items-center text-xs text-yellow-400">
                    <span>★</span>
                    <span className="ml-0.5">{movie.imdbRating}</span>
                  </div>
                )}
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* View All */}
      <div className="text-center mt-6">
        <Link
          href="/phim"
          className="inline-block text-red-400 hover:text-red-300 font-medium"
        >
          Xem thêm phim →
        </Link>
      </div>
    </div>
  );
}
