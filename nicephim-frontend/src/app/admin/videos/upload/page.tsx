'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { VideoUpload } from '@/components/admin/VideoUpload';

export default function VideoUploadPage() {
  const router = useRouter();
  const [uploadedVideo, setUploadedVideo] = useState<{
    videoId: string;
    hlsUrl: string;
  } | null>(null);

  const handleVideoUploaded = (videoId: string, hlsUrl: string) => {
    setUploadedVideo({ videoId, hlsUrl });
  };

  const handleVideoUploadError = (error: string) => {
    console.error('Video upload error:', error);
    alert(`Lỗi upload video: ${error}`);
  };

  const handleCreateMovie = () => {
    if (uploadedVideo) {
      // Redirect to movie creation with video data
      const params = new URLSearchParams({
        videoId: uploadedVideo.videoId,
        hlsUrl: uploadedVideo.hlsUrl
      });
      router.push(`/admin/movies/new?${params.toString()}`);
    }
  };

  return (
    <div className="min-h-screen" style={{backgroundColor: 'var(--bg-2)'}}>
      <div className="w-[90%] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Upload Video</h1>
          <p className="text-gray-400">
            Upload video MP4 và chuyển đổi sang HLS để phát trực tuyến
          </p>
        </div>

        {/* Upload Section */}
        <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-6 mb-6">
          <VideoUpload
            onVideoUploaded={handleVideoUploaded}
            onError={handleVideoUploadError}
          />
        </div>

        {/* Uploaded Video Info */}
        {uploadedVideo && (
          <div className="bg-green-900/20 border border-green-500/50 rounded-lg p-6 mb-6">
            <h3 className="text-green-400 font-medium mb-4">✅ Video đã upload thành công</h3>
            <div className="space-y-2 text-sm">
              <p><span className="text-gray-400">Video ID:</span> <span className="text-white">{uploadedVideo.videoId}</span></p>
              <p><span className="text-gray-400">HLS URL:</span> <span className="text-white">{uploadedVideo.hlsUrl}</span></p>
            </div>
            
            <div className="mt-4 flex space-x-4">
              <button
                onClick={handleCreateMovie}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
              >
                Tạo Phim với Video này
              </button>
              
              <button
                onClick={() => setUploadedVideo(null)}
                className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
              >
                Upload Video Khác
              </button>
            </div>
          </div>
        )}

        {/* Instructions */}
        <div className="bg-blue-900/20 border border-blue-500/50 rounded-lg p-6">
          <h3 className="text-blue-400 font-medium mb-4">📋 Hướng dẫn</h3>
          <div className="space-y-2 text-sm text-gray-300">
            <p>• Chọn file video MP4, AVI, MOV, hoặc MKV (không giới hạn dung lượng)</p>
            <p>• Video sẽ được chuyển đổi sang định dạng HLS với nhiều chất lượng</p>
            <p>• Sau khi upload thành công, bạn có thể tạo phim với video này</p>
            <p>• Video sẽ hỗ trợ tính năng xem chung (watch together)</p>
          </div>
        </div>

        {/* Back Button */}
        <div className="mt-6">
          <button
            onClick={() => router.push('/admin')}
            className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
          >
            ← Về Admin Dashboard
          </button>
        </div>
      </div>
    </div>
  );
}