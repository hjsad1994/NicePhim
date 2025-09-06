'use client';

import Link from 'next/link';
import { MOVIE_GENRES } from '@/constants';

export function InterestSection() {
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
          {MOVIE_GENRES.slice(0, 6).map((genre, index) => {
            const gradients = [
              { bg: 'bg-gradient-to-r from-red-600 to-red-400', border: 'border-red-500' },
              { bg: 'bg-gradient-to-r from-blue-600 to-blue-400', border: 'border-blue-500' },
              { bg: 'bg-gradient-to-r from-green-600 to-green-400', border: 'border-green-500' },
              { bg: 'bg-gradient-to-r from-purple-600 to-purple-400', border: 'border-purple-500' },
              { bg: 'bg-gradient-to-r from-orange-600 to-orange-400', border: 'border-orange-500' },
              { bg: 'bg-gradient-to-r from-pink-600 to-pink-400', border: 'border-pink-500' }
            ];
            const gradientSet = gradients[index % gradients.length];
            
            return (
              <Link
                key={genre.id}
                href={`/the-loai/${genre.slug}`}
                className={`px-14 py-7 rounded-xl border-2 transition-all duration-300 text-center flex-shrink-0 text-white font-bold text-xl whitespace-nowrap hover:brightness-110 hover:scale-105 hover:shadow-xl min-w-[180px] ${gradientSet.bg} ${gradientSet.border}`}
              >
                {genre.name}
              </Link>
            );
          })}
          
          {/* Chủ đề khác */}
          <Link
            href="/chu-de"
            className="px-14 py-7 rounded-xl border-2 border-yellow-500 bg-gradient-to-r from-yellow-600 to-yellow-400 text-white hover:brightness-110 hover:scale-105 hover:shadow-xl transition-all duration-300 text-center flex-shrink-0 font-bold text-xl whitespace-nowrap min-w-[180px]"
          >
            Chủ đề khác
          </Link>
        </div>
      </div>
    </section>
  );
}
