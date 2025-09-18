'use client';

import { useState, useRef } from 'react';
import Image from 'next/image';
import { PhotoIcon, XMarkIcon, CloudArrowUpIcon } from '@heroicons/react/24/outline';
import { getImageUrl } from '@/lib/utils';

interface ImageUploadProps {
  label: string;
  type: 'poster' | 'banner';
  currentUrl?: string;
  onUpload: (url: string) => void;
  onRemove?: () => void;
  required?: boolean;
  className?: string;
}

export function ImageUpload({ 
  label, 
  type, 
  currentUrl, 
  onUpload, 
  onRemove,
  required = false,
  className = ''
}: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [error, setError] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Chỉ được upload file hình ảnh');
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setError('Kích thước file không được vượt quá 10MB');
      return;
    }

    setError('');
    setIsUploading(true);

    try {
      // Create preview URL
      const preview = URL.createObjectURL(file);
      setPreviewUrl(preview);

      // Upload to backend
      const formData = new FormData();
      formData.append('file', file);

      const endpoint = type === 'poster' ? '/api/images/upload/poster' : '/api/images/upload/banner';
      const response = await fetch(`http://localhost:8080${endpoint}`, {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (result.success && result.data) {
        onUpload(result.data.url);
      } else {
        throw new Error(result.error || 'Upload thất bại');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Có lỗi xảy ra khi upload';
      setError(errorMessage);
      setPreviewUrl('');
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemove = () => {
    setPreviewUrl('');
    setError('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    if (onRemove) {
      onRemove();
    }
  };

  const displayUrl = previewUrl || currentUrl;

  return (
    <div className={className}>
      <label className="block text-sm font-medium text-white mb-2">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-red-400 transition-colors">
        {displayUrl ? (
          <div className="relative">
            <Image
              src={getImageUrl(displayUrl, type === 'poster' ? 'medium' : 'large')}
              alt={`${label} preview`}
              width={type === 'poster' ? 200 : 300}
              height={type === 'poster' ? 300 : 150}
              className="mx-auto rounded object-cover"
            />
            <button
              type="button"
              onClick={handleRemove}
              className="absolute top-2 right-2 bg-red-600 text-white rounded-full p-1 hover:bg-red-700"
            >
              <XMarkIcon className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <div>
            {isUploading ? (
              <div className="flex flex-col items-center">
                <CloudArrowUpIcon className="h-12 w-12 text-blue-500 animate-pulse" />
                <p className="mt-2 text-sm text-blue-600">Đang upload...</p>
              </div>
            ) : (
              <div>
                <PhotoIcon className="mx-auto h-12 w-12 text-gray-400" />
                <div className="mt-2">
                  <label htmlFor={`${type}-upload`} className="cursor-pointer">
                    <span className="text-red-600 hover:text-red-500">Upload {label.toLowerCase()}</span>
                    <input
                      ref={fileInputRef}
                      id={`${type}-upload`}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleFileSelect}
                      disabled={isUploading}
                    />
                  </label>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {error && (
        <p className="mt-2 text-sm text-red-600">{error}</p>
      )}
    </div>
  );
}