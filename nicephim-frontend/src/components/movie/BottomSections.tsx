import Image from 'next/image';
import { StarIcon, HeartIcon, FireIcon } from '@heroicons/react/24/solid';
import { Movie } from '@/types/movie';
import { getImageUrl, formatViewCount } from '@/lib/utils';

interface BottomSectionsProps {
  trendingMovies: Movie[];
  favoriteMovies: Movie[];
  hotGenres: Array<{
    id: string;
    name: string;
    movieCount: number;
    thumbnail: string;
    trending: boolean;
  }>;
}

export function BottomSections({ 
  trendingMovies, 
  favoriteMovies, 
  hotGenres 
}: BottomSectionsProps) {
  return (
    <section className="py-12" style={{backgroundColor: 'var(--bg-3)'}}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left: Rating các phim sôi nổi nhất */}
          <div className="p-6 rounded-lg" style={{backgroundColor: 'var(--bg-4)'}}>
            <div className="mb-6">
              <h3 className="text-xl font-bold text-white flex items-center">
                <FireIcon className="h-6 w-6 text-orange-500 mr-2" />
                Sôi Nổi Nhất
              </h3>
            </div>
            
            <div className="space-y-4">
              {trendingMovies.slice(0, 5).map((movie, index) => (
                <Link
                  key={movie.id}
                  href={`/phim/${movie.slug}`}
                  className="flex items-center space-x-3 p-3 rounded-lg hover:bg-opacity-50 transition-colors group"
                  style={{backgroundColor: 'var(--bg-5)'}}
                >
                  {/* Rank */}
                  <div className="flex-shrink-0 w-8 h-8 bg-red-600 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold text-sm">{index + 1}</span>
                  </div>
                  
                  {/* Movie Poster */}
                  <div className="relative w-12 h-16 bg-gray-700 rounded overflow-hidden flex-shrink-0">
                    <Image
                      src={getImageUrl(movie.poster, 'small')}
                      alt={movie.title}
                      fill
                      className="object-cover"
                      sizes="48px"
                    />
                  </div>
                  
                  {/* Movie Info */}
                  <div className="flex-1 min-w-0">
                    <h4 className="text-white font-medium text-sm group-hover:text-red-400 transition-colors line-clamp-2">
                      {movie.title}
                    </h4>
                    <div className="flex items-center space-x-3 mt-1">
                      <div className="flex items-center text-yellow-400">
                        <StarIcon className="h-3 w-3 mr-1" />
                        <span className="text-xs">{movie.imdbRating}</span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* Center: Yêu thích nhất */}
          <div className="p-6 rounded-lg" style={{backgroundColor: 'var(--bg-4)'}}>
            <div className="mb-6">
              <h3 className="text-xl font-bold text-white flex items-center">
                <HeartIcon className="h-6 w-6 text-red-500 mr-2" />
                Yêu Thích Nhất
              </h3>
            </div>
            
            <div className="space-y-4">
              {favoriteMovies.slice(0, 5).map((movie, index) => (
                <Link
                  key={movie.id}
                  href={`/phim/${movie.slug}`}
                  className="flex items-center space-x-3 p-3 rounded-lg hover:bg-opacity-50 transition-colors group"
                  style={{backgroundColor: 'var(--bg-5)'}}
                >
                  {/* Rank */}
                  <div className="flex-shrink-0 w-8 h-8 bg-red-600 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold text-sm">{index + 1}</span>
                  </div>
                  
                  {/* Movie Poster */}
                  <div className="relative w-12 h-16 bg-gray-700 rounded overflow-hidden flex-shrink-0">
                    <Image
                      src={getImageUrl(movie.poster, 'small')}
                      alt={movie.title}
                      fill
                      className="object-cover"
                      sizes="48px"
                    />
                  </div>
                  
                  {/* Movie Info */}
                  <div className="flex-1 min-w-0">
                    <h4 className="text-white font-medium text-sm group-hover:text-red-400 transition-colors line-clamp-2">
                      {movie.title}
                    </h4>
                    <div className="flex items-center space-x-3 mt-1">
                      <div className="flex items-center text-red-400">
                        <HeartIcon className="h-3 w-3 mr-1" />
                        <span className="text-xs">{formatViewCount(movie.likeCount)}</span>
                      </div>
                      <span className="text-gray-400 text-xs">{movie.releaseYear}</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* Right: Thể loại hot */}
          <div className="p-6 rounded-lg" style={{backgroundColor: 'var(--bg-4)'}}>
            <div className="mb-6">
              <h3 className="text-xl font-bold text-white flex items-center">
                <FireIcon className="h-6 w-6 text-yellow-500 mr-2" />
                Thể Loại Hot
              </h3>
            </div>
            
            <div className="space-y-4">
              {hotGenres.map((genre, index) => (
                <Link
                  key={genre.id}
                  href={`/the-loai/${genre.id}`}
                  className="flex items-center space-x-3 p-3 rounded-lg hover:bg-opacity-50 transition-colors group"
                  style={{backgroundColor: 'var(--bg-5)'}}
                >
                  {/* Rank */}
                  <div className="flex-shrink-0 w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center">
                    <span className="text-black font-bold text-sm">{index + 1}</span>
                  </div>
                  
                  {/* Genre Thumbnail */}
                  <div className="relative w-12 h-16 bg-gray-700 rounded overflow-hidden flex-shrink-0">
                    <Image
                      src={genre.thumbnail}
                      alt={genre.name}
                      fill
                      className="object-cover"
                      sizes="48px"
                    />
                    {genre.trending && (
                      <div className="absolute top-1 right-1">
                        <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                      </div>
                    )}
                  </div>
                  
                  {/* Genre Info */}
                  <div className="flex-1 min-w-0">
                    <h4 className="text-white font-medium text-sm group-hover:text-yellow-400 transition-colors">
                      {genre.name}
                    </h4>
                    <p className="text-gray-400 text-xs mt-1">
                      {genre.movieCount} phim
                    </p>
                    {genre.trending && (
                      <span className="inline-flex items-center text-xs text-red-400 mt-1">
                        <FireIcon className="h-3 w-3 mr-1" />
                        Đang hot
                      </span>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
