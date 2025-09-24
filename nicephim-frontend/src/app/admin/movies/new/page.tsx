'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { 
  PhotoIcon,
  FilmIcon,
  DocumentIcon,
  XMarkIcon,
  PlusIcon
} from '@heroicons/react/24/outline';
import { COUNTRIES } from '@/constants';
import { ApiService, GenreResponse } from '@/lib/api';
import { VideoUpload } from '@/components/admin/VideoUpload';
import { ImageUpload } from '@/components/admin/ImageUpload';

interface MovieFormData {
  title: string;
  description: string;
  releaseYear: number;
  duration: number;
  quality: string;
  imdbRating: number;
  genres: string[];
  country: string;
  director: string;
  cast: string[];
  isHot: boolean;
  type: 'movie' | 'series';
  posterUrl: string;
  bannerUrl: string;
}

interface Episode {
  id: string;
  title: string;
  episodeNumber: number;
  video: File | null;
  subtitle: File | null;
  dubbed: File | null;
}

export default function NewMovie() {
  const [formData, setFormData] = useState<MovieFormData>({
    title: '',
    description: '',
    releaseYear: new Date().getFullYear(),
    duration: 0,
    quality: 'HD',
    imdbRating: 0,
    genres: [],
    cast: [],
    isHot: false,
    type: 'movie',
    posterUrl: '',
    bannerUrl: ''
  });

  const [availableGenres, setAvailableGenres] = useState<GenreResponse[]>([]);
  const [loadingGenres, setLoadingGenres] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [files, setFiles] = useState({
    poster: null as File | null,
    banner: null as File | null,
    thumbnail: null as File | null,
    trailer: null as File | null,
    video: null as File | null
  });

  const [videoUpload, setVideoUpload] = useState({
    videoId: '',
    hlsUrl: '',
    isUploaded: false
  });

  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const [castInput, setCastInput] = useState('');
  const [previewUrls, setPreviewUrls] = useState({
    poster: '',
    banner: '',
    thumbnail: ''
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

  const handleInputChange = (field: keyof MovieFormData, value: string | number | boolean | string[]) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleFileChange = (field: keyof typeof files, file: File | null) => {
    setFiles(prev => ({ ...prev, [field]: file }));
    
    // Create preview URL for images
    if (file && ['poster', 'banner', 'thumbnail'].includes(field)) {
      const url = URL.createObjectURL(file);
      setPreviewUrls(prev => ({ ...prev, [field]: url }));
    }
  };

  const handleGenreToggle = (genreId: string) => {
    setFormData(prev => ({
      ...prev,
      genres: prev.genres.includes(genreId)
        ? prev.genres.filter(id => id !== genreId)
        : [...prev.genres, genreId]
    }));
  };

  const addCastMember = () => {
    if (castInput.trim()) {
      setFormData(prev => ({
        ...prev,
        cast: [...prev.cast, castInput.trim()]
      }));
      setCastInput('');
    }
  };

  const removeCastMember = (index: number) => {
    setFormData(prev => ({
      ...prev,
      cast: prev.cast.filter((_, i) => i !== index)
    }));
  };

  const addEpisode = () => {
    const newEpisode: Episode = {
      id: Date.now().toString(),
      title: `Tập ${episodes.length + 1}`,
      episodeNumber: episodes.length + 1,
      video: null,
      subtitle: null,
      dubbed: null
    };
    setEpisodes(prev => [...prev, newEpisode]);
  };

  const updateEpisode = (id: string, field: keyof Episode, value: string | number | File | null) => {
    setEpisodes(prev => prev.map(ep => 
      ep.id === id ? { ...ep, [field]: value } : ep
    ));
  };

  // Video upload handlers
  const handleVideoUploaded = (videoId: string) => {
    setVideoUpload(prev => ({ ...prev, videoId, isUploaded: true }));
  };

  const handleVideoUploadError = (error: string) => {
    console.error('Video upload error:', error);
    // You can add a toast notification here
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!formData.title || !formData.description) {
      alert('Vui lòng điền đầy đủ thông tin bắt buộc');
      return;
    }

    if (!files.poster) {
      alert('Vui lòng upload poster');
      return;
    }

    if (formData.type === 'movie' && !files.video) {
      alert('Vui lòng upload video phim');
      return;
    }

    if (formData.type === 'series' && episodes.length === 0) {
      alert('Vui lòng thêm ít nhất một tập phim');
      return;
    }

    // Prepare movie data
      const movieData = {
        title: formData.title,
        aliasTitle: formData.title, // Use title as alias for now
        description: formData.description,
        releaseYear: formData.releaseYear,
        ageRating: formData.quality, // Map quality to age rating for now
        imdbRating: formData.imdbRating,
        isSeries: formData.type === 'series',
        posterUrl: formData.posterUrl,
        bannerUrl: formData.bannerUrl,
        genreIds: formData.genres // Include selected genre IDs
      };

      console.log('Submitting movie data:', movieData);
      
      // Submit to API
      const response = await ApiService.createMovie(movieData);
      
      if (response.success) {
        alert('Phim đã được thêm thành công!');
        router.push('/admin/movies');
      } else {
        alert(`Lỗi: ${response.error || 'Không thể tạo phim'}`);
      }
    } catch (error) {
      console.error('Error creating movie:', error);
      alert(`Lỗi: ${error instanceof Error ? error.message : 'Không thể tạo phim'}`);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold" style={{color: 'var(--color-text-primary)'}}>Thêm phim mới</h1>
        <p style={{color: 'var(--color-text-secondary)'}}>Điền thông tin để thêm phim vào hệ thống</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <div className="p-6 rounded-lg shadow-sm" style={{backgroundColor: 'var(--bg-4)', border: '1px solid var(--bg-3)'}}>
          <h3 className="text-lg font-medium mb-4" style={{color: 'var(--color-text-primary)'}}>Thông tin cơ bản</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium mb-2" style={{color: 'var(--color-text-secondary)'}}>
                Tên phim <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                className="w-full px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                style={{
                  backgroundColor: 'var(--bg-3)',
                  border: '1px solid var(--bg-3)',
                  color: 'var(--color-text-primary)'
                }}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2" style={{color: 'var(--color-text-secondary)'}}>Loại phim</label>
              <select
                value={formData.type}
                onChange={(e) => handleInputChange('type', e.target.value as 'movie' | 'series')}
                className="w-full px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                style={{
                  backgroundColor: 'var(--bg-3)',
                  border: '1px solid var(--bg-3)',
                  color: 'var(--color-text-primary)'
                }}
              >
                <option value="movie">Phim lẻ</option>
                <option value="series">Phim bộ</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2" style={{color: 'var(--color-text-secondary)'}}>Năm phát hành</label>
              <input
                type="number"
                value={formData.releaseYear}
                onChange={(e) => handleInputChange('releaseYear', parseInt(e.target.value))}
                className="w-full px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                style={{
                  backgroundColor: 'var(--bg-3)',
                  border: '1px solid var(--bg-3)',
                  color: 'var(--color-text-primary)'
                }}
                min="1900"
                max={new Date().getFullYear() + 5}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2" style={{color: 'var(--color-text-secondary)'}}>Thời lượng (phút)</label>
              <input
                type="number"
                value={formData.duration}
                onChange={(e) => handleInputChange('duration', parseInt(e.target.value))}
                className="w-full px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                style={{
                  backgroundColor: 'var(--bg-3)',
                  border: '1px solid var(--bg-3)',
                  color: 'var(--color-text-primary)'
                }}
                min="1"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2" style={{color: 'var(--color-text-secondary)'}}>Chất lượng</label>
              <select
                value={formData.quality}
                onChange={(e) => handleInputChange('quality', e.target.value)}
                className="w-full px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                style={{
                  backgroundColor: 'var(--bg-3)',
                  border: '1px solid var(--bg-3)',
                  color: 'var(--color-text-primary)'
                }}
              >
                <option value="CAM">CAM</option>
                <option value="SD">SD</option>
                <option value="HD">HD</option>
                <option value="FHD">FHD</option>
                <option value="4K">4K</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2" style={{color: 'var(--color-text-secondary)'}}>Điểm IMDb</label>
              <input
                type="number"
                step="0.1"
                min="0"
                max="10"
                value={formData.imdbRating}
                onChange={(e) => handleInputChange('imdbRating', parseFloat(e.target.value))}
                className="w-full px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                style={{
                  backgroundColor: 'var(--bg-3)',
                  border: '1px solid var(--bg-3)',
                  color: 'var(--color-text-primary)'
                }}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2" style={{color: 'var(--color-text-secondary)'}}>Quốc gia</label>
              <select
                value={formData.country}
                onChange={(e) => handleInputChange('country', e.target.value)}
                className="w-full px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                style={{
                  backgroundColor: 'var(--bg-3)',
                  border: '1px solid var(--bg-3)',
                  color: 'var(--color-text-primary)'
                }}
              >
                <option value="">Chọn quốc gia</option>
                {COUNTRIES.map(country => (
                  <option key={country.code} value={country.name}>{country.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2" style={{color: 'var(--color-text-secondary)'}}>Đạo diễn</label>
              <input
                type="text"
                value={formData.director}
                onChange={(e) => handleInputChange('director', e.target.value)}
                className="w-full px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                style={{
                  backgroundColor: 'var(--bg-3)',
                  border: '1px solid var(--bg-3)',
                  color: 'var(--color-text-primary)'
                }}
              />
            </div>
          </div>

          <div className="mt-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Mô tả phim <span className="text-red-500">*</span>
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
              required
            />
          </div>

          <div className="mt-6">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="isHot"
                checked={formData.isHot}
                onChange={(e) => handleInputChange('isHot', e.target.checked)}
                className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
              />
              <label htmlFor="isHot" className="ml-2 block text-sm text-gray-700">
                Phim hot (hiển thị badge HOT)
              </label>
            </div>
          </div>
        </div>

        {/* Genres */}
        <div className="p-6 rounded-lg shadow-sm" style={{backgroundColor: 'var(--bg-4)', border: '1px solid var(--bg-3)'}}>
          <h3 className="text-lg font-medium mb-4" style={{color: 'var(--color-text-primary)'}}>Thể loại</h3>
          {loadingGenres ? (
            <div className="text-center py-4">
              <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-red-400"></div>
              <p className="mt-2 text-sm" style={{color: 'var(--color-text-muted)'}}>Đang tải thể loại...</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {availableGenres.map(genre => (
                <label key={genre.genreId} className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.genres.includes(genre.genreId)}
                    onChange={() => handleGenreToggle(genre.genreId)}
                    className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
                  />
                  <span className="text-sm" style={{color: 'var(--color-text-primary)'}}>{genre.name}</span>
                </label>
              ))}
            </div>
          )}
          {availableGenres.length === 0 && !loadingGenres && (
            <p className="text-sm text-center py-4" style={{color: 'var(--color-text-muted)'}}>
              Không có thể loại nào. Vui lòng tạo thể loại trước.
            </p>
          )}
        </div>

        {/* Cast */}
        <div className="p-6 rounded-lg shadow-sm" style={{backgroundColor: 'var(--bg-4)', border: '1px solid var(--bg-3)'}}>
          <h3 className="text-lg font-medium mb-4" style={{color: 'var(--color-text-primary)'}}>Diễn viên</h3>
          
          <div className="flex gap-2 mb-4">
            <input
              type="text"
              value={castInput}
              onChange={(e) => setCastInput(e.target.value)}
              placeholder="Tên diễn viên"
              className="flex-1 px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
              style={{
                backgroundColor: 'var(--bg-3)',
                border: '1px solid var(--bg-3)',
                color: 'var(--color-text-primary)'
              }}
              onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addCastMember())}
            />
            <button
              type="button"
              onClick={addCastMember}
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
            >
              <PlusIcon className="h-4 w-4" />
            </button>
          </div>

          <div className="flex flex-wrap gap-2">
            {formData.cast.map((actor, index) => (
              <span
                key={index}
                className="inline-flex items-center px-3 py-1 rounded-full text-sm"
                style={{backgroundColor: 'var(--bg-3)', color: 'var(--color-text-primary)'}}
              >
                {actor}
                <button
                  type="button"
                  onClick={() => removeCastMember(index)}
                  className="ml-2 transition-colors"
                  style={{color: 'var(--color-text-muted)'}}
                  onMouseEnter={(e) => e.currentTarget.style.color = 'var(--color-text-primary)'}
                  onMouseLeave={(e) => e.currentTarget.style.color = 'var(--color-text-muted)'}
                >
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Poster */}
            <ImageUpload
              label="Poster"
              type="poster"
              currentUrl={formData.posterUrl}
              onUpload={(url) => handleInputChange('posterUrl', url)}
              onRemove={() => handleInputChange('posterUrl', '')}
              required={true}
            />

            {/* Banner */}
            <ImageUpload
              label="Banner"
              type="banner"
              currentUrl={formData.bannerUrl}
              onUpload={(url) => handleInputChange('bannerUrl', url)}
              onRemove={() => handleInputChange('bannerUrl', '')}
              required={false}
            />                  id="banner-upload"
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => e.target.files && handleFileChange('banner', e.target.files[0])}
                        />
                      </label>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Thumbnail */}
            <div>
              <label className="block text-sm font-medium mb-2" style={{color: 'var(--color-text-secondary)'}}>Thumbnail</label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-red-400 transition-colors">
                {previewUrls.thumbnail ? (
                  <div className="relative">
                    <Image
                      src={previewUrls.thumbnail}
                      alt="Thumbnail preview"
                      width={200}
                      height={120}
                      className="mx-auto rounded object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => handleFileChange('thumbnail', null)}
                      className="absolute top-2 right-2 bg-red-600 text-white rounded-full p-1"
                    >
                      <XMarkIcon className="h-4 w-4" />
                    </button>
                  </div>
                ) : (
                  <div>
                    <PhotoIcon className="mx-auto h-12 w-12 text-gray-400" />
                    <div className="mt-2">
                      <label htmlFor="thumbnail-upload" className="cursor-pointer">
                        <span className="text-red-600 hover:text-red-500">Upload thumbnail</span>
                        <input
                          id="thumbnail-upload"
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => e.target.files && handleFileChange('thumbnail', e.target.files[0])}
                        />
                      </label>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Trailer & Video */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
            {/* Trailer */}
            <div>
              <label className="block text-sm font-medium mb-2" style={{color: 'var(--color-text-secondary)'}}>Trailer (Optional)</label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-red-400 transition-colors">
                {files.trailer ? (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 truncate">{files.trailer.name}</span>
                    <button
                      type="button"
                      onClick={() => handleFileChange('trailer', null)}
                      className="text-red-600 hover:text-red-500"
                    >
                      <XMarkIcon className="h-4 w-4" />
                    </button>
                  </div>
                ) : (
                  <div>
                    <FilmIcon className="mx-auto h-12 w-12 text-gray-400" />
                    <div className="mt-2">
                      <label htmlFor="trailer-upload" className="cursor-pointer">
                        <span className="text-red-600 hover:text-red-500">Upload trailer</span>
                        <input
                          id="trailer-upload"
                          type="file"
                          accept="video/*"
                          className="hidden"
                          onChange={(e) => e.target.files && handleFileChange('trailer', e.target.files[0])}
                        />
                      </label>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Video for single movie */}
            {formData.type === 'movie' && (
              <div>
                <label className="block text-sm font-medium mb-2" style={{color: 'var(--color-text-secondary)'}}>
                  Video phim <span className="text-red-500">*</span>
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-red-400 transition-colors">
                  {files.video ? (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600 truncate">{files.video.name}</span>
                      <button
                        type="button"
                        onClick={() => handleFileChange('video', null)}
                        className="text-red-600 hover:text-red-500"
                      >
                        <XMarkIcon className="h-4 w-4" />
                      </button>
                    </div>
                  ) : (
                    <div>
                      <FilmIcon className="mx-auto h-12 w-12 text-gray-400" />
                      <div className="mt-2">
                        <label htmlFor="video-upload" className="cursor-pointer">
                          <span className="text-red-600 hover:text-red-500">Upload video</span>
                          <input
                            id="video-upload"
                            type="file"
                            accept="video/*"
                            className="hidden"
                            onChange={(e) => e.target.files && handleFileChange('video', e.target.files[0])}
                          />
                        </label>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Episodes for series */}
        {formData.type === 'series' && (
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">Tập phim</h3>
              <button
                type="button"
                onClick={addEpisode}
                className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700"
              >
                <PlusIcon className="mr-2 h-4 w-4" />
                Thêm tập
              </button>
            </div>

            <div className="space-y-4">
              {episodes.map((episode) => (
                <div key={episode.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-4">
                    <input
                      type="text"
                      value={episode.title}
                      onChange={(e) => updateEpisode(episode.id, 'title', e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 mr-4 text-gray-900"
                      placeholder="Tên tập phim"
                    />
                    <button
                      type="button"
                      onClick={() => removeEpisode(episode.id)}
                      className="text-red-600 hover:text-red-500"
                    >
                      <XMarkIcon className="h-5 w-5" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Video */}
                    <div>
                      <label className="block text-sm font-medium mb-2" style={{color: 'var(--color-text-secondary)'}}>Video</label>
                      <div className="border border-gray-300 rounded-lg p-3 text-center">
                        {episode.video ? (
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600 truncate">{episode.video.name}</span>
                            <button
                              type="button"
                              onClick={() => updateEpisode(episode.id, 'video', null)}
                              className="text-red-600 hover:text-red-500"
                            >
                              <XMarkIcon className="h-4 w-4" />
                            </button>
                          </div>
                        ) : (
                          <label className="cursor-pointer">
                            <FilmIcon className="mx-auto h-8 w-8 text-gray-400" />
                            <span className="text-sm text-red-600">Upload video</span>
                            <input
                              type="file"
                              accept="video/*"
                              className="hidden"
                              onChange={(e) => e.target.files && updateEpisode(episode.id, 'video', e.target.files[0])}
                            />
                          </label>
                        )}
                      </div>
                    </div>

                    {/* Subtitle */}
                    <div>
                      <label className="block text-sm font-medium mb-2" style={{color: 'var(--color-text-secondary)'}}>Phụ đề</label>
                      <div className="border border-gray-300 rounded-lg p-3 text-center">
                        {episode.subtitle ? (
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600 truncate">{episode.subtitle.name}</span>
                            <button
                              type="button"
                              onClick={() => updateEpisode(episode.id, 'subtitle', null)}
                              className="text-red-600 hover:text-red-500"
                            >
                              <XMarkIcon className="h-4 w-4" />
                            </button>
                          </div>
                        ) : (
                          <label className="cursor-pointer">
                            <DocumentIcon className="mx-auto h-8 w-8 text-gray-400" />
                            <span className="text-sm text-red-600">Upload subtitle</span>
                            <input
                              type="file"
                              accept=".srt,.vtt,.ass"
                              className="hidden"
                              onChange={(e) => e.target.files && updateEpisode(episode.id, 'subtitle', e.target.files[0])}
                            />
                          </label>
                        )}
                      </div>
                    </div>

                    {/* Dubbed */}
                    <div>
                      <label className="block text-sm font-medium mb-2" style={{color: 'var(--color-text-secondary)'}}>Thuyết minh</label>
                      <div className="border border-gray-300 rounded-lg p-3 text-center">
                        {episode.dubbed ? (
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600 truncate">{episode.dubbed.name}</span>
                            <button
                              type="button"
                              onClick={() => updateEpisode(episode.id, 'dubbed', null)}
                              className="text-red-600 hover:text-red-500"
                            >
                              <XMarkIcon className="h-4 w-4" />
                            </button>
                          </div>
                        ) : (
                          <label className="cursor-pointer">
                            <FilmIcon className="mx-auto h-8 w-8 text-gray-400" />
                            <span className="text-sm text-red-600">Upload thuyết minh</span>
                            <input
                              type="file"
                              accept="video/*"
                              className="hidden"
                              onChange={(e) => e.target.files && updateEpisode(episode.id, 'dubbed', e.target.files[0])}
                            />
                          </label>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Submit */}
        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={() => router.back()}
            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
          >
            Hủy
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-6 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Đang thêm...' : 'Thêm phim'}
          </button>
        </div>
      </form>
    </div>
  );
}
