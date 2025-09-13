'use client';

import Link from 'next/link';

export default function XemChungPage() {
  return (
    <div className="min-h-screen" style={{backgroundColor: 'var(--bg-2)'}}>
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
        <div className="border-2 border-gray-400/15 rounded-lg" style={{backgroundColor: 'var(--bg-3)'}}>
          <div className="p-10">
            <div className="flex items-center justify-center gap-3">
              <Link
                href="/xem-chung/tao-moi"
                className="btn btn-rounded rounded-full border-2 border-red-500/80 text-white hover:bg-red-500/20 px-5 py-2 transition-colors"
              >
                Tạo phòng mới
              </Link>
              <Link
                href="/xem-chung/quan-ly"
                className="btn btn-rounded rounded-full border-2 border-gray-400/30 text-white hover:bg-white/10 px-5 py-2 transition-colors"
              >
                Quản lý phòng
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
