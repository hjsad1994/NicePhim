'use client';

import { useState } from 'react';
import { VideoUpload } from '@/components/admin/VideoUpload';

export default function TestVideoUploadPage() {
  const [uploadedVideo, setUploadedVideo] = useState<{
    videoId: string;
    hlsUrl: string;
  } | null>(null);

  const handleVideoUploaded = (videoId: string, hlsUrl: string) => {
    console.log('Video uploaded successfully:', { videoId, hlsUrl });
    setUploadedVideo({ videoId, hlsUrl });
  };

  const handleVideoUploadError = (error: string) => {
    console.error('Video upload error:', error);
    alert(`Lỗi upload video: ${error}`);
  };

  const testMovieCreation = async () => {
    if (!uploadedVideo) {
      alert('Vui lòng upload video trước');
      return;
    }

    const movieData = {
      title: 'Test Movie with Video',
      aliasTitle: 'test-movie-with-video',
      description: 'This is a test movie with uploaded video',
      releaseYear: 2024,
      ageRating: 'PG-13',
      imdbRating: 8.5,
      isSeries: false,
      posterUrl: 'https://via.placeholder.com/300x450',
      bannerUrl: 'https://via.placeholder.com/1200x400',
      genreIds: [],
      videoId: uploadedVideo.videoId,
      hlsUrl: uploadedVideo.hlsUrl,
      videoStatus: 'ready'
    };

    console.log('Creating movie with data:', movieData);

    try {
      const response = await fetch('http://localhost:8080/api/admin/movies', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(movieData),
      });

      const result = await response.json();
      console.log('Movie creation response:', result);

      if (response.ok) {
        alert('Movie created successfully! Check the database.');
      } else {
        alert(`Error creating movie: ${result.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error creating movie:', error);
      alert(`Error creating movie: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Test Video Upload & Movie Creation</h1>
        
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Step 1: Upload Video</h2>
          <VideoUpload
            onVideoUploaded={handleVideoUploaded}
            onError={handleVideoUploadError}
          />
        </div>

        {uploadedVideo && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-6">
            <h2 className="text-xl font-semibold text-green-800 mb-4">✅ Video Uploaded Successfully</h2>
            <div className="space-y-2">
              <p><strong>Video ID:</strong> {uploadedVideo.videoId}</p>
              <p><strong>HLS URL:</strong> {uploadedVideo.hlsUrl}</p>
            </div>
            
            <button
              onClick={testMovieCreation}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Test Movie Creation
            </button>
          </div>
        )}

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-blue-800 mb-4">Instructions</h2>
          <ol className="list-decimal list-inside space-y-2 text-blue-700">
            <li>Upload a video file (MP4 format)</li>
            <li>Wait for the video processing to complete (status: READY)</li>
            <li>Click "Test Movie Creation" to create a movie with the uploaded video</li>
            <li>Check the database to see if video_id and hls_url are properly stored</li>
          </ol>
        </div>
      </div>
    </div>
  );
}