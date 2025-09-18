'use client';

import Link from 'next/link';
import { GenreResponse } from '@/lib/api';

interface InterestSectionProps {
  genres: GenreResponse[];
}

export function InterestSection({ genres }: InterestSectionProps) {
  return (
    <section className="py-12 border-2 border-gray-400/15 rounded-lg mt-2" style={{backgroundColor: 'var(--bg-3)'}}>
      <div className="w-[90%] mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-white mb-4">
            🤔 Bạn đang quan tâm gì?
          </h2>
          <p className="text-gray-300 text-lg">
            Chọn chủ đề bạn yêu thích để khám phá phim hay
          </p>
        </div>

        {/* Topics Horizontal Layout */}
        <div className="flex flex-wrap justify-center gap-4 mb-8">
          {genres.slice(0, 6).map((genre, index) => {
            const brightGradients = [
              { bg: 'bg-gradient-to-r from-red-500 to-red-400', border: 'border-red-400', hover: 'hover:from-red-400 hover:to-red-300 hover:shadow-red-500/50' },
              { bg: 'bg-gradient-to-r from-yellow-500 to-yellow-400', border: 'border-yellow-400', hover: 'hover:from-yellow-400 hover:to-yellow-300 hover:shadow-yellow-500/50' },
              { bg: 'bg-gradient-to-r from-green-500 to-green-400', border: 'border-green-400', hover: 'hover:from-green-400 hover:to-green-300 hover:shadow-green-500/50' },
              { bg: 'bg-gradient-to-r from-teal-500 to-teal-400', border: 'border-teal-400', hover: 'hover:from-teal-400 hover:to-teal-300 hover:shadow-teal-500/50' },
              { bg: 'bg-gradient-to-r from-violet-500 to-violet-400', border: 'border-violet-400', hover: 'hover:from-violet-400 hover:to-violet-300 hover:shadow-violet-500/50' },
              { bg: 'bg-gradient-to-r from-rose-500 to-rose-400', border: 'border-rose-400', hover: 'hover:from-rose-400 hover:to-rose-300 hover:shadow-rose-500/50' }
            ];
            const gradientSet = brightGradients[index % brightGradients.length];
            
            return (
              <Link
                key={genre.genreId}
                href={`/the-loai/${genre.name.toLowerCase().replace(/\s+/g, '-')}`}
                className={`px-14 py-7 rounded-xl border-2 transition-all duration-300 text-center flex-shrink-0 text-white font-medium text-xl whitespace-nowrap hover:scale-105 hover:shadow-xl hover:shadow-2xl min-w-[180px] ${gradientSet.bg} ${gradientSet.border} ${gradientSet.hover}`}
              >
                {genre.name}
              </Link>
            );
          })}
          
          {/* Chủ đề khác */}
          <Link
            href="/chu-de"
            className="px-14 py-7 rounded-xl border-2 border-gray-600 bg-gradient-to-r from-gray-700 to-gray-600 hover:from-gray-600 hover:to-gray-500 hover:shadow-gray-600/50 text-white hover:scale-105 hover:shadow-xl hover:shadow-2xl transition-all duration-300 text-center flex-shrink-0 font-medium text-xl whitespace-nowrap min-w-[180px]"
          >
            Chủ đề khác
          </Link>
        </div>
      </div>
    </section>
  );
}