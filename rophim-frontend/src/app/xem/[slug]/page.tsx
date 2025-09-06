import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { VideoPlayer } from '@/components/video/VideoPlayer';
import { VideoComments } from '@/components/video/VideoComments';
import { RelatedMovies } from '@/components/video/RelatedMovies';
import { MovieInfo } from '@/components/video/MovieInfo';
import { mockMovies } from '@/lib/mockData';

interface WatchPageProps {
  params: {
    slug: string;
  };
}

export async function generateMetadata({ params }: WatchPageProps): Promise<Metadata> {
  const movie = mockMovies.find(m => m.slug === params.slug);
  
  if (!movie) {
    return {
      title: 'Phim không tìm thấy',
    };
  }

  return {
    title: `Xem ${movie.title} - NicePhim`,
    description: `Xem phim ${movie.title} (${movie.releaseYear}) chất lượng HD miễn phí tại NicePhim. ${movie.description}`,
  };
}

export default function WatchPage({ params }: WatchPageProps) {
  const movie = mockMovies.find(m => m.slug === params.slug);
  
  if (!movie) {
    notFound();
  }

  // Mock video sources with different qualities
  const videoSources = [
    { quality: '360p', url: 'https://sample-videos.com/zip/10/mp4/mp4-1080p.mp4' },
    { quality: '720p', url: 'https://sample-videos.com/zip/10/mp4/mp4-1080p.mp4' },
    { quality: '1080p', url: 'https://sample-videos.com/zip/10/mp4/mp4-1080p.mp4' },
  ];

  const relatedMovies = mockMovies
    .filter(m => m.id !== movie.id && m.genres.some(g => movie.genres.some(mg => mg.id === g.id)))
    .slice(0, 8);

  return (
    <div className="min-h-screen" style={{backgroundColor: 'var(--bg-2)'}}>
      {/* Video Player Section */}
      <div className="w-full">
        <VideoPlayer 
          movie={movie}
          videoSources={videoSources}
        />
      </div>

      {/* Content Below Video */}
      <div className="w-[90%] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Movie Info */}
            <MovieInfo movie={movie} />
            
            {/* Comments Section */}
            <VideoComments movieId={movie.id} />
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <RelatedMovies movies={relatedMovies} />
          </div>
        </div>
      </div>
    </div>
  );
}

// Generate static params for all movies
export async function generateStaticParams() {
  return mockMovies.map((movie) => ({
    slug: movie.slug,
  }));
}
