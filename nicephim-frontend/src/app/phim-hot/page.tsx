'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Metadata } from 'next';
import { MovieSection } from '@/components/movie/MovieSection';
import { hotMovies } from '@/lib/mockData';

export default function PhimHotPage() {
  const [favoriteMovies, setFavoriteMovies] = useState<string[]>([]);

  const handleFavoriteToggle = (movieId: string) => {
    setFavoriteMovies(prev => 
      prev.includes(movieId) 
        ? prev.filter(id => id !== movieId)
        : [...prev, movieId]
    );
  };

  return (
    <div className="min-h-screen" style={{backgroundColor: 'var(--bg-2)'}}>
      <div className="w-[90%] mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="mb-8">
          <nav className="flex items-center space-x-2 text-sm text-gray-400 mb-4">
            <Link href="/" className="hover:text-red-400 transition-colors">
              Trang chủ
            </Link>
            <span>/</span>
            <span className="text-white">Phim Hot</span>
          </nav>
          
          <div className="flex items-center space-x-4 mb-6">
            <div className="w-1 h-8 bg-red-600 rounded"></div>
            <h1 className="text-4xl font-bold text-white">🔥 Phim Hot</h1>
          </div>
          
          <p className="text-gray-300 text-lg">
            Khám phá những bộ phim đang thịnh hành và được yêu thích nhất hiện tại
          </p>
        </div>

        {/* Movies Grid */}
        <div className="border-2 border-gray-400/15 rounded-lg" style={{backgroundColor: 'var(--bg-3)'}}>
          <div className="p-6">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7 gap-4 sm:gap-6">
              {hotMovies.map((movie) => {
                const MovieCard = require('@/components/movie/MovieCard').MovieCard;
                return (
                  <MovieCard
                    key={movie.id}
                    movie={movie}
                    size="medium"
                    showDetails={true}
                  />
                );
              })}
            </div>
            
            {hotMovies.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-400 text-lg">Không có phim nào trong danh sách này.</p>
              </div>
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="mt-8 text-center">
          <p className="text-gray-400">
            Hiển thị {hotMovies.length} phim hot
          </p>
        </div>
      </div>
    </div>
  );
}
