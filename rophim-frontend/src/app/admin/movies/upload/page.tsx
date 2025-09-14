'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ApiService, CreateMovieRequest, GenreResponse } from '@/lib/api';
import { VideoUpload } from '@/components/admin/VideoUpload';

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

  // Video upload state
  const [videoUpload, setVideoUpload] = useState({
    videoId: '',
    hlsUrl: '',
    isUploaded: false,
    hasError: false
  });

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

  // Video upload handlers
  const handleVideoUploaded = (videoId: string, hlsUrl: string) => {
    setVideoUpload({
      videoId,
      hlsUrl,
      isUploaded: true,
      hasError: false
    });
  };

  const handleVideoUploadError = (error: string) => {
    console.error('Video upload error:', error);
    setVideoUpload(prev => ({
      ...prev,
      isUploaded: false,
      hasError: true
    }));
    setError(`Lỗi upload video: ${error}`);
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

      // Validate video upload
      if (videoUpload.hasError) {
        throw new Error('Video upload bị lỗi. Vui lòng thử lại.');
      }
      
      if (!videoUpload.isUploaded || !videoUpload.videoId || !videoUpload.hlsUrl) {
        throw new Error('Vui lòng upload video trước khi tạo phim');
      }

      // Include video data if uploaded
      const movieData = {
        ...formData,
        videoId: videoUpload.videoId,
        hlsUrl: videoUpload.hlsUrl,
        videoStatus: 'ready'
      };

      console.log('Video upload state:', videoUpload);
      console.log('Movie data being sent:', movieData);

      const response = await ApiService.createMovie(movieData);

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
        setVideoUpload({
          videoId: '',
          hlsUrl: '',
          isUploaded: false,
          hasError: false
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
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h1 className="text-2xl font-bold text-gray-900">Tạo phim mới</h1>
            <p className="mt-1 text-sm text-gray-600">
              Thêm thông tin phim và upload video để tạo phim mới
            </p>
          </div>

          <form onSubmit={handleSubmit} className="px-6 py-6 space-y-6">
            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-md p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-red-800">Lỗi</h3>
                    <div className="mt-2 text-sm text-red-700">
                      <p>{error}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Success Message */}
            {success && (
              <div className="bg-green-50 border border-green-200 rounded-md p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-green-800">Thành công</h3>
                    <div className="mt-2 text-sm text-green-700">
                      <p>{success}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                  Tên phim *
                </label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={formData.title || ''}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent text-black"
                  placeholder="Nhập tên phim..."
                  required
                />
              </div>

              <div>
                <label htmlFor="aliasTitle" className="block text-sm font-medium text-gray-700 mb-2">
                  Tên khác
                </label>
                <input
                  type="text"
                  id="aliasTitle"
                  name="aliasTitle"
                  value={formData.aliasTitle || ''}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent text-black"
                  placeholder="Tên khác của phim..."
                />
              </div>

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
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent text-black"
                  placeholder="2024"
                  min="1900"
                  max="2030"
                />
              </div>

              <div>
                <label htmlFor="ageRating" className="block text-sm font-medium text-gray-700 mb-2">
                  Độ tuổi
                </label>
                <select
                  id="ageRating"
                  name="ageRating"
                  value={formData.ageRating || ''}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent text-black"
                >
                  <option value="">Chọn độ tuổi</option>
                  <option value="G">G - Mọi lứa tuổi</option>
                  <option value="PG">PG - Có sự hướng dẫn của phụ huynh</option>
                  <option value="PG-13">PG-13 - Trên 13 tuổi</option>
                  <option value="R">R - Hạn chế</option>
                  <option value="NC-17">NC-17 - Không dành cho trẻ em</option>
                </select>
              </div>

              <div>
                <label htmlFor="imdbRating" className="block text-sm font-medium text-gray-700 mb-2">
                  Đánh giá IMDB
                </label>
                <input
                  type="number"
                  id="imdbRating"
                  name="imdbRating"
                  value={formData.imdbRating || ''}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent text-black"
                  placeholder="8.5"
                  min="0"
                  max="10"
                  step="0.1"
                />
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isSeries"
                  name="isSeries"
                  checked={formData.isSeries || false}
                  onChange={handleInputChange}
                  className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
                />
                <label htmlFor="isSeries" className="ml-2 block text-sm text-gray-700">
                  Là phim bộ
                </label>
              </div>
            </div>

            {/* URLs */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
            </div>

            {/* Description */}
            <div>
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

            {/* Video Upload Section */}
            <div className="border-t border-gray-200 pt-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Upload Video</h3>
              <div className="bg-gray-50 p-4 rounded-lg">
                <VideoUpload
                  onVideoUploaded={handleVideoUploaded}
                  onError={handleVideoUploadError}
                />
              </div>
              
              {/* Video Upload Status */}
              {videoUpload.isUploaded && (
                <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <h4 className="text-sm font-medium text-green-800">Video đã upload thành công!</h4>
                      <div className="mt-1 text-sm text-green-700">
                        <p>Video ID: {videoUpload.videoId}</p>
                        <p>HLS URL: {videoUpload.hlsUrl}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
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
                disabled={isLoading || !videoUpload.isUploaded || videoUpload.hasError}
                className={`px-4 py-2 text-sm font-medium text-white border border-transparent rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed ${
                  videoUpload.isUploaded && !videoUpload.hasError
                    ? 'bg-red-600 hover:bg-red-700 focus:ring-red-500' 
                    : videoUpload.hasError
                    ? 'bg-red-400 cursor-not-allowed'
                    : 'bg-gray-400 cursor-not-allowed'
                }`}
              >
                {isLoading ? 'Đang tạo phim...' : 
                 videoUpload.hasError ? '❌ Upload video bị lỗi' :
                 videoUpload.isUploaded ? '🎬 Tạo phim' : 
                 '⏳ Chờ upload video hoàn thành'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}