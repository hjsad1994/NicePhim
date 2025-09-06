import { Movie } from '@/types/movie';

// Mock data for development
export const mockMovies: Movie[] = [
  {
    id: '1',
    title: 'Spider-Man: No Way Home',
    slug: 'spider-man-no-way-home',
    availableEpisodes: {
      subtitled: [1, 2, 3, 4],
      dubbed: [1, 2]
    },
    description: 'Peter Parker được huyền thoại Doctor Strange giúp đỡ để khôi phục bí mật danh tính của anh ta. Khi một câu thần chú bị sai, những kẻ thù nguy hiểm từ các thế giới khác bắt đầu xuất hiện, buộc Peter phải khám phá ra ý nghĩa thực sự của việc trở thành Người Nhện.',
    poster: '/placeholder-movie.jpg',
    banner: '/placeholder-banner.jpg',
    releaseYear: 2021,
    duration: 148,
    imdbRating: 8.4,
    genres: [
      { id: '1', name: 'Hành Động', slug: 'hanh-dong' },
      { id: '2', name: 'Phiêu Lưu', slug: 'phieu-luu' }
    ],
    country: 'Hoa Kỳ',
    status: 'completed',
    quality: 'FullHD',
    language: 'en',
    createdAt: '2023-01-01T00:00:00Z',
    updatedAt: '2023-01-01T00:00:00Z',
    viewCount: 1250000,
    likeCount: 45000,
    isHot: true,
    isFeatured: true,
  },
  {
    id: '2',
    title: 'Squid Game',
    slug: 'squid-game',
    availableEpisodes: {
      subtitled: [1, 2, 3, 4, 5, 6],
      dubbed: [1, 2, 3]
    },
    description: 'Hàng trăm người chơi nợ nần chấp nhận lời mời tham gia vào các trò chơi dành cho trẻ em với giải thưởng khổng lồ. Nhưng những rủi ro thì cũng khổng lồ như vậy.',
    poster: '/placeholder-movie.jpg',
    banner: '/placeholder-banner.jpg',
    releaseYear: 2021,
    duration: 60,
    imdbRating: 8.0,
    genres: [
      { id: '3', name: 'Chính Kịch', slug: 'chinh-kich' },
      { id: '4', name: 'Ly Kỳ', slug: 'ly-ky' }
    ],
    country: 'Hàn Quốc',
    status: 'completed',
    totalEpisodes: 9,
    currentEpisodes: 9,
    quality: '4K',
    language: 'kr',
    createdAt: '2023-01-02T00:00:00Z',
    updatedAt: '2023-01-02T00:00:00Z',
    viewCount: 2100000,
    likeCount: 78000,
    isHot: true,
    isFeatured: true,
  },
  {
    id: '3',
    title: 'The Batman',
    slug: 'the-batman',
    availableEpisodes: {
      subtitled: [1, 2, 3],
      dubbed: [1]
    },
    description: 'Trong năm thứ hai của mình khi chiến đấu với tội phạm, Batman khám phá ra sự tham nhũng ở Gotham City có liên quan đến gia đình của chính mình.',
    poster: '/placeholder-movie.jpg',
    banner: '/placeholder-banner.jpg',
    releaseYear: 2022,
    duration: 176,
    imdbRating: 7.8,
    genres: [
      { id: '1', name: 'Hành Động', slug: 'hanh-dong' },
      { id: '5', name: 'Tội Phạm', slug: 'toi-pham' }
    ],
    country: 'Hoa Kỳ',
    status: 'completed',
    quality: 'FullHD',
    language: 'en',
    createdAt: '2023-01-03T00:00:00Z',
    updatedAt: '2023-01-03T00:00:00Z',
    viewCount: 980000,
    likeCount: 35000,
    isFeatured: true,
  },
  {
    id: '4',
    title: 'One Piece Film: Red',
    slug: 'one-piece-film-red',
    description: 'Uta — ca sĩ được yêu thích nhất thế giới. Giọng hát của cô ấy, được mô tả là "khác thế giới", đã khiến cô nổi tiếng ngay cả khi che giấu danh tính thực sự của mình.',
    poster: '/placeholder-movie.jpg',
    banner: '/placeholder-banner.jpg',
    releaseYear: 2022,
    duration: 115,
    imdbRating: 7.2,
    genres: [
      { id: '6', name: 'Hoạt Hình', slug: 'hoat-hinh' },
      { id: '2', name: 'Phiêu Lưu', slug: 'phieu-luu' }
    ],
    country: 'Nhật Bản',
    status: 'completed',
    quality: 'FullHD',
    language: 'jp',
    createdAt: '2023-01-04T00:00:00Z',
    updatedAt: '2023-01-04T00:00:00Z',
    viewCount: 750000,
    likeCount: 28000,
  },
  {
    id: '5',
    title: 'Avatar: The Way of Water',
    slug: 'avatar-the-way-of-water',
    description: 'Jake Sully sống với gia đình mới của mình trên hành tinh Pandora. Khi một mối đe dọa quen thuộc trở lại để hoàn thành những gì đã bắt đầu trước đây, Jake phải làm việc với Neytiri và quân đội của chủng tộc Na\'vi để bảo vệ hành tinh của họ.',
    poster: '/placeholder-movie.jpg',
    banner: '/placeholder-banner.jpg',
    releaseYear: 2022,
    duration: 192,
    imdbRating: 7.6,
    genres: [
      { id: '7', name: 'Viễn Tưởng', slug: 'vien-tuong' },
      { id: '2', name: 'Phiêu Lưu', slug: 'phieu-luu' }
    ],
    country: 'Hoa Kỳ',
    status: 'completed',
    quality: '4K',
    language: 'en',
    createdAt: '2023-01-05T00:00:00Z',
    updatedAt: '2023-01-05T00:00:00Z',
    viewCount: 1800000,
    likeCount: 67000,
    isFeatured: true,
  },
  {
    id: '6',
    title: 'Demon Slayer: Entertainment District Arc',
    slug: 'demon-slayer-entertainment-district-arc',
    description: 'Tanjiro, Zenitsu và Inosuke đi đến quận giải trí để điều tra những vụ mất tích bí ẩn. Họ sẽ đối mặt với một trong những con quỷ mạnh nhất - Upper Moon Six.',
    poster: '/placeholder-movie.jpg',
    releaseYear: 2021,
    duration: 45,
    imdbRating: 8.7,
    genres: [
      { id: '6', name: 'Hoạt Hình', slug: 'hoat-hinh' },
      { id: '1', name: 'Hành Động', slug: 'hanh-dong' }
    ],
    country: 'Nhật Bản',
    status: 'completed',
    totalEpisodes: 11,
    currentEpisodes: 11,
    quality: 'FullHD',
    language: 'jp',
    createdAt: '2023-01-06T00:00:00Z',
    updatedAt: '2023-01-06T00:00:00Z',
    viewCount: 890000,
    likeCount: 42000,
    isHot: true,
  },
  {
    id: '7',
    title: 'Top Gun: Maverick',
    slug: 'top-gun-maverick',
    description: 'Sau hơn ba mười năm phục vụ với tư cách là một trong những phi công hàng đầu của Hải quân, Pete "Maverick" Mitchell ở nơi anh thuộc về, thúc đẩy ranh giới như một phi công thử nghiệm dũng cảm.',
    poster: '/placeholder-movie.jpg',
    releaseYear: 2022,
    duration: 130,
    imdbRating: 8.3,
    genres: [
      { id: '1', name: 'Hành Động', slug: 'hanh-dong' },
      { id: '3', name: 'Chính Kịch', slug: 'chinh-kich' }
    ],
    country: 'Hoa Kỳ',
    status: 'completed',
    quality: '4K',
    language: 'en',
    createdAt: '2023-01-07T00:00:00Z',
    updatedAt: '2023-01-07T00:00:00Z',
    viewCount: 1400000,
    likeCount: 52000,
  },
  {
    id: '8',
    title: 'Jujutsu Kaisen 0',
    slug: 'jujutsu-kaisen-0',
    description: 'Yuta Okkotsu là một học sinh trung học bị ám ảnh bởi linh hồn Rika, bạn thời thơ ấu đã qua đời của cậu. Linh hồn của Rika không phải là linh hồn bình thường, mà là một Lời nguyền Đặc biệt.',
    poster: '/placeholder-movie.jpg',
    releaseYear: 2021,
    duration: 105,
    imdbRating: 7.8,
    genres: [
      { id: '6', name: 'Hoạt Hình', slug: 'hoat-hinh' },
      { id: '8', name: 'Siêu Nhiên', slug: 'sieu-nhien' }
    ],
    country: 'Nhật Bản',
    status: 'completed',
    quality: 'FullHD',
    language: 'jp',
    createdAt: '2023-01-08T00:00:00Z',
    updatedAt: '2023-01-08T00:00:00Z',
    viewCount: 680000,
    likeCount: 31000,
  }
];

export const featuredMovies = mockMovies.filter(movie => movie.isFeatured);
export const hotMovies = mockMovies.filter(movie => movie.isHot);
export const newMovies = mockMovies.slice(0, 6);
export const animeMovies = mockMovies.filter(movie => 
  movie.genres.some(genre => genre.slug === 'hoat-hinh')
);
export const actionMovies = mockMovies.filter(movie => 
  movie.genres.some(genre => genre.slug === 'hanh-dong')
);

// Sort by view count for trending with trend data
export const trendingMovies = [...mockMovies]
  .sort((a, b) => b.viewCount - a.viewCount)
  .map((movie, index) => ({
    ...movie,
    trend: index < 2 ? 'up' : index < 4 ? 'down' : 'stable' as 'up' | 'down' | 'stable'
  }));

// Sort by like count for favorites with trend data
export const favoriteMoviesList = [...mockMovies]
  .sort((a, b) => b.likeCount - a.likeCount)
  .map((movie, index) => ({
    ...movie,
    trend: index < 3 ? 'up' : index < 5 ? 'stable' : 'down' as 'up' | 'down' | 'stable'
  }));

// Hot genres data with trend indicators
export const hotGenres = [
  {
    id: 'hanh-dong',
    name: 'Hành Động',
    movieCount: 1250,
    thumbnail: '/placeholder-movie.jpg',
    trending: true,
    trend: 'up' as 'up' | 'down' | 'stable',
  },
  {
    id: 'hoat-hinh',
    name: 'Hoạt Hình',
    movieCount: 890,
    thumbnail: '/placeholder-movie.jpg',
    trending: true,
    trend: 'up' as 'up' | 'down' | 'stable',
  },
  {
    id: 'lang-man',
    name: 'Lãng Mạn',
    movieCount: 760,
    thumbnail: '/placeholder-movie.jpg',
    trending: false,
    trend: 'stable' as 'up' | 'down' | 'stable',
  },
  {
    id: 'kinh-di',
    name: 'Kinh Dị',
    movieCount: 650,
    thumbnail: '/placeholder-movie.jpg',
    trending: true,
    trend: 'down' as 'up' | 'down' | 'stable',
  },
  {
    id: 'hai-huoc',
    name: 'Hài Hước',
    movieCount: 580,
    thumbnail: '/placeholder-movie.jpg',
    trending: false,
    trend: 'down' as 'up' | 'down' | 'stable',
  },
];
