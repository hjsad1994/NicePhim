'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function XemChungPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
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
        <div className="w-[90%] mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Header minimal */}
        <div className="mb-8">
          <nav className="flex items-center space-x-2 text-sm text-gray-400 mb-3">
            <Link href="/" className="hover:text-red-400 transition-colors">
              Trang chủ
            </Link>
            <span>/</span>
            <span className="text-white">Xem chung</span>
          </nav>
          <h1 className="text-3xl font-bold text-white">Xem chung</h1>
        </div>

        {/* Centered actions */}
        <div className="flex items-center justify-center gap-3 py-16">
          <button
            onClick={() => setIsModalOpen(true)}
            className="group inline-flex items-center px-8 py-4 bg-white/10 backdrop-blur-sm border border-gray-700/50 text-white font-semibold rounded-xl hover:bg-white/20 hover:border-gray-600/50 transition-all duration-500"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-6 w-6 mr-3">
              <path fillRule="evenodd" d="M12 3.75a.75.75 0 01.75.75v6.75h6.75a.75.75 0 010 1.5h-6.75v6.75a.75.75 0 01-1.5 0v-6.75H4.5a.75.75 0 010-1.5h6.75V4.5a.75.75 0 01.75-.75z" clipRule="evenodd" />
            </svg>
            Tạo phòng mới
            <svg className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
          <Link
            href="/xem-chung/quan-ly"
            className="group inline-flex items-center px-8 py-4 bg-white/10 backdrop-blur-sm border border-gray-700/50 text-white font-semibold rounded-xl hover:bg-white/20 hover:border-gray-600/50 transition-all duration-500"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-6 w-6 mr-3">
              <path fillRule="evenodd" d="M11.078 2.25c-.917 0-1.699.663-1.85 1.567L9.05 4.889c-.02.12-.115.26-.297.348a7.49 7.49 0 00-.88.45c-.416.274-.784.624-1.095 1.037a.75.75 0 01-1.152-.082L5.296 6.07a.75.75 0 00-1.08.02l-.022.022a.75.75 0 00.02 1.08l1.153 1.108a.75.75 0 01-.157 1.179 7.482 7.482 0 00-.45.878c-.088.183-.228.277-.35.298l-1.069.179c-.904.15-1.567.932-1.567 1.849v.5c0 .917.663 1.699 1.567 1.85l1.07.179c.12.02.26.115.348.297.12.302.27.588.446.855.274.416.624.784 1.037 1.095a.75.75 0 01-.082 1.152l-1.108 1.153a.75.75 0 00.02 1.08l.022.022a.75.75 0 001.08-.02l1.108-1.153a.75.75 0 011.179.157 7.48 7.48 0 00.878.45c.183.088.277.228.298.35l.179 1.069c.15.904.932 1.567 1.849 1.567h.5c.917 0 1.699-.663 1.85-1.567l.179-1.07c.02-.12.115-.26.297-.348a7.49 7.49 0 00.88-.45c.416-.274.784-.624 1.095-1.037a.75.75 0 011.152.082l1.153 1.108a.75.75 0 001.08-.02l.022-.022a.75.75 0 00-.02-1.08l-1.153-1.108a.75.75 0 01.157-1.179 7.482 7.482 0 00.45-.878c.088-.183.228-.277.35-.298l1.069-.179c.904-.15 1.567-.932 1.567-1.849v-.5c0-.917-.663-1.699-1.567-1.85l-1.07-.179c-.12-.02-.26-.115-.348-.297a7.49 7.49 0 00-.446-.855 7.482 7.482 0 00-1.037-1.095.75.75 0 01.082-1.152l1.108-1.153a.75.75 0 00-.02-1.08l-.022-.022a.75.75 0 00-1.08.02l-1.108 1.153a.75.75 0 01-1.179-.157 7.48 7.48 0 00-.878-.45c-.183-.088-.277-.228-.298-.35l-.179-1.069c-.15-.904-.932-1.567-1.849-1.567h-.5zM12 15.75a3.75 3.75 0 100-7.5 3.75 3.75 0 000 7.5z" clipRule="evenodd" />
            </svg>
            Quản lý phòng
            <svg className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white/5 backdrop-blur-sm rounded-xl border border-gray-700/50 p-6 max-w-md w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-white">Hướng dẫn tạo phòng xem chung</h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4 text-gray-300">
              <p>Để tạo phòng xem chung phim, hãy làm theo các bước sau:</p>

              <div className="space-y-3">
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0 mt-0.5">
                    1
                  </div>
                  <div>
                    <h3 className="font-medium text-white">Vào trang chi tiết phim</h3>
                    <p className="text-sm">Chọn phim bạn muốn xem chung và vào trang chi tiết của phim đó</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0 mt-0.5">
                    2
                  </div>
                  <div>
                    <h3 className="font-medium text-white">Nhấn nút "Xem chung"</h3>
                    <p className="text-sm">Trên trang chi tiết phim, nhấn vào nút "Xem chung" để bắt đầu tạo phòng</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0 mt-0.5">
                    3
                  </div>
                  <div>
                    <h3 className="font-medium text-white">Chọn tập phim</h3>
                    <p className="text-sm">Chọn tập phim bạn muốn xem chung với mọi người</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0 mt-0.5">
                    4
                  </div>
                  <div>
                    <h3 className="font-medium text-white">Tạo và chia sẻ phòng</h3>
                    <p className="text-sm">Tạo phòng và chia sẻ link phòng với bạn bè để cùng xem phim</p>
                  </div>
                </div>
              </div>

              <div className="pt-4">
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="w-full btn btn-rounded rounded-full border-2 border-red-500/80 text-white hover:bg-red-500/20 px-5 py-2 transition-colors"
                >
                  Đã hiểu
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      </div>
    </div>
  );
}
