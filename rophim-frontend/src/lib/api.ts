const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  displayName?: string;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface RegisterResponse {
  success: boolean;
  user_id?: string;
  message?: string;
  error?: string;
}

export interface LoginResponse {
  success: boolean;
  user?: {
    user_id: string;
    username: string;
    email: string;
    display_name: string;
    created_at: string;
  };
  message?: string;
  error?: string;
}

export interface CreateMovieRequest {
  title: string;
  aliasTitle?: string;
  description?: string;
  releaseYear?: number;
  ageRating?: string;
  imdbRating?: number;
  isSeries?: boolean;
  posterUrl?: string;
  bannerUrl?: string;
  genreIds?: string[];
}

export interface UpdateMovieRequest {
  title?: string;
  aliasTitle?: string;
  description?: string;
  releaseYear?: number;
  ageRating?: string;
  imdbRating?: number;
  isSeries?: boolean;
  posterUrl?: string;
  bannerUrl?: string;
  videoId?: string;
  hlsUrl?: string;
  videoStatus?: string;
}

export interface MovieResponse {
  movieId: string;
  title: string;
  aliasTitle?: string;
  description?: string;
  releaseYear?: number;
  ageRating?: string;
  imdbRating?: number;
  isSeries: boolean;
  posterUrl?: string;
  bannerUrl?: string;
  createdBy: string;
  createdAt: string;
  updatedAt?: string;
  genres?: GenreResponse[];
  videoId?: string;
  hlsUrl?: string;
  videoStatus?: string;
}

export interface MovieListResponse {
  success: boolean;
  data: MovieResponse[];
  pagination?: {
    page: number;
    size: number;
    total: number;
    totalPages: number;
  };
  count?: number;
  error?: string;
}

export interface MovieActionResponse {
  success: boolean;
  data?: MovieResponse;
  message?: string;
  error?: string;
}

export interface CreateGenreRequest {
  name: string;
}

export interface UpdateGenreRequest {
  name: string;
}

export interface GenreResponse {
  genreId: string;
  name: string;
}

export interface GenreListResponse {
  success: boolean;
  data: GenreResponse[];
  error?: string;
}

export interface GenreActionResponse {
  success: boolean;
  data?: GenreResponse;
  message?: string;
  error?: string;
}

export class ApiService {
  private static async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;

    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    try {
      console.log('API Request:', { url, config });
      const response = await fetch(url, config);

      // Log response for debugging
      console.log('API Response Status:', response.status);

      let data;
      try {
        data = await response.json();
        console.log('API Response Data:', data);
      } catch (jsonError) {
        console.error('JSON Parse Error:', jsonError);
        throw new Error('Phản hồi từ server không hợp lệ');
      }

      if (!response.ok) {
        const errorMessage = data?.error || data?.message || `Lỗi ${response.status}: ${response.statusText}`;
        throw new Error(errorMessage);
      }

      return data;
    } catch (error) {
      console.error('API Error:', error);

      if (error instanceof Error) {
        // Check for specific error types
        if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
          throw new Error('Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng và đảm bảo backend đang chạy.');
        }
        throw error;
      }
      throw new Error('Có lỗi không xác định xảy ra');
    }
  }

  // Auth methods
  static async register(data: RegisterRequest): Promise<RegisterResponse> {
    return this.request<RegisterResponse>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  static async login(data: LoginRequest): Promise<LoginResponse> {
    return this.request<LoginResponse>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Movie Admin methods
  static async createMovie(data: CreateMovieRequest): Promise<MovieActionResponse> {
    return this.request<MovieActionResponse>('/api/admin/movies', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  static async getMovies(page: number = 0, size: number = 10): Promise<MovieListResponse> {
    return this.request<MovieListResponse>(`/api/admin/movies?page=${page}&size=${size}`);
  }

  static async getMovieById(movieId: string): Promise<MovieActionResponse> {
    return this.request<MovieActionResponse>(`/api/admin/movies/${movieId}`);
  }

  static async getMovieBySlug(slug: string): Promise<MovieActionResponse> {
    return this.request<MovieActionResponse>(`/api/admin/movies/slug/${slug}`);
  }

  static async updateMovie(movieId: string, data: UpdateMovieRequest): Promise<MovieActionResponse> {
    return this.request<MovieActionResponse>(`/api/admin/movies/${movieId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  static async deleteMovie(movieId: string): Promise<MovieActionResponse> {
    return this.request<MovieActionResponse>(`/api/admin/movies/${movieId}`, {
      method: 'DELETE',
    });
  }

  static async searchMovies(title: string): Promise<MovieListResponse> {
    return this.request<MovieListResponse>(`/api/admin/movies/search?title=${encodeURIComponent(title)}`);
  }

  // Genre Admin methods
  static async createGenre(data: CreateGenreRequest): Promise<GenreActionResponse> {
    return this.request<GenreActionResponse>('/api/admin/genres', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  static async getGenres(): Promise<GenreListResponse> {
    return this.request<GenreListResponse>('/api/admin/genres');
  }

  static async getGenreById(genreId: string): Promise<GenreActionResponse> {
    return this.request<GenreActionResponse>(`/api/admin/genres/${genreId}`);
  }

  static async updateGenre(genreId: string, data: UpdateGenreRequest): Promise<GenreActionResponse> {
    return this.request<GenreActionResponse>(`/api/admin/genres/${genreId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  static async deleteGenre(genreId: string): Promise<GenreActionResponse> {
    return this.request<GenreActionResponse>(`/api/admin/genres/${genreId}`, {
      method: 'DELETE',
    });
  }

  static async getGenresByMovieId(movieId: string): Promise<GenreListResponse> {
    return this.request<GenreListResponse>(`/api/admin/genres/movie/${movieId}`);
  }

  static async addGenreToMovie(genreId: string, movieId: string): Promise<GenreActionResponse> {
    return this.request<GenreActionResponse>(`/api/admin/genres/${genreId}/movies/${movieId}`, {
      method: 'POST',
    });
  }

  static async removeGenreFromMovie(genreId: string, movieId: string): Promise<GenreActionResponse> {
    return this.request<GenreActionResponse>(`/api/admin/genres/${genreId}/movies/${movieId}`, {
      method: 'DELETE',
    });
  }
}
