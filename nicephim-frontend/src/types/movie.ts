export interface Movie {
  id: string;
  title: string;
  slug: string;
  description: string;
  poster: string;
  banner?: string;
  releaseYear: number;
  duration: number; // phút
  imdbRating?: number;
  genres: Genre[];
  country: string;
  status: 'completed' | 'ongoing' | 'upcoming';
  totalEpisodes?: number;
  currentEpisodes?: number;
  quality: string; // HD, FullHD, 4K
  language: string; // vi, en, cn, kr, jp
  createdAt: string;
  updatedAt: string;
  viewCount: number;
  views?: number; // alias for viewCount for compatibility
  isHot?: boolean;
  isFeatured?: boolean;
  // Video fields for uploaded videos
  videoId?: string;
  hlsUrl?: string;
  videoStatus?: string;
  // Additional video page properties
  director?: string;
  cast?: string[];
  keywords?: string[];
  // Episodes information for display
  availableEpisodes?: {
    subtitled: number[]; // PĐ episodes [1,2,3,4]
    dubbed: number[]; // TM episodes [1,2]
  };
}

export interface Episode {
  id: string;
  movieId: string;
  episodeNumber: number;
  title: string;
  duration: number;
  videoSources: VideoSource[];
  subtitles: Subtitle[];
  thumbnail?: string;
  createdAt: string;
}

export interface VideoSource {
  id: string;
  quality: string; // 360p, 480p, 720p, 1080p, 4K
  url: string;
  type: 'dubbed' | 'subtitled'; // thuyết minh hoặc phụ đề
  language: string;
  fileSize?: number;
}

export interface Subtitle {
  id: string;
  language: string;
  languageCode: string; // vi, en, cn, kr, jp
  url: string;
  isDefault?: boolean;
}

export interface Genre {
  id: string;
  name: string;
  slug: string;
}

export interface Comment {
  id: string;
  userId: string;
  movieId: string;
  episodeId?: string;
  content: string;
  timestamp?: number; // vị trí trong video (giây)
  parentId?: string; // cho reply
  createdAt: string;
  likeCount: number;
  user: {
    id: string;
    username: string;
    avatar?: string;
  };
}

export interface User {
  id: string;
  username: string;
  email: string;
  avatar?: string;
  favoriteMovies: string[]; // movie IDs
  watchHistory: WatchHistory[];
  preferences: UserPreferences;
  createdAt: string;
}

export interface WatchHistory {
  movieId: string;
  episodeId?: string;
  watchedAt: string;
  progress: number; // phần trăm đã xem
  currentTime: number; // thời gian hiện tại (giây)
}

export interface UserPreferences {
  subtitleSettings: SubtitleSettings;
  autoPlay: boolean;
  quality: string;
  language: string;
}

export interface SubtitleSettings {
  fontSize: number; // 12-24px
  fontFamily: string; // Arial, Roboto, etc.
  color: string; // hex color
  backgroundColor?: string;
  outline: boolean;
  outlineColor?: string;
}

export interface SearchFilters {
  genres?: string[];
  years?: number[];
  countries?: string[];
  status?: string[];
  quality?: string[];
  sortBy?: 'newest' | 'oldest' | 'views' | 'likes' | 'imdb' | 'name';
  sortOrder?: 'asc' | 'desc';
}
