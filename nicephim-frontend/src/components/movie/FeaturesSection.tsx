'use client';

import { useState } from 'react';
import Link from 'next/link';
import { PlayIcon, UsersIcon, SparklesIcon } from '@heroicons/react/24/outline';
import { PlayIcon as PlaySolidIcon, UsersIcon as UsersSolidIcon, SparklesIcon as SparklesSolidIcon } from '@heroicons/react/24/solid';

export function FeaturesSection() {
  const [activeFeature, setActiveFeature] = useState(0);

  const features = [
    {
      title: "Trải Nghiệm Xem Phim Cao Cấp",
      description: "HLS streaming công nghệ cao với chất lượng từ 360p đến 4K, phụ đề đa ngôn ngữ và giao diện mượt mà.",
      icon: PlayIcon,
      iconSolid: PlaySolidIcon,
      gradient: "from-red-600 to-pink-600",
      bgGradient: "from-red-600/10 via-pink-600/5 to-transparent"
    },
    {
      title: "Xem Chung Thật Tuyệt Vời",
      description: "Tạo phòng xem cùng bạn bè, trò chuyện thời gian thực và đồng bộ phát video với WebSocket.",
      icon: UsersIcon,
      iconSolid: UsersSolidIcon,
      gradient: "from-blue-600 to-cyan-600",
      bgGradient: "from-blue-600/10 via-cyan-600/5 to-transparent"
    },
    {
      title: "Nội Dung Độc Quyền",
      description: "Bộ sưu tập phim đặc sắc, cập nhật liên tục và nhiều nội dung độc quyền chỉ có tại NicePhim.",
      icon: SparklesIcon,
      iconSolid: SparklesSolidIcon,
      gradient: "from-purple-600 to-violet-600",
      bgGradient: "from-purple-600/10 via-violet-600/5 to-transparent"
    }
  ];

  
  return (
    <section className="relative py-20 bg-gradient-to-b from-black via-gray-900 to-black overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-red-600/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-r from-red-600/10 via-blue-600/10 to-purple-600/10 rounded-full blur-3xl animate-pulse"></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-white via-gray-300 to-white bg-clip-text text-transparent mb-6">
            NicePhim
          </h2>
          <p className="text-xl md:text-2xl text-gray-400 max-w-3xl mx-auto">
            Nền tảng streaming phim hiện đại với trải nghiệm xem phim đỉnh cao
          </p>
        </div>

        {/* Interactive Feature Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-20">
          {features.map((feature, index) => {
            const Icon = activeFeature === index ? feature.iconSolid : feature.icon;
            return (
              <div
                key={index}
                className={`group relative cursor-pointer transition-all duration-500 ${activeFeature === index ? 'scale-105' : 'hover:scale-102'}`}
                onClick={() => setActiveFeature(index)}
                onMouseEnter={() => setActiveFeature(index)}
              >
                {/* Card Background */}
                <div className={`
                  relative p-8 rounded-2xl backdrop-blur-sm border transition-all duration-500
                  ${activeFeature === index
                    ? 'bg-gradient-to-br from-gray-800/90 to-gray-900/90 border-gray-700/50 shadow-2xl'
                    : 'bg-gray-800/50 border-gray-700/30 hover:bg-gray-800/70'
                  }
                `}>
                  {/* Glow Effect */}
                  {activeFeature === index && (
                    <div className={`absolute inset-0 bg-gradient-to-r ${feature.bgGradient} rounded-2xl opacity-50 blur-xl animate-pulse`}></div>
                  )}

                  {/* Icon */}
                  <div className={`
                    relative inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-6 transition-all duration-500
                    ${activeFeature === index
                      ? `bg-gradient-to-br ${feature.gradient} shadow-lg transform scale-110`
                      : 'bg-gray-700 group-hover:bg-gray-600'
                    }
                  `}>
                    <Icon className={`w-8 h-8 ${activeFeature === index ? 'text-white' : 'text-gray-400 group-hover:text-white'}`} />
                  </div>

                  {/* Content */}
                  <h3 className={`
                    text-xl font-bold mb-4 transition-all duration-500
                    ${activeFeature === index ? 'text-white' : 'text-gray-300 group-hover:text-white'}
                  `}>
                    {feature.title}
                  </h3>
                  <p className={`
                    text-base leading-relaxed transition-all duration-500
                    ${activeFeature === index ? 'text-gray-300' : 'text-gray-400 group-hover:text-gray-300'}
                  `}>
                    {feature.description}
                  </p>

                  {/* Action Button */}
                  <Link
                    href={index === 0 ? "/phim-moi" : index === 1 ? "/xem-chung" : "/chu-de"}
                    className={`
                      inline-flex items-center mt-6 px-4 py-2 rounded-lg font-medium transition-all duration-500
                      ${activeFeature === index
                        ? `bg-gradient-to-r ${feature.gradient} text-white shadow-lg hover:shadow-xl transform hover:scale-105`
                        : 'bg-gray-700 text-gray-300 group-hover:bg-gray-600 group-hover:text-white'
                      }
                    `}
                  >
                    {index === 0 ? "Xem Phim Ngay" : index === 1 ? "Bắt Đầu Xem Cùng" : "Khám Phá"}
                    <svg className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                </div>
              </div>
            );
          })}
        </div>

        {/* CTA Section */}
        <div className="mt-16 text-center">
          <div className="inline-flex items-center space-x-6">
            <Link
              href="/dang-ky"
              className="group inline-flex items-center px-8 py-4 bg-gradient-to-r from-red-600 to-pink-600 text-white font-semibold rounded-xl hover:from-red-700 hover:to-pink-700 transition-all duration-500 shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              Bắt Đầu Trải Nghiệm
              <svg className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
            <Link
              href="/the-loai"
              className="group inline-flex items-center px-8 py-4 bg-gray-800/80 backdrop-blur-sm border border-gray-700 text-white font-semibold rounded-xl hover:bg-gray-700/80 hover:border-gray-600 transition-all duration-500"
            >
              Khám Phá Thư Viện
              <svg className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}