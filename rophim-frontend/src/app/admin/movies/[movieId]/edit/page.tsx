'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ApiService, MovieResponse, UpdateMovieRequest, GenreResponse } from '@/lib/api';
import {
  ArrowLeftIcon,
  TagIcon,
  XMarkIcon,
  CheckIcon
} from '@heroicons/react/24/outline';

export default function EditMoviePage() {
  const router = useRouter();
  const params = useParams();
  const movieId = params.movieId as string;

  const [movie, setMovie] = useState<MovieResponse | null>(null);
  const [genres, setGenres] = useState<GenreResponse[]>([]);
  const [movieGenres, setMovieGenres] = useState<GenreResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Form state
  const [formData, setFormData] = useState<UpdateMovieRequest>({
    title: '',
    aliasTitle: '',
    description: '',
    releaseYear: undefined,
    ageRating: '',
    imdbRating: undefined,
    isSeries: false,
    posterUrl: '',
    bannerUrl: ''
  });

  // Genre assignment state
  const [showGenreModal, setShowGenreModal] = useState(false);
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);

  useEffect(() => {
    if (movieId) {
      fetchMovieData();
    }
  }, [movieId]);

  const fetchMovieData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Fetch movie details
      const movieResponse = await ApiService.getMovieById(movieId);
      if (movieResponse.success && movieResponse.data) {
        const movieData = movieResponse.data;
        setMovie(movieData);
        setFormData({
          title: movieData.title || '',
          aliasTitle: movieData.aliasTitle || '',
          description: movieData.description || '',
          releaseYear: movieData.releaseYear,
          ageRating: movieData.ageRating || '',
          imdbRating: movieData.imdbRating,
          isSeries: movieData.isSeries || false,
          posterUrl: movieData.posterUrl || '',
          bannerUrl: movieData.bannerUrl || ''
        });
      } else {
        throw new Error(movieResponse.error || 'Không thể tải thông tin phim');
      }

      // Fetch all available genres
      const genresResponse = await ApiService.getGenres();
      if (genresResponse.success && genresResponse.data) {
        setGenres(genresResponse.data);
      }

      // Fetch movie's current genres
      const movieGenresResponse = await ApiService.getGenresByMovieId(movieId);
      if (movieGenresResponse.success && movieGenresResponse.data) {
        setMovieGenres(movieGenresResponse.data);
        setSelectedGenres(movieGenresResponse.data.map(g => g.genreId));
      }

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Có lỗi xảy ra khi tải dữ liệu';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!movie) return;

    try {
      setIsSaving(true);
      setError(null);
      setSuccess(null);

      const response = await ApiService.updateMovie(movieId, formData);
      if (response.success) {
        setSuccess('Cập nhật phim thành công!');
        // Update local movie state
        setMovie({ ...movie, ...formData });
      } else {
        throw new Error(response.error || 'Không thể cập nhật phim');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Có lỗi xảy ra khi cập nhật phim';
      setError(errorMessage);
    } finally {
      setIsSaving(false);
    }
  };

  const handleGenreToggle = (genreId: string) => {
    setSelectedGenres(prev => {
      if (prev.includes(genreId)) {
        return prev.filter(id => id !== genreId);
      } else {
        return [...prev, genreId];
      }
    });
  };

  const handleSaveGenres = async () => {
    try {
      setIsSaving(true);
      setError(null);

      // Remove all current genres
      for (const genre of movieGenres) {
        await ApiService.removeGenreFromMovie(genre.genreId, movieId);
      }

      // Add selected genres
      for (const genreId of selectedGenres) {
        await ApiService.addGenreToMovie(genreId, movieId);
      }

      setSuccess('Cập nhật thể loại thành công!');
      setShowGenreModal(false);
      
      // Refresh movie genres
      const movieGenresResponse = await ApiService.getGenresByMovieId(movieId);
      if (movieGenresResponse.success && movieGenresResponse.data) {
        setMovieGenres(movieGenresResponse.data);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Có lỗi xảy ra khi cập nhật thể loại';
      setError(errorMessage);
    } finally {
      setIsSaving(false);
    }
  };

  const handleInputChange = (field: keyof UpdateMovieRequest, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    // Clear success message when user starts typing
    if (success) setSuccess(null);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-64">
        <div className="text-gray-500">Đang tải...</div>
      </div>
    );
  }

  if (!movie) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-500 mb-4">Không tìm thấy phim</div>
        <button
          onClick={() => router.push('/admin/movies')}
          className="text-red-600 hover:text-red-700"
        >
          Quay lại danh sách phim
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => router.push('/admin/movies')}
            className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md"
          >
            <ArrowLeftIcon className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Chỉnh sửa phim</h1>
            <p className="text-gray-600">{movie.title}</p>
          </div>
        </div>
      </div>

      {/* Success Message */}
      {success && (
        <div className="bg-green-50 border border-green-200 rounded-md p-4">
          <div className="flex">
            <CheckIcon className="h-5 w-5 text-green-400" />
            <div className="ml-3">
              <p className="text-sm font-medium text-green-800">{success}</p>
            </div>
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="flex">
            <div className="ml-3">
              <p className="text-sm font-medium text-red-800">{error}</p>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Form */}
        <div className="lg:col-span-2">
          <div className="bg-white shadow-sm rounded-lg border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Thông tin phim</h3>
            </div>
            <div className="p-6">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Title */}
                <div>
                  <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                    Tên phim *
                  </label>
                  <input
                    type="text"
                    id="title"
                    value={formData.title}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-red-500 focus:border-red-500"
                    required
                  />
                </div>

                {/* Alias Title */}
                <div>
                  <label htmlFor="aliasTitle" className="block text-sm font-medium text-gray-700 mb-2">
                    Tên khác
                  </label>
                  <input
                    type="text"
                    id="aliasTitle"
                    value={formData.aliasTitle}
                    onChange={(e) => handleInputChange('aliasTitle', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-red-500 focus:border-red-500"
                  />
                </div>

                {/* Description */}
                <div>
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                    Mô tả
                  </label>
                  <textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-red-500 focus:border-red-500"
                  />
                </div>

                {/* Release Year and Age Rating */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="releaseYear" className="block text-sm font-medium text-gray-700 mb-2">
                      Năm phát hành
                    </label>
                    <input
                      type="number"
                      id="releaseYear"
                      value={formData.releaseYear || ''}
                      onChange={(e) => handleInputChange('releaseYear', e.target.value ? parseInt(e.target.value) : undefined)}
                      min="1900"
                      max="2030"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-red-500 focus:border-red-500"
                    />
                  </div>
                  <div>
                    <label htmlFor="ageRating" className="block text-sm font-medium text-gray-700 mb-2">
                      Độ tuổi
                    </label>
                    <input
                      type="text"
                      id="ageRating"
                      value={formData.ageRating}
                      onChange={(e) => handleInputChange('ageRating', e.target.value)}
                      placeholder="PG-13, R, 18+"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-red-500 focus:border-red-500"
                    />
                  </div>
                </div>

                {/* IMDB Rating and Series */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="imdbRating" className="block text-sm font-medium text-gray-700 mb-2">
                      Điểm IMDB
                    </label>
                    <input
                      type="number"
                      id="imdbRating"
                      value={formData.imdbRating || ''}
                      onChange={(e) => handleInputChange('imdbRating', e.target.value ? parseFloat(e.target.value) : undefined)}
                      min="0"
                      max="10"
                      step="0.1"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-red-500 focus:border-red-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Loại phim
                    </label>
                    <div className="flex items-center space-x-4">
                      <label className="flex items-center">
                        <input
                          type="radio"
                          checked={!formData.isSeries}
                          onChange={() => handleInputChange('isSeries', false)}
                          className="mr-2"
                        />
                        Phim lẻ
                      </label>
                      <label className="flex items-center">
                        <input
                          type="radio"
                          checked={formData.isSeries}
                          onChange={() => handleInputChange('isSeries', true)}
                          className="mr-2"
                        />
                        Phim bộ
                      </label>
                    </div>
                  </div>
                </div>

                {/* Poster URL */}
                <div>
                  <label htmlFor="posterUrl" className="block text-sm font-medium text-gray-700 mb-2">
                    URL Poster
                  </label>
                  <input
                    type="url"
                    id="posterUrl"
                    value={formData.posterUrl}
                    onChange={(e) => handleInputChange('posterUrl', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-red-500 focus:border-red-500"
                  />
                </div>

                {/* Banner URL */}
                <div>
                  <label htmlFor="bannerUrl" className="block text-sm font-medium text-gray-700 mb-2">
                    URL Banner
                  </label>
                  <input
                    type="url"
                    id="bannerUrl"
                    value={formData.bannerUrl}
                    onChange={(e) => handleInputChange('bannerUrl', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-red-500 focus:border-red-500"
                  />
                </div>

                {/* Submit Button */}
                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => router.push('/admin/movies')}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSaving ? 'Đang lưu...' : 'Lưu thay đổi'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Genres */}
          <div className="bg-white shadow-sm rounded-lg border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-gray-900">Thể loại</h3>
                <button
                  onClick={() => setShowGenreModal(true)}
                  className="text-sm text-red-600 hover:text-red-700"
                >
                  Chỉnh sửa
                </button>
              </div>
            </div>
            <div className="p-6">
              {movieGenres.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {movieGenres.map((genre) => (
                    <span
                      key={genre.genreId}
                      className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800"
                    >
                      <TagIcon className="h-3 w-3 mr-1" />
                      {genre.name}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500">Chưa có thể loại nào</p>
              )}
            </div>
          </div>

          {/* Movie Info */}
          <div className="bg-white shadow-sm rounded-lg border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Thông tin</h3>
            </div>
            <div className="p-6 space-y-3">
              <div>
                <span className="text-sm font-medium text-gray-500">ID:</span>
                <span className="text-sm text-gray-900 ml-2">{movie.movieId}</span>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-500">Ngày tạo:</span>
                <span className="text-sm text-gray-900 ml-2">
                  {new Date(movie.createdAt).toLocaleDateString('vi-VN')}
                </span>
              </div>
              {movie.updatedAt && (
                <div>
                  <span className="text-sm font-medium text-gray-500">Cập nhật lần cuối:</span>
                  <span className="text-sm text-gray-900 ml-2">
                    {new Date(movie.updatedAt).toLocaleDateString('vi-VN')}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Genre Selection Modal */}
      {showGenreModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">Chọn thể loại</h3>
                <button
                  onClick={() => setShowGenreModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XMarkIcon className="h-6 w-6" />
                </button>
              </div>
              
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {genres.map((genre) => (
                  <label key={genre.genreId} className="flex items-center p-2 hover:bg-gray-50 rounded-md">
                    <input
                      type="checkbox"
                      checked={selectedGenres.includes(genre.genreId)}
                      onChange={() => handleGenreToggle(genre.genreId)}
                      className="mr-3"
                    />
                    <span className="text-sm text-gray-900">{genre.name}</span>
                  </label>
                ))}
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => setShowGenreModal(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                >
                  Hủy
                </button>
                <button
                  onClick={handleSaveGenres}
                  disabled={isSaving}
                  className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSaving ? 'Đang lưu...' : 'Lưu'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
