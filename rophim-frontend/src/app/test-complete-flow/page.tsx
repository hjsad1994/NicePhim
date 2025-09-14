'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function TestCompleteFlowPage() {
  const router = useRouter();
  const [testResults, setTestResults] = useState<string[]>([]);

  const addResult = (result: string) => {
    setTestResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${result}`]);
  };

  const testVideoUpload = async () => {
    addResult('🧪 Testing video upload workflow...');
    
    // Test 1: Check if backend is running
    try {
      const response = await fetch('http://localhost:8080/api/videos/test-video-id/status');
      addResult('✅ Backend is running');
    } catch (error) {
      addResult('❌ Backend is not running - please start it first');
      return;
    }

    // Test 2: Check if we can create a movie
    try {
      const movieData = {
        title: 'Test Movie for Video Upload',
        aliasTitle: 'test-movie-video-upload',
        description: 'This is a test movie to verify video upload workflow',
        releaseYear: 2024,
        ageRating: 'PG-13',
        imdbRating: 8.5,
        isSeries: false,
        posterUrl: 'https://via.placeholder.com/300x450',
        bannerUrl: 'https://via.placeholder.com/1200x400',
        genreIds: [],
        videoId: null,
        hlsUrl: null,
        videoStatus: null
      };

      const response = await fetch('http://localhost:8080/api/admin/movies', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(movieData),
      });

      const result = await response.json();
      
      if (response.ok) {
        addResult('✅ Movie creation API is working');
        addResult(`📝 Created test movie: ${result.data.title}`);
      } else {
        addResult(`❌ Movie creation failed: ${result.error}`);
      }
    } catch (error) {
      addResult(`❌ Movie creation error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const testVideoStatus = async () => {
    addResult('🧪 Testing video status endpoint...');
    
    try {
      const response = await fetch('http://localhost:8080/api/videos/test-video-id/status');
      const statusData = await response.json();
      
      addResult(`📊 Video status response: ${JSON.stringify(statusData)}`);
      
      if (statusData.status) {
        addResult('✅ Video status endpoint is working');
      } else {
        addResult('❌ Video status endpoint returned unexpected data');
      }
    } catch (error) {
      addResult(`❌ Video status error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const testMovieList = async () => {
    addResult('🧪 Testing movie list endpoint...');
    
    try {
      const response = await fetch('http://localhost:8080/api/admin/movies?page=0&size=5');
      const result = await response.json();
      
      if (result.success && result.data) {
        addResult(`✅ Movie list endpoint is working - found ${result.data.length} movies`);
        
        // Check if any movies have video data
        const moviesWithVideo = result.data.filter((movie: any) => movie.videoId && movie.hlsUrl);
        addResult(`📹 Movies with video data: ${moviesWithVideo.length}`);
        
        if (moviesWithVideo.length > 0) {
          addResult('🎬 Movies with videos:');
          moviesWithVideo.forEach((movie: any) => {
            addResult(`  - ${movie.title} (ID: ${movie.videoId})`);
          });
        }
      } else {
        addResult(`❌ Movie list failed: ${result.error}`);
      }
    } catch (error) {
      addResult(`❌ Movie list error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const clearResults = () => {
    setTestResults([]);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Complete Video Upload Flow Test</h1>
        
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Test Controls</h2>
          <div className="flex space-x-4">
            <button
              onClick={testVideoUpload}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Test Video Upload Workflow
            </button>
            
            <button
              onClick={testVideoStatus}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              Test Video Status
            </button>
            
            <button
              onClick={testMovieList}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
            >
              Test Movie List
            </button>
            
            <button
              onClick={clearResults}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
            >
              Clear Results
            </button>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Manual Testing Steps</h2>
          <div className="space-y-4">
            <div className="border-l-4 border-blue-500 pl-4">
              <h3 className="font-medium text-blue-800">Step 1: Upload Video</h3>
              <p className="text-gray-600">Go to <a href="/admin/movies/upload" className="text-blue-600 hover:underline">/admin/movies/upload</a> and upload a video file</p>
            </div>
            
            <div className="border-l-4 border-green-500 pl-4">
              <h3 className="font-medium text-green-800">Step 2: Create Movie</h3>
              <p className="text-gray-600">Fill in movie details and submit the form</p>
            </div>
            
            <div className="border-l-4 border-purple-500 pl-4">
              <h3 className="font-medium text-purple-800">Step 3: Test Video Playback</h3>
              <p className="text-gray-600">Go to the movie detail page and click "Xem phim" to test video playback</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Test Results</h2>
          <div className="bg-gray-100 rounded-lg p-4 max-h-96 overflow-y-auto">
            {testResults.length === 0 ? (
              <p className="text-gray-500">No test results yet. Click a test button above.</p>
            ) : (
              <div className="space-y-1">
                {testResults.map((result, index) => (
                  <div key={index} className="text-sm font-mono">
                    {result}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}