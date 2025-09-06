'use client';

import Link from 'next/link';
import { MOVIE_GENRES } from '@/constants';

export function InterestSection() {
  return (
    <section className="py-12" style={{backgroundColor: 'var(--bg-3)'}}>
      <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8 xl:px-12">
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
        <div className="flex flex-wrap justify-center gap-6 mb-8">
          {MOVIE_GENRES.slice(0, 6).map((genre, index) => {
            const gradients = [
              { bg: 'bg-gradient-to-r from-red-300 to-red-100', border: 'border-red-200' },
              { bg: 'bg-gradient-to-r from-blue-300 to-blue-100', border: 'border-blue-200' },
              { bg: 'bg-gradient-to-r from-green-300 to-green-100', border: 'border-green-200' },
              { bg: 'bg-gradient-to-r from-purple-300 to-purple-100', border: 'border-purple-200' },
              { bg: 'bg-gradient-to-r from-orange-300 to-orange-100', border: 'border-orange-200' },
              { bg: 'bg-gradient-to-r from-pink-300 to-pink-100', border: 'border-pink-200' }
            ];
            const gradientSet = gradients[index % gradients.length];
            
            return (
              <Link
                key={genre.id}
                href={`/the-loai/${genre.slug}`}
                className={`px-10 py-5 rounded-xl border-2 transition-all duration-300 text-center flex-shrink-0 text-gray-800 font-semibold text-lg whitespace-nowrap hover:brightness-110 hover:scale-105 hover:shadow-xl min-w-[140px] ${gradientSet.bg} ${gradientSet.border}`}
              >
                {genre.name}
              </Link>
            );
          })}
          
          {/* Chủ đề khác */}
          <Link
            href="/chu-de"
            className="px-10 py-5 rounded-xl border-2 border-yellow-200 bg-gradient-to-r from-yellow-300 to-yellow-100 text-gray-800 hover:brightness-110 hover:scale-105 hover:shadow-xl transition-all duration-300 text-center flex-shrink-0 font-semibold text-lg whitespace-nowrap min-w-[140px]"
          >
            Chủ đề khác
          </Link>
        </div>
      </div>
    </section>
  );
}
