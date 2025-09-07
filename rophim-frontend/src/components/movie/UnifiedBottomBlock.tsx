'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { 
  ChevronLeftIcon, 
  ChevronRightIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  MinusIcon,
  FilmIcon,
  HeartIcon as HeartSolid,
  PlusIcon,
  BoltIcon,
  PlayIcon
} from '@heroicons/react/24/solid';
import { Movie } from '@/types/movie';
import { getImageUrl } from '@/lib/utils';

// Comment data interface
interface CommentData {
  id: string;
  user: {
    name: string;
    avatar: string;
    gender: 'male' | 'female';
    badge: 'infinity' | 'none';
  };
  movie: {
    title: string;
    poster: string;
    slug: string;
  };
  content: string;
  upvotes: number;
  downvotes: number;
  replies: number;
  timestamp: string;
}

// Latest comment interface for Bình luận mới section
interface LatestComment {
  id: string;
  user: {
    name: string;
    avatar: string;
    gender: 'male' | 'female';
    badge: 'infinity' | 'none';
  };
  movie: {
    title: string;
    slug: string;
  };
  content: string;
  timestamp: string;
}

interface UnifiedBottomBlockProps {
  trendingMovies: Array<Movie & { trend: 'up' | 'down' | 'stable' }>;
  favoriteMovies: Array<Movie & { trend: 'up' | 'down' | 'stable' }>;
  hotGenres: Array<{
    id: string;
    name: string;
    movieCount: number;
    thumbnail: string;
    trending: boolean;
    trend: 'up' | 'down' | 'stable';
  }>;
}

const mockComments: CommentData[] = [
  {
    id: '1',
    user: {
      name: 'Nguyễn Thị Mỹ Ngọc',
      avatar: '/placeholder-avatar.jpg',
      gender: 'female',
      badge: 'infinity',
    },
    movie: {
      title: 'Giao Ước Quỷ Dữ',
      poster: '/placeholder-banner.jpg',
      slug: 'giao-uoc-quy-du',
    },
    content: 'tao thuộc luôn nhạc QC man88 rồi, hãng có cần book tao hát k ?!',
    upvotes: 17,
    downvotes: 0,
    replies: 2,
    timestamp: '2 giờ trước',
  },
  {
    id: '2',
    user: {
      name: 'Hoa Nguyễn',
      avatar: '/placeholder-avatar.jpg',
      gender: 'female',
      badge: 'infinity',
    },
    movie: {
      title: 'Giao Ước Quỷ Dữ',
      poster: '/placeholder-banner.jpg',
      slug: 'giao-uoc-quy-du',
    },
    content: 'phim hay hoặc dở do thằng đạo diễn , đã xem free thì ngậm mồm mà xem thôi mắc gì chửi 2 =)))))))',
    upvotes: 12,
    downvotes: 0,
    replies: 1,
    timestamp: '3 giờ trước',
  },
  {
    id: '3',
    user: {
      name: 'Duyên Mỹ',
      avatar: '/placeholder-avatar.jpg',
      gender: 'female',
      badge: 'infinity',
    },
    movie: {
      title: 'Dữ Tấn Trường An',
      poster: '/placeholder-banner.jpg',
      slug: 'du-tan-truong-an',
    },
    content: 'T coi được full rồi hẹhẹ bên kia á, mà bình luận không được....nó để k hợp lệ, bên P h i m h d c',
    upvotes: 0,
    downvotes: 0,
    replies: 6,
    timestamp: '5 giờ trước',
  },
  {
    id: '4',
    user: {
      name: 'Linh Đào',
      avatar: '/placeholder-avatar.jpg',
      gender: 'female',
      badge: 'infinity',
    },
    movie: {
      title: 'Ngự Trù của Bạo Chúa',
      poster: '/placeholder-banner.jpg',
      slug: 'ngu-tru-cua-bao-chua',
    },
    content: 'bạo chúa gì mà nhát gái, phải t thì t thị tẩm từ cuối tập 4 là hết phim =))))))))))))))))))',
    upvotes: 12,
    downvotes: 0,
    replies: 1,
    timestamp: '1 ngày trước',
  },
  {
    id: '5',
    user: {
      name: 'Mikony.ೃ𓆝',
      avatar: '/placeholder-avatar.jpg',
      gender: 'female',
      badge: 'infinity',
    },
    movie: {
      title: 'Ngự Trù của Bạo Chúa',
      poster: '/placeholder-banner.jpg',
      slug: 'ngu-tru-cua-bao-chua',
    },
    content: 'Hài vkl nữ 9 cắn lại đã ác , ghép mấy cái sound rồi maya cảnh tưởng tượng hài điên, coi mà cứ cười mãi =)))))) mới coi cổ tay áo màu đỏ xong coi này chữa lành quắ um có khi sau ngược',
    upvotes: 6,
    downvotes: 0,
    replies: 0,
    timestamp: '1 ngày trước',
  },
  {
    id: '6',
    user: {
      name: 'nấmmmmm',
      avatar: '/placeholder-avatar.jpg',
      gender: 'female',
      badge: 'none',
    },
    movie: {
      title: 'Giấc Mơ Người Luật Sư',
      poster: '/placeholder-banner.jpg',
      slug: 'giac-mo-nguoi-luat-su',
    },
    content: 'Má, bà vợ cũ vẫn đổ lỗi ngược cho na9 ạ? Nhìn thì tưởng cảnh này bả là nạn nhân đấy nhưng ko, tỉnh lên mng ơi! Na9 là chồng và là bố đứa bé, tsao bà vợ cũ lại tước đi quyền đc biết về sự tồn tại của đứa bé và tình trạng của đứa bé?',
    upvotes: 3,
    downvotes: 0,
    replies: 3,
    timestamp: '2 ngày trước',
  },
  {
    id: '7',
    user: {
      name: 'Anh Tuấn',
      avatar: '/placeholder-avatar.jpg',
      gender: 'male',
      badge: 'infinity',
    },
    movie: {
      title: 'Thử Thách Thần Chết',
      poster: '/placeholder-banner.jpg',
      slug: 'thu-thach-than-chet',
    },
    content: 'Phim này hay quá! Plot twist liên tục, không đoán được kết thúc. Diễn viên chính acting rất tốt, nhất là phần thể hiện tâm lý nhân vật.',
    upvotes: 25,
    downvotes: 1,
    replies: 8,
    timestamp: '3 ngày trước',
  },
  {
    id: '8',
    user: {
      name: 'Mai Lan',
      avatar: '/placeholder-avatar.jpg',
      gender: 'female',
      badge: 'none',
    },
    movie: {
      title: 'Kẻ Săn Bóng Đêm',
      poster: '/placeholder-banner.jpg',
      slug: 'ke-san-bong-dem',
    },
    content: 'Cinematography đẹp xuất sắc! Mỗi frame đều như một bức tranh nghệ thuật. Âm nhạc cũng rất phù hợp với không khí u ám của phim.',
    upvotes: 31,
    downvotes: 2,
    replies: 12,
    timestamp: '4 ngày trước',
  },
  {
    id: '9',
    user: {
      name: 'Hoàng Việt',
      avatar: '/placeholder-avatar.jpg',
      gender: 'male',
      badge: 'none',
    },
    movie: {
      title: 'Chiến Binh Galactic',
      poster: '/placeholder-banner.jpg',
      slug: 'chien-binh-galactic',
    },
    content: 'VFX tuyệt vời! Những cảnh chiến đấu trong không gian làm tôi nổi da gà. Đáng đồng tiền bát gạo, 10/10 sẽ xem lại!',
    upvotes: 19,
    downvotes: 0,
    replies: 5,
    timestamp: '5 ngày trước',
  },
  {
    id: '10',
    user: {
      name: 'Thanh Hương',
      avatar: '/placeholder-avatar.jpg',
      gender: 'female',
      badge: 'infinity',
    },
    movie: {
      title: 'Tình Yêu Mùa Thu',
      poster: '/placeholder-banner.jpg',
      slug: 'tinh-yeu-mua-thu',
    },
    content: 'Rom-com hay nhất mùa này! Chemistry giữa hai diễn viên chính quá tự nhiên và ngọt ngào. Khóc và cười cùng lúc.',
    upvotes: 44,
    downvotes: 3,
    replies: 18,
    timestamp: '1 tuần trước',
  },
  {
    id: '11',
    user: {
      name: 'Đức Minh',
      avatar: '/placeholder-avatar.jpg',
      gender: 'male',
      badge: 'none',
    },
    movie: {
      title: 'Bí Ẩn Khu Rừng',
      poster: '/placeholder-banner.jpg',
      slug: 'bi-an-khu-rung',
    },
    content: 'Thriller tâm lý hay! Căng thẳng từ đầu đến cuối, không có lúc nào thả lỏng. Kịch bản chặt chẽ, diễn xuất ổn.',
    upvotes: 22,
    downvotes: 1,
    replies: 7,
    timestamp: '1 tuần trước',
  },
  {
    id: '12',
    user: {
      name: 'Ngọc Diệp',
      avatar: '/placeholder-avatar.jpg',
      gender: 'female',
      badge: 'infinity',
    },
    movie: {
      title: 'Ký Ức Đã Mất',
      poster: '/placeholder-banner.jpg',
      slug: 'ky-uc-da-mat',
    },
    content: 'Drama sâu sắc về gia đình. Mang thông điệp ý nghĩa về tình thân và sự tha thứ. Khuyên mọi người nên xem!',
    upvotes: 38,
    downvotes: 0,
    replies: 15,
    timestamp: '1 tuần trước',
  },
  {
    id: '13',
    user: {
      name: 'Trung Kiên',
      avatar: '/placeholder-avatar.jpg',
      gender: 'male',
      badge: 'none',
    },
    movie: {
      title: 'Siêu Anh Hùng Mới',
      poster: '/placeholder-banner.jpg',
      slug: 'sieu-anh-hung-moi',
    },
    content: 'Action packed! Những pha stunts thực hiện rất chuyên nghiệp. Dù cốt truyện hơi cũ nhưng vẫn giải trí tốt.',
    upvotes: 28,
    downvotes: 5,
    replies: 11,
    timestamp: '2 tuần trước',
  },
  {
    id: '14',
    user: {
      name: 'Kim Oanh',
      avatar: '/placeholder-avatar.jpg',
      gender: 'female',
      badge: 'none',
    },
    movie: {
      title: 'Học Đường Đại Chiến',
      poster: '/placeholder-banner.jpg',
      slug: 'hoc-duong-dai-chien',
    },
    content: 'Anime adaptation khá ổn! Faithful với manga gốc, animation mượt mà. Fan của series sẽ hài lòng.',
    upvotes: 33,
    downvotes: 2,
    replies: 9,
    timestamp: '2 tuần trước',
  },
  {
    id: '15',
    user: {
      name: 'Quang Huy',
      avatar: '/placeholder-avatar.jpg',
      gender: 'male',
      badge: 'infinity',
    },
    movie: {
      title: 'Đế Chế Sụp Đổ',
      poster: '/placeholder-banner.jpg',
      slug: 'de-che-sup-do',
    },
    content: 'Epic historical drama! Production value cao, trang phục và set design rất chăm chút. Đáng xem để hiểu lịch sử.',
    upvotes: 41,
    downvotes: 1,
    replies: 16,
    timestamp: '2 tuần trước',
  },
  {
    id: '16',
    user: {
      name: 'Huyền Trang',
      avatar: '/placeholder-avatar.jpg',
      gender: 'female',
      badge: 'none',
    },
    movie: {
      title: 'Cuộc Phiêu Lưu Vũ Trụ',
      poster: '/placeholder-banner.jpg',
      slug: 'cuoc-phieu-luu-vu-tru',
    },
    content: 'Sci-fi tuyệt vời cho cả gia đình! Con em tôi rất thích, graphics đẹp mà nội dung cũng hay và ý nghĩa.',
    upvotes: 26,
    downvotes: 0,
    replies: 13,
    timestamp: '3 tuần trước',
  },
];

// Mock latest comments data
const mockLatestComments: LatestComment[] = [
  {
    id: '1',
    user: {
      name: 'mng',
      avatar: '/placeholder-avatar.jpg',
      gender: 'female',
      badge: 'none',
    },
    movie: {
      title: 'Thư Ký Kim Sao Thế?',
      slug: 'thu-ky-kim-sao-the',
    },
    content: 'Khúc na9 hết hồn nhìn mặt cưng tht=))',
    timestamp: '1 phút trước',
  },
  {
    id: '2',
    user: {
      name: 'maow✿',
      avatar: '/placeholder-avatar.jpg',
      gender: 'female',
      badge: 'infinity',
    },
    movie: {
      title: 'Cõng Anh Mà Chạy',
      slug: 'cong-anh-ma-chay',
    },
    content: 'tr ơi coi cười muốn chếch =)))))',
    timestamp: '2 phút trước',
  },
  {
    id: '3',
    user: {
      name: 'Vy Khánh',
      avatar: '/placeholder-avatar.jpg',
      gender: 'female',
      badge: 'infinity',
    },
    movie: {
      title: 'Em Là Một Nửa Đời Anh',
      slug: 'em-la-mot-nua-doi-anh',
    },
    content: 'Hayyy mờ mặc dù coi khúc đầu hog hỉu nhắm',
    timestamp: '3 phút trước',
  },
  {
    id: '4',
    user: {
      name: 'Minaaaa',
      avatar: '/placeholder-avatar.jpg',
      gender: 'female',
      badge: 'none',
    },
    movie: {
      title: 'Lựa Chọn Của Thái Tử',
      slug: 'lua-chon-cua-thai-tu',
    },
    content: 'Biết là kết HE mà xem kết xong vẫn khóc😭',
    timestamp: '4 phút trước',
  },
  {
    id: '5',
    user: {
      name: 'Kdrama',
      avatar: '/placeholder-avatar.jpg',
      gender: 'female',
      badge: 'infinity',
    },
    movie: {
      title: 'Tự Cẩm',
      slug: 'tu-cam',
    },
    content: 'Nhìn 2 mẹ con nó cười mà t muốn tát cho mỗi đứa 1 cái',
    timestamp: '5 phút trước',
  },
];

export function UnifiedBottomBlock({ 
  trendingMovies, 
  favoriteMovies, 
  hotGenres 
}: UnifiedBottomBlockProps) {
  const [currentCommentIndex, setCurrentCommentIndex] = useState(0);
  const [currentLatestCommentIndex, setCurrentLatestCommentIndex] = useState(0);
  const [windowWidth, setWindowWidth] = useState(0);

  // Track window width for responsive
  useEffect(() => {
    const updateWindowWidth = () => {
      setWindowWidth(window.innerWidth);
    };

    // Set initial width
    updateWindowWidth();
    
    // Add event listener
    window.addEventListener('resize', updateWindowWidth);
    
    return () => window.removeEventListener('resize', updateWindowWidth);
  }, []);

  // Auto-slide for latest comments
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentLatestCommentIndex((prev) => (prev + 1) % mockLatestComments.length);
    }, 3000); // Change every 3 seconds

    return () => clearInterval(interval);
  }, []);

  const goToPreviousComment = () => {
    setCurrentCommentIndex((prev) => {
      const newIndex = prev - 1;
      return newIndex < 0 ? mockComments.length - 1 : newIndex;
    });
  };

  const goToNextComment = () => {
    setCurrentCommentIndex((prev) => (prev + 1) % mockComments.length);
  };

  // Responsive calculations
  const getCommentWidth = () => {
    if (windowWidth >= 1024) return 264.2; // lg: desktop
    if (windowWidth >= 768) return 280;    // md: tablet  
    return Math.min(300, windowWidth - 80); // sm: mobile with padding
  };

  const getVisibleComments = () => {
    if (windowWidth >= 1024) return 6; // lg: show 6
    if (windowWidth >= 768) return 3;  // md: show 3
    return 1; // sm: show 1
  };

  const getContainerWidth = () => {
    const comments = getVisibleComments();
    const width = getCommentWidth();
    const gaps = (comments - 1) * 16; // 16px margin between cards
    return `${comments * width + gaps}px`;
  };

  // Calculate scroll distance per comment (including margin)
  const getScrollDistance = () => {
    return getCommentWidth() + 16; // Comment width + 16px margin
  };

  // Helper function to render trend indicator
  const renderTrendIndicator = (trend: 'up' | 'down' | 'stable') => {
    switch (trend) {
      case 'up':
        return <ArrowTrendingUpIcon className="h-4 w-4 text-green-400" />;
      case 'down':
        return <ArrowTrendingDownIcon className="h-4 w-4 text-red-400" />;
      case 'stable':
        return <MinusIcon className="h-4 w-4 text-gray-400" />;
    }
  };

  return (
    <div className="cards-row wide">
      <div className="row-content">
        <div className="comm-wrap" style={{backgroundColor: 'var(--bg-3)'}}>
          
          {/* TOP DISCUSS Section */}
          <div className="top-discuss p-6 relative">
            {/* Navigation positioned visibly but outside comment area */}
            <button 
              type="button" 
              className="sw-button sw-prev absolute left-2 top-1/2 -translate-y-1/2 z-30 p-3 bg-gray-800/90 hover:bg-gray-700 text-white rounded-full transition-all duration-200 shadow-lg border border-gray-600"
              onClick={goToPreviousComment}
              aria-label="Previous comments"
            >
              <ChevronLeftIcon className="h-5 w-5" />
            </button>
            
            <button 
              type="button" 
              className="sw-button sw-next absolute right-2 top-1/2 -translate-y-1/2 z-30 p-3 bg-gray-800/90 hover:bg-gray-700 text-white rounded-full transition-all duration-200 shadow-lg border border-gray-600"
              onClick={goToNextComment}
              aria-label="Next comments"
            >
              <ChevronRightIcon className="h-5 w-5" />
            </button>

            <div className="comm-title line-center mb-8">
              <FilmIcon className="h-6 w-6 text-yellow-400 mr-3" />
              <span className="text-2xl font-bold text-yellow-400">Top bình luận</span>
            </div>
            
            <div className="td-list px-16">
              <div className="flex items-center justify-center">
                <div id="id-top-discuss" className="top-discuss-wrapper relative" style={{ width: getContainerWidth() }}>
                {/* Swiper Container */}
                <div className="swiper swiper-initialized swiper-horizontal overflow-hidden" style={{ width: getContainerWidth() }}>
                  <div 
                    className="swiper-wrapper flex transition-transform duration-500 ease-in-out"
                    style={{ 
                      transform: `translate3d(-${currentCommentIndex * getScrollDistance()}px, 0px, 0px)` 
                    }}
                  >
                    {mockComments.map((comment, index) => (
                      <div 
                        key={comment.id}
                        className="swiper-slide flex-shrink-0"
                        style={{ 
                          width: `${getCommentWidth()}px`,
                          marginRight: index < mockComments.length - 1 ? '16px' : '0'
                        }}
                        data-swiper-slide-index={index}
                      >
                        <div className="d-item td-d-item relative h-48 rounded-lg overflow-hidden">
                          
                          {/* Background Movie Poster */}
                          <div className="di-poster absolute inset-0 z-0">
                            <Image
                              alt="test"
                              loading="lazy"
                              src={getImageUrl(comment.movie.poster, 'medium')}
                              fill
                              className="object-cover blur-sm opacity-30"
                              sizes="248px"
                            />
                            <div className="absolute inset-0 bg-black/60"></div>
                          </div>

                          {/* Movie Thumbnail - Top Right Corner */}
                          <div className="d-thumb absolute top-2 right-2 z-20">
                            <Link 
                              className="v-thumbnail block"
                              title={comment.movie.title}
                              href={`/phim/${comment.movie.slug}`}
                            >
                              <Image
                                alt="test"
                                loading="lazy"
                                src={getImageUrl(comment.movie.poster, 'small')}
                                width={50}
                                height={65}
                                className="rounded object-cover shadow-lg border-2 border-white/20"
                              />
                            </Link>
                          </div>

                          {/* Main Content - Full Width Layout */}
                          <div className="di-v relative z-10 p-4 h-full flex flex-col pr-16">
                            
                            {/* User Header */}
                            <div className="flex items-start space-x-3 mb-3">
                              <div className="user-avatar flex-shrink-0">
                                <Image 
                                  alt={comment.user.name}
                                  src={comment.user.avatar}
                                  width={40}
                                  height={40}
                                  className="rounded-full object-cover"
                                />
                              </div>
                              <div className="flex-1">
                                <div className="user-name line-center gr-free flex items-center">
                                  <span className="text-white text-sm font-medium mr-2">{comment.user.name}</span>
                                  {comment.user.badge === 'infinity' ? (
                                    <span className="text-blue-400 text-xs">∞</span>
                                  ) : (
                                    <>
                                      {comment.user.gender === 'female' && (
                                        <span className="text-pink-400 text-xs">♀</span>
                                      )}
                                      {comment.user.gender === 'male' && (
                                        <span className="text-blue-400 text-xs">♂</span>
                                      )}
                                    </>
                                  )}
                                </div>
                              </div>
                            </div>

                            {/* Comment Text */}
                            <div className="text text-gray-200 text-sm leading-relaxed mb-auto line-clamp-3">
                              {comment.content}
                            </div>

                            {/* Comment Stats */}
                            <div className="comment-bottom flex items-center space-x-3 text-xs text-gray-400 mt-3">
                              <div className="item item-up flex items-center space-x-1">
                                <span className="text-green-400">⬆</span>
                                <span>{comment.upvotes}</span>
                              </div>
                              <div className="item item-down flex items-center space-x-1">
                                <span className="text-red-400">⬇</span>
                                <span>{comment.downvotes}</span>
                              </div>
                              <div className="item item-rep flex items-center space-x-1">
                                <span>💬</span>
                                <span>{comment.replies}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              </div>
            </div>
          </div>

          {/* IRT Table - Grid Layout BELOW Top Comments */}
          <div className="irt-table grid grid-cols-1 lg:grid-cols-4 gap-6 px-6 pt-0 pb-6">
            
            {/* Sôi nổi nhất */}
            <div className="it-col this-01">
              <div className="comm-title line-center mb-4">
                <FilmIcon className="h-5 w-5 text-orange-400 mr-2" />
                <span className="flex-grow-1 text-lg font-bold text-white">Sôi nổi nhất</span>
              </div>
              <div className="chart-list space-y-2">
                {trendingMovies.slice(0, 5).map((movie, index) => (
                  <div key={movie.id} className="item flex items-center space-x-3 p-2 rounded hover:bg-gray-800/50 transition-colors">
                    <div className="pos text-white font-bold text-sm w-6">{index + 1}.</div>
                    <div className="dev dev-stand">
                      {renderTrendIndicator(movie.trend)}
                    </div>
                    <div className="v-thumbnail w-8 h-10 flex-shrink-0">
                      <Image
                        alt="test"
                        loading="lazy"
                        src={getImageUrl(movie.poster, 'small')}
                        width={32}
                        height={40}
                        className="rounded object-cover"
                      />
                    </div>
                    <h4 className="name lim-1 flex-1 min-w-0">
                      <Link 
                        title={movie.title}
                        href={`/phim/${movie.slug}`}
                        className="text-white text-sm hover:text-red-400 transition-colors line-clamp-1"
                      >
                        {movie.title}
                      </Link>
                    </h4>
                  </div>
                ))}
                <div className="item-more mt-2">
                  <Link href="/trending" className="small text-gray-400 hover:text-white transition-colors text-sm">
                    Xem thêm
                  </Link>
                </div>
              </div>
            </div>

            {/* Yêu thích nhất */}
            <div className="it-col this-01">
              <div className="comm-title line-center mb-4">
                <HeartSolid className="h-5 w-5 text-red-400 mr-2" />
                <span className="flex-grow-1 text-lg font-bold text-white">Yêu thích nhất</span>
              </div>
              <div className="chart-list space-y-2">
                {favoriteMovies.slice(0, 5).map((movie, index) => (
                  <div key={movie.id} className="item flex items-center space-x-3 p-2 rounded hover:bg-gray-800/50 transition-colors">
                    <div className="pos text-white font-bold text-sm w-6">{index + 1}.</div>
                    <div className="dev dev-up">
                      {renderTrendIndicator(movie.trend)}
                    </div>
                    <div className="v-thumbnail w-8 h-10 flex-shrink-0">
                      <Image
                        alt="test"
                        loading="lazy"
                        src={getImageUrl(movie.poster, 'small')}
                        width={32}
                        height={40}
                        className="rounded object-cover"
                      />
                    </div>
                    <h4 className="name lim-1 flex-1 min-w-0">
                      <Link 
                        title={movie.title}
                        href={`/phim/${movie.slug}`}
                        className="text-white text-sm hover:text-red-400 transition-colors line-clamp-1"
                      >
                        {movie.title}
                      </Link>
                    </h4>
                  </div>
                ))}
                <div className="item-more mt-2">
                  <Link href="/favorites" className="small text-gray-400 hover:text-white transition-colors text-sm">
                    Xem thêm
                  </Link>
                </div>
              </div>
            </div>

            {/* Thể loại Hot */}
            <div className="it-col this-03">
              <div className="comm-title line-center mb-4">
                <PlusIcon className="h-5 w-5 text-yellow-400 mr-2" />
                <span className="flex-grow-1 text-lg font-bold text-white">Thể loại Hot</span>
              </div>
              <div className="chart-list space-y-2">
                {hotGenres.map((genre, index) => (
                  <div key={genre.id} className="item flex items-center space-x-3 p-2 rounded hover:bg-gray-800/50 transition-colors">
                    <div className="pos text-white font-bold text-sm w-6">{index + 1}.</div>
                    <div className="dev dev-stand">
                      {renderTrendIndicator(genre.trend)}
                    </div>
                    <div className="topic-color w-8 h-6 flex-shrink-0 rounded" style={{backgroundColor: 'rgb(116, 45, 75)'}}>
                      <Link 
                        href={`/the-loai/${genre.id}`}
                        className="w-full h-full rounded text-white text-xs flex items-center justify-center font-medium"
                      >
                        {genre.name.charAt(0)}
                      </Link>
                    </div>
                    <div className="name flex-1 min-w-0">
                      <Link 
                        href={`/the-loai/${genre.id}`}
                        className="text-white text-sm hover:text-yellow-400 transition-colors line-clamp-1"
                      >
                        {genre.name}
                      </Link>
                    </div>
                  </div>
                ))}
                <div className="item-more mt-2">
                  <Link href="/genres" className="small text-gray-400 hover:text-white transition-colors text-sm">
                    Xem thêm
                  </Link>
                </div>
              </div>
            </div>

            {/* Bình luận mới */}
            <div className="it-col this-05">
              <div className="comm-title line-center mb-4">
                <BoltIcon className="h-5 w-5 text-blue-400 mr-2" />
                <span className="text-lg font-bold text-white">Bình luận mới</span>
              </div>
              <div className="release-list">
                <div id="latest-comment" className="comment-slide-wrapper">
                  <div className="swiper swiper-initialized swiper-vertical sw-comment-slide overflow-hidden" style={{ height: '280px' }}>
                    <div 
                      className="swiper-wrapper transition-transform duration-300"
                      style={{ transform: `translate3d(0px, -${currentLatestCommentIndex * 71.5}px, 0px)` }}
                    >
                      {mockLatestComments.map((comment, index) => (
                        <div 
                          key={comment.id}
                          className="swiper-slide mb-1"
                          style={{ height: '67.5px' }}
                          data-swiper-slide-index={index}
                        >
                          <Link 
                            className="re-item flex items-center space-x-3 p-2 rounded hover:bg-gray-800/50 transition-colors"
                            href={`/phim/${comment.movie.slug}`}
                          >
                            <div className="user-avatar w-10 h-10 flex-shrink-0">
                              <Image
                                alt={comment.user.name}
                                src={comment.user.avatar}
                                width={40}
                                height={40}
                                className="rounded-full object-cover"
                              />
                            </div>
                            <div className="user-comment flex-1 min-w-0">
                              <div className="user-name line-center gr-free flex items-center mb-1">
                                <span className="text-white text-xs font-medium mr-1">{comment.user.name}</span>
                                {comment.user.badge === 'infinity' ? (
                                  <span className="text-blue-400 text-xs">∞</span>
                                ) : (
                                  <>
                                    {comment.user.gender === 'female' && (
                                      <span className="text-pink-400 text-xs">♀</span>
                                    )}
                                    {comment.user.gender === 'male' && (
                                      <span className="text-blue-400 text-xs">♂</span>
                                    )}
                                  </>
                                )}
                              </div>
                              <div className="subject">
                                <div className="lim-1 text-gray-300 text-xs line-clamp-1">
                                  {comment.content}
                                </div>
                              </div>
                            </div>
                            <div className="for line-center gap-1 flex items-center text-xs text-gray-400">
                              <PlayIcon className="h-3 w-3 mr-1" />
                              <span className="lim-1 line-clamp-1">{comment.movie.title}</span>
                            </div>
                          </Link>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
