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
      const uploadUrl = `http://localhost:8080${endpoint}`;
      console.log('Uploading to:', uploadUrl);

      const response = await fetch(uploadUrl, {
        method: 'POST',
        body: formData,
      });

      console.log('Response status:', response.status);
      console.log('Response headers:', response.headers);

      let result;
      let responseText;
      try {
        responseText = await response.text();
        result = JSON.parse(responseText);
        console.log('Response data:', result);
      } catch (jsonError) {
        console.error('Failed to parse JSON:', jsonError);
        console.log('Response text:', responseText);
        throw new Error('Server response is not valid JSON');
      }

      if (result.success && result.data) {
        console.log('Upload successful, URL:', result.data.url);
        onUpload(result.data.url);
      } else {
        console.error('Upload failed:', result);
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
  console.log('Display URL:', displayUrl, 'Type:', type);

  return (
    <div className={className}>
      <label className="block text-sm font-medium text-white mb-2">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-red-400 transition-colors">
        {displayUrl ? (
          <div className="relative">
            <Image
              src={displayUrl}
              alt={`${label} preview`}
              width={type === 'poster' ? 200 : 300}
              height={type === 'poster' ? 300 : 150}
              className="mx-auto rounded object-cover"
              unoptimized={true}
              onError={(e) => {
                console.error('Image failed to load:', displayUrl);
                // Fallback to regular img tag if Next.js Image fails
                const fallbackImg = document.createElement('img');
                fallbackImg.src = displayUrl;
                fallbackImg.alt = `${label} preview`;
                fallbackImg.width = type === 'poster' ? 200 : 300;
                fallbackImg.height = type === 'poster' ? 300 : 150;
                fallbackImg.className = 'mx-auto rounded object-cover';
                e.currentTarget.parentNode?.replaceChild(fallbackImg, e.currentTarget);
              }}
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