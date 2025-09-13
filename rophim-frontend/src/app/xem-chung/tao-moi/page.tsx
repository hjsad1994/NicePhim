'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect, use } from 'react';
import { ApiService, MovieResponse } from '@/lib/api';
import { Movie } from '@/types/movie';

interface TaoPhongXemChungPageProps {
  searchParams: Promise<{
    movie?: string;
  }>;
}

export default function TaoPhongXemChungPage({ searchParams }: TaoPhongXemChungPageProps) {
  const resolvedSearchParams = use(searchParams);
  const [movie, setMovie] = useState<Movie | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [roomName, setRoomName] = useState<string>('');
  const [autoStart, setAutoStart] = useState<boolean>(false);
  const [privateOnly, setPrivateOnly] = useState<boolean>(false);

  // Convert MovieResponse to Movie type for compatibility
  const convertToMovie = (movieResponse: MovieResponse): Movie => {
    const slug = movieResponse.aliasTitle || movieResponse.title.toLowerCase().replace(/\s+/g, '-');
    return {
      id: movieResponse.movieId,
      title: movieResponse.title,
      slug: slug,
      description: movieResponse.description || '',
      poster: movieResponse.posterUrl || '/placeholder-movie.jpg',
      banner: movieResponse.bannerUrl,
      releaseYear: movieResponse.releaseYear || new Date().getFullYear(),
      duration: 120, // Default duration in minutes
      imdbRating: movieResponse.imdbRating,
      genres: (movieResponse.genres || []).map(genre => ({
        id: genre.genreId,
        name: genre.name,
        slug: genre.name.toLowerCase().replace(/\s+/g, '-')
      })),
      country: 'Vietnam', // Default country
      status: 'completed' as const,
      quality: 'HD', // Default quality
      language: 'vi', // Default language
      createdAt: movieResponse.createdAt,
      updatedAt: movieResponse.updatedAt || movieResponse.createdAt,
      viewCount: 0, // Default view count
      likeCount: 0, // Default like count
      isHot: false,
      isFeatured: false
    };
  };

  // Load movie data
  useEffect(() => {
    const loadMovie = async () => {
      try {
        setIsLoading(true);
        
        // Create realistic fallback movie
        const createFallbackMovie = (): Movie => ({
          id: 'watch-together-movie',
          title: 'Spider-Man: No Way Home',
          slug: 'spider-man-no-way-home',
          description: 'Peter Parker được huyền thoại Doctor Strange giúp đỡ để khôi phục bí mật danh tính của anh ta. Khi một câu thần chú bị sai, những kẻ thù nguy hiểm từ các thế giới khác bắt đầu xuất hiện, buộc Peter phải khám phá ra ý nghĩa thực sự của việc trở thành Người Nhện.',
          poster: 'https://image.tmdb.org/t/p/w500/1g0dhYtq4irTY1GPXvft6k4YLjm.jpg',
          banner: 'https://image.tmdb.org/t/p/w1280/14QbnygCuTO0vl7CAFmPf1fgZfV.jpg',
          releaseYear: 2021,
          duration: 148,
          imdbRating: 8.4,
          genres: [
            { id: '1', name: 'Hành Động', slug: 'hanh-dong' },
            { id: '2', name: 'Phiêu Lưu', slug: 'phieu-luu' },
            { id: '3', name: 'Khoa Học Viễn Tưởng', slug: 'khoa-hoc-vien-tuong' }
          ],
          country: 'Hoa Kỳ',
          status: 'completed',
          quality: 'FullHD',
          language: 'vi',
          createdAt: '2023-01-01T00:00:00Z',
          updatedAt: '2023-01-01T00:00:00Z',
          viewCount: 1250000,
          likeCount: 45000,
          isHot: true,
          isFeatured: true
        });

        try {
          // Try to get movies from database
          const moviesResponse = await Promise.race([
            ApiService.getMovies(0, 100),
            new Promise((_, reject) => 
              setTimeout(() => reject(new Error('API timeout')), 5000)
            )
          ]) as any;
          
          if (moviesResponse.success && moviesResponse.data && moviesResponse.data.length > 0) {
            // Convert MovieResponse to Movie
            const movies = moviesResponse.data.map(convertToMovie);
            
            // If movie slug is provided in search params, find that specific movie
            if (resolvedSearchParams.movie) {
              const foundMovie = movies.find(m => m.slug === resolvedSearchParams.movie);
              if (foundMovie) {
                setMovie(foundMovie);
                setRoomName(`Cùng xem ${foundMovie.title} nhé`);
              } else {
                setMovie(movies[0]);
                setRoomName(`Cùng xem ${movies[0].title} nhé`);
              }
            } else {
              // Use first movie if no specific movie requested
              setMovie(movies[0]);
              setRoomName(`Cùng xem ${movies[0].title} nhé`);
            }
          } else {
            console.log('⚠️ No movies in database, using fallback');
            setMovie(createFallbackMovie());
            setRoomName('Cùng xem Spider-Man: No Way Home nhé');
          }
        } catch (apiError) {
          console.error('❌ API call failed:', apiError);
          setMovie(createFallbackMovie());
          setRoomName('Cùng xem Spider-Man: No Way Home nhé');
        }
        
      } catch (error) {
        console.error('❌ Unexpected error:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadMovie();
  }, [resolvedSearchParams.movie]);

  const posters = [
    {
      alt: 'poster 1',
      src: movie?.poster || 'https://image.tmdb.org/t/p/w500/1g0dhYtq4irTY1GPXvft6k4YLjm.jpg',
    },
    {
      alt: 'poster 2',
      src: movie?.banner || 'https://image.tmdb.org/t/p/w1280/14QbnygCuTO0vl7CAFmPf1fgZfV.jpg',
    },
    {
      alt: 'poster 3',
      src: 'https://image.tmdb.org/t/p/w500/dDlEmu3EZ0Pgg93K2SVNLCjCSvE.jpg',
    },
  ];
  const [activePoster, setActivePoster] = useState<number>(0);

  const handleCreate = () => {
    // TODO: integrate API create room
    alert('Đã tạo phòng: ' + roomName + (privateOnly ? ' (chỉ bạn bè)' : ' (công khai)'));
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{backgroundColor: 'var(--bg-2)'}}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-red-600 mx-auto mb-4"></div>
          <div className="text-white text-xl">Đang tải thông tin phim...</div>
        </div>
      </div>
    );
  }

  if (!movie) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{backgroundColor: 'var(--bg-2)'}}>
        <div className="text-center">
          <div className="text-6xl mb-4">🎬</div>
          <h1 className="text-2xl font-bold text-white mb-4">Không thể tải thông tin phim</h1>
          <p className="text-gray-400 mb-6">Vui lòng thử lại sau</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{backgroundColor: 'var(--bg-2)'}}>
      <div className="w-[90%] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-4 flex items-center gap-3">
          <Link href={`/phim/${movie.slug}`} className="btn btn-circle btn-outline border-2 border-gray-400/30 text-white hover:bg-white/10" aria-label="Quay lại">
            <span className="i-fa6-solid-angle-left" aria-hidden />
          </Link>
          <h3 className="category-name text-white text-2xl font-semibold">Tạo phòng xem chung</h3>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Movie detail */}
          <div className="border-2 border-gray-400/15 rounded-lg p-5" style={{backgroundColor: 'var(--bg-3)'}}>
            <div className="flex gap-5">
              <div className="div-poster w-[140px] shrink-0">
                <div className="v-thumbnail relative w-[140px] h-[200px] overflow-hidden rounded-md border border-gray-500/30">
                  <Image
                    alt={movie.title}
                    src={movie.poster}
                    fill
                    className="object-cover"
                    sizes="140px"
                  />
                </div>
              </div>
              <div className="info flex-1">
                <h2 className="heading-sm media-name text-white text-xl font-semibold leading-snug">
                  <Link
                    title={movie.title}
                    href={`/phim/${movie.slug}`}
                    className="hover:text-red-400"
                  >
                    {movie.title}
                  </Link>
                </h2>
                {movie.releaseYear && (
                  <div className="alias-name mb-3 text-red-400">{movie.releaseYear}</div>
                )}
                <div className="detail-more space-y-3 text-gray-300">
                  <div className="hl-tags flex items-center gap-2">
                    <div className="tag-model">
                      <span className="last inline-block px-2 py-0.5 rounded bg-gray-600/40 text-white text-xs">
                        <strong>{movie.quality}</strong>
                      </span>
                    </div>
                    {movie.releaseYear && (
                      <div className="tag-classic">
                        <span className="inline-block px-2 py-0.5 rounded bg-gray-600/40 text-white text-xs">
                          {movie.releaseYear}
                        </span>
                      </div>
                    )}
                    {movie.imdbRating && (
                      <div className="tag-classic">
                        <span className="inline-block px-2 py-0.5 rounded bg-gray-600/40 text-white text-xs">
                          ⭐ {movie.imdbRating}
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="hl-tags flex flex-wrap items-center gap-2">
                    {movie.genres.map((genre) => (
                      <Link 
                        key={genre.id} 
                        href={`/the-loai/${genre.slug}`}
                        className="tag-topic inline-block text-xs px-2 py-0.5 rounded border border-gray-400/30 text-gray-200 hover:bg-white/10"
                      >
                        {genre.name}
                      </Link>
                    ))}
                  </div>
                  <div className="description text-sm text-gray-300/90 leading-relaxed">
                    {movie.description}
                  </div>
                  <div className="buttons mt-2">
                    <div className="btn btn-outline inline-flex items-center gap-2 rounded-full border-2 border-gray-400/30 text-white px-4 py-2">
                      <span className="i-fa6-solid-play" aria-hidden />
                      <span>{movie.duration} phút</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Steps */}
          <div className="border-2 border-gray-400/15 rounded-lg p-5" style={{backgroundColor: 'var(--bg-3)'}}>
            {/* 1. Name */}
            <div className="step-row is-name mb-6">
              <div className="step-name mb-3 text-white">1. Tên phòng</div>
              <div className="form-group">
                <input
                  className="form-control size-lg v-form-control w-full rounded-lg bg-black/20 border-2 border-gray-400/30 text-white placeholder:text-gray-400 px-4 py-3 outline-none focus:border-red-500/80"
                  placeholder="Nhập tên phòng"
                  maxLength={100}
                  minLength={10}
                  type="text"
                  value={roomName}
                  onChange={(e) => setRoomName(e.target.value)}
                />
              </div>
            </div>

            {/* 2. Poster */}
            <div className="step-row is-poster mb-6">
              <div className="flex items-start justify-between gap-4 w-full">
                <div className="flex flex-col flex-grow">
                  <div className="step-name text-white">2. Chọn poster hiển thị</div>
                </div>
                <div className="d-poster flex items-center gap-3">
                  {posters.map((p, idx) => (
                    <button
                      key={p.src}
                      type="button"
                      onClick={() => setActivePoster(idx)}
                      className={`item ${activePoster === idx ? 'ring-2 ring-red-500/80' : ''} rounded-md overflow-hidden`}
                    >
                      <Image 
                        alt={p.alt} 
                        src={p.src} 
                        width={90}
                        height={90}
                        className="object-cover" 
                      />
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* 3. Time */}
            <div className="step-row is-time mb-6">
              <div className="step-name text-white">3. Cài đặt thời gian</div>
              <p className="step-desc text-gray-400">Có thể bắt đầu thủ công hoặc tự động theo thời gian cài đặt.</p>
              <div className="start-manual mt-2">
                <button
                  type="button"
                  onClick={() => setAutoStart((v) => !v)}
                  className="line-center inline-flex items-center gap-2"
                >
                  <div className={`toggle-x relative w-12 h-6 rounded-full transition-colors ${autoStart ? 'bg-red-500/80' : 'bg-gray-600/60'}`}>
                    <span className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white transition-all ${autoStart ? 'translate-x-6' : ''}`}></span>
                  </div>
                  <div className="text text-gray-200">Tôi muốn bắt đầu tự động</div>
                </button>
              </div>
            </div>

            {/* 4. Privacy */}
            <div className="step-row is-public mb-2">
              <div className="flex items-center w-full mb-2 gap-4">
                <div className="step-name mb-0 flex-grow text-white">4. Bạn chỉ muốn xem với bạn bè?</div>
                <button
                  type="button"
                  onClick={() => setPrivateOnly((v) => !v)}
                  className="v-toggle"
                >
                  <div className={`toggle-x relative w-12 h-6 rounded-full transition-colors ${privateOnly ? 'bg-red-500/80' : 'bg-gray-600/60'}`}>
                    <span className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white transition-all ${privateOnly ? 'translate-x-6' : ''}`}></span>
                  </div>
                </button>
              </div>
              <p className="step-desc text-gray-400 mb-0">Nếu bật, chỉ có thành viên có link mới xem được phòng này.</p>
            </div>

            {/* Submit */}
            <div className="is-submit mt-5">
              <div className="buttons flex items-center gap-3 w-full">
                <button
                  className="btn btn-xl btn-primary flex-grow rounded-full border-2 border-red-500/80 bg-red-500/10 hover:bg-red-500/20 text-white py-3"
                  onClick={handleCreate}
                >
                  Tạo phòng
                </button>
                <Link
                  className="btn btn-xl btn-light rounded-full border-2 border-gray-400/30 text-white hover:bg-white/10 py-3 px-6"
                  href={`/phim/${movie.slug}`}
                >
                  Huỷ bỏ
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}