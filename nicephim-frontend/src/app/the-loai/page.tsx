'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ApiService, GenreResponse } from '@/lib/api';

export default function TheLoaiPage() {
  const [genres, setGenres] = useState<GenreResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [particles, setParticles] = useState<Array<{key: number, left: number, top: number, delay: number, duration: number}>>([]);

  useEffect(() => {
    // Create particles only on client side to avoid hydration mismatch
    const newParticles = [...Array(15)].map((_, i) => ({
      key: i,
      left: Math.random() * 100,
      top: Math.random() * 100,
      delay: Math.random() * 3,
      duration: 2 + Math.random() * 3
    }));
    setParticles(newParticles);
  }, []);

  useEffect(() => {
    const loadGenres = async () => {
      try {
        setIsLoading(true);
        console.log('📋 Loading genres from database...');
        
        const response = await Promise.race([
          ApiService.getGenres(),
          new Promise((_, reject) => 
            setTimeout(() => reject(new Error('API timeout')), 10000)
          )
        ]) as any;
        
        if (response.success && response.data && response.data.length > 0) {
          console.log(`✅ Loaded ${response.data.length} genres:`, response.data.map((g: GenreResponse) => g.name));
          setGenres(response.data);
        } else {
          console.log('⚠️ No genres found in database');
          setError('Chưa có thể loại nào');
        }
      } catch (err) {
        console.error('❌ Failed to load genres:', err);
        setError('Không thể tải danh sách thể loại');
      } finally {
        setIsLoading(false);
      }
    };

    loadGenres();
  }, []);

  // Convert genre name to slug
  const getGenreSlug = (name: string) => {
    return name.toLowerCase().replace(/\s+/g, '-');
  };

  // Icon map for genres
  const getGenreIcon = (name: string) => {
    const iconMap: { [key: string]: string } = {
      'hành động': '💥',
      'phiêu lưu': '🗺️',
      'hoạt hình': '🎨',
      'hài hước': '😂',
      'chính kịch': '🎭',
      'viễn tưởng': '🔮',
      'kinh dị': '👻',
      'lãng mạn': '💕',
      'ly kỳ': '🔍',
      'khoa học viễn tưởng': '🚀',
      'tội phạm': '🔫',
      'tài liệu': '📚',
      'gia đình': '👨‍👩‍👧‍👦',
      'chiến tranh': '⚔️',
      'âm nhạc': '🎵',
      'thể thao': '⚽',
      'tiểu sử': '📖',
      'lịch sử': '🏛️',
      'giả tưởng': '🐉',
      'siêu anh hùng': '🦸',
    };
    
    const lowerName = name.toLowerCase();
    return iconMap[lowerName] || '🎬';
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-red-600 mx-auto mb-4"></div>
          <div className="text-white text-xl">Đang tải thể loại...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black relative overflow-hidden">
      {/* Animated Glow Orbs Background */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-red-600/10 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-purple-600/5 rounded-full blur-3xl animate-pulse delay-2000"></div>

      {/* Floating Particles */}
      {particles.map((particle) => (
        <div
          key={particle.key}
          className="absolute w-1 h-1 bg-white/20 rounded-full animate-pulse"
          style={{
            left: `${particle.left}%`,
            top: `${particle.top}%`,
            animationDelay: `${particle.delay}s`,
            animationDuration: `${particle.duration}s`
          }}
        />
      ))}

      <div className="relative w-[90%] mx-auto px-4 sm:px-6 lg:px-8 py-8 z-10">
        {/* Header */}
        <div className="text-center mb-12 pt-20">
          <div className="inline-block mb-8">
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-black mb-4 tracking-tight">
              <span className="bg-gradient-to-r from-white via-gray-50 to-gray-200 bg-clip-text text-transparent drop-shadow-2xl">
                Thể Loại
              </span>
              {' '}
              <span className="relative inline-block">
                <span className="bg-gradient-to-r from-rose-500 via-pink-500 to-purple-500 bg-clip-text text-transparent">
                  Phim
                </span>
                <div className="absolute -inset-1 bg-gradient-to-r from-rose-500/20 via-pink-500/20 to-purple-500/20 blur-2xl -z-10"></div>
              </span>
            </h1>
          </div>
          <p className="text-xl md:text-2xl text-gray-400 max-w-3xl mx-auto leading-relaxed font-light">
            Khám phá đa dạng thể loại phim tại NicePhim
          </p>
        </div>

        {/* Error State */}
        {error && (
          <div className="text-center py-16">
            <div className="text-red-500 text-xl mb-4">⚠️ {error}</div>
            <p className="text-gray-400 mb-6">
              Vui lòng thử lại sau hoặc liên hệ quản trị viên
            </p>
            <Link
              href="/"
              className="inline-flex items-center px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors"
            >
              ← Quay lại trang chủ
            </Link>
          </div>
        )}

        {/* Genres Grid */}
        {!error && genres.length > 0 && (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 mb-12">
              {genres.map((genre, index) => (
                <Link
                  key={genre.genreId}
                  href={`/the-loai/${getGenreSlug(genre.name)}`}
                  className="group relative"
                >
                  {/* Card */}
                  <div className="relative h-full p-6 rounded-2xl transition-all duration-500 bg-white/5 hover:bg-white/10 backdrop-blur-xl border border-white/10 hover:border-white/20 hover:scale-105 hover:shadow-2xl hover:shadow-rose-500/10">
                    {/* Glow Effect on Hover */}
                    <div className="absolute -inset-0.5 bg-gradient-to-r from-rose-500/0 via-pink-500/0 to-purple-500/0 group-hover:from-rose-500/20 group-hover:via-pink-500/20 group-hover:to-purple-500/20 rounded-2xl blur opacity-0 group-hover:opacity-100 transition duration-500"></div>
                    
                    {/* Content */}
                    <div className="relative text-center">
                      {/* Genre Name */}
                      <h3 className="text-lg font-bold text-gray-200 group-hover:text-white transition-colors">
                        {genre.name}
                      </h3>
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            {/* Stats */}
            <div className="text-center text-gray-400 mb-8">
              <p className="text-lg">
                Tổng cộng <span className="text-white font-semibold">{genres.length}</span> thể loại phim
              </p>
            </div>
          </>
        )}

        {/* Empty State */}
        {!error && genres.length === 0 && (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">🎬</div>
            <h3 className="text-2xl font-semibold text-white mb-2">
              Chưa có thể loại nào
            </h3>
            <p className="text-gray-400 mb-6">
              Hệ thống đang được cập nhật. Vui lòng quay lại sau!
            </p>
          </div>
        )}

        {/* Back Navigation */}
        <div className="text-center mt-12">
          <Link
            href="/"
            className="inline-flex items-center px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors mr-4"
          >
            ← Quay lại trang chủ
          </Link>
          <Link
            href="/chu-de"
            className="inline-flex items-center px-6 py-3 border border-gray-600 text-gray-300 hover:bg-gray-700 rounded-lg font-medium transition-colors"
          >
            Xem tất cả chủ đề
          </Link>
        </div>
      </div>
    </div>
  );
}
