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
    <div className="bg-gray-900 rounded-lg p-6">
      {/* Title and Actions */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <h1 className="text-2xl font-bold text-white mb-2">{movie.title}</h1>
          <div className="flex items-center space-x-4 text-sm text-gray-400">
            <div className="flex items-center">
              <CalendarIcon className="h-4 w-4 mr-1" />
              <span>{movie.releaseYear}</span>
            </div>
            <div className="flex items-center">
              <ClockIcon className="h-4 w-4 mr-1" />
              <span>{movie.duration}</span>
            </div>
            {movie.imdbRating && (
              <div className="flex items-center text-yellow-400">
                <StarIcon className="h-4 w-4 mr-1" />
                <span>{movie.imdbRating}</span>
              </div>
            )}
            <span className="bg-red-600 text-white px-2 py-1 rounded text-xs">
              {movie.quality}
            </span>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={handleFavoriteToggle}
            className={`p-2 rounded-lg transition-colors ${
              isFavorite 
                ? 'bg-red-600 text-white' 
                : 'bg-gray-800 text-gray-400 hover:text-red-400'
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
            className="p-2 rounded-lg bg-gray-800 text-gray-400 hover:text-white transition-colors"
          >
            <ShareIcon className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Quick Info Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-gray-800 rounded-lg p-3">
          <div className="flex items-center text-gray-400 text-sm mb-1">
            <FilmIcon className="h-4 w-4 mr-1" />
            Thể loại
          </div>
          <div className="text-white text-sm">
            {movie.genres.slice(0, 2).map(g => g.name).join(', ')}
          </div>
        </div>

        <div className="bg-gray-800 rounded-lg p-3">
          <div className="flex items-center text-gray-400 text-sm mb-1">
            <GlobeAltIcon className="h-4 w-4 mr-1" />
            Quốc gia
          </div>
          <div className="text-white text-sm">{movie.country}</div>
        </div>

        <div className="bg-gray-800 rounded-lg p-3">
          <div className="text-gray-400 text-sm mb-1">Đạo diễn</div>
          <div className="text-white text-sm">{movie.director}</div>
        </div>

        <div className="bg-gray-800 rounded-lg p-3">
          <div className="text-gray-400 text-sm mb-1">Lượt xem</div>
          <div className="text-white text-sm">{(movie.views || movie.viewCount)?.toLocaleString()}</div>
        </div>
      </div>

      {/* Genres Tags */}
      <div className="mb-6">
        <h3 className="text-white font-medium mb-3">Thể loại</h3>
        <div className="flex flex-wrap gap-2">
          {movie.genres.map((genre) => (
            <Link
              key={genre.id}
              href={`/the-loai/${genre.slug}`}
              className="bg-gray-800 hover:bg-red-600 text-gray-300 hover:text-white px-3 py-1 rounded-full text-sm transition-colors"
            >
              {genre.name}
            </Link>
          ))}
        </div>
      </div>

      {/* Cast */}
      {movie.cast && movie.cast.length > 0 && (
        <div className="mb-6">
          <h3 className="text-white font-medium mb-3">Diễn viên</h3>
          <div className="flex flex-wrap gap-2">
            {movie.cast.slice(0, 6).map((actor, index) => (
              <Link
                key={index}
                href={`/dien-vien/${actor.toLowerCase().replace(/\s+/g, '-')}`}
                className="bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white px-3 py-1 rounded-full text-sm transition-colors"
              >
                {actor}
              </Link>
            ))}
            {movie.cast.length > 6 && (
              <span className="text-gray-400 text-sm px-3 py-1">
                +{movie.cast.length - 6} khác
              </span>
            )}
          </div>
        </div>
      )}

      {/* Description */}
      <div>
        <h3 className="text-white font-medium mb-3">Nội dung phim</h3>
        <div className="text-gray-300 leading-relaxed">
          <p>
            {showFullDescription ? movie.description : truncatedDescription}
          </p>
          {movie.description.length > 300 && (
            <button
              onClick={() => setShowFullDescription(!showFullDescription)}
              className="text-red-400 hover:text-red-300 mt-2 text-sm font-medium"
            >
              {showFullDescription ? 'Thu gọn' : 'Xem thêm'}
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
