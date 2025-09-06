'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { 
  HeartIcon, 
  FireIcon, 
  ChevronLeftIcon, 
  ChevronRightIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  MinusIcon,
  StarIcon
} from '@heroicons/react/24/solid';
import { Movie } from '@/types/movie';
import { getImageUrl } from '@/lib/utils';

// Comment data interface
interface CommentData {
  id: string;
  user: {
    name: string;
    avatar: string;
  };
  movie: {
    title: string;
    poster: string;
  };
  content: string;
  rating: number;
  timestamp: string;
}

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

const mockComments: CommentData[] = [
  {
    id: '1',
    user: {
      name: 'Minh Anh',
      avatar: '/placeholder-avatar.jpg',
    },
    movie: {
      title: 'Spider-Man: No Way Home',
      poster: '/placeholder-movie.jpg',
    },
    content: 'Phim hay tuyệt vời! CGI đỉnh cao, cốt truyện hấp dẫn. Tom Holland diễn xuất rất tự nhiên và cuốn hút.',
    rating: 5,
    timestamp: '2 giờ trước',
  },
  {
    id: '2',
    user: {
      name: 'Đức Thắng',
      avatar: '/placeholder-avatar.jpg',
    },
    movie: {
      title: 'Squid Game',
      poster: '/placeholder-movie.jpg',
    },
    content: 'Series hay nhất năm! Kịch bản sâu sắc, diễn xuất tuyệt vời. Những game tưởng chừng đơn giản nhưng lại rất căng thẳng.',
    rating: 5,
    timestamp: '3 giờ trước',
  },
  {
    id: '3',
    user: {
      name: 'Thu Trang',
      avatar: '/placeholder-avatar.jpg',
    },
    movie: {
      title: 'The Batman',
      poster: '/placeholder-movie.jpg',
    },
    content: 'Robert Pattinson thể hiện Batman rất ấn tượng. Phim tối tăm nhưng rất chân thực và cuốn hút.',
    rating: 4,
    timestamp: '5 giờ trước',
  },
  {
    id: '4',
    user: {
      name: 'Hoàng Nam',
      avatar: '/placeholder-avatar.jpg',
    },
    movie: {
      title: 'One Piece Film: Red',
      poster: '/placeholder-movie.jpg',
    },
    content: 'Fan One Piece thì không thể bỏ lỡ! Animation đẹp mắt, nhạc phim hay. Uta thật sự rất ấn tượng.',
    rating: 5,
    timestamp: '1 ngày trước',
  },
  {
    id: '5',
    user: {
      name: 'Linh Chi',
      avatar: '/placeholder-avatar.jpg',
    },
    movie: {
      title: 'Avatar: The Way of Water',
      poster: '/placeholder-movie.jpg',
    },
    content: 'Hình ảnh siêu đẹp, công nghệ 3D đỉnh cao. Tuy dài nhưng không hề chán, cảm động và hoành tráng.',
    rating: 4,
    timestamp: '1 ngày trước',
  },
];

export function UnifiedBottomBlock({ 
  trendingMovies, 
  favoriteMovies, 
  hotGenres 
}: UnifiedBottomBlockProps) {
  const [currentCommentIndex, setCurrentCommentIndex] = useState(0);

  const goToPreviousComment = () => {
    setCurrentCommentIndex((prev) => (prev - 1 + mockComments.length) % mockComments.length);
  };

  const goToNextComment = () => {
    setCurrentCommentIndex((prev) => (prev + 1) % mockComments.length);
  };

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
    <section className="py-12" style={{backgroundColor: 'var(--bg-3)'}}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Top: Comments Slider */}
        <div className="mb-12">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-white mb-4">
              💬 Top Bình Luận Nổi Bật
            </h2>
            <p className="text-gray-300 text-lg">
              Những đánh giá và bình luận hay nhất từ cộng đồng
            </p>
          </div>

          <div className="relative">
            <div className="overflow-hidden rounded-lg">
              <div 
                className="flex transition-transform duration-500 ease-in-out"
                style={{ transform: `translateX(-${currentCommentIndex * 100}%)` }}
              >
                {mockComments.map((comment) => (
                  <div
                    key={comment.id}
                    className="w-full flex-shrink-0 p-6 rounded-lg"
                    style={{backgroundColor: 'var(--bg-4)'}}
                  >
                    <div className="flex items-start space-x-4">
                      {/* Movie Poster */}
                      <div className="relative w-16 h-24 bg-gray-700 rounded overflow-hidden flex-shrink-0">
                        <Image
                          src={getImageUrl(comment.movie.poster, 'small')}
                          alt={comment.movie.title}
                          fill
                          className="object-cover"
                          sizes="64px"
                        />
                      </div>

                      {/* Comment Content */}
                      <div className="flex-1 min-w-0">
                        {/* User Info */}
                        <div className="flex items-center space-x-3 mb-3">
                          <div className="relative w-10 h-10 bg-gray-600 rounded-full overflow-hidden">
                            <Image
                              src={comment.user.avatar}
                              alt={comment.user.name}
                              fill
                              className="object-cover"
                              sizes="40px"
                            />
                          </div>
                          <div>
                            <h4 className="text-white font-medium">{comment.user.name}</h4>
                            <p className="text-gray-400 text-sm">
                              bình luận về <span className="text-red-400">{comment.movie.title}</span>
                            </p>
                          </div>
                        </div>

                        {/* Rating */}
                        <div className="flex items-center space-x-1 mb-3">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <StarIcon
                              key={i}
                              className={`h-4 w-4 ${
                                i < comment.rating ? 'text-yellow-400' : 'text-gray-600'
                              }`}
                            />
                          ))}
                          <span className="text-gray-400 text-sm ml-2">{comment.timestamp}</span>
                        </div>

                        {/* Comment Text */}
                        <p className="text-gray-200 leading-relaxed">
                          &ldquo;{comment.content}&rdquo;
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Navigation Arrows */}
            <button
              onClick={goToPreviousComment}
              className="absolute left-4 top-1/2 -translate-y-1/2 p-2 bg-black/50 hover:bg-black/70 text-white rounded-full transition-colors"
              aria-label="Bình luận trước"
            >
              <ChevronLeftIcon className="h-5 w-5" />
            </button>
            
            <button
              onClick={goToNextComment}
              className="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-black/50 hover:bg-black/70 text-white rounded-full transition-colors"
              aria-label="Bình luận tiếp theo"
            >
              <ChevronRightIcon className="h-5 w-5" />
            </button>

            {/* Dots Indicator */}
            <div className="flex justify-center mt-6 space-x-2">
              {mockComments.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentCommentIndex(index)}
                  className={`w-2 h-2 rounded-full transition-colors ${
                    index === currentCommentIndex ? 'bg-red-500' : 'bg-gray-600 hover:bg-gray-500'
                  }`}
                  aria-label={`Đi đến bình luận ${index + 1}`}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Bottom: 3 Columns */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left: Rating các phim sôi nổi nhất */}
          <div className="p-6 rounded-lg" style={{backgroundColor: 'var(--bg-4)'}}>
            <div className="mb-6">
              <h3 className="text-xl font-bold text-white flex items-center">
                <FireIcon className="h-6 w-6 text-orange-500 mr-2" />
                Sôi Nổi Nhất
              </h3>
            </div>
            
            <div className="space-y-3">
              {trendingMovies.slice(0, 5).map((movie, index) => (
                <Link
                  key={movie.id}
                  href={`/phim/${movie.slug}`}
                  className="flex items-center space-x-3 p-2 rounded-lg hover:bg-opacity-50 transition-colors group"
                  style={{backgroundColor: 'var(--bg-5)'}}
                >
                  {/* Rank */}
                  <div className="flex-shrink-0 w-6 h-6 bg-red-600 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold text-xs">{index + 1}</span>
                  </div>
                  
                  {/* Movie Poster */}
                  <div className="relative w-10 h-14 bg-gray-700 rounded overflow-hidden flex-shrink-0">
                    <Image
                      src={getImageUrl(movie.poster, 'small')}
                      alt={movie.title}
                      fill
                      className="object-cover"
                      sizes="40px"
                    />
                  </div>
                  
                  {/* Movie Info */}
                  <div className="flex-1 min-w-0">
                    <h4 className="text-white font-medium text-xs group-hover:text-red-400 transition-colors line-clamp-2">
                      {movie.title}
                    </h4>
                    <div className="flex items-center space-x-2 mt-1">
                      <span className="text-gray-400 text-xs">{movie.releaseYear}</span>
                      {renderTrendIndicator(movie.trend)}
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
            
            <div className="space-y-3">
              {favoriteMovies.slice(0, 5).map((movie, index) => (
                <Link
                  key={movie.id}
                  href={`/phim/${movie.slug}`}
                  className="flex items-center space-x-3 p-2 rounded-lg hover:bg-opacity-50 transition-colors group"
                  style={{backgroundColor: 'var(--bg-5)'}}
                >
                  {/* Rank */}
                  <div className="flex-shrink-0 w-6 h-6 bg-red-600 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold text-xs">{index + 1}</span>
                  </div>
                  
                  {/* Movie Poster */}
                  <div className="relative w-10 h-14 bg-gray-700 rounded overflow-hidden flex-shrink-0">
                    <Image
                      src={getImageUrl(movie.poster, 'small')}
                      alt={movie.title}
                      fill
                      className="object-cover"
                      sizes="40px"
                    />
                  </div>
                  
                  {/* Movie Info */}
                  <div className="flex-1 min-w-0">
                    <h4 className="text-white font-medium text-xs group-hover:text-red-400 transition-colors line-clamp-2">
                      {movie.title}
                    </h4>
                    <div className="flex items-center space-x-2 mt-1">
                      <span className="text-gray-400 text-xs">{movie.releaseYear}</span>
                      {renderTrendIndicator(movie.trend)}
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
            
            <div className="space-y-3">
              {hotGenres.map((genre, index) => (
                <Link
                  key={genre.id}
                  href={`/the-loai/${genre.id}`}
                  className="flex items-center space-x-3 p-2 rounded-lg hover:bg-opacity-50 transition-colors group"
                  style={{backgroundColor: 'var(--bg-5)'}}
                >
                  {/* Rank */}
                  <div className="flex-shrink-0 w-6 h-6 bg-yellow-500 rounded-full flex items-center justify-center">
                    <span className="text-black font-bold text-xs">{index + 1}</span>
                  </div>
                  
                  {/* Genre Thumbnail */}
                  <div className="relative w-10 h-14 bg-gray-700 rounded overflow-hidden flex-shrink-0">
                    <Image
                      src={genre.thumbnail}
                      alt={genre.name}
                      fill
                      className="object-cover"
                      sizes="40px"
                    />
                    {genre.trending && (
                      <div className="absolute top-1 right-1">
                        <div className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse"></div>
                      </div>
                    )}
                  </div>
                  
                  {/* Genre Info */}
                  <div className="flex-1 min-w-0">
                    <h4 className="text-white font-medium text-xs group-hover:text-yellow-400 transition-colors">
                      {genre.name}
                    </h4>
                    <div className="flex items-center space-x-2 mt-1">
                      <span className="text-gray-400 text-xs">{genre.movieCount} phim</span>
                      {renderTrendIndicator(genre.trend)}
                    </div>
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
