'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { PlayIcon, InformationCircleIcon, ChevronLeftIcon, ChevronRightIcon, StarIcon, ClockIcon, PauseIcon } from '@heroicons/react/24/solid';
import { Movie } from '@/types/movie';
import { getImageUrl, truncateText } from '@/lib/utils';

interface HeroProps {
  movies: Movie[];
}

export function Hero({ movies }: HeroProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlay, setIsAutoPlay] = useState(true);
  const [isHovered, setIsHovered] = useState(false);
  const [progress, setProgress] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const currentMovie = movies[currentIndex];

  // Auto-play carousel with progress bar
  useEffect(() => {
    if (!isAutoPlay || movies.length <= 1) return;

    const startProgress = () => {
      setProgress(0);
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
      progressIntervalRef.current = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 100) {
            return 100;
          }
          return prev + 2; // 2% every 100ms = 5s total
        });
      }, 100);
    };

    startProgress();

    intervalRef.current = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % movies.length);
    }, 5000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
    };
  }, [movies.length, isAutoPlay, isHovered]);

  // Reset progress and restart auto-play when movie changes
  useEffect(() => {
    setProgress(0);
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
    }

    // Restart progress for new slide
    if (isAutoPlay && !isHovered) {
      const restartProgress = () => {
        progressIntervalRef.current = setInterval(() => {
          setProgress((prev) => {
            if (prev >= 100) {
              return 100;
            }
            return prev + 2;
          });
        }, 100);
      };
      restartProgress();
    }
  }, [currentIndex, isAutoPlay, isHovered]);

  // Resume auto-play after user interaction
  useEffect(() => {
    if (!isHovered && !isAutoPlay && movies.length > 1) {
      const resumeTimeout = setTimeout(() => {
        setIsAutoPlay(true);
      }, 10000); // Resume after 10 seconds of inactivity

      return () => clearTimeout(resumeTimeout);
    }
  }, [isHovered, isAutoPlay, movies.length]);

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

  const toggleAutoPlay = () => {
    setIsAutoPlay(!isAutoPlay);
  };

  if (movies.length === 0) return null;

  return (
    <div
      className="relative h-[70vh] sm:h-[80vh] lg:h-[90vh] overflow-hidden"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Background Images with Parallax Effect */}
      {movies.map((movie, index) => (
        <div
          key={movie.id}
          className={`absolute inset-0 transition-all duration-1000 ease-out ${
            index === currentIndex ? 'opacity-100 scale-100' : 'opacity-0 scale-110'
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
          {/* Enhanced Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/60 via-30% to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/40" />
        </div>
      ))}

      {/* Floating Particles Effect */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-white/20 rounded-full animate-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 2}s`,
              animationDuration: `${2 + Math.random() * 2}s`
            }}
          />
        ))}
      </div>

      {/* Content */}
      <div className="relative h-full flex items-center">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 w-full">
          <div className="max-w-2xl lg:max-w-3xl">
            {/* Movie Badge */}
            <div className="inline-flex items-center space-x-2 mb-6 bg-black/40 backdrop-blur-sm border border-gray-700/50 rounded-full px-4 py-2">
              <div className="flex items-center space-x-1">
                <StarIcon className="h-4 w-4 text-yellow-400" />
                <span className="text-white text-sm font-medium">
                  {currentMovie.imdbRating || '8.5'}
                </span>
              </div>
              <div className="w-px h-4 bg-gray-600" />
              <span className="text-gray-300 text-sm">{currentMovie.releaseYear}</span>
              <div className="w-px h-4 bg-gray-600" />
              <span className="bg-gradient-to-r from-red-600 to-pink-600 text-white text-xs px-2 py-1 rounded-full font-medium">
                {currentMovie.quality || 'HD'}
              </span>
            </div>

            {/* Title with Animation */}
            <h1 className="text-5xl sm:text-6xl lg:text-7xl xl:text-8xl font-bold text-white mb-6 leading-tight">
              <span className="bg-gradient-to-r from-white via-gray-200 to-white bg-clip-text text-transparent">
                {currentMovie.title}
              </span>
            </h1>

            {/* Genre Tags */}
            <div className="flex flex-wrap gap-2 mb-6">
              {currentMovie.genres?.slice(0, 3).map((genre) => (
                <span
                  key={genre.id}
                  className="px-3 py-1 bg-gray-800/60 backdrop-blur-sm border border-gray-700/50 text-gray-300 text-sm rounded-full hover:bg-gray-700/60 transition-colors"
                >
                  {genre.name}
                </span>
              ))}
            </div>

            {/* Description */}
            <p className="text-gray-200 text-lg lg:text-xl mb-8 leading-relaxed max-w-2xl">
              {truncateText(currentMovie.description || 'Khám phá bộ phim hấp dẫn này ngay hôm nay.', 200)}
            </p>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <Link
                href={`/xem/${currentMovie.slug}`}
                className="group inline-flex items-center px-8 py-4 bg-gradient-to-r from-red-600 to-pink-600 text-white font-semibold rounded-xl hover:from-red-700 hover:to-pink-700 transition-all duration-500 shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                <PlayIcon className="h-6 w-6 mr-3" />
                Xem Ngay
                <svg className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>

              <Link
                href={`/phim/${currentMovie.slug}`}
                className="group inline-flex items-center px-8 py-4 bg-black/40 backdrop-blur-sm border border-gray-700/50 text-white font-semibold rounded-xl hover:bg-gray-800/60 hover:border-gray-600/50 transition-all duration-500"
              >
                <InformationCircleIcon className="h-6 w-6 mr-3" />
                Thông Tin
                <svg className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>

            {/* Additional Info */}
            <div className="flex items-center space-x-6 mt-8 text-gray-400">
              <div className="flex items-center space-x-2">
                <ClockIcon className="h-5 w-5" />
                <span className="text-sm">{currentMovie.duration || 120} phút</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-sm">{currentMovie.country || 'Việt Nam'}</span>
              </div>
              {currentMovie.isHot && (
                <div className="flex items-center space-x-1">
                  <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse" />
                  <span className="text-sm text-orange-400 font-medium">HOT</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Navigation Arrows */}
        {movies.length > 1 && (
          <>
            <button
              onClick={goToPrevious}
              className="absolute left-6 top-1/2 -translate-y-1/2 p-3 bg-black/40 backdrop-blur-sm border border-gray-700/50 text-white rounded-full transition-all duration-300 hover:bg-black/60 hover:scale-110 group"
              aria-label="Phim trước"
            >
              <ChevronLeftIcon className="h-6 w-6 group-hover:scale-110 transition-transform" />
            </button>

            <button
              onClick={goToNext}
              className="absolute right-6 top-1/2 -translate-y-1/2 p-3 bg-black/40 backdrop-blur-sm border border-gray-700/50 text-white rounded-full transition-all duration-300 hover:bg-black/60 hover:scale-110 group"
              aria-label="Phim tiếp theo"
            >
              <ChevronRightIcon className="h-6 w-6 group-hover:scale-110 transition-transform" />
            </button>
          </>
        )}

  
        {/* Dots Indicator */}
        {movies.length > 1 && (
          <div className="absolute bottom-20 left-1/2 -translate-x-1/2 flex space-x-3">
            {movies.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`relative w-3 h-3 rounded-full transition-all duration-300 ${
                  index === currentIndex ? 'bg-white' : 'bg-white/30 hover:bg-white/50'
                }`}
                aria-label={`Đi đến slide ${index + 1}`}
              >
                {index === currentIndex && (
                  <div className="absolute inset-0 bg-white rounded-full animate-ping opacity-50" />
                )}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Side Info Panel */}
      {movies.length > 1 && (
        <div className="absolute right-25 top-1/2 -translate-y-1/2 hidden lg:block">
          <div className="space-x-2"> 
            {movies.map((movie, index) => (
              <button
                key={movie.id}
                onClick={() => goToSlide(index)}
                className={`group relative w-32 h-20 rounded-lg overflow-hidden transition-all duration-300 transform hover:scale-100 ${
                  index === currentIndex
                    ? 'ring-2 ring-red-500 scale-110 shadow-lg'
                    : 'opacity-70 hover:opacity-90 hover:ring-1 hover:ring-white/50'
                }`}
                title={movie.title}
              >
                <Image
                  src={getImageUrl(movie.poster, 'small')}
                  alt={movie.title}
                  fill
                  className="object-cover"
                  priority={index === currentIndex}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent"  />
                <div className="absolute bottom-1 left-1 right-1">
                  <p className="text-white text-xs font-medium truncate leading-tight">
                    {movie.title}
                  </p>
                  {index === currentIndex && (
                    <div className="flex items-center mt-1">
                      <div className="w-1.5 h-1.5 bg-red-500 rounded-full mr-1 animate-pulse" />
                      <span className="text-red-400 text-[10px] font-medium">Đang phát</span>
                    </div>
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}