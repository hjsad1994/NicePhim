'use client';

export default function UploadGuidePage() {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Video Upload Guide</h1>
        
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">📋 How to Upload Videos and Create Movies</h2>
          
          <div className="space-y-6">
            <div className="border-l-4 border-blue-500 pl-4">
              <h3 className="text-lg font-medium text-blue-800 mb-2">Step 1: Access Upload Page</h3>
              <p className="text-gray-600 mb-2">Go to the movie upload page:</p>
              <div className="bg-gray-100 p-3 rounded-lg">
                <code className="text-blue-600">http://localhost:3000/admin/movies/upload</code>
              </div>
            </div>

            <div className="border-l-4 border-green-500 pl-4">
              <h3 className="text-lg font-medium text-green-800 mb-2">Step 2: Upload Video File</h3>
              <div className="space-y-2">
                <p className="text-gray-600">• Click "Choose File" and select an MP4 video file</p>
                <p className="text-gray-600">• Wait for the upload to complete</p>
                <p className="text-gray-600">• The system will automatically process the video (create HLS files)</p>
                <p className="text-gray-600">• You'll see "Video đã sẵn sàng!" when processing is complete</p>
              </div>
            </div>

            <div className="border-l-4 border-purple-500 pl-4">
              <h3 className="text-lg font-medium text-purple-800 mb-2">Step 3: Fill Movie Details</h3>
              <div className="space-y-2">
                <p className="text-gray-600">• Enter movie title (required)</p>
                <p className="text-gray-600">• Add description, release year, rating, etc.</p>
                <p className="text-gray-600">• Select genres (optional)</p>
                <p className="text-gray-600">• Add poster and banner URLs (optional)</p>
              </div>
            </div>

            <div className="border-l-4 border-orange-500 pl-4">
              <h3 className="text-lg font-medium text-orange-800 mb-2">Step 4: Create Movie</h3>
              <div className="space-y-2">
                <p className="text-gray-600">• Click "Tạo Phim" button</p>
                <p className="text-gray-600">• The system will create the movie with the uploaded video</p>
                <p className="text-gray-600">• You'll be redirected to the movie list page</p>
              </div>
            </div>

            <div className="border-l-4 border-red-500 pl-4">
              <h3 className="text-lg font-medium text-red-800 mb-2">Step 5: Watch Video</h3>
              <div className="space-y-2">
                <p className="text-gray-600">• Go to the movie detail page</p>
                <p className="text-gray-600">• Click "Xem phim" button</p>
                <p className="text-gray-600">• The video will play using HLS streaming</p>
                <p className="text-gray-600">• URL format: <code className="bg-gray-100 px-1 rounded">/xem/[movie-slug]</code></p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">🔧 Technical Details</h2>
          
          <div className="space-y-4">
            <div>
              <h3 className="font-medium text-gray-800 mb-2">Video Processing</h3>
              <ul className="list-disc list-inside space-y-1 text-gray-600">
                <li>Videos are uploaded to <code className="bg-gray-100 px-1 rounded">/api/videos</code> endpoint</li>
                <li>FFmpeg converts MP4 to HLS format with multiple qualities (360p, 720p, 1080p)</li>
                <li>HLS files are stored in <code className="bg-gray-100 px-1 rounded">D:/media/{videoId}/</code></li>
                <li>Master playlist: <code className="bg-gray-100 px-1 rounded">master.m3u8</code></li>
              </ul>
            </div>

            <div>
              <h3 className="font-medium text-gray-800 mb-2">Database Storage</h3>
              <ul className="list-disc list-inside space-y-1 text-gray-600">
                <li><code className="bg-gray-100 px-1 rounded">video_id</code>: Unique identifier for the video</li>
                <li><code className="bg-gray-100 px-1 rounded">hls_url</code>: Path to HLS master playlist</li>
                <li><code className="bg-gray-100 px-1 rounded">video_status</code>: Processing status (ready/failed)</li>
              </ul>
            </div>

            <div>
              <h3 className="font-medium text-gray-800 mb-2">Video Playback</h3>
              <ul className="list-disc list-inside space-y-1 text-gray-600">
                <li>Frontend checks if movie has <code className="bg-gray-100 px-1 rounded">videoId</code> and <code className="bg-gray-100 px-1 rounded">hlsUrl</code></li>
                <li>Uses <code className="bg-gray-100 px-1 rounded">HLSVideoPlayer</code> component for streaming</li>
                <li>HLS URL: <code className="bg-gray-100 px-1 rounded">http://localhost:8080/videos/{videoId}/master.m3u8</code></li>
                <li>Adaptive quality streaming (auto-selects best quality)</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">🚀 Quick Start</h2>
          
          <div className="space-y-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="font-medium text-blue-800 mb-2">1. Start Backend</h3>
              <div className="bg-gray-100 p-2 rounded text-sm font-mono">
                cd nicephim-backend && ./mvnw spring-boot:run
              </div>
            </div>

            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h3 className="font-medium text-green-800 mb-2">2. Upload Video</h3>
              <div className="text-sm">
                <p>Go to: <a href="/admin/movies/upload" className="text-blue-600 hover:underline">/admin/movies/upload</a></p>
                <p>Upload an MP4 file and create a movie</p>
              </div>
            </div>

            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
              <h3 className="font-medium text-purple-800 mb-2">3. Test Playback</h3>
              <div className="text-sm">
                <p>Go to the movie detail page and click "Xem phim"</p>
                <p>Video should play using HLS streaming</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}