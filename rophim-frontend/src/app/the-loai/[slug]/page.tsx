import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { MOVIE_GENRES } from '@/constants';
import { MovieSection } from '@/components/movie/MovieSection';
import { mockMovies } from '@/lib/mockData';

interface TheLoaiPageProps {
  params: {
    slug: string;
  };
}

export async function generateMetadata({ params }: TheLoaiPageProps): Promise<Metadata> {
  const genre = MOVIE_GENRES.find(g => g.slug === params.slug);
  
  if (!genre) {
    return {
      title: 'Thể loại không tìm thấy',
    };
  }

  return {
    title: `Phim ${genre.name} - NicePhim`,
    description: `Xem phim ${genre.name} hay nhất tại NicePhim. Cập nhật liên tục phim ${genre.name} mới nhất với chất lượng HD.`,
  };
}

export default function TheLoaiPage({ params }: TheLoaiPageProps) {
  const genre = MOVIE_GENRES.find(g => g.slug === params.slug);
  
  if (!genre) {
    notFound();
  }

  // Filter movies by genre (for now using mock data)
  const genreMovies = mockMovies.filter(movie => 
    movie.genres.some(movieGenre => movieGenre.toLowerCase() === genre.name.toLowerCase())
  );

  return (
    <div className="min-h-screen" style={{backgroundColor: 'var(--bg-2)'}}>
      <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white mb-4">
            🎬 Phim {genre.name}
          </h1>
          <p className="text-gray-300 text-lg">
            Khám phá những bộ phim {genre.name} hay nhất
          </p>
          <div className="mt-4 text-gray-400">
            Tìm thấy {genreMovies.length} bộ phim
          </div>
        </div>

        {/* Movies Grid */}
        {genreMovies.length > 0 ? (
          <MovieSection
            title=""
            movies={genreMovies}
            showHeader={false}
          />
        ) : (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">🎭</div>
            <h3 className="text-2xl font-semibold text-white mb-2">
              Chưa có phim {genre.name}
            </h3>
            <p className="text-gray-400 mb-6">
              Chúng tôi đang cập nhật thêm phim {genre.name} mới. Hãy quay lại sau nhé!
            </p>
          </div>
        )}

        {/* Back Navigation */}
        <div className="text-center mt-12">
          <a
            href="/"
            className="inline-flex items-center px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors mr-4"
          >
            ← Quay lại trang chủ
          </a>
          <a
            href="/chu-de"
            className="inline-flex items-center px-6 py-3 border border-gray-600 text-gray-300 hover:bg-gray-700 rounded-lg font-medium transition-colors"
          >
            Xem tất cả chủ đề
          </a>
        </div>
      </div>
    </div>
  );
}

// Generate static params for all genres
export async function generateStaticParams() {
  return MOVIE_GENRES.map((genre) => ({
    slug: genre.slug,
  }));
} 