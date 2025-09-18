'use client';

import Image from 'next/image';
import Link from 'next/link';
import { 
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  MinusIcon,
  FilmIcon,
  HeartIcon as HeartSolid,
  PlusIcon
} from '@heroicons/react/24/solid';
import { Movie } from '@/types/movie';
import { getImageUrl } from '@/lib/utils';



interface UnifiedBottomBlockProps {
  trendingMovies: Array<Movie & { trend: 'up' | 'down' | 'stable' }>;
  favoriteMovies: Array<Movie & { trend: 'up' | 'down' | 'stable' }>;
  hotGenres: Array<{
    id: string;
    name: string;
    movieCount: number;
    thumbnail: string;
    trending: boolean;
    trend: 'up' | 'down' | 'stable';
  }>;
}


export function UnifiedBottomBlock({ 
  trendingMovies, 
  favoriteMovies, 
  hotGenres 
}: UnifiedBottomBlockProps) {

  // Helper function to render trend indicator
  const renderTrendIndicator = (trend: 'up' | 'down' | 'stable') => {
    switch (trend) {
      case 'up':
        return <ArrowTrendingUpIcon className="h-4 w-4 text-green-400" />;
      case 'down':
        return <ArrowTrendingDownIcon className="h-4 w-4 text-red-400" />;
      case 'stable':
        return <MinusIcon className="h-4 w-4 text-gray-400" />;
    }
  };

  return (
    <div className="cards-row wide">
      <div className="row-content">
        <div className="comm-wrap" style={{backgroundColor: 'var(--bg-3)'}}>
          

          {/* IRT Table - Grid Layout */}
          <div className="irt-table grid grid-cols-1 lg:grid-cols-3 gap-6 px-6 pt-0 pb-6">
            
            {/* Sôi nổi nhất */}
            <div className="it-col this-01">
              <div className="comm-title line-center mb-4">
                <FilmIcon className="h-5 w-5 text-orange-400 mr-2" />
                <span className="flex-grow-1 text-lg font-bold text-white">Sôi nổi nhất</span>
              </div>
              <div className="chart-list space-y-2">
                {trendingMovies.slice(0, 5).map((movie, index) => (
                  <div key={movie.id} className="item flex items-center space-x-3 p-2 rounded hover:bg-gray-800/50 transition-colors">
                    <div className="pos text-white font-bold text-sm w-6">{index + 1}.</div>
                    <div className="dev dev-stand">
                      {renderTrendIndicator(movie.trend)}
                    </div>
                    <div className="v-thumbnail w-8 h-10 flex-shrink-0">
                      <Image
                        alt="test"
                        loading="lazy"
                        src={getImageUrl(movie.poster, 'small')}
                        width={32}
                        height={40}
                        className="rounded object-cover"
                      />
                    </div>
                    <h4 className="name lim-1 flex-1 min-w-0">
                      <Link 
                        title={movie.title}
                        href={`/phim/${movie.slug}`}
                        className="text-white text-sm hover:text-red-400 transition-colors line-clamp-1"
                      >
                        {movie.title}
                      </Link>
                    </h4>
                  </div>
                ))}
                <div className="item-more mt-2">
                  <Link href="/trending" className="small text-gray-400 hover:text-white transition-colors text-sm">
                    Xem thêm
                  </Link>
                </div>
              </div>
            </div>

            {/* Yêu thích nhất */}
            <div className="it-col this-01">
              <div className="comm-title line-center mb-4">
                <HeartSolid className="h-5 w-5 text-red-400 mr-2" />
                <span className="flex-grow-1 text-lg font-bold text-white">Yêu thích nhất</span>
              </div>
              <div className="chart-list space-y-2">
                {favoriteMovies.slice(0, 5).map((movie, index) => (
                  <div key={movie.id} className="item flex items-center space-x-3 p-2 rounded hover:bg-gray-800/50 transition-colors">
                    <div className="pos text-white font-bold text-sm w-6">{index + 1}.</div>
                    <div className="dev dev-up">
                      {renderTrendIndicator(movie.trend)}
                    </div>
                    <div className="v-thumbnail w-8 h-10 flex-shrink-0">
                      <Image
                        alt="test"
                        loading="lazy"
                        src={getImageUrl(movie.poster, 'small')}
                        width={32}
                        height={40}
                        className="rounded object-cover"
                      />
                    </div>
                    <h4 className="name lim-1 flex-1 min-w-0">
                      <Link 
                        title={movie.title}
                        href={`/phim/${movie.slug}`}
                        className="text-white text-sm hover:text-red-400 transition-colors line-clamp-1"
                      >
                        {movie.title}
                      </Link>
                    </h4>
                  </div>
                ))}
                <div className="item-more mt-2">
                  <Link href="/favorites" className="small text-gray-400 hover:text-white transition-colors text-sm">
                    Xem thêm
                  </Link>
                </div>
              </div>
            </div>

            {/* Thể loại Hot */}
            <div className="it-col this-03">
              <div className="comm-title line-center mb-4">
                <PlusIcon className="h-5 w-5 text-yellow-400 mr-2" />
                <span className="flex-grow-1 text-lg font-bold text-white">Thể loại Hot</span>
              </div>
              <div className="chart-list space-y-2">
                {hotGenres.map((genre, index) => (
                  <div key={genre.id} className="item flex items-center space-x-3 p-2 rounded hover:bg-gray-800/50 transition-colors">
                    <div className="pos text-white font-bold text-sm w-6">{index + 1}.</div>
                    <div className="dev dev-stand">
                      {renderTrendIndicator(genre.trend)}
                    </div>
                    <div className="topic-color w-8 h-6 flex-shrink-0 rounded" style={{backgroundColor: 'rgb(116, 45, 75)'}}>
                      <Link 
                        href={`/the-loai/${genre.id}`}
                        className="w-full h-full rounded text-white text-xs flex items-center justify-center font-medium"
                      >
                        {genre.name.charAt(0)}
                      </Link>
                    </div>
                    <div className="name flex-1 min-w-0">
                      <Link 
                        href={`/the-loai/${genre.id}`}
                        className="text-white text-sm hover:text-yellow-400 transition-colors line-clamp-1"
                      >
                        {genre.name}
                      </Link>
                    </div>
                  </div>
                ))}
                <div className="item-more mt-2">
                  <Link href="/genres" className="small text-gray-400 hover:text-white transition-colors text-sm">
                    Xem thêm
                  </Link>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
