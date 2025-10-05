'use client';

import { useState } from 'react';
import Link from 'next/link';
import { PlayIcon, UsersIcon, SparklesIcon } from '@heroicons/react/24/outline';
import { PlayIcon as PlaySolidIcon, UsersIcon as UsersSolidIcon, SparklesIcon as SparklesSolidIcon } from '@heroicons/react/24/solid';

export function FeaturesSection() {
  const [hoveredFeature, setHoveredFeature] = useState<number | null>(null);

  const features = [
    {
      title: "Streaming Chất Lượng Cao",
      description: "Công nghệ HLS streaming tiên tiến với chất lượng từ 360p đến 4K. Tận hưởng trải nghiệm xem phim mượt mà với phụ đề đa ngôn ngữ.",
      icon: PlayIcon,
      iconSolid: PlaySolidIcon,
      gradient: "from-rose-500 via-pink-500 to-red-500",
      borderGradient: "from-rose-500/50 to-red-500/50",
      glowColor: "rose",
      link: "/phim-moi",
      buttonText: "Xem Ngay"
    },
    {
      title: "Watch Together",
      description: "Kết nối với bạn bè qua tính năng xem chung. Trò chuyện real-time, đồng bộ video và tạo những khoảnh khắc đáng nhớ.",
      icon: UsersIcon,
      iconSolid: UsersSolidIcon,
      gradient: "from-cyan-500 via-blue-500 to-indigo-500",
      borderGradient: "from-cyan-500/50 to-indigo-500/50",
      glowColor: "blue",
      link: "/xem-chung",
      buttonText: "Tạo Phòng"
    },
    {
      title: "Thư Viện Phong Phú",
      description: "Hàng ngàn bộ phim từ mọi thể loại, cập nhật liên tục mỗi ngày. Nội dung độc quyền và bom tấn quốc tế.",
      icon: SparklesIcon,
      iconSolid: SparklesSolidIcon,
      gradient: "from-violet-500 via-purple-500 to-fuchsia-500",
      borderGradient: "from-violet-500/50 to-fuchsia-500/50",
      glowColor: "purple",
      link: "/the-loai",
      buttonText: "Khám Phá"
    }
  ];

  
  return (
    <section className="relative py-32 bg-black overflow-hidden">
      {/* Animated Background Gradients */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -left-40 w-80 h-80 bg-rose-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-60 -right-40 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute -bottom-40 left-1/3 w-80 h-80 bg-purple-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-20">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/5 backdrop-blur-sm border border-white/10 rounded-full mb-6">
            <SparklesSolidIcon className="w-4 h-4 text-yellow-400" />
            <span className="text-sm font-medium text-gray-300">Trải Nghiệm Đỉnh Cao</span>
          </div>
          <h2 className="text-5xl md:text-6xl lg:text-7xl font-bold mb-6">
            <span className="bg-gradient-to-r from-white via-gray-100 to-gray-300 bg-clip-text text-transparent">
              Tại Sao Chọn
            </span>
            <br />
            <span className="bg-gradient-to-r from-rose-400 via-pink-400 to-purple-400 bg-clip-text text-transparent">
              NicePhim
            </span>
          </h2>
          <p className="text-lg md:text-xl text-gray-400 max-w-2xl mx-auto leading-relaxed">
            Nền tảng streaming hiện đại mang đến trải nghiệm giải trí hoàn hảo
          </p>
        </div>

        {/* Modern Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 mb-20">
          {features.map((feature, index) => {
            const Icon = hoveredFeature === index ? feature.iconSolid : feature.icon;
            const isHovered = hoveredFeature === index;
            
            return (
              <div
                key={index}
                className="group relative"
                onMouseEnter={() => setHoveredFeature(index)}
                onMouseLeave={() => setHoveredFeature(null)}
              >
                {/* Glow Effect on Hover */}
                {isHovered && (
                  <div className={`absolute -inset-1 bg-gradient-to-r ${feature.borderGradient} rounded-3xl blur-lg opacity-75 group-hover:opacity-100 transition duration-1000`}></div>
                )}

                {/* Card */}
                <div className={`
                  relative h-full p-8 rounded-2xl transition-all duration-500
                  ${isHovered 
                    ? 'bg-gradient-to-br from-white/10 to-white/5 transform -translate-y-2' 
                    : 'bg-white/5 hover:bg-white/8'
                  }
                  backdrop-blur-xl border ${isHovered ? 'border-white/20' : 'border-white/10'}
                `}>
                  
                  {/* Icon Container */}
                  <div className="mb-6">
                    <div className={`
                      inline-flex items-center justify-center w-14 h-14 rounded-xl
                      transition-all duration-500
                      ${isHovered 
                        ? `bg-gradient-to-br ${feature.gradient} shadow-2xl scale-110` 
                        : 'bg-white/10 group-hover:bg-white/15'
                      }
                    `}>
                      <Icon className={`w-7 h-7 transition-colors duration-500 ${isHovered ? 'text-white' : 'text-gray-300'}`} />
                    </div>
                  </div>

                  {/* Content */}
                  <div className="space-y-4">
                    <h3 className={`
                      text-2xl font-bold transition-colors duration-500
                      ${isHovered ? 'text-white' : 'text-gray-200'}
                    `}>
                      {feature.title}
                    </h3>
                    
                    <p className={`
                      text-sm leading-relaxed transition-colors duration-500
                      ${isHovered ? 'text-gray-300' : 'text-gray-400'}
                    `}>
                      {feature.description}
                    </p>

                    {/* Action Link */}
                    <Link
                      href={feature.link}
                      className={`
                        inline-flex items-center gap-2 font-semibold text-sm
                        transition-all duration-500 group/link
                        ${isHovered 
                          ? `bg-gradient-to-r ${feature.gradient} bg-clip-text text-transparent` 
                          : 'text-gray-400 hover:text-white'
                        }
                      `}
                    >
                      {feature.buttonText}
                      <svg 
                        className={`w-4 h-4 transition-all duration-500 ${isHovered ? 'translate-x-1' : 'group-hover/link:translate-x-1'}`}
                        fill="none" 
                        stroke="currentColor" 
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                      </svg>
                    </Link>
                  </div>

                  {/* Decorative Elements */}
                  {isHovered && (
                    <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-white/10 to-transparent rounded-bl-full opacity-50"></div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* CTA Section */}
        <div className="mt-20 text-center">
          <div className="relative inline-block">
            {/* Glow Background */}
            <div className="absolute -inset-1 bg-gradient-to-r from-rose-500 via-pink-500 to-purple-500 rounded-2xl blur-xl opacity-30 group-hover:opacity-50 transition duration-1000"></div>
            
            {/* Buttons Container */}
            <div className="relative flex flex-col sm:flex-row items-center gap-4 p-2 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl">
              <Link
                href="/dang-ky"
                className="group inline-flex items-center justify-center gap-3 px-8 py-4 bg-gradient-to-r from-rose-500 via-pink-500 to-red-500 text-white font-bold rounded-xl transition-all duration-500 shadow-2xl hover:shadow-pink-500/50 hover:scale-105 w-full sm:w-auto"
              >
                <PlaySolidIcon className="w-5 h-5" />
                Bắt Đầu Ngay
                <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>
              
              <Link
                href="/the-loai"
                className="group inline-flex items-center justify-center gap-3 px-8 py-4 bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white font-semibold rounded-xl border border-white/20 hover:border-white/30 transition-all duration-500 w-full sm:w-auto"
              >
                <SparklesSolidIcon className="w-5 h-5 text-purple-400" />
                Khám Phá Phim
                <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}