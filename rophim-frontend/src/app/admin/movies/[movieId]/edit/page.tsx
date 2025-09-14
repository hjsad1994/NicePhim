'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ApiService, MovieResponse, UpdateMovieRequest, GenreResponse } from '@/lib/api';
import { ImageUpload } from '@/components/admin/ImageUpload';
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

  const fetchMovieData = useCallback(async () => {
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
  }, [movieId]);

  useEffect(() => {
    if (movieId) {
      fetchMovieData();
    }
  }, [movieId, fetchMovieData]);

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

  const handleInputChange = (field: keyof UpdateMovieRequest, value: string | number | boolean | undefined) => {
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
        <div style={{color: 'var(--color-text-muted)'}}>Đang tải...</div>
      </div>
    );
  }

  if (!movie) {
    return (
      <div className="text-center py-12">
        <div className="mb-4" style={{color: 'var(--color-text-muted)'}}>Không tìm thấy phim</div>
        <button
          onClick={() => router.push('/admin/movies')}
          className="text-red-400 hover:text-red-300 transition-colors"
        >
          Quay lại danh sách phim
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8" style={{backgroundColor: 'var(--bg-2)'}}>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-lg shadow" style={{backgroundColor: 'var(--bg-4)', border: '1px solid var(--bg-3)'}}>
          <div className="px-6 py-4 border-b" style={{borderColor: 'var(--bg-3)'}}>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.push('/admin/movies')}
                className="p-2 rounded-md transition-colors"
                style={{
                  color: 'var(--color-text-muted)',
                  backgroundColor: 'transparent'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'var(--bg-3)';
                  e.currentTarget.style.color = 'var(--color-text-primary)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                  e.currentTarget.style.color = 'var(--color-text-muted)';
                }}
              >
                <ArrowLeftIcon className="h-5 w-5" />
              </button>
              <div>
                <h1 className="text-2xl font-bold" style={{color: 'var(--color-text-primary)'}}>Chỉnh sửa phim</h1>
                <p className="mt-1 text-sm" style={{color: 'var(--color-text-secondary)'}}>{movie.title}</p>
              </div>
            </div>
          </div>

      {/* Success Message */}
      {success && (
        <div className="rounded-md p-4" style={{backgroundColor: 'var(--bg-4)', border: '1px solid #10b981'}}>
          <div className="flex">
            <CheckIcon className="h-5 w-5 text-green-400" />
            <div className="ml-3">
              <p className="text-sm font-medium text-green-400">{success}</p>
            </div>
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="rounded-md p-4" style={{backgroundColor: 'var(--bg-4)', border: '1px solid #ef4444'}}>
          <div className="flex">
            <div className="ml-3">
              <p className="text-sm font-medium text-red-400">{error}</p>
            </div>
          </div>
        </div>
      )}

          <form onSubmit={handleSubmit} className="px-6 py-6 space-y-6">
                {/* Title */}
                <div>
                  <label htmlFor="title" className="block text-sm font-medium mb-2" style={{color: 'var(--color-text-secondary)'}}>
                    Tên phim *
                  </label>
                  <input
                    type="text"
                    id="title"
                    value={formData.title}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                    className="w-full px-3 py-2 rounded-md focus:outline-none focus:ring-1 focus:ring-red-500 focus:border-red-500 text-gray-900"
                    style={{
                      backgroundColor: 'var(--bg-3)',
                      border: '1px solid var(--bg-3)',
                      color: 'var(--color-text-primary)'
                    }}
                    required
                  />
                </div>

                {/* Alias Title */}
                <div>
                  <label htmlFor="aliasTitle" className="block text-sm font-medium mb-2" style={{color: 'var(--color-text-secondary)'}}>
                    Tên khác
                  </label>
                  <input
                    type="text"
                    id="aliasTitle"
                    value={formData.aliasTitle}
                    onChange={(e) => handleInputChange('aliasTitle', e.target.value)}
                    className="w-full px-3 py-2 rounded-md focus:outline-none focus:ring-1 focus:ring-red-500 focus:border-red-500 text-gray-900"
                    style={{
                      backgroundColor: 'var(--bg-3)',
                      border: '1px solid var(--bg-3)',
                      color: 'var(--color-text-primary)'
                    }}
                  />
                </div>

                {/* Description */}
                <div>
                  <label htmlFor="description" className="block text-sm font-medium mb-2" style={{color: 'var(--color-text-secondary)'}}>
                    Mô tả
                  </label>
                  <textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    rows={4}
                    className="w-full px-3 py-2 rounded-md focus:outline-none focus:ring-1 focus:ring-red-500 focus:border-red-500 text-gray-900"
                    style={{
                      backgroundColor: 'var(--bg-3)',
                      border: '1px solid var(--bg-3)',
                      color: 'var(--color-text-primary)'
                    }}
                  />
                </div>

                {/* Release Year and Age Rating */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="releaseYear" className="block text-sm font-medium mb-2" style={{color: 'var(--color-text-secondary)'}}>
                      Năm phát hành
                    </label>
                    <input
                      type="number"
                      id="releaseYear"
                      value={formData.releaseYear || ''}
                      onChange={(e) => handleInputChange('releaseYear', parseInt(e.target.value) || 0)}
                      className="w-full px-3 py-2 rounded-md focus:outline-none focus:ring-1 focus:ring-red-500 focus:border-red-500 text-gray-900"
                    style={{
                      backgroundColor: 'var(--bg-3)',
                      border: '1px solid var(--bg-3)',
                      color: 'var(--color-text-primary)'
                    }}
                    />
                  </div>
                  
                  <div className="mb-4">
                    <label htmlFor="ageRating" className="block text-sm font-medium mb-1" style={{color: 'var(--color-text-secondary)'}}>
                      Độ tuổi
                    </label>
                    <input
                      type="text"
                      id="ageRating"
                      value={formData.ageRating}
                      onChange={(e) => handleInputChange('ageRating', e.target.value)}
                      placeholder="PG-13, R, 18+"
                      className="w-full px-3 py-2 rounded-md focus:outline-none focus:ring-1 focus:ring-red-500 focus:border-red-500 text-gray-900"
                    style={{
                      backgroundColor: 'var(--bg-3)',
                      border: '1px solid var(--bg-3)',
                      color: 'var(--color-text-primary)'
                    }}
                    />
                  </div>
                </div>

                {/* IMDB Rating and Series */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="imdbRating" className="block text-sm font-medium mb-1" style={{color: 'var(--color-text-secondary)'}}>
                      IMDB Rating
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      max="10"
                      id="imdbRating"
                      value={formData.imdbRating || ''}
                      onChange={(e) => handleInputChange('imdbRating', e.target.value ? parseFloat(e.target.value) : undefined)}
                      placeholder="8.5"
                      className="w-full px-3 py-2 rounded-md focus:outline-none focus:ring-1 focus:ring-red-500 focus:border-red-500 text-gray-900"
                    style={{
                      backgroundColor: 'var(--bg-3)',
                      border: '1px solid var(--bg-3)',
                      color: 'var(--color-text-primary)'
                    }}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2" style={{color: 'var(--color-text-secondary)'}}>
                      Loại phim
                    </label>
                    <div className="space-y-2">
                      <label className="flex items-center">
                        <input
                          type="radio"
                          name="isSeries"
                          value="false"
                          checked={!formData.isSeries}
                          onChange={() => handleInputChange('isSeries', false)}
                          className="mr-2"
                        />
                        Phim lẻ
                      </label>
                      <label className="flex items-center">
                        <input
                          type="radio"
                          name="isSeries"
                          value="true"
                          checked={formData.isSeries}
                          onChange={() => handleInputChange('isSeries', true)}
                          className="mr-2"
                        />
                        Phim bộ
                      </label>
                    </div>
                  </div>
                </div>

                {/* Image Uploads */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <ImageUpload
                    label="Poster"
                    type="poster"
                    currentUrl={formData.posterUrl}
                    onUpload={(url) => handleInputChange('posterUrl', url)}
                    onRemove={() => handleInputChange('posterUrl', '')}
                    required={false}
                  />

                  <ImageUpload
                    label="Banner"
                    type="banner"
                    currentUrl={formData.bannerUrl}
                    onUpload={(url) => handleInputChange('bannerUrl', url)}
                    onRemove={() => handleInputChange('bannerUrl', '')}
                    required={false}
                  />
                </div>

            {/* Genres Selection */}
            <div className="border-t pt-6" style={{borderColor: 'var(--bg-3)'}}>
              <h3 className="text-lg font-medium mb-4" style={{color: 'var(--color-text-primary)'}}>Thể loại phim</h3>
              <div className="flex items-center justify-between mb-4">
                <div className="flex flex-wrap gap-2">
                  {movieGenres.length > 0 ? (
                    movieGenres.map((genre) => (
                      <span
                        key={genre.genreId}
                        className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                        style={{backgroundColor: '#dc2626', color: '#ffffff'}}
                      >
                        <TagIcon className="h-3 w-3 mr-1" />
                        {genre.name}
                      </span>
                    ))
                  ) : (
                    <p className="text-sm" style={{color: 'var(--color-text-muted)'}}>Chưa có thể loại nào</p>
                  )}
                </div>
                <button
                  onClick={() => setShowGenreModal(true)}
                  className="text-sm text-red-400 hover:text-red-300 transition-colors"
                >
                  Chỉnh sửa
                </button>
              </div>
            </div>

            <div className="flex justify-end space-x-4 pt-6 border-t" style={{borderColor: 'var(--bg-3)'}}>
              <button
                type="button"
                onClick={() => router.push('/admin/movies')}
                className="px-4 py-2 text-sm font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-colors"
                style={{
                  backgroundColor: 'var(--bg-3)',
                  border: '1px solid var(--bg-3)',
                  color: 'var(--color-text-secondary)'
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-2)'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-3)'}
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

      {/* Genre Selection Modal */}
      {showGenreModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 w-96 shadow-lg rounded-md" style={{backgroundColor: 'var(--bg-4)', border: '1px solid var(--bg-3)'}}>
            <div className="mt-3">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium" style={{color: 'var(--color-text-primary)'}}>Chọn thể loại</h3>
                <button
                  onClick={() => setShowGenreModal(false)}
                  className="text-gray-400 hover:text-gray-300 transition-colors"
                >
                  <XMarkIcon className="h-6 w-6" />
                </button>
              </div>
              
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {genres.map((genre) => (
                  <label key={genre.genreId} className="flex items-center p-2 rounded-md transition-colors" style={{backgroundColor: 'transparent'}} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-3)'} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}>
                    <input
                      type="checkbox"
                      checked={selectedGenres.includes(genre.genreId)}
                      onChange={() => handleGenreToggle(genre.genreId)}
                      className="mr-3"
                    />
                    <span className="text-sm" style={{color: 'var(--color-text-primary)'}}>{genre.name}</span>
                  </label>
                ))}
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => setShowGenreModal(false)}
                  className="px-4 py-2 text-sm font-medium rounded-md transition-colors"
                  style={{
                    color: 'var(--color-text-secondary)',
                    backgroundColor: 'var(--bg-3)'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-2)'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-3)'}
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
