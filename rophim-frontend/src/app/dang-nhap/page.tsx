'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { LoginForm } from '@/components/auth/LoginForm';

export default function SignInPage() {
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const router = useRouter();

  const handleSuccess = (user: any) => {
    setSuccessMessage(`Chào mừng ${user.display_name || user.username}! Đang chuyển hướng...`);
    setErrorMessage('');

    // Store user data in localStorage (in a real app, you'd use proper session management)
    localStorage.setItem('user', JSON.stringify(user));

    // Redirect to home page after a short delay
    setTimeout(() => {
      router.push('/');
    }, 1500);
  };

  const handleError = (error: string) => {
    setErrorMessage(error);
    setSuccessMessage('');
  };

  return (
    <div className="min-h-screen" style={{backgroundColor: 'var(--bg-2)'}}>
      <div className="w-full max-w-md mx-auto px-4 py-16">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Đăng nhập</h1>
          <p className="text-gray-400">Đăng nhập để truy cập tài khoản của bạn</p>
        </div>

        {/* Success Message */}
        {successMessage && (
          <div className="mb-6 p-4 bg-green-900/20 border border-green-500/50 rounded-lg">
            <p className="text-green-400 text-sm">{successMessage}</p>
          </div>
        )}

        {/* Error Message */}
        {errorMessage && (
          <div className="mb-6 p-4 bg-red-900/20 border border-red-500/50 rounded-lg">
            <p className="text-red-400 text-sm">{errorMessage}</p>
          </div>
        )}

        {/* Login Form */}
        <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-6">
          <LoginForm onSuccess={handleSuccess} onError={handleError} />
        </div>

        {/* Sign Up Link */}
        <div className="text-center mt-6">
          <p className="text-gray-400">
            Chưa có tài khoản?{' '}
            <Link href="/dang-ky" className="text-red-400 hover:text-red-300 transition-colors">
              Đăng ký ngay
            </Link>
          </p>
        </div>

        {/* Back to Home */}
        <div className="text-center mt-4">
          <Link href="/" className="text-gray-500 hover:text-gray-300 transition-colors text-sm">
            ← Về trang chủ
          </Link>
        </div>
      </div>
    </div>
  );
}


