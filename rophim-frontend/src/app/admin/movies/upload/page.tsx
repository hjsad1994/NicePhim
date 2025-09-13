'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ApiService, CreateMovieRequest, GenreResponse } from '@/lib/api';

export default function UploadMoviePage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [formData, setFormData] = useState<CreateMovieRequest>({
    title: '',
    aliasTitle: '',
    description: '',
    releaseYear: undefined,
    ageRating: '',
    imdbRating: undefined,
    isSeries: false,
    posterUrl: '',
    bannerUrl: '',
    genreIds: [],
  });

  const [availableGenres, setAvailableGenres] = useState<GenreResponse[]>([]);
  const [loadingGenres, setLoadingGenres] = useState(true);

  // Load genres on component mount
  useEffect(() => {
    const loadGenres = async () => {
      try {
        setLoadingGenres(true);
        const response = await ApiService.getGenres();
        if (response.success && response.data) {
          setAvailableGenres(response.data);
        } else {
          console.error('Failed to load genres:', response.error);
        }
      } catch (error) {
        console.error('Error loading genres:', error);
      } finally {
        setLoadingGenres(false);
      }
    };

    loadGenres();
  }, []);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;

    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({
        ...prev,
        [name]: checked
      }));
    } else if (type === 'number') {
      setFormData(prev => ({
        ...prev,
        [name]: value === '' ? undefined : Number(value)
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value === '' ? undefined : value
      }));
    }
  };

  const handleGenreToggle = (genreId: string) => {
    setFormData(prev => ({
      ...prev,
      genreIds: prev.genreIds?.includes(genreId)
        ? prev.genreIds.filter(id => id !== genreId)
        : [...(prev.genreIds || []), genreId]
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      // Validate required fields
      if (!formData.title.trim()) {
        throw new Error('Tên phim không được để trống');
      }

      const response = await ApiService.createMovie(formData);

      if (response.success) {
        setSuccess(response.message || 'Tạo phim thành công!');
        // Reset form
        setFormData({
          title: '',
          aliasTitle: '',
          description: '',
          releaseYear: undefined,
          ageRating: '',
          imdbRating: undefined,
          isSeries: false,
          posterUrl: '',
          bannerUrl: '',
          genreIds: [],
        });

        // Redirect after 2 seconds
        setTimeout(() => {
          router.push('/admin/movies');
        }, 2000);
      } else {
        throw new Error(response.error || 'Có lỗi xảy ra khi tạo phim');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Có lỗi không xác định xảy ra';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h1 className="text-xl font-semibold text-gray-900">Tải lên phim mới</h1>
          <p className="text-sm text-gray-600 mt-1">Thêm thông tin phim mới vào hệ thống</p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
              {error}
            </div>
          )}

          {success && (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-md">
              {success}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Title */}
            <div className="md:col-span-2">
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                Tên phim <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent text-black"
                placeholder="Nhập tên phim..."
              />
            </div>

            {/* Alias Title */}
            <div>
              <label htmlFor="aliasTitle" className="block text-sm font-medium text-gray-700 mb-2">
                Tên phụ
              </label>
              <input
                type="text"
                id="aliasTitle"
                name="aliasTitle"
                value={formData.aliasTitle || ''}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent text-black"
                placeholder="Tên tiếng Anh hoặc tên khác..."
              />
            </div>

            {/* Release Year */}
            <div>
              <label htmlFor="releaseYear" className="block text-sm font-medium text-gray-700 mb-2">
                Năm phát hành
              </label>
              <input
                type="number"
                id="releaseYear"
                name="releaseYear"
                value={formData.releaseYear || ''}
                onChange={handleInputChange}
                min="1900"
                max="2100"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent text-black"
                placeholder="2024"
              />
            </div>

            {/* Age Rating */}
            <div>
              <label htmlFor="ageRating" className="block text-sm font-medium text-gray-700 mb-2">
                Phân loại độ tuổi
              </label>
              <select
                id="ageRating"
                name="ageRating"
                value={formData.ageRating || ''}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent text-black"
              >
                <option value="">Chọn phân loại...</option>
                <option value="P">P - Phổ thông</option>
                <option value="T13">T13 - Từ 13 tuổi</option>
                <option value="T16">T16 - Từ 16 tuổi</option>
                <option value="T18">T18 - Từ 18 tuổi</option>
                <option value="C">C - Cấm trẻ em</option>
              </select>
            </div>

            {/* IMDB Rating */}
            <div>
              <label htmlFor="imdbRating" className="block text-sm font-medium text-gray-700 mb-2">
                Điểm IMDB
              </label>
              <input
                type="number"
                id="imdbRating"
                name="imdbRating"
                value={formData.imdbRating || ''}
                onChange={handleInputChange}
                min="0"
                max="10"
                step="0.1"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent text-black"
                placeholder="7.5"
              />
            </div>

            {/* Is Series */}
            <div className="flex items-center">
              <input
                type="checkbox"
                id="isSeries"
                name="isSeries"
                checked={formData.isSeries}
                onChange={handleInputChange}
                className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
              />
              <label htmlFor="isSeries" className="ml-2 block text-sm text-gray-700">
                Đây là phim bộ
              </label>
            </div>

            {/* Poster URL */}
            <div>
              <label htmlFor="posterUrl" className="block text-sm font-medium text-gray-700 mb-2">
                URL Poster
              </label>
              <input
                type="url"
                id="posterUrl"
                name="posterUrl"
                value={formData.posterUrl || ''}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent text-black"
                placeholder="https://example.com/poster.jpg"
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
                name="bannerUrl"
                value={formData.bannerUrl || ''}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent text-black"
                placeholder="https://example.com/banner.jpg"
              />
            </div>

            {/* Description */}
            <div className="md:col-span-2">
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                Mô tả phim
              </label>
              <textarea
                id="description"
                name="description"
                rows={4}
                value={formData.description || ''}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent text-black"
                placeholder="Mô tả nội dung phim..."
              />
            </div>
          </div>

          {/* Genres Selection */}
          <div className="border-t border-gray-200 pt-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Thể loại phim</h3>
            {loadingGenres ? (
              <div className="text-center py-4">
                <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-red-600"></div>
                <p className="mt-2 text-sm text-gray-600">Đang tải thể loại...</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {availableGenres.map(genre => (
                  <label key={genre.genreId} className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.genreIds?.includes(genre.genreId) || false}
                      onChange={() => handleGenreToggle(genre.genreId)}
                      className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
                    />
                    <span className="text-sm text-gray-700">{genre.name}</span>
                  </label>
                ))}
              </div>
            )}
            {availableGenres.length === 0 && !loadingGenres && (
              <p className="text-sm text-gray-500 text-center py-4">
                Không có thể loại nào. Vui lòng tạo thể loại trước.
              </p>
            )}
          </div>

          <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={() => router.push('/admin/movies')}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Đang tải lên...' : 'Tạo phim'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}