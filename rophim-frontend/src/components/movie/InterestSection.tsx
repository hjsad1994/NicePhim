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
            const modernGradients = [
              { bg: 'bg-gradient-to-r from-slate-600 to-slate-500', border: 'border-slate-500', hover: 'hover:from-slate-500 hover:to-slate-400' },
              { bg: 'bg-gradient-to-r from-zinc-600 to-zinc-500', border: 'border-zinc-500', hover: 'hover:from-zinc-500 hover:to-zinc-400' },
              { bg: 'bg-gradient-to-r from-neutral-600 to-neutral-500', border: 'border-neutral-500', hover: 'hover:from-neutral-500 hover:to-neutral-400' },
              { bg: 'bg-gradient-to-r from-stone-600 to-stone-500', border: 'border-stone-500', hover: 'hover:from-stone-500 hover:to-stone-400' },
              { bg: 'bg-gradient-to-r from-gray-600 to-gray-500', border: 'border-gray-500', hover: 'hover:from-gray-500 hover:to-gray-400' },
              { bg: 'bg-gradient-to-r from-slate-700 to-slate-600', border: 'border-slate-600', hover: 'hover:from-slate-600 hover:to-slate-500' }
            ];
            const gradientSet = modernGradients[index % modernGradients.length];
            
            return (
              <Link
                key={genre.genreId}
                href={`/the-loai/${genre.name.toLowerCase().replace(/\s+/g, '-')}`}
                className={`px-14 py-7 rounded-xl border-2 transition-all duration-300 text-center flex-shrink-0 text-white font-medium text-xl whitespace-nowrap hover:scale-105 hover:shadow-xl min-w-[180px] ${gradientSet.bg} ${gradientSet.border} ${gradientSet.hover}`}
              >
                {genre.name}
              </Link>
            );
          })}
          
          {/* Chủ đề khác */}
          <Link
            href="/chu-de"
            className="px-14 py-7 rounded-xl border-2 border-amber-600 bg-gradient-to-r from-amber-700 to-amber-600 hover:from-amber-600 hover:to-amber-500 text-white hover:scale-105 hover:shadow-xl transition-all duration-300 text-center flex-shrink-0 font-medium text-xl whitespace-nowrap min-w-[180px]"
          >
            Chủ đề khác
          </Link>
        </div>
      </div>
    </section>
  );
}