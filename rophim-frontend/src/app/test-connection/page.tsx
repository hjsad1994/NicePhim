'use client';

import { useState } from 'react';

export default function TestConnectionPage() {
  const [results, setResults] = useState<string[]>([]);

  const addResult = (result: string) => {
    setResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${result}`]);
  };

  const testBackendConnection = async () => {
    addResult('🧪 Testing backend connection...');
    
    try {
      const response = await fetch('http://localhost:8080/api/test/ping');
      const data = await response.json();
      
      if (response.ok) {
        addResult(`✅ Backend is running! Response: ${JSON.stringify(data)}`);
      } else {
        addResult(`❌ Backend error: ${data.error || 'Unknown error'}`);
      }
    } catch (error) {
      if (error instanceof Error && error.message.includes('Failed to fetch')) {
        addResult('❌ Cannot connect to backend. Make sure it\'s running on port 8080.');
      } else {
        addResult(`❌ Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }
  };

  const testCORS = async () => {
    addResult('🧪 Testing CORS configuration...');
    
    try {
      const response = await fetch('http://localhost:8080/api/test/cors');
      const data = await response.json();
      
      if (response.ok) {
        addResult(`✅ CORS is working! Response: ${JSON.stringify(data)}`);
      } else {
        addResult(`❌ CORS error: ${data.error || 'Unknown error'}`);
      }
    } catch (error) {
      addResult(`❌ CORS Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const testVideoEndpoint = async () => {
    addResult('🧪 Testing video endpoint...');
    
    try {
      const response = await fetch('http://localhost:8080/api/videos/test-video-id/status');
      const data = await response.json();
      
      if (response.ok) {
        addResult(`✅ Video endpoint is working! Response: ${JSON.stringify(data)}`);
      } else {
        addResult(`❌ Video endpoint error: ${data.error || 'Unknown error'}`);
      }
    } catch (error) {
      addResult(`❌ Video endpoint Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const clearResults = () => {
    setResults([]);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Backend Connection Test</h1>
        
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Test Controls</h2>
          <div className="flex space-x-4">
            <button
              onClick={testBackendConnection}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Test Backend Connection
            </button>
            
            <button
              onClick={testCORS}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              Test CORS
            </button>
            
            <button
              onClick={testVideoEndpoint}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
            >
              Test Video Endpoint
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
          <h2 className="text-xl font-semibold mb-4">Backend Status</h2>
          <div className="bg-gray-100 rounded-lg p-4">
            <p className="text-sm text-gray-600 mb-2">
              <strong>Backend URL:</strong> http://localhost:8080
            </p>
            <p className="text-sm text-gray-600 mb-2">
              <strong>Frontend URL:</strong> http://localhost:3000
            </p>
            <p className="text-sm text-gray-600">
              <strong>Expected:</strong> All tests should pass if backend is running correctly
            </p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Test Results</h2>
          <div className="bg-gray-100 rounded-lg p-4 max-h-96 overflow-y-auto">
            {results.length === 0 ? (
              <p className="text-gray-500">No test results yet. Click a test button above.</p>
            ) : (
              <div className="space-y-1">
                {results.map((result, index) => (
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