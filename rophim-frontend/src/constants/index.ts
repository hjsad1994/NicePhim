export const SITE_CONFIG = {
  name: 'NicePhim',
  description: 'Website xem phim trực tuyến miễn phí',
  url: 'https://www.nicephim.me',
  author: 'NicePhim Team',
  keywords: ['xem phim', 'phim mới', 'phim hay', 'phim trực tuyến', 'NicePhim'] as const,
} as const;

export const MOVIE_GENRES = [
  { id: 'action', name: 'Hành Động', slug: 'hanh-dong' },
  { id: 'adventure', name: 'Phiêu Lưu', slug: 'phieu-luu' },
  { id: 'animation', name: 'Hoạt Hình', slug: 'hoat-hinh' },
  { id: 'comedy', name: 'Hài Hước', slug: 'hai-huoc' },
  { id: 'drama', name: 'Chính Kịch', slug: 'chinh-kich' },
  { id: 'horror', name: 'Kinh Dị', slug: 'kinh-di' },
  { id: 'romance', name: 'Lãng Mạn', slug: 'lang-man' },
  { id: 'thriller', name: 'Ly Kỳ', slug: 'ly-ky' },
  { id: 'sci-fi', name: 'Khoa Học Viễn Tưởng', slug: 'khoa-hoc-vien-tuong' },
  { id: 'crime', name: 'Tội Phạm', slug: 'toi-pham' },
  { id: 'documentary', name: 'Tài Liệu', slug: 'tai-lieu' },
] as const;

export const COUNTRIES = [
  { id: 'vietnam', name: 'Việt Nam', code: 'VN' },
  { id: 'usa', name: 'Hoa Kỳ', code: 'US' },
  { id: 'korea', name: 'Hàn Quốc', code: 'KR' },
  { id: 'japan', name: 'Nhật Bản', code: 'JP' },
  { id: 'china', name: 'Trung Quốc', code: 'CN' },
  { id: 'thailand', name: 'Thái Lan', code: 'TH' },
  { id: 'england', name: 'Anh', code: 'GB' },
  { id: 'france', name: 'Pháp', code: 'FR' },
] as const;

export const VIDEO_QUALITIES = [
  { id: '360p', name: '360p', bitrate: '1Mbps' },
  { id: '480p', name: '480p', bitrate: '2Mbps' },
  { id: '720p', name: '720p HD', bitrate: '4Mbps' },
  { id: '1080p', name: '1080p FullHD', bitrate: '8Mbps' },
  { id: '4k', name: '4K UHD', bitrate: '15Mbps' },
] as const;

export const SUBTITLE_FONTS = [
  'Arial',
  'Roboto',
  'Open Sans',
  'Noto Sans',
  'Nunito',
  'Poppins',
  'Inter',
] as const;

export const SUBTITLE_COLORS = [
  { name: 'Trắng', value: '#FFFFFF' },
  { name: 'Đen', value: '#000000' },
  { name: 'Vàng', value: '#FFD700' },
  { name: 'Xanh dương', value: '#0080FF' },
  { name: 'Đỏ', value: '#FF0000' },
  { name: 'Xanh lá', value: '#00FF00' },
  { name: 'Tím', value: '#8A2BE2' },
  { name: 'Cam', value: '#FFA500' },
] as const;

export const YEARS = Array.from(
  { length: new Date().getFullYear() - 1950 + 1 },
  (_, i) => new Date().getFullYear() - i
);

export const SORT_OPTIONS = [
  { id: 'newest', name: 'Mới nhất' },
  { id: 'oldest', name: 'Cũ nhất' },
  { id: 'views', name: 'Lượt xem' },
  { id: 'likes', name: 'Lượt thích' },
  { id: 'imdb', name: 'Điểm IMDb' },
  { id: 'name', name: 'Tên A-Z' },
] as const;

export const ROUTES = {
  HOME: '/',
  MOVIES: '/phim',
  MOVIE_DETAIL: '/phim/[slug]',
  WATCH: '/xem/[slug]',
  SEARCH: '/tim-kiem',
  GENRE: '/the-loai/[slug]',
  COUNTRY: '/quoc-gia/[slug]',
  YEAR: '/nam/[year]',
  FAVORITES: '/yeu-thich',
  HISTORY: '/lich-su',
  PROFILE: '/ca-nhan',
  // New routes for enhanced header
  SINGLE_MOVIES: '/phim-le',
  SERIES_MOVIES: '/phim-bo',
  WATCH_TOGETHER: '/xem-chung',
  ACTORS: '/dien-vien',
  SCHEDULE: '/lich-chieu',
  NOTIFICATIONS: '/thong-bao',
} as const;
