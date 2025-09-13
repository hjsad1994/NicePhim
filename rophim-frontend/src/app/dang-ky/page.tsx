'use client';

import { useState } from 'react';
import Link from 'next/link';
import { SignUpForm } from '@/components/auth/SignUpForm';

export default function SignUpPage() {
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const handleSuccess = (userId: string) => {
    setSuccessMessage('Đăng ký thành công! Bạn có thể đăng nhập ngay bây giờ.');
    setErrorMessage('');
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
          <h1 className="text-3xl font-bold text-white mb-2">Đăng ký tài khoản</h1>
          <p className="text-gray-400">Tạo tài khoản để trải nghiệm đầy đủ các tính năng</p>
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

        {/* Sign Up Form */}
        <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-6">
          <SignUpForm onSuccess={handleSuccess} onError={handleError} />
        </div>

        {/* Login Link */}
        <div className="text-center mt-6">
          <p className="text-gray-400">
            Đã có tài khoản?{' '}
            <Link href="/dang-nhap" className="text-red-400 hover:text-red-300 transition-colors">
              Đăng nhập ngay
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


