'use client';

import { useState, useRef, useEffect } from 'react';
import ReactPlayer from 'react-player';
import { HLSVideoPlayer } from './HLSVideoPlayer';
import SimpleHLSPlayer from './SimpleHLSPlayer';
import { 
  PlayIcon, 
  PauseIcon, 
  SpeakerWaveIcon, 
  SpeakerXMarkIcon,
  ArrowsPointingOutIcon,
  ArrowsPointingInIcon,
  Cog6ToothIcon
} from '@heroicons/react/24/solid';
import { Movie } from '@/types/movie';
import { SubtitleSettings } from './SubtitleSettings';
import { QualitySelector } from './QualitySelector';

interface VideoSource {
  quality: string;
  url: string;
}

interface VideoPlayerProps {
  movie: Movie;
  videoSources: VideoSource[];
  hlsUrl?: string; // Optional HLS URL for real uploaded videos
}

export function VideoPlayer({ movie, videoSources, hlsUrl }: VideoPlayerProps) {
  const playerRef = useRef<ReactPlayer>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(false);
  const [volume, setVolume] = useState(0.8);
  const [played, setPlayed] = useState(0);
  const [duration, setDuration] = useState(0);
  const [fullscreen, setFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [currentQuality, setCurrentQuality] = useState(videoSources[0]?.quality || '720p');
  const [showSettings, setShowSettings] = useState(false);
  const [showSubtitleSettings, setShowSubtitleSettings] = useState(false);

  // Auto-hide controls
  useEffect(() => {
    let timeout: NodeJS.Timeout;
    
    if (playing && showControls) {
      timeout = setTimeout(() => {
        setShowControls(false);
      }, 3000);
    }
    
    return () => clearTimeout(timeout);
  }, [playing, showControls]);

  // Fullscreen change handler
  useEffect(() => {
    const handleFullscreenChange = () => {
      setFullscreen(!!document.fullscreenElement);
    };
    
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const handleMouseMove = () => {
    setShowControls(true);
  };

  const handleProgress = (progress: { played: number }) => {
    setPlayed(progress.played);
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const seekTime = parseFloat(e.target.value);
    setPlayed(seekTime);
    if (playerRef.current) {
      playerRef.current.seekTo(seekTime);
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    setMuted(newVolume === 0);
  };

  const toggleMute = () => {
    setMuted(!muted);
  };

  const togglePlay = () => {
    setPlaying(!playing);
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  };

  const formatTime = (time: number) => {
    const hours = Math.floor(time / 3600);
    const minutes = Math.floor((time % 3600) / 60);
    const seconds = Math.floor(time % 60);
    
    if (hours > 0) {
      const hh = hours.toString().padStart(2, '0');
      const mm = minutes.toString().padStart(2, '0');
      const ss = seconds.toString().padStart(2, '0');
      return `${hh}:${mm}:${ss}`;
    }
    const mm = minutes.toString().padStart(2, '0');
    const ss = seconds.toString().padStart(2, '0');
    return `${mm}:${ss}`;
  };

  const currentVideoSource = videoSources.find(source => source.quality === currentQuality);

  return (
    <div 
      ref={containerRef}
      className={`relative w-full ${fullscreen ? 'h-screen' : 'aspect-video'} bg-black group`}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => setShowControls(false)}
    >
      {/* Video Player */}
      {hlsUrl ? (
        <SimpleHLSPlayer
          hlsUrl={hlsUrl}
          title={movie.title}
          className="w-full h-full"
        />
      ) : (
        <ReactPlayer
          ref={playerRef}
          url={currentVideoSource?.url}
          width="100%"
          height="100%"
          playing={playing}
          muted={muted}
          volume={volume}
          onProgress={handleProgress}
          onReady={() => {
            console.log('Player ready');
            if (playerRef.current) {
              setDuration(playerRef.current.getDuration());
            }
          }}
          config={{
            file: {
              attributes: {
                crossOrigin: 'anonymous',
              }
            }
          }}
        />
      )}

      {/* Movie Title Overlay - Only show for ReactPlayer */}
      {!hlsUrl && (
        <div className={`absolute top-4 left-4 transition-opacity duration-300 ${showControls ? 'opacity-100' : 'opacity-0'}`}>
          <h1 className="text-white text-xl font-bold bg-black bg-opacity-50 px-3 py-1 rounded">
            {movie.title}
          </h1>
        </div>
      )}

      {/* Settings Panels - Only show for ReactPlayer */}
      {!hlsUrl && showSettings && (
        <div className="absolute top-4 right-4 bg-black bg-opacity-90 rounded-lg p-4 text-white min-w-48">
          <h3 className="font-semibold mb-3">Cài đặt video</h3>
          <QualitySelector
            qualities={videoSources}
            currentQuality={currentQuality}
            onQualityChange={setCurrentQuality}
          />
          <button
            onClick={() => setShowSubtitleSettings(!showSubtitleSettings)}
            className="w-full mt-3 px-3 py-2 bg-gray-700 hover:bg-gray-600 rounded text-sm transition-colors"
          >
            Phụ đề
          </button>
        </div>
      )}

      {!hlsUrl && showSubtitleSettings && (
        <div className="absolute top-4 right-4 bg-black bg-opacity-90 rounded-lg p-4 text-white min-w-48">
          <SubtitleSettings />
        </div>
      )}

      {/* Controls Overlay - Only show for ReactPlayer, not HLSVideoPlayer */}
      {!hlsUrl && (
        <div className={`absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent transition-opacity duration-300 ${showControls ? 'opacity-100' : 'opacity-0'}`}>
        {/* Top Controls */}
        <div className="absolute top-4 right-4 flex space-x-2">
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="text-white hover:text-gray-300 transition-colors"
          >
            <Cog6ToothIcon className="h-6 w-6" />
          </button>
        </div>

        {/* Center Play Button */}
        <div className="absolute inset-0 flex items-center justify-center">
          <button
            onClick={togglePlay}
            className="text-white hover:text-gray-300 transition-colors"
          >
            {playing ? (
              <PauseIcon className="h-16 w-16" />
            ) : (
              <PlayIcon className="h-16 w-16" />
            )}
          </button>
        </div>

        {/* Bottom Controls */}
        <div className="absolute bottom-4 left-4 right-4">
          {/* Progress Bar */}
          <div className="mb-4">
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={played}
              onChange={handleSeek}
              className="w-full h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer slider"
            />
          </div>

          {/* Control Buttons */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={togglePlay}
                className="text-white hover:text-gray-300 transition-colors"
              >
                {playing ? (
                  <PauseIcon className="h-6 w-6" />
                ) : (
                  <PlayIcon className="h-6 w-6" />
                )}
              </button>

              <div className="flex items-center space-x-2">
                <button
                  onClick={toggleMute}
                  className="text-white hover:text-gray-300 transition-colors"
                >
                  {muted ? (
                    <SpeakerXMarkIcon className="h-6 w-6" />
                  ) : (
                    <SpeakerWaveIcon className="h-6 w-6" />
                  )}
                </button>
                
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={muted ? 0 : volume}
                  onChange={handleVolumeChange}
                  className="w-20 h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer slider"
                />
              </div>

              <span className="text-white text-sm">
                {formatTime(played * duration)} / {formatTime(duration)}
              </span>
            </div>

            <div className="flex items-center space-x-4">
              <button
                onClick={toggleFullscreen}
                className="text-white hover:text-gray-300 transition-colors"
              >
                {fullscreen ? (
                  <ArrowsPointingInIcon className="h-6 w-6" />
                ) : (
                  <ArrowsPointingOutIcon className="h-6 w-6" />
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
      )}
    </div>
  );
}