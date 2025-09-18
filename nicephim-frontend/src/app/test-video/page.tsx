'use client';

import { useState } from 'react';
import { VideoUpload } from '@/components/admin/VideoUpload';
import SimpleHLSPlayer from '@/components/video/SimpleHLSPlayer';

export default function TestVideoPage() {
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

  return (
    <div className="min-h-screen" style={{backgroundColor: 'var(--bg-2)'}}>
      <div className="w-[90%] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Test Video Upload & HLS Player</h1>
          <p className="text-gray-400">
            Test real video upload with MP4 to HLS conversion and HLS video player
          </p>
        </div>

        {/* Upload Section */}
        <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-6 mb-8">
          <h2 className="text-xl font-semibold text-white mb-4">1. Upload Video</h2>
          <VideoUpload
            onVideoUploaded={handleVideoUploaded}
            onError={handleVideoUploadError}
          />
        </div>

        {/* Video Player Section */}
        {uploadedVideo && (
          <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-6 mb-8">
            <h2 className="text-xl font-semibold text-white mb-4">2. HLS Video Player</h2>
            <div className="space-y-4">
              <div className="text-sm text-gray-300">
                <p><span className="text-gray-400">Video ID:</span> {uploadedVideo.videoId}</p>
                <p><span className="text-gray-400">HLS URL:</span> {uploadedVideo.hlsUrl}</p>
              </div>
              
              <div className="aspect-video bg-black rounded-lg overflow-hidden">
                <SimpleHLSPlayer
                  hlsUrl={uploadedVideo.hlsUrl}
                  title="Test Video"
                  className="w-full h-full"
                />
              </div>
            </div>
          </div>
        )}

        {/* Watch Together Test Section */}
        {uploadedVideo && (
          <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-6 mb-8">
            <h2 className="text-xl font-semibold text-white mb-4">3. Watch Together Test</h2>
            <div className="space-y-4">
              <p className="text-gray-300">
                This video player supports watch together functionality with WebSocket synchronization.
              </p>
              
              <div className="aspect-video bg-black rounded-lg overflow-hidden">
                <SimpleHLSPlayer
                  hlsUrl={uploadedVideo.hlsUrl}
                  title="Watch Together Test"
                  className="w-full h-full"
                />
              </div>
              
              <div className="text-sm text-gray-400">
                <p>• Host controls are synchronized with other viewers</p>
                <p>• Play, pause, and seek actions are shared in real-time</p>
                <p>• Quality selection and volume are individual</p>
              </div>
            </div>
          </div>
        )}

        {/* Instructions */}
        <div className="bg-blue-900/20 border border-blue-500/50 rounded-lg p-6">
          <h3 className="text-blue-400 font-medium mb-4">📋 Test Instructions</h3>
          <div className="space-y-2 text-sm text-gray-300">
            <p>1. <strong>Upload Video:</strong> Select an MP4 file (max 2GB) and upload it</p>
            <p>2. <strong>Wait for Processing:</strong> The video will be converted to HLS format with multiple qualities</p>
            <p>3. <strong>Test Player:</strong> Use the HLS video player with full controls</p>
            <p>4. <strong>Watch Together:</strong> Test the collaborative watching features</p>
            <p>5. <strong>Backend Required:</strong> Make sure the Spring Boot backend is running on port 8080</p>
          </div>
        </div>

        {/* Backend Status */}
        <div className="mt-6 bg-yellow-900/20 border border-yellow-500/50 rounded-lg p-4">
          <h4 className="text-yellow-400 font-medium mb-2">⚠️ Backend Requirements</h4>
          <div className="text-sm text-gray-300 space-y-1">
            <p>• Spring Boot server running on http://localhost:8080</p>
            <p>• FFmpeg installed and configured</p>
            <p>• Video upload directory: D:/videos_demo</p>
            <p>• HLS output directory: D:/media</p>
          </div>
        </div>
      </div>
    </div>
  );
}