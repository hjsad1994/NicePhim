'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { ChevronLeftIcon, ChevronRightIcon, StarIcon } from '@heroicons/react/24/solid';
import { getImageUrl } from '@/lib/utils';

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

export function CommentsSlider() {
  const [currentIndex, setCurrentIndex] = useState(0);

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + mockComments.length) % mockComments.length);
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % mockComments.length);
  };

  return (
    <section className="py-12" style={{backgroundColor: 'var(--bg-4)'}}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-white mb-4">
            💬 Top Bình Luận Nổi Bật
          </h2>
          <p className="text-gray-300 text-lg">
            Những đánh giá và bình luận hay nhất từ cộng đồng
          </p>
        </div>

        {/* Comments Slider */}
        <div className="relative">
          <div className="overflow-hidden rounded-lg">
            <div 
              className="flex transition-transform duration-500 ease-in-out"
              style={{ transform: `translateX(-${currentIndex * 100}%)` }}
            >
              {mockComments.map((comment) => (
                <div
                  key={comment.id}
                  className="w-full flex-shrink-0 p-6 rounded-lg"
                  style={{backgroundColor: 'var(--bg-5)'}}
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
                        "{comment.content}"
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Navigation Arrows */}
          <button
            onClick={goToPrevious}
            className="absolute left-4 top-1/2 -translate-y-1/2 p-2 bg-black/50 hover:bg-black/70 text-white rounded-full transition-colors"
            aria-label="Bình luận trước"
          >
            <ChevronLeftIcon className="h-5 w-5" />
          </button>
          
          <button
            onClick={goToNext}
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
                onClick={() => setCurrentIndex(index)}
                className={`w-2 h-2 rounded-full transition-colors ${
                  index === currentIndex ? 'bg-red-500' : 'bg-gray-600 hover:bg-gray-500'
                }`}
                aria-label={`Đi đến bình luận ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
