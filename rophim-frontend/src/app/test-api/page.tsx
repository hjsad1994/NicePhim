'use client';

import { useState } from 'react';
import { ApiService } from '@/lib/api';

export default function TestApiPage() {
  const [testResult, setTestResult] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);

  const testConnection = async () => {
    setIsLoading(true);
    setTestResult('Đang kiểm tra kết nối...');
    
    try {
      // Test basic connection
      const response = await fetch('http://localhost:8080/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: 'testuser',
          email: 'test@example.com',
          password: 'password123',
          displayName: 'Test User'
        })
      });
      
      const data = await response.json();
      setTestResult(`✅ Kết nối thành công!\nStatus: ${response.status}\nResponse: ${JSON.stringify(data, null, 2)}`);
    } catch (error) {
      setTestResult(`❌ Lỗi kết nối:\n${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  };

  const testApiService = async () => {
    setIsLoading(true);
    setTestResult('Đang test API Service...');
    
    try {
      const result = await ApiService.register({
        username: 'testuser2',
        email: 'test2@example.com',
        password: 'password123',
        displayName: 'Test User 2'
      });
      
      setTestResult(`✅ API Service hoạt động!\nResponse: ${JSON.stringify(result, null, 2)}`);
    } catch (error) {
      setTestResult(`❌ API Service lỗi:\n${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen" style={{backgroundColor: 'var(--bg-2)'}}>
      <div className="w-full max-w-2xl mx-auto px-4 py-16">
        <h1 className="text-3xl font-bold text-white mb-8">API Connection Test</h1>
        
        <div className="space-y-4 mb-8">
          <button
            onClick={testConnection}
            disabled={isLoading}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white px-4 py-2 rounded-lg mr-4"
          >
            Test Direct Connection
          </button>
          
          <button
            onClick={testApiService}
            disabled={isLoading}
            className="bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white px-4 py-2 rounded-lg"
          >
            Test API Service
          </button>
        </div>

        <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
          <h2 className="text-xl font-bold text-white mb-4">Test Result:</h2>
          <pre className="text-sm text-gray-300 whitespace-pre-wrap">
            {testResult || 'Chưa có kết quả test...'}
          </pre>
        </div>

        <div className="mt-8 bg-yellow-900/20 border border-yellow-500/50 rounded-lg p-4">
          <h3 className="text-yellow-400 font-bold mb-2">Hướng dẫn debug:</h3>
          <ul className="text-yellow-300 text-sm space-y-1">
            <li>1. Đảm bảo backend đang chạy trên port 8080</li>
            <li>2. Kiểm tra console browser để xem chi tiết lỗi</li>
            <li>3. Kiểm tra Network tab trong DevTools</li>
            <li>4. Đảm bảo database đã được khởi tạo</li>
          </ul>
        </div>
      </div>
    </div>
  );
}


