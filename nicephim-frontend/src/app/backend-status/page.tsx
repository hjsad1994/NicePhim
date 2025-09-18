'use client';

import { useState } from 'react';

export default function BackendStatusPage() {
  const [status, setStatus] = useState<string>('Checking...');
  const [isChecking, setIsChecking] = useState(false);

  const checkBackendStatus = async () => {
    setIsChecking(true);
    setStatus('Checking...');
    
    try {
      const response = await fetch('http://localhost:8080/api/test/directory');
      const data = await response.json();
      
      if (response.ok) {
        setStatus('✅ Backend is running!');
      } else {
        setStatus(`❌ Backend error: ${data.error || 'Unknown error'}`);
      }
    } catch (error) {
      if (error instanceof Error && error.message.includes('Failed to fetch')) {
        setStatus('❌ Backend is not running. Please start it first.');
      } else {
        setStatus(`❌ Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    } finally {
      setIsChecking(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Backend Status Check</h1>
        
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Backend Status</h2>
          <div className="flex items-center space-x-4">
            <div className={`px-4 py-2 rounded-lg ${
              status.includes('✅') ? 'bg-green-100 text-green-800' :
              status.includes('❌') ? 'bg-red-100 text-red-800' :
              'bg-yellow-100 text-yellow-800'
            }`}>
              {status}
            </div>
            <button
              onClick={checkBackendStatus}
              disabled={isChecking}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {isChecking ? 'Checking...' : 'Check Status'}
            </button>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">How to Start Backend</h2>
          
          <div className="space-y-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="font-medium text-blue-800 mb-2">Step 1: Navigate to Backend Directory</h3>
              <div className="bg-gray-100 p-2 rounded text-sm font-mono">
                cd nicephim-backend/demo
              </div>
            </div>

            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h3 className="font-medium text-green-800 mb-2">Step 2: Start Spring Boot Application</h3>
              <div className="bg-gray-100 p-2 rounded text-sm font-mono">
                ./mvnw spring-boot:run
              </div>
            </div>

            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
              <h3 className="font-medium text-purple-800 mb-2">Step 3: Wait for Startup</h3>
              <p className="text-sm text-gray-600">
                Wait for the message "Started DemoApplication" in the console. 
                The backend will be available at <code className="bg-gray-100 px-1 rounded">http://localhost:8080</code>
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Troubleshooting</h2>
          
          <div className="space-y-4">
            <div className="border-l-4 border-red-500 pl-4">
              <h3 className="font-medium text-red-800 mb-2">"Failed to fetch" Error</h3>
              <p className="text-gray-600">This means the backend is not running. Start it using the steps above.</p>
            </div>

            <div className="border-l-4 border-yellow-500 pl-4">
              <h3 className="font-medium text-yellow-800 mb-2">Port 8080 Already in Use</h3>
              <p className="text-gray-600">Another application is using port 8080. Either stop it or change the port in application.properties.</p>
            </div>

            <div className="border-l-4 border-blue-500 pl-4">
              <h3 className="font-medium text-blue-800 mb-2">Database Connection Issues</h3>
              <p className="text-gray-600">Make sure SQL Server is running and accessible at the configured connection string.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}