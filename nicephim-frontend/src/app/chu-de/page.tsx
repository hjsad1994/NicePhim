'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function ChuDePage() {
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

  const allTopics = [
    'Hành Động', 'Phiêu Lưu', 'Hoạt Hình', 'Hài Hước', 'Chính Kịch', 'Viễn Tưởng',
    'Kinh Dị', 'Lãng Mạn', 'Ly Kỳ', 'Khoa Học Viễn Tưởng', 'Tội Phạm', 'Tài Liệu',
    'Gia Đình', 'Chiến Tranh', 'Âm Nhạc', 'Thể Thao', 'Tiểu Sử', 'Lịch Sử',
    'Giả Tưởng', 'Siêu Anh Hùng', 'Zombie', 'Vampire', 'Werewolf', 'Ma Thuật'
  ];

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
          <h1 className="text-4xl font-bold text-white mb-4">
            🎬 Tất cả chủ đề phim
          </h1>
          <p className="text-gray-300 text-lg">
            Khám phá đa dạng thể loại và chủ đề phim tại NicePhim
          </p>
        </div>

        {/* Topics Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {allTopics.map((topic, index) => (
            <div
              key={index}
              className="group inline-flex items-center justify-center p-3 bg-white/10 backdrop-blur-sm border border-gray-700/50 text-white font-semibold rounded-xl hover:bg-white/20 hover:border-gray-600/50 transition-all duration-500 text-center cursor-pointer h-full"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4 mr-2 opacity-70 group-hover:opacity-100 transition-opacity flex-shrink-0">
                <path fillRule="evenodd" d="M4.5 2.25a3 3 0 00-3 3v4.318a3 3 0 00.879 2.121l9.58 9.581c.92.92 2.39 1.186 3.548.428a18.849 18.849 0 005.441-5.44c.758-1.16.492-2.629-.428-3.548l-9.58-9.581a3 3 0 00-2.122-.879H4.5zM7.5 6a1.5 1.5 0 100 3 1.5 1.5 0 000-3z" clipRule="evenodd" />
              </svg>
              <span className="text-xs sm:text-sm flex-1 truncate">{topic}</span>
              <svg className="w-3 h-3 ml-2 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          ))}
        </div>

        {/* Back to Home */}
        <div className="text-center mt-12">
          <Link
            href="/"
            className="inline-flex items-center px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors"
          >
            ← Quay lại trang chủ
          </Link>
        </div>
      </div>
    </div>
  );
}
