'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ApiService, MovieResponse, GenreResponse } from '@/lib/api';
import { getImageUrl, generateSlug } from '@/lib/utils';
import {
  PencilIcon,
  TrashIcon,
  EyeIcon,
  PlusIcon,
  MagnifyingGlassIcon,
  TagIcon
} from '@heroicons/react/24/outline';

export default function MoviesManagement() {
  const router = useRouter();
  const [movies, setMovies] = useState<MovieResponse[]>([]);
  const [movieGenres, setMovieGenres] = useState<{[movieId: string]: GenreResponse[]}>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalMovies, setTotalMovies] = useState(0);
  const [isSearching, setIsSearching] = useState(false);

  const pageSize = 10;

  const fetchGenresForMovies = async (movies: MovieResponse[]) => {
    // Use genres from MovieResponse if available, otherwise fetch separately
    const genresMap: {[movieId: string]: GenreResponse[]} = {};
    const moviesNeedingGenres: MovieResponse[] = [];
    
    movies.forEach((movie) => {
      if (movie.genres && movie.genres.length > 0) {
        // Use genres from MovieResponse
        genresMap[movie.movieId] = movie.genres;
      } else {
        // Mark for separate fetching
        moviesNeedingGenres.push(movie);
        genresMap[movie.movieId] = [];
      }
    });
    
    // Fetch genres separately for movies that don't have them
    if (moviesNeedingGenres.length > 0) {
      const genrePromises = moviesNeedingGenres.map(async (movie) => {
        try {
          const response = await ApiService.getGenresByMovieId(movie.movieId);
          return { movieId: movie.movieId, genres: response.success ? response.data || [] : [] };
        } catch {
          return { movieId: movie.movieId, genres: [] };
        }
      });

      const results = await Promise.all(genrePromises);
      results.forEach(({ movieId, genres }) => {
        genresMap[movieId] = genres;
      });
    }
    
    setMovieGenres(genresMap);
  };

  const fetchMovies = async (page: number = 0) => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await ApiService.getMovies(page, pageSize);

      if (response.success && response.data) {
        console.log('Movies data:', response.data);
        console.log('First movie genres:', response.data[0]?.genres);
        setMovies(response.data);
        if (response.pagination) {
          setCurrentPage(response.pagination.page);
          setTotalPages(response.pagination.totalPages);
          setTotalMovies(response.pagination.total);
        }
        // Fetch genres for all movies
        await fetchGenresForMovies(response.data);
      } else {
        throw new Error(response.error || 'Không thể tải danh sách phim');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Có lỗi xảy ra khi tải danh sách phim';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const searchMovies = async (query: string) => {
    if (!query.trim()) {
      fetchMovies(0);
      return;
    }

    try {
      setIsSearching(true);
      setError(null);
      const response = await ApiService.searchMovies(query.trim());

      if (response.success && response.data) {
        setMovies(response.data);
        setTotalMovies(response.count || response.data.length);
        setTotalPages(1);
        setCurrentPage(0);
        // Fetch genres for search results
        await fetchGenresForMovies(response.data);
      } else {
        throw new Error(response.error || 'Không thể tìm kiếm phim');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Có lỗi xảy ra khi tìm kiếm';
      setError(errorMessage);
    } finally {
      setIsSearching(false);
    }
  };

  const handleDeleteMovie = async (movieId: string, title: string) => {
    if (!confirm(`Bạn có chắc chắn muốn xóa phim "${title}"?`)) {
      return;
    }

    try {
      const response = await ApiService.deleteMovie(movieId);
      if (response.success) {
        // Refresh the list
        if (searchQuery.trim()) {
          searchMovies(searchQuery);
        } else {
          fetchMovies(currentPage);
        }
        alert(response.message || 'Xóa phim thành công!');
      } else {
        throw new Error(response.error || 'Không thể xóa phim');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Có lỗi xảy ra khi xóa phim';
      alert(errorMessage);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    searchMovies(searchQuery);
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 0 && newPage < totalPages) {
      fetchMovies(newPage);
    }
  };

  useEffect(() => {
    fetchMovies(0);
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold" style={{color: 'var(--color-text-primary)'}}>Quản lý phim</h1>
          <p style={{color: 'var(--color-text-secondary)'}}>Tổng cộng: {totalMovies} phim</p>
        </div>
        <button
          onClick={() => router.push('/admin/movies/upload')}
          className="flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
        >
          <PlusIcon className="h-5 w-5 mr-2" />
          Thêm phim mới
        </button>
      </div>

      {/* Search */}
      <div className="p-4 rounded-lg shadow-sm" style={{backgroundColor: 'var(--bg-4)', border: '1px solid var(--bg-3)'}}>
        <form onSubmit={handleSearchSubmit} className="flex gap-4">
          <div className="flex-1 relative">
            <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2" style={{color: 'var(--color-text-muted)'}} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm kiếm phim theo tên..."
              className="w-full pl-10 pr-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
              style={{
                backgroundColor: 'var(--bg-3)',
                border: '1px solid var(--bg-3)',
                color: 'var(--color-text-primary)'
              }}
            />
          </div>
          <button
            type="submit"
            disabled={isSearching}
            className="px-4 py-2 text-white rounded-md transition-colors disabled:opacity-50"
            style={{backgroundColor: 'var(--bg-2)'}}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-1)'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-2)'}
          >
            {isSearching ? 'Đang tìm...' : 'Tìm kiếm'}
          </button>
          {searchQuery && (
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                fetchMovies(0);
              }}
              className="px-4 py-2 rounded-md transition-colors"
              style={{
                backgroundColor: 'var(--bg-3)',
                color: 'var(--color-text-secondary)'
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-2)'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-3)'}
            >
              Xóa bộ lọc
            </button>
          )}
        </form>
      </div>

      {/* Error */}
      {error && (
        <div className="px-4 py-3 rounded-md" style={{backgroundColor: 'var(--bg-4)', border: '1px solid #ef4444'}}>
          <div style={{color: '#ef4444'}}>{error}</div>
        </div>
      )}

      {/* Loading */}
      {isLoading && (
        <div className="flex justify-center items-center py-12">
          <div style={{color: 'var(--color-text-muted)'}}>Đang tải...</div>
        </div>
      )}

      {/* Movies Table */}
      {!isLoading && movies.length > 0 && (
        <div className="rounded-lg shadow-sm overflow-hidden" style={{backgroundColor: 'var(--bg-4)', border: '1px solid var(--bg-3)'}}>
          <div className="overflow-x-auto">
            <table className="min-w-full" style={{borderColor: 'var(--bg-3)'}}>
              <thead style={{backgroundColor: 'var(--bg-3)'}}>
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{color: 'var(--color-text-muted)'}}>
                    Phim
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{color: 'var(--color-text-muted)'}}>
                    Năm
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{color: 'var(--color-text-muted)'}}>
                    Loại
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{color: 'var(--color-text-muted)'}}>
                    Thể loại
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{color: 'var(--color-text-muted)'}}>
                    IMDB
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{color: 'var(--color-text-muted)'}}>
                    Ngày tạo
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider" style={{color: 'var(--color-text-muted)'}}>
                    Thao tác
                  </th>
                </tr>
              </thead>
              <tbody style={{backgroundColor: 'var(--bg-4)'}}>
                {movies.map((movie) => (
                  <tr key={movie.movieId} className="transition-colors" style={{backgroundColor: 'transparent'}} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-3)'} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {movie.posterUrl && (
                          <img
                            src={getImageUrl(movie.posterUrl, 'small')}
                            alt={movie.title}
                            className="h-12 w-8 object-cover rounded mr-3"
                            onError={(e) => {
                              (e.target as HTMLImageElement).style.display = 'none';
                            }}
                          />
                        )}
                        <div>
                          <div className="text-sm font-medium" style={{color: 'var(--color-text-primary)'}}>{movie.title}</div>
                          {movie.aliasTitle && (
                            <div className="text-sm" style={{color: 'var(--color-text-muted)'}}>{movie.aliasTitle}</div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm" style={{color: 'var(--color-text-primary)'}}>
                      {movie.releaseYear || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full" style={{
                        backgroundColor: movie.isSeries ? '#1e40af' : '#059669',
                        color: '#ffffff'
                      }}>
                        {movie.isSeries ? 'Phim bộ' : 'Phim lẻ'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {movieGenres[movie.movieId] && movieGenres[movie.movieId].length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {movieGenres[movie.movieId].slice(0, 2).map((genre) => (
                            <span
                              key={genre.genreId}
                              className="inline-flex items-center px-2 py-1 text-xs font-medium rounded-full"
                              style={{backgroundColor: '#dc2626', color: '#ffffff'}}
                            >
                              <TagIcon className="h-3 w-3 mr-1" />
                              {genre.name}
                            </span>
                          ))}
                          {movieGenres[movie.movieId].length > 2 && (
                            <span className="text-xs" style={{color: 'var(--color-text-muted)'}}>
                              +{movieGenres[movie.movieId].length - 2} khác
                            </span>
                          )}
                        </div>
                      ) : (
                        <span className="text-xs" style={{color: 'var(--color-text-muted)'}}>Chưa có thể loại</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm" style={{color: 'var(--color-text-primary)'}}>
                      {movie.imdbRating ? `${movie.imdbRating}/10` : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm" style={{color: 'var(--color-text-primary)'}}>
                      {new Date(movie.createdAt).toLocaleDateString('vi-VN')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-2">
                        <button
                          onClick={() => router.push(`/phim/${generateSlug(movie.title)}`)}
                          className="p-1 transition-colors"
                          style={{color: '#3b82f6'}}
                          onMouseEnter={(e) => e.currentTarget.style.color = '#1d4ed8'}
                          onMouseLeave={(e) => e.currentTarget.style.color = '#3b82f6'}
                          title="Xem phim"
                        >
                          <EyeIcon className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => router.push(`/admin/movies/${movie.movieId}/edit`)}
                          className="p-1 transition-colors"
                          style={{color: '#10b981'}}
                          onMouseEnter={(e) => e.currentTarget.style.color = '#059669'}
                          onMouseLeave={(e) => e.currentTarget.style.color = '#10b981'}
                          title="Chỉnh sửa"
                        >
                          <PencilIcon className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteMovie(movie.movieId, movie.title)}
                          className="p-1 transition-colors"
                          style={{color: '#ef4444'}}
                          onMouseEnter={(e) => e.currentTarget.style.color = '#dc2626'}
                          onMouseLeave={(e) => e.currentTarget.style.color = '#ef4444'}
                          title="Xóa"
                        >
                          <TrashIcon className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && movies.length === 0 && (
        <div className="text-center py-12">
          <div className="mb-4" style={{color: 'var(--color-text-muted)'}}>
            {searchQuery ? 'Không tìm thấy phim nào phù hợp' : 'Chưa có phim nào'}
          </div>
          {!searchQuery && (
            <button
              onClick={() => router.push('/admin/movies/upload')}
              className="inline-flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              <PlusIcon className="h-5 w-5 mr-2" />
              Thêm phim đầu tiên
            </button>
          )}
        </div>
      )}

      {/* Pagination */}
      {!searchQuery && totalPages > 1 && (
        <div className="flex justify-between items-center">
          <div className="text-sm" style={{color: 'var(--color-text-secondary)'}}>
            Trang {currentPage + 1} / {totalPages} (Tổng: {totalMovies} phim)
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 0}
              className="px-3 py-1 text-sm rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              style={{
                backgroundColor: 'var(--bg-3)',
                border: '1px solid var(--bg-3)',
                color: 'var(--color-text-secondary)'
              }}
              onMouseEnter={(e) => !e.currentTarget.disabled && (e.currentTarget.style.backgroundColor = 'var(--bg-2)')}
              onMouseLeave={(e) => !e.currentTarget.disabled && (e.currentTarget.style.backgroundColor = 'var(--bg-3)')}
            >
              Trước
            </button>
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              const pageNum = Math.max(0, Math.min(currentPage - 2 + i, totalPages - 5 + i));
              return (
                <button
                  key={pageNum}
                  onClick={() => handlePageChange(pageNum)}
                  className="px-3 py-1 text-sm rounded-md transition-colors"
                  style={pageNum === currentPage ? {
                    backgroundColor: '#dc2626',
                    color: '#ffffff',
                    border: '1px solid #dc2626'
                  } : {
                    backgroundColor: 'var(--bg-3)',
                    color: 'var(--color-text-secondary)',
                    border: '1px solid var(--bg-3)'
                  }}
                  onMouseEnter={(e) => {
                    if (pageNum !== currentPage) {
                      e.currentTarget.style.backgroundColor = 'var(--bg-2)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (pageNum !== currentPage) {
                      e.currentTarget.style.backgroundColor = 'var(--bg-3)';
                    }
                  }}
                >
                  {pageNum + 1}
                </button>
              );
            })}
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages - 1}
              className="px-3 py-1 text-sm rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              style={{
                backgroundColor: 'var(--bg-3)',
                border: '1px solid var(--bg-3)',
                color: 'var(--color-text-secondary)'
              }}
              onMouseEnter={(e) => !e.currentTarget.disabled && (e.currentTarget.style.backgroundColor = 'var(--bg-2)')}
              onMouseLeave={(e) => !e.currentTarget.disabled && (e.currentTarget.style.backgroundColor = 'var(--bg-3)')}
            >
              Sau
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
