'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { SignUpForm } from '@/components/auth/SignUpForm';

interface Particle {
  key: number;
  left: number;
  top: number;
  delay: number;
  duration: number;
}

export default function SignUpPage() {
  const [particles, setParticles] = useState<Particle[]>([]);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    // Create particles only on client side to avoid hydration mismatch
    const newParticles = [...Array(15)].map((_, i) => ({
      key: i,
      left: Math.random() * 100,
      top: Math.random() * 100,
      delay: Math.random() * 3,
      duration: 2 + Math.random() * 3
    }));
    setParticles(newParticles);
  }, []);

  const handleSuccess = (userId: string) => {
    setSuccessMessage('Đăng ký thành công! Bạn có thể đăng nhập ngay bây giờ.');
    setErrorMessage('');
  };

  const handleError = (error: string) => {
    setErrorMessage(error);
    setSuccessMessage('');
  };

  return (
    <div className="min-h-screen bg-black relative overflow-hidden">
      {/* Animated Glow Orbs Background */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-red-600/10 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-purple-600/5 rounded-full blur-3xl animate-pulse delay-2000"></div>

      {/* Floating Particles */}
      {particles.map((particle) => (
        <div
          key={particle.key}
          className="absolute w-1 h-1 bg-white/20 rounded-full animate-pulse"
          style={{
            left: `${particle.left}%`,
            top: `${particle.top}%`,
            animationDelay: `${particle.delay}s`,
            animationDuration: `${particle.duration}s`
          }}
        />
      ))}

      <div className="relative w-[90%] max-w-md mx-auto px-4 py-8 z-10">
        {/* Header */}
        <div className="text-center mb-8 pt-20">
          <h1 className="text-4xl font-bold text-white mb-2 bg-gradient-to-r from-green-400 to-blue-400 bg-clip-text text-transparent">
            Đăng ký tài khoản
          </h1>
          <p className="text-gray-400">Tham gia cộng đồng xem phim cùng nhau</p>
        </div>

        {/* Success Message */}
        {successMessage && (
          <div className="mb-6 p-4 bg-green-500/10 backdrop-blur-sm border border-green-500/30 rounded-xl">
            <div className="flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 text-green-400">
                <path fillRule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zm13.36-1.814a.75.75 0 10-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.14-.094l3.75-5.25z" clipRule="evenodd" />
              </svg>
              <p className="text-green-400 text-sm">{successMessage}</p>
            </div>
          </div>
        )}

        {/* Error Message */}
        {errorMessage && (
          <div className="mb-6 p-4 bg-red-500/10 backdrop-blur-sm border border-red-500/30 rounded-xl">
            <div className="flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 text-red-400">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <p className="text-red-400 text-sm">{errorMessage}</p>
            </div>
          </div>
        )}

        {/* Sign Up Form */}
        <div className="bg-white/5 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-6 mb-6">
          <SignUpForm onSuccess={handleSuccess} onError={handleError} />
        </div>

        {/* Login Link */}
        <div className="text-center">
          <p className="text-gray-400 mb-4">
            Đã có tài khoản?{' '}
          </p>
          <Link
            href="/dang-nhap"
            className="group inline-flex items-center px-8 py-4 bg-white/10 backdrop-blur-sm border border-gray-700/50 text-white font-semibold rounded-xl hover:bg-white/20 hover:border-gray-600/50 transition-all duration-500"
          >
            Đăng nhập ngay
          </Link>
        </div>

        {/* Back to Home */}
        <div className="text-center mt-8">
          <Link
            href="/"
            className="inline-flex items-center text-gray-400 hover:text-white transition-colors text-sm"
          >
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Về trang chủ
          </Link>
        </div>
      </div>
    </div>
  );
}


