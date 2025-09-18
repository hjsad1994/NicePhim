import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Chủ đề phim',
  description: 'Khám phá các chủ đề phim đa dạng tại NicePhim',
};

export default function ChuDePage() {
  const allTopics = [
    'Hành Động', 'Phiêu Lưu', 'Hoạt Hình', 'Hài Hước', 'Chính Kịch', 'Viễn Tưởng',
    'Kinh Dị', 'Lãng Mạn', 'Ly Kỳ', 'Khoa Học Viễn Tưởng', 'Tội Phạm', 'Tài Liệu',
    'Gia Đình', 'Chiến Tranh', 'Âm Nhạc', 'Thể Thao', 'Tiểu Sử', 'Lịch Sử',
    'Giả Tưởng', 'Siêu Anh Hùng', 'Zombie', 'Vampire', 'Werewolf', 'Ma Thuật'
  ];

  return (
    <div className="min-h-screen" style={{backgroundColor: 'var(--bg-2)'}}>
      <div className="w-[90%] mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center mb-12">
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
              className="p-4 rounded-lg border-2 border-gray-600 text-gray-300 hover:border-red-500 hover:text-white transition-all duration-300 text-center cursor-pointer group"
              style={{backgroundColor: 'var(--bg-4)'}}
            >
              <h3 className="font-medium text-sm group-hover:text-red-400 transition-colors">
                {topic}
              </h3>
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
