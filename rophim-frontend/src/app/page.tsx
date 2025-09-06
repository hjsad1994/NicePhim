'use client';

import { useState } from 'react';
import { Hero } from '@/components/movie/Hero';
import { MovieSection } from '@/components/movie/MovieSection';
import { InterestSection } from '@/components/movie/InterestSection';
import { UnifiedBottomBlock } from '@/components/movie/UnifiedBottomBlock';
import { 
  featuredMovies, 
  hotMovies, 
  newMovies, 
  animeMovies, 
  actionMovies,
  trendingMovies,
  favoriteMoviesList,
  hotGenres
} from '@/lib/mockData';

export default function Home() {
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
      {/* 1. Hero Section - Giữ nguyên */}
      <Hero movies={featuredMovies} />

      {/* Movie Sections */}
      <div style={{backgroundColor: 'var(--bg-3)'}} className="border-2 border-gray-400/15 rounded-lg">
        <div className="py-8">
          <MovieSection
            title="🔥 Phim Hot"
            movies={hotMovies}
            viewAllLink="/phim-hot"
            onFavoriteToggle={handleFavoriteToggle}
            favoriteMovies={favoriteMovies}
          />
        </div>
        
        <div className="py-8 border-t border-gray-400/50">
          <MovieSection
            title="🆕 Phim Mới Cập Nhật"
            movies={newMovies}
            viewAllLink="/phim-moi"
            onFavoriteToggle={handleFavoriteToggle}
            favoriteMovies={favoriteMovies}
          />
        </div>
      </div>

      {/* 2. Bạn đang quan tâm gì? - Section chủ đề phim */}
      <InterestSection />

      {/* More Movie Sections */}
      <div style={{backgroundColor: 'var(--bg-2)'}} className="border-2 border-gray-400/15 rounded-lg mt-2">
        <div className="py-8">
          <MovieSection
            title="🎌 Anime Nổi Bật"
            movies={animeMovies}
            viewAllLink="/hoat-hinh"
            onFavoriteToggle={handleFavoriteToggle}
            favoriteMovies={favoriteMovies}
          />
        </div>
        
        <div className="py-8 border-t border-gray-400/50">
          <MovieSection
            title="💥 Phim Hành Động"
            movies={actionMovies}
            viewAllLink="/the-loai/hanh-dong"
            onFavoriteToggle={handleFavoriteToggle}
            favoriteMovies={favoriteMovies}
          />
        </div>
      </div>

      {/* 3. Unified Bottom Block - Comments + 3 Rankings */}
      <UnifiedBottomBlock 
        trendingMovies={trendingMovies}
        favoriteMovies={favoriteMoviesList}
        hotGenres={hotGenres}
      />
    </div>
  );
}