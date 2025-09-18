'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { PlayIcon, InformationCircleIcon, ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/solid';
import { Movie } from '@/types/movie';
import { getImageUrl, truncateText } from '@/lib/utils';

interface HeroProps {
  movies: Movie[];
}

export function Hero({ movies }: HeroProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlay, setIsAutoPlay] = useState(true);
  const [animationKey, setAnimationKey] = useState(0);

  const currentMovie = movies[currentIndex];

  // Trigger animation when movie changes
  useEffect(() => {
    setAnimationKey(prev => prev + 1);
  }, [currentIndex]);

  // Auto-play carousel
  useEffect(() => {
    if (!isAutoPlay || movies.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % movies.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [movies.length, isAutoPlay]);

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + movies.length) % movies.length);
    setIsAutoPlay(false);
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % movies.length);
    setIsAutoPlay(false);
  };

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
    setIsAutoPlay(false);
  };

  if (movies.length === 0) return null;

  return (
    <div className="relative h-[60vh] sm:h-[70vh] lg:h-[80vh] overflow-hidden">
      {/* Background Images */}
      {movies.map((movie, index) => (
        <div
          key={movie.id}
          className={`absolute inset-0 transition-opacity duration-1000 ${
            index === currentIndex ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <Image
            src={getImageUrl(movie.banner || movie.poster, 'large')}
            alt={movie.title}
            fill
            className="object-cover"
            priority={index === 0}
            sizes="100vw"
          />
          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
        </div>
      ))}

      {/* Content */}
      <div className="relative h-full flex items-center pt-16">
        <div className="w-[90%] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-xl lg:max-w-2xl">
            {/* Title */}
            <h1 
              key={`title-${animationKey}`}
              className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-4 animate-slide-in-left"
            >
              {currentMovie.title}
            </h1>

            {/* Info */}
            <div 
              key={`info-${animationKey}`}
              className="flex items-center space-x-4 text-gray-300 mb-4 animate-slide-in-left-delayed"
            >
              <span className="bg-red-600 text-white px-2 py-1 rounded text-sm font-medium">
                {currentMovie.quality}
              </span>
              <span>{currentMovie.releaseYear}</span>
              {currentMovie.imdbRating && (
                <div className="flex items-center">
                  <span className="text-yellow-400 mr-1">★</span>
                  <span>{currentMovie.imdbRating}</span>
                </div>
              )}
              <span>{currentMovie.genres[0]?.name}</span>
            </div>

            {/* Description */}
            <p 
              key={`desc-${animationKey}`}
              className="text-gray-200 text-lg mb-8 leading-relaxed animate-slide-in-left-delayed-2"
            >
              {truncateText(currentMovie.description, 200)}
            </p>

            {/* Action Buttons */}
            <div 
              key={`buttons-${animationKey}`}
              className="flex items-center space-x-4 animate-slide-in-left-delayed-3"
            >
              <Link
                href={`/xem/${currentMovie.slug}`}
                className="flex items-center bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
              >
                <PlayIcon className="h-5 w-5 mr-2" />
                Xem ngay
              </Link>
              
              <Link
                href={`/phim/${currentMovie.slug}`}
                className="flex items-center bg-gray-800/80 hover:bg-gray-700/80 text-white px-6 py-3 rounded-lg font-medium transition-colors backdrop-blur-sm"
              >
                <InformationCircleIcon className="h-5 w-5 mr-2" />
                Chi tiết
              </Link>
            </div>
          </div>
        </div>

        {/* Navigation Arrows */}
        {movies.length > 1 && (
          <>
            <button
              onClick={goToPrevious}
              className="absolute left-4 top-1/2 -translate-y-1/2 p-2 bg-black/50 hover:bg-black/70 text-white rounded-full transition-colors"
              aria-label="Phim trước"
            >
              <ChevronLeftIcon className="h-6 w-6" />
            </button>
            
            <button
              onClick={goToNext}
              className="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-black/50 hover:bg-black/70 text-white rounded-full transition-colors"
              aria-label="Phim tiếp theo"
            >
              <ChevronRightIcon className="h-6 w-6" />
            </button>
          </>
        )}

        {/* Dots Indicator */}
        {movies.length > 1 && (
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex space-x-2">
            {movies.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`w-3 h-3 rounded-full transition-colors ${
                  index === currentIndex ? 'bg-red-600' : 'bg-white/50 hover:bg-white/70'
                }`}
                aria-label={`Đi đến slide ${index + 1}`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
