'use client';

import { useState, useRef } from 'react';

interface VideoUploadProps {
  onVideoUploaded: (videoId: string, hlsUrl: string) => void;
  onError: (error: string) => void;
}

interface UploadStatus {
  status: 'idle' | 'uploading' | 'processing' | 'ready' | 'error';
  progress: number;
  message: string;
  videoId?: string;
  hlsUrl?: string;
}

export function VideoUpload({ onVideoUploaded, onError }: VideoUploadProps) {
  const [uploadStatus, setUploadStatus] = useState<UploadStatus>({
    status: 'idle',
    progress: 0,
    message: ''
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('video/')) {
        onError('Vui lòng chọn file video hợp lệ');
        return;
      }
      
      setSelectedFile(file);
      setUploadStatus({
        status: 'idle',
        progress: 0,
        message: `✅ Đã chọn: ${file.name} (${(file.size / (1024 * 1024)).toFixed(1)} MB) - Nhấn "Upload Video" để tiếp tục`
      });
    }
  };

  const uploadVideo = async () => {
    if (!selectedFile) return;

    const formData = new FormData();
    formData.append('file', selectedFile);

    try {
      setUploadStatus({
        status: 'uploading',
        progress: 0,
        message: '📤 Đang upload video lên server...'
      });

      // Upload video
      const response = await fetch('http://localhost:8080/api/videos', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Upload failed: ${response.statusText}`);
      }

      const result = await response.json();
      console.log('Upload response:', result);
      const { videoId, hlsUrl } = result;
      console.log('Extracted videoId:', videoId, 'hlsUrl:', hlsUrl);

      setUploadStatus({
        status: 'processing',
        progress: 50,
        message: '⚙️ Đang xử lý video (chuyển đổi sang HLS)...',
        videoId,
        hlsUrl
      });

      // Start polling for processing status
      startStatusPolling(videoId);

    } catch (error) {
      console.error('Upload error:', error);
      let errorMessage = 'Unknown error';
      
      if (error instanceof Error) {
        if (error.message.includes('Failed to fetch')) {
          errorMessage = 'Không thể kết nối đến server. Vui lòng kiểm tra backend có đang chạy không.';
        } else {
          errorMessage = error.message;
        }
      }
      
      setUploadStatus({
        status: 'error',
        progress: 0,
        message: `❌ Lỗi upload: ${errorMessage}`
      });
      onError(`Lỗi upload: ${errorMessage}`);
    }
  };

  const startStatusPolling = (videoId: string) => {
    console.log('Starting status polling for videoId:', videoId);
    intervalRef.current = setInterval(async () => {
      try {
        console.log('Polling status for videoId:', videoId);
        const response = await fetch(`http://localhost:8080/api/videos/${videoId}/status`);
        const statusData = await response.json();
        console.log('Status response:', statusData);
        
        if (statusData.status === 'READY') {
          setUploadStatus({
            status: 'ready',
            progress: 100,
            message: '✅ Video đã sẵn sàng! Bây giờ bạn có thể tạo phim.',
            videoId,
            hlsUrl: statusData.hlsUrl
          });
          
          console.log('Video ready! Calling onVideoUploaded with:', { videoId, hlsUrl: statusData.hlsUrl });
          onVideoUploaded(videoId, statusData.hlsUrl);
          if (intervalRef.current) {
            clearInterval(intervalRef.current);
          }
        } else if (statusData.status === 'FAILED') {
          setUploadStatus({
            status: 'error',
            progress: 0,
            message: `Lỗi xử lý video: ${statusData.log || 'Unknown error'}`
          });
          onError(`Lỗi xử lý video: ${statusData.log || 'Unknown error'}`);
          if (intervalRef.current) {
            clearInterval(intervalRef.current);
          }
        } else if (statusData.status === 'PROCESSING') {
          setUploadStatus(prev => ({
            ...prev,
            progress: Math.min(prev.progress + 5, 90),
            message: `Đang xử lý video... ${statusData.log || ''}`
          }));
        }
      } catch (error) {
        console.error('Status polling error:', error);
        setUploadStatus({
          status: 'error',
          progress: 0,
          message: 'Lỗi kiểm tra trạng thái video'
        });
        onError('Lỗi kiểm tra trạng thái video');
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
        }
      }
    }, 2000); // Poll every 2 seconds
  };

  const resetUpload = () => {
    setSelectedFile(null);
    setUploadStatus({
      status: 'idle',
      progress: 0,
      message: ''
    });
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
  };

  const getStatusColor = () => {
    switch (uploadStatus.status) {
      case 'uploading':
      case 'processing':
        return 'text-blue-400';
      case 'ready':
        return 'text-green-400';
      case 'error':
        return 'text-red-400';
      default:
        return 'text-gray-400';
    }
  };

  const getProgressBarColor = () => {
    switch (uploadStatus.status) {
      case 'uploading':
      case 'processing':
        return 'bg-blue-500';
      case 'ready':
        return 'bg-green-500';
      case 'error':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Upload Video (MP4)
        </label>
        
        {/* File Input */}
        <div className="border-2 border-dashed border-gray-600 rounded-lg p-6 text-center">
          <input
            ref={fileInputRef}
            type="file"
            accept="video/mp4,video/avi,video/mov,video/mkv"
            onChange={handleFileSelect}
            className="hidden"
            disabled={uploadStatus.status === 'uploading' || uploadStatus.status === 'processing'}
          />
          
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploadStatus.status === 'uploading' || uploadStatus.status === 'processing'}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
          >
            Chọn File Video
          </button>
          
          <p className="text-sm text-gray-400 mt-2">
            Hỗ trợ: MP4, AVI, MOV, MKV (không giới hạn dung lượng)
          </p>
        </div>

        {/* Selected File Info */}
        {selectedFile && (
          <div className="mt-4 p-3 bg-gray-800 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-300">{selectedFile.name}</p>
                <p className="text-xs text-gray-400">
                  {(selectedFile.size / (1024 * 1024)).toFixed(1)} MB
                </p>
              </div>
              {uploadStatus.status === 'idle' && (
                <button
                  onClick={uploadVideo}
                  className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors"
                >
                  📤 Upload Video
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Upload Progress */}
      {uploadStatus.status !== 'idle' && (
        <div className="space-y-3">
          {/* Progress Bar */}
          <div className="w-full bg-gray-700 rounded-full h-2">
            <div
              className={`h-2 rounded-full transition-all duration-300 ${getProgressBarColor()}`}
              style={{ width: `${uploadStatus.progress}%` }}
            />
          </div>

          {/* Status Message */}
          <div className={`text-sm ${getStatusColor()}`}>
            {uploadStatus.message}
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-2">
            {uploadStatus.status === 'ready' && (
              <button
                onClick={resetUpload}
                className="px-3 py-1 bg-gray-600 hover:bg-gray-700 text-white text-sm rounded transition-colors"
              >
                Upload Video Khác
              </button>
            )}
            
            {uploadStatus.status === 'error' && (
              <button
                onClick={resetUpload}
                className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-sm rounded transition-colors"
              >
                Thử Lại
              </button>
            )}
          </div>
        </div>
      )}

      {/* Video Preview (when ready) */}
      {uploadStatus.status === 'ready' && uploadStatus.hlsUrl && (
        <div className="mt-4 p-4 bg-green-900/20 border border-green-500/50 rounded-lg">
          <h4 className="text-green-400 font-medium mb-2">✅ Video đã sẵn sàng</h4>
          <p className="text-sm text-gray-300 mb-2">
            Video ID: {uploadStatus.videoId}
          </p>
          <p className="text-sm text-gray-300">
            HLS URL: {uploadStatus.hlsUrl}
          </p>
        </div>
      )}
    </div>
  );
}