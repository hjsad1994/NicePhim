# Backend Setup Guide

## Quick Start

To get real movie data instead of fallback data, you need to start the backend server.

### Option 1: Use the startup script
```bash
cd /mnt/d/rophim
./start-backend.sh
```

### Option 2: Manual startup
```bash
cd /mnt/d/rophim/nicephim-backend/demo
./mvnw spring-boot:run
```

## What You'll Get

Once the backend is running on `http://localhost:8080`, you'll see:

### Real Movie Data
- **Spider-Man: No Way Home** - Action/Adventure/Sci-Fi movie
- **Squid Game** - Thriller/Mystery series
- **And more movies** from the database

### Real Genres
- Hành Động (Action)
- Phiêu Lưu (Adventure) 
- Khoa Học Viễn Tưởng (Sci-Fi)
- Kinh Dị (Horror)
- Bí Ẩn (Mystery)

### Real Descriptions
- Detailed Vietnamese descriptions
- Real IMDB ratings
- Actual release years and durations

## Current Status

Right now, the frontend shows fallback data because:
1. Backend is not running on port 8080
2. No movies exist in the database yet

## Next Steps

1. **Start the backend** using one of the methods above
2. **Create movies** using the admin panel at `/admin/movies/new`
3. **Assign genres** to movies
4. **View real data** on the movie detail pages

## Admin Panel

Once backend is running, you can:
- Create new movies: `http://localhost:3000/admin/movies/new`
- Manage genres: `http://localhost:3000/admin/genres`
- Edit existing movies: `http://localhost:3000/admin/movies`

## Troubleshooting

If you see "Test Movie" or "Squid Game" fallback data:
1. Check if backend is running: `curl http://localhost:8080/api/movies`
2. Check browser console for API errors
3. Verify database connection in backend logs