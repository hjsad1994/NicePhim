import Link from 'next/link';
import { SITE_CONFIG } from '@/constants';

export function Footer() {
  const footerLinks = {
    company: [
      { name: 'Về chúng tôi', href: '/about' },
      { name: 'Liên hệ', href: '/contact' },
      { name: 'Điều khoản', href: '/terms' },
      { name: 'Chính sách', href: '/privacy' },
    ],
    categories: [
      { name: 'Phim bộ', href: '/phim-bo' },
      { name: 'Phim lẻ', href: '/phim-le' },
      { name: 'Hoạt hình', href: '/hoat-hinh' },
      { name: 'TV Shows', href: '/tv-shows' },
    ],
    genres: [
      { name: 'Hành động', href: '/the-loai/hanh-dong' },
      { name: 'Hài hước', href: '/the-loai/hai-huoc' },
      { name: 'Lãng mạn', href: '/the-loai/lang-man' },
      { name: 'Kinh dị', href: '/the-loai/kinh-di' },
    ],
    social: [
      { name: 'Facebook', href: '#' },
      { name: 'Twitter', href: '#' },
      { name: 'YouTube', href: '#' },
      { name: 'Telegram', href: '#' },
    ],
  };

  return (
    <footer className="border-t border-gray-800" style={{backgroundColor: 'var(--bg-4)'}}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Logo & Description */}
          <div className="lg:col-span-2">
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-8 h-8 bg-red-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">N</span>
              </div>
              <span className="text-white font-bold text-xl">NicePhim</span>
            </div>
            <p className="text-gray-400 text-sm mb-4 max-w-md">
              {SITE_CONFIG.description}. Xem phim miễn phí với chất lượng cao, 
              phụ đề đa ngôn ngữ và giao diện thân thiện.
            </p>
            <p className="text-gray-500 text-xs">
              © {new Date().getFullYear()} {SITE_CONFIG.name}. All rights reserved.
            </p>
          </div>

          {/* Company Links */}
          <div>
            <h3 className="text-white font-semibold text-sm mb-4">Công ty</h3>
            <ul className="space-y-2">
              {footerLinks.company.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-gray-400 hover:text-white text-sm transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h3 className="text-white font-semibold text-sm mb-4">Danh mục</h3>
            <ul className="space-y-2">
              {footerLinks.categories.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-gray-400 hover:text-white text-sm transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Genres */}
          <div>
            <h3 className="text-white font-semibold text-sm mb-4">Thể loại</h3>
            <ul className="space-y-2">
              {footerLinks.genres.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-gray-400 hover:text-white text-sm transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-gray-800 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-500 text-xs mb-4 md:mb-0">
            Tất cả nội dung được cung cấp bởi các nhà phát hành được ủy quyền.
          </p>
          
          {/* Social Links */}
          <div className="flex space-x-4">
            {footerLinks.social.map((social) => (
              <Link
                key={social.name}
                href={social.href}
                className="text-gray-400 hover:text-white text-sm transition-colors"
              >
                {social.name}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
