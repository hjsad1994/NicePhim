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
    content: 'Phim hay tuyệt vời! CGI đỉnh cao, cốt truyện hấp dẫn. Tom Holland diễn xuất rất tự nhiên và cuốn hút. Đây thực sự là một bộ phim Marvel xuất sắc nhất từ trước đến nay với những pha hành động mãn nhãn.',
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
    content: 'Series hay nhất năm! Kịch bản sâu sắc, diễn xuất tuyệt vời. Những game tưởng chừng đơn giản nhưng lại rất căng thẳng và đầy kịch tính. Tôi không thể rời mắt khỏi màn hình suốt 9 tập phim. Thông điệp xã hội rất ý nghĩa.',
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
  {
    id: '6',
    user: {
      name: 'Quang Minh',
      avatar: '/placeholder-avatar.jpg',
    },
    movie: {
      title: 'Top Gun: Maverick',
      poster: '/placeholder-movie.jpg',
    },
    content: 'Tom Cruise còn ngầu hơn xưa! Những cảnh bay thật sự nghẹt thở, adrenaline tăng cao suốt phim.',
    rating: 5,
    timestamp: '2 ngày trước',
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
    <section className="py-12 border-2 border-gray-400/15 rounded-lg mt-2" style={{backgroundColor: 'var(--bg-3)'}}>
      <div className="w-[90%] mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Top: Movie Comments Stats Slider */}
        <div className="mb-12 p-6 rounded-lg border-2 border-gray-400/50" style={{backgroundColor: 'var(--bg-4)'}}>
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl font-bold text-yellow-400">
              🏆 TOP BÌNH LUẬN
            </h2>
          </div>

          <div className="relative">
            {/* Navigation Arrows */}
            <button
              onClick={goToPreviousComment}
              className="absolute left-2 top-1/2 -translate-y-1/2 p-2 bg-gray-800/80 hover:bg-gray-700 text-white rounded-full transition-colors z-10 border border-gray-400/60"
              aria-label="Phim trước"
            >
              <ChevronLeftIcon className="h-5 w-5" />
            </button>
            
            <button
              onClick={goToNextComment}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-gray-800/80 hover:bg-gray-700 text-white rounded-full transition-colors z-10 border border-gray-400/60"
              aria-label="Phim tiếp theo"
            >
              <ChevronRightIcon className="h-5 w-5" />
            </button>

            {/* Movie Cards Container */}
            <div className="overflow-hidden">
              <div 
                className="flex gap-4 transition-transform duration-500 ease-in-out"
                style={{ transform: `translateX(-${currentCommentIndex * 320}px)` }}
              >
                {mockComments.map((comment) => (
                  <div
                    key={comment.id}
                    className="flex-shrink-0 group cursor-pointer"
                    style={{ width: '310px', height: '230px' }}
                  >
                    <Link href={`/phim/${comment.movie.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`}>
                      {/* Outer Box - 310x230px with Movie Background */}
                      <div 
                        className="relative rounded-lg overflow-hidden h-full group-hover:scale-105 transition-transform duration-300 border-2 border-gray-400/70"
                        style={{ width: '310px', height: '230px' }}
                      >
                        {/* Blurred Movie Background */}
                        <div className="absolute inset-0">
                          <Image
                            src={getImageUrl(comment.movie.poster, 'medium')}
                            alt={comment.movie.title}
                            fill
                            className="object-cover blur-sm opacity-30"
                            sizes="310px"
                          />
                          {/* Dark overlay */}
                          <div className="absolute inset-0 bg-black/60"></div>
                        </div>

                        {/* Content Area - 240x170px */}
                        <div 
                          className="relative z-10 mx-auto flex h-full"
                          style={{ width: '240px', height: '170px', paddingTop: '30px' }}
                        >
                          {/* Left Side - User Info & Comment */}
                          <div className="flex-1 flex flex-col">
                            {/* User Avatar & Info */}
                            <div className="flex items-start space-x-3 mb-3">
                              <div className="relative w-12 h-12 bg-gray-600 rounded-full overflow-hidden flex-shrink-0">
                                <Image
                                  src={comment.user.avatar}
                                  alt={comment.user.name}
                                  fill
                                  className="object-cover"
                                  sizes="48px"
                                />
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center space-x-2">
                                  <h4 className="text-white font-medium text-sm">{comment.user.name}</h4>
                                  <span className="text-blue-400 text-xs">
                                    {Math.random() > 0.5 ? '♂️' : '♀️'}
                                  </span>
                                  {/* Infinity Badge */}
                                  <div className="bg-blue-600 text-white text-[8px] px-1.5 py-0.5 rounded">
                                    ∞
                                  </div>
                                </div>
                                <p className="text-gray-400 text-xs">{comment.timestamp}</p>
                              </div>
                            </div>

                            {/* Comment Text */}
                            <p className="text-gray-200 text-sm leading-relaxed line-clamp-4 mb-3 overflow-hidden text-ellipsis">
                              {comment.content}
                            </p>

                            {/* Stats */}
                            <div className="flex items-center space-x-4 text-xs text-gray-400 mt-auto">
                              <span className="flex items-center space-x-1">
                                <span>👁</span>
                                <span>{Math.floor(Math.random() * 10) + 1}</span>
                              </span>
                              <span className="flex items-center space-x-1">
                                <span>👍</span>
                                <span>0</span>
                              </span>
                              <span className="flex items-center space-x-1">
                                <span>💬</span>
                                <span>{comment.rating}</span>
                              </span>
                            </div>
                          </div>

                          {/* Right Side - Movie Poster */}
                          <div className="w-20 ml-4 flex-shrink-0">
                            <div className="relative w-20 h-28 bg-gray-800 rounded-lg overflow-hidden shadow-lg">
                              <Image
                                src={getImageUrl(comment.movie.poster, 'small')}
                                alt={comment.movie.title}
                                fill
                                className="object-cover"
                                sizes="80px"
                              />
                            </div>
                            <h5 className="text-white text-xs font-medium mt-2 line-clamp-2 text-center">
                              {comment.movie.title}
                            </h5>
                          </div>
                        </div>
                      </div>
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Bottom: 3 Columns */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 border-t border-gray-400/70 pt-12">
          
          {/* Left: Rating các phim sôi nổi nhất */}
          <div className="p-6 rounded-lg border border-gray-400/60" style={{backgroundColor: 'var(--bg-4)'}}>
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
          <div className="p-6 rounded-lg border border-gray-400/60" style={{backgroundColor: 'var(--bg-4)'}}>
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
          <div className="p-6 rounded-lg border border-gray-400/60" style={{backgroundColor: 'var(--bg-4)'}}>
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
