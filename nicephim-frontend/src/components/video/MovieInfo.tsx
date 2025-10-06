'use client';

import { useState } from 'react';
import Link from 'next/link';
import { 
  HeartIcon, 
  ShareIcon, 
  StarIcon,
  CalendarIcon,
  ClockIcon,
  FilmIcon,
  GlobeAltIcon
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolid } from '@heroicons/react/24/solid';
import { Movie } from '@/types/movie';

interface MovieInfoProps {
  movie: Movie;
}

export function MovieInfo({ movie }: MovieInfoProps) {
  const [isFavorite, setIsFavorite] = useState(false);
  const [showFullDescription, setShowFullDescription] = useState(false);

  const handleFavoriteToggle = () => {
    setIsFavorite(!isFavorite);
    // Save to localStorage or API
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: movie.title,
        text: movie.description,
        url: window.location.href
      });
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href);
      alert('Đã sao chép link phim!');
    }
  };

  const truncatedDescription = movie.description.length > 300 
    ? movie.description.substring(0, 300) + '...' 
    : movie.description;

  return (
    <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
      {/* Title and Actions */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-3xl font-black mb-3 text-white">
            {movie.title}
          </h1>
          <div className="flex items-center flex-wrap gap-3 text-sm text-white">
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-white/5 rounded-lg border border-white/10">
              <CalendarIcon className="h-4 w-4 text-rose-400" />
              <span>{movie.releaseYear}</span>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-white/5 rounded-lg border border-white/10">
              <ClockIcon className="h-4 w-4 text-pink-400" />
              <span>{movie.duration} phút</span>
            </div>
            {movie.imdbRating && (
              <div className="flex items-center gap-1.5 px-3 py-1.5 bg-white/10 rounded-lg border border-white/20">
                <StarIcon className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                <span className="text-yellow-400 font-semibold">{movie.imdbRating}</span>
              </div>
            )}
            <span className="px-3 py-1.5 bg-white/10 text-rose-400 rounded-lg border border-white/20 text-xs font-semibold">
              {movie.quality}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleFavoriteToggle}
            className={`p-3 rounded-xl transition-all duration-300 transform hover:scale-110 ${
              isFavorite 
                ? 'bg-gradient-to-r from-rose-500 to-pink-500 text-white shadow-lg shadow-rose-500/50' 
                : 'bg-white/5 backdrop-blur-xl border border-white/10 text-gray-400 hover:text-rose-400 hover:border-rose-500/30'
            }`}
          >
            {isFavorite ? (
              <HeartSolid className="h-5 w-5" />
            ) : (
              <HeartIcon className="h-5 w-5" />
            )}
          </button>
          
          <button
            onClick={handleShare}
            className="p-3 rounded-xl bg-white/5 backdrop-blur-xl border border-white/10 text-gray-400 hover:text-white hover:border-white/20 transition-all duration-300 transform hover:scale-110"
          >
            <ShareIcon className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Movie Info Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="flex items-center gap-3 p-3 bg-white/5 rounded-xl border border-white/10">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-rose-500/20 to-rose-600/20 flex items-center justify-center">
            <FilmIcon className="h-5 w-5 text-rose-400" />
          </div>
          <div>
            <div className="text-xs text-rose-300/70 mb-0.5 font-medium">Thể loại</div>
            <div className="text-sm font-semibold text-white">
              {movie.genres.slice(0, 2).map(g => g.name).join(', ')}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 p-3 bg-white/5 rounded-xl border border-white/10">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-pink-500/20 to-pink-600/20 flex items-center justify-center">
            <GlobeAltIcon className="h-5 w-5 text-pink-400" />
          </div>
          <div>
            <div className="text-xs text-pink-300/70 mb-0.5 font-medium">Quốc gia</div>
            <div className="text-sm font-semibold text-white">{movie.country || 'Đang cập nhật'}</div>
          </div>
        </div>

        <div className="flex items-center gap-3 p-3 bg-white/5 rounded-xl border border-white/10">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500/20 to-purple-600/20 flex items-center justify-center">
            <FilmIcon className="h-5 w-5 text-purple-400" />
          </div>
          <div>
            <div className="text-xs text-purple-300/70 mb-0.5 font-medium">Đạo diễn</div>
            <div className="text-sm font-semibold text-white">{movie.director || 'Đang cập nhật'}</div>
          </div>
        </div>

        {movie.cast && movie.cast.length > 0 && (
          <div className="flex items-center gap-3 p-3 bg-white/5 rounded-xl border border-white/10">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500/20 to-blue-600/20 flex items-center justify-center">
              <FilmIcon className="h-5 w-5 text-blue-400" />
            </div>
            <div>
              <div className="text-xs text-blue-300/70 mb-0.5 font-medium">Diễn viên</div>
              <div className="text-sm font-semibold text-white">
                {movie.cast.slice(0, 2).join(', ')}
                {movie.cast.length > 2 && `...`}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Genres Tags */}
      <div className="mb-6">
        <h3 className="text-white font-semibold mb-3 flex items-center">
          Thể loại
        </h3>
        <div className="flex flex-wrap gap-2">
          {movie.genres.map((genre) => (
            <Link
              key={genre.id}
              href={`/the-loai/${genre.slug}`}
              className="px-4 py-2 bg-white/5 hover:bg-gradient-to-r hover:from-rose-500/20 hover:to-pink-500/20 border border-white/10 hover:border-rose-500/30 text-gray-300 hover:text-white rounded-xl text-sm transition-all duration-300"
            >
              {genre.name}
            </Link>
          ))}
        </div>
      </div>


      {/* Description */}
      <div>
        <h3 className="text-white font-semibold mb-3 flex items-center">
          Nội dung phim
        </h3>
        <div className="text-gray-300 leading-relaxed">
          <p>
            {showFullDescription ? movie.description : truncatedDescription}
          </p>
          {movie.description.length > 300 && (
            <button
              onClick={() => setShowFullDescription(!showFullDescription)}
              className="text-rose-400 hover:text-rose-300 mt-3 text-sm font-medium flex items-center gap-1 transition-colors"
            >
              {showFullDescription ? 'Thu gọn ↑' : 'Xem thêm ↓'}
            </button>
          )}
        </div>
      </div>

      {/* Keywords/Tags */}
      {movie.keywords && movie.keywords.length > 0 && (
        <div className="mt-6 pt-6 border-t border-gray-800">
          <h3 className="text-white font-medium mb-3">Từ khóa</h3>
          <div className="flex flex-wrap gap-2">
            {movie.keywords.map((keyword, index) => (
              <span
                key={index}
                className="bg-gray-800 text-gray-300 px-2 py-1 rounded text-xs"
              >
                {keyword}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
