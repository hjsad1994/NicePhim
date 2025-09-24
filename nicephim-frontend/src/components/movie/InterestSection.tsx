'use client';

import { useState } from 'react';
import Link from 'next/link';
import { SparklesIcon, FilmIcon } from '@heroicons/react/24/outline';
import { GenreResponse } from '@/lib/api';

interface InterestSectionProps {
  genres: GenreResponse[];
}

export function InterestSection({ genres }: InterestSectionProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  return (
    <section className="relative py-20 bg-gradient-to-b from-gray-900 via-black to-black overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-pink-600/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-r from-purple-600/10 via-pink-600/10 to-blue-600/10 rounded-full blur-3xl animate-pulse"></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center space-x-3 mb-6">
            <div className="relative">
              <SparklesIcon className="h-8 w-8 text-purple-400" />
              <div className="absolute inset-0 bg-purple-400/20 rounded-full blur-lg animate-pulse"></div>
            </div>
            <h2 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-white via-purple-300 to-white bg-clip-text text-transparent">
              Bạn đang quan tâm gì?
            </h2>
          </div>
          <p className="text-xl md:text-2xl text-gray-400 max-w-2xl mx-auto leading-relaxed">
            Khám phá thế giới phim đa dạng qua các thể loại đặc sắc
          </p>
        </div>

        {/* Topics Grid Layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {genres.slice(0, 6).map((genre, index) => {
            const modernGradients = [
              { bg: 'from-red-600 to-pink-600', border: 'border-red-500/30', hover: 'hover:shadow-red-500/30', icon: FilmIcon },
              { bg: 'from-purple-600 to-blue-600', border: 'border-purple-500/30', hover: 'hover:shadow-purple-500/30', icon: FilmIcon },
              { bg: 'from-green-600 to-teal-600', border: 'border-green-500/30', hover: 'hover:shadow-green-500/30', icon: FilmIcon },
              { bg: 'from-yellow-600 to-orange-600', border: 'border-yellow-500/30', hover: 'hover:shadow-yellow-500/30', icon: FilmIcon },
              { bg: 'from-indigo-600 to-purple-600', border: 'border-indigo-500/30', hover: 'hover:shadow-indigo-500/30', icon: FilmIcon },
              { bg: 'from-pink-600 to-rose-600', border: 'border-pink-500/30', hover: 'hover:shadow-pink-500/30', icon: FilmIcon }
            ];

            const gradientSet = modernGradients[index % modernGradients.length];
            const Icon = gradientSet.icon;

            return (
              <Link
                key={genre.genreId}
                href={`/the-loai/${genre.name.toLowerCase().replace(/\s+/g, '-')}`}
                className={`group relative overflow-hidden rounded-2xl backdrop-blur-sm border transition-all duration-500 transform hover:scale-105 ${gradientSet.border} hover:${gradientSet.hover}`}
                onMouseEnter={() => setHoveredIndex(index)}
                onMouseLeave={() => setHoveredIndex(null)}
              >
                {/* Background */}
                <div className={`absolute inset-0 bg-gradient-to-br ${gradientSet.bg} opacity-80 group-hover:opacity-90 transition-opacity duration-500`} />

                {/* Floating Particles */}
                {hoveredIndex === index && (
                  <div className="absolute inset-0 overflow-hidden">
                    {[...Array(8)].map((_, i) => (
                      <div
                        key={i}
                        className="absolute w-1 h-1 bg-white/40 rounded-full animate-pulse"
                        style={{
                          left: `${Math.random() * 100}%`,
                          top: `${Math.random() * 100}%`,
                          animationDelay: `${Math.random() * 1}s`,
                          animationDuration: `${1 + Math.random() * 1}s`
                        }}
                      />
                    ))}
                  </div>
                )}

                {/* Content */}
                <div className="relative p-8 text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl mb-4 group-hover:scale-110 transition-transform duration-500">
                    <Icon className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-white group-hover:to-gray-200 transition-all duration-300">
                    {genre.name}
                  </h3>
                  <p className="text-white/80 text-sm group-hover:text-white transition-colors">
                    Khám phá ngay
                  </p>
                </div>

                {/* Glow Effect */}
                {hoveredIndex === index && (
                  <div className={`absolute inset-0 bg-gradient-to-br ${gradientSet.bg} rounded-2xl opacity-30 blur-xl -z-10 animate-pulse`} />
                )}
              </Link>
            );
          })}
        </div>

        {/* CTA Button */}
        <div className="text-center">
          <Link
            href="/chu-de"
            className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-gray-800/80 to-gray-700/80 backdrop-blur-sm border border-gray-600/50 text-white font-semibold rounded-2xl hover:from-gray-700/80 hover:to-gray-600/80 hover:border-gray-500/50 transition-all duration-500 transform hover:scale-105 shadow-lg hover:shadow-xl"
          >
            <FilmIcon className="h-5 w-5 mr-3" />
            Xem tất cả chủ đề
            <svg className="w-5 h-5 ml-3 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      </div>
    </section>
  );
}