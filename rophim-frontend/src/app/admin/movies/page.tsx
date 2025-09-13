'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ApiService, MovieResponse, GenreResponse } from '@/lib/api';
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
          <h1 className="text-2xl font-bold text-gray-900">Quản lý phim</h1>
          <p className="text-gray-600">Tổng cộng: {totalMovies} phim</p>
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
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
        <form onSubmit={handleSearchSubmit} className="flex gap-4">
          <div className="flex-1 relative">
            <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm kiếm phim theo tên..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
            />
          </div>
          <button
            type="submit"
            disabled={isSearching}
            className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors disabled:opacity-50"
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
              className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition-colors"
            >
              Xóa bộ lọc
            </button>
          )}
        </form>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
          {error}
        </div>
      )}

      {/* Loading */}
      {isLoading && (
        <div className="flex justify-center items-center py-12">
          <div className="text-gray-500">Đang tải...</div>
        </div>
      )}

      {/* Movies Table */}
      {!isLoading && movies.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Phim
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Năm
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Loại
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Thể loại
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    IMDB
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ngày tạo
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Thao tác
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {movies.map((movie) => (
                  <tr key={movie.movieId} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {movie.posterUrl && (
                          <img
                            src={movie.posterUrl}
                            alt={movie.title}
                            className="h-12 w-8 object-cover rounded mr-3"
                            onError={(e) => {
                              (e.target as HTMLImageElement).style.display = 'none';
                            }}
                          />
                        )}
                        <div>
                          <div className="text-sm font-medium text-gray-900">{movie.title}</div>
                          {movie.aliasTitle && (
                            <div className="text-sm text-gray-500">{movie.aliasTitle}</div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {movie.releaseYear || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        movie.isSeries
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-green-100 text-green-800'
                      }`}>
                        {movie.isSeries ? 'Phim bộ' : 'Phim lẻ'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {movieGenres[movie.movieId] && movieGenres[movie.movieId].length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {movieGenres[movie.movieId].slice(0, 2).map((genre) => (
                            <span
                              key={genre.genreId}
                              className="inline-flex items-center px-2 py-1 text-xs font-medium bg-red-100 text-red-800 rounded-full"
                            >
                              <TagIcon className="h-3 w-3 mr-1" />
                              {genre.name}
                            </span>
                          ))}
                          {movieGenres[movie.movieId].length > 2 && (
                            <span className="text-xs text-gray-500">
                              +{movieGenres[movie.movieId].length - 2} khác
                            </span>
                          )}
                        </div>
                      ) : (
                        <span className="text-xs text-gray-400">Chưa có thể loại</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {movie.imdbRating ? `${movie.imdbRating}/10` : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(movie.createdAt).toLocaleDateString('vi-VN')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-2">
                        <button
                          onClick={() => router.push(`/admin/movies/${movie.movieId}`)}
                          className="text-blue-600 hover:text-blue-900 p-1"
                          title="Xem chi tiết"
                        >
                          <EyeIcon className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => router.push(`/admin/movies/${movie.movieId}/edit`)}
                          className="text-green-600 hover:text-green-900 p-1"
                          title="Chỉnh sửa"
                        >
                          <PencilIcon className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteMovie(movie.movieId, movie.title)}
                          className="text-red-600 hover:text-red-900 p-1"
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
          <div className="text-gray-500 mb-4">
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
          <div className="text-sm text-gray-700">
            Trang {currentPage + 1} / {totalPages} (Tổng: {totalMovies} phim)
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 0}
              className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Trước
            </button>
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              const pageNum = Math.max(0, Math.min(currentPage - 2 + i, totalPages - 5 + i));
              return (
                <button
                  key={pageNum}
                  onClick={() => handlePageChange(pageNum)}
                  className={`px-3 py-1 text-sm border rounded-md ${
                    pageNum === currentPage
                      ? 'bg-red-600 text-white border-red-600'
                      : 'border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {pageNum + 1}
                </button>
              );
            })}
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages - 1}
              className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Sau
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
