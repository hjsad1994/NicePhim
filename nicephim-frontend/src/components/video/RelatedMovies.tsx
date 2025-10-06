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
    <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 sticky top-24">
      <h3 className="text-2xl font-black mb-6 flex items-center gap-2 text-white">
        <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
          <PlayIcon className="h-5 w-5 text-white" />
        </div>
        Phim liên quan
      </h3>
      
      <div className="space-y-3">
        {movies.map((movie) => (
          <Link
            key={movie.id}
            href={`/xem/${movie.slug}`}
            className="flex gap-3 group p-3 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 rounded-xl transition-all duration-300"
          >
            {/* Thumbnail */}
            <div className="relative w-28 h-16 flex-shrink-0 rounded-lg overflow-hidden">
              <Image
                src={getImageUrl(movie.poster, 'small')}
                alt={movie.title}
                fill
                className="object-cover group-hover:scale-110 transition-transform duration-300"
                sizes="112px"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="w-8 h-8 rounded-full bg-rose-500/90 flex items-center justify-center">
                  <PlayIcon className="h-4 w-4 text-white" />
                </div>
              </div>
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <h4 className="font-semibold text-white group-hover:text-rose-400 transition-colors line-clamp-2 leading-tight mb-1.5">
                {movie.title}
              </h4>
              <div className="flex items-center gap-2 text-xs text-white/70 mb-1.5 font-medium">
                <span>{movie.releaseYear}</span>
                <span>•</span>
                <div className="flex items-center gap-1">
                  <ClockIcon className="h-3 w-3" />
                  <span>{movie.duration}p</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="bg-white/10 border border-white/20 text-rose-400 text-xs px-2 py-0.5 rounded-md font-semibold">
                  {movie.quality}
                </span>
                {movie.imdbRating && (
                  <div className="flex items-center text-xs text-yellow-400 font-medium">
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
      <div className="text-center mt-6 pt-4 border-t border-white/10">
        <Link
          href="/phim"
          className="inline-flex items-center gap-2 px-6 py-2.5 bg-white/10 hover:bg-white/20 border border-white/20 hover:border-white/30 text-white font-medium rounded-xl transition-all duration-300 transform hover:scale-105"
        >
          Xem thêm phim
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
          </svg>
        </Link>
      </div>
    </div>
  );
}
