'use client';

import Link from 'next/link';

export default function QuanLyXemChungPage() {
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
            <Link href="/xem-chung" className="hover:text-red-400 transition-colors">
              Xem chung
            </Link>
            <span>/</span>
            <span className="text-white">Quản lý</span>
          </nav>
          <div className="flex items-center space-x-4 mb-2">
            <div className="w-1 h-8 bg-red-600 rounded"></div>
            <h1 className="text-3xl font-bold text-white">Quản lý phòng xem chung</h1>
          </div>
          <p className="text-gray-300">Tạo, quản lý và theo dõi các phòng xem chung của bạn.</p>
        </div>

        {/* Empty Notice */}
        <div className="border-2 border-gray-400/15 rounded-lg" style={{backgroundColor: 'var(--bg-3)'}}>
          <div className="p-10">
            <div className="v-notice flex flex-col items-center justify-center text-center" style={{margin: '3rem 0'}}>
              <div className="inc-icon icon-notice mb-4">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img alt="live icon" src="/window.svg" className="w-16 h-16 opacity-80" />
              </div>
              <p className="mb-0 text-white text-lg">Không có phòng xem chung nào</p>
              <div className="mt-6">
                <Link href="/xem-chung/tao-moi" className="btn btn-rounded rounded-full border-2 border-red-500/80 text-white hover:bg-red-500/20 px-5 py-2 transition-colors">
                  Tạo phòng mới
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

