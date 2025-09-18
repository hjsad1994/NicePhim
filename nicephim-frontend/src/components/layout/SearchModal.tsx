'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogPanel } from '@headlessui/react';
import { MagnifyingGlassIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { FilmIcon } from '@heroicons/react/24/solid';
import Link from 'next/link';
import Image from 'next/image';
import { debounce } from '@/lib/utils';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface SearchResult {
  id: string;
  title: string;
  slug: string;
  poster: string;
  releaseYear: number;
  type: 'movie' | 'series';
}

export function SearchModal({ isOpen, onClose }: SearchModalProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Mock search function - replace with actual API call
  const performSearch = debounce(async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setResults([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Mock results
    const mockResults: SearchResult[] = [
      {
        id: '1',
        title: 'Spider-Man: No Way Home',
        slug: 'spider-man-no-way-home',
        poster: '/placeholder-movie.jpg',
        releaseYear: 2021,
        type: 'movie',
      },
      {
        id: '2',
        title: 'Squid Game',
        slug: 'squid-game',
        poster: '/placeholder-movie.jpg',
        releaseYear: 2021,
        type: 'series',
      },
      {
        id: '3',
        title: 'The Batman',
        slug: 'the-batman',
        poster: '/placeholder-movie.jpg',
        releaseYear: 2022,
        type: 'movie',
      },
    ].filter(item => 
      item.title.toLowerCase().includes(searchQuery.toLowerCase())
    );

    setResults(mockResults);
    setIsLoading(false);
  }, 300);

  useEffect(() => {
    performSearch(query);
  }, [query]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
      setQuery('');
      setResults([]);
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const handleResultClick = () => {
    onClose();
  };

  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" aria-hidden="true" />

      {/* Full-screen container */}
      <div className="fixed inset-0 flex items-start justify-center p-4 pt-16">
        <DialogPanel className="w-full max-w-2xl bg-gray-900 rounded-lg shadow-xl border border-gray-700">
          {/* Search Input */}
          <div className="flex items-center border-b border-gray-700 p-4">
            <MagnifyingGlassIcon className="h-5 w-5 text-gray-400 mr-3" />
            <input
              type="text"
              placeholder="Tìm kiếm phim, diễn viên, đạo diễn..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="flex-1 bg-transparent text-white placeholder-gray-400 outline-none"
              autoFocus
            />
            <button
              onClick={onClose}
              className="ml-3 p-1 text-gray-400 hover:text-white transition-colors"
            >
              <XMarkIcon className="h-5 w-5" />
            </button>
          </div>

          {/* Search Results */}
          <div className="max-h-96 overflow-y-auto">
            {isLoading && (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
              </div>
            )}

            {!isLoading && query && results.length === 0 && (
              <div className="flex flex-col items-center justify-center py-12">
                <FilmIcon className="h-12 w-12 text-gray-600 mb-4" />
                <p className="text-gray-400 text-center">
                  Không tìm thấy kết quả nào cho "{query}"
                </p>
              </div>
            )}

            {!isLoading && results.length > 0 && (
              <div className="p-4">
                <p className="text-gray-400 text-sm mb-4">
                  Tìm thấy {results.length} kết quả
                </p>
                <div className="space-y-3">
                  {results.map((result) => (
                    <Link
                      key={result.id}
                      href={`/phim/${result.slug}`}
                      onClick={handleResultClick}
                      className="flex items-center p-3 rounded-lg hover:bg-gray-800 transition-colors group"
                    >
                      <div className="relative w-12 h-16 bg-gray-700 rounded overflow-hidden flex-shrink-0">
                        <Image
                          src={result.poster}
                          alt={result.title}
                          fill
                          className="object-cover"
                          sizes="48px"
                        />
                      </div>
                      <div className="ml-3 flex-1 min-w-0">
                        <h3 className="text-white font-medium group-hover:text-red-400 transition-colors truncate">
                          {result.title}
                        </h3>
                        <p className="text-gray-400 text-sm">
                          {result.releaseYear} • {result.type === 'movie' ? 'Phim lẻ' : 'Phim bộ'}
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {!query && (
              <div className="p-4">
                <h3 className="text-white font-medium mb-3">Tìm kiếm phổ biến</h3>
                <div className="flex flex-wrap gap-2">
                  {['Spider-Man', 'Squid Game', 'One Piece', 'Attack on Titan', 'Marvel'].map((term) => (
                    <button
                      key={term}
                      onClick={() => setQuery(term)}
                      className="px-3 py-1 bg-gray-800 text-gray-300 rounded-full text-sm hover:bg-gray-700 hover:text-white transition-colors"
                    >
                      {term}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </DialogPanel>
      </div>
    </Dialog>
  );
}
