'use client';

import { useState, useRef, useEffect } from 'react';
import ReactPlayer from 'react-player';
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
}

export function VideoPlayer({ movie, videoSources }: VideoPlayerProps) {
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

  // Fullscreen handling
  useEffect(() => {
    const handleFullscreenChange = () => {
      setFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const handlePlayPause = () => {
    setPlaying(!playing);
  };

  const handleProgress = (state: { played: number; loadedSeconds: number; playedSeconds: number }) => {
    setPlayed(state.played);
    // Fallback: nếu duration chưa được set, lấy từ progress state
    if (duration === 0 && state.loadedSeconds > 0) {
      setDuration(state.loadedSeconds);
    }
  };

  const handleSeekChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const seekTo = parseFloat(e.target.value);
    setPlayed(seekTo);
    playerRef.current?.seekTo(seekTo);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    setMuted(newVolume === 0);
  };

  const toggleMute = () => {
    setMuted(!muted);
  };

  const toggleFullscreen = async () => {
    if (!document.fullscreenElement) {
      await containerRef.current?.requestFullscreen();
    } else {
      await document.exitFullscreen();
    }
  };

  const handleMouseMove = () => {
    setShowControls(true);
  };

  const formatTime = (seconds: number) => {
    const date = new Date(seconds * 1000);
    const hh = date.getUTCHours();
    const mm = date.getUTCMinutes();
    const ss = date.getUTCSeconds().toString().padStart(2, '0');
    if (hh) {
      return `${hh}:${mm.toString().padStart(2, '0')}:${ss}`;
    }
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

      {/* Movie Title Overlay */}
      <div className={`absolute top-4 left-4 transition-opacity duration-300 ${showControls ? 'opacity-100' : 'opacity-0'}`}>
        <h1 className="text-white text-xl font-bold bg-black bg-opacity-50 px-3 py-1 rounded">
          {movie.title}
        </h1>
      </div>

      {/* Settings Panels */}
      {showSettings && (
        <div className="absolute top-4 right-4 bg-black bg-opacity-90 rounded-lg p-4 text-white min-w-48">
          <h3 className="font-semibold mb-3">Cài đặt video</h3>
          <QualitySelector
            qualities={videoSources}
            currentQuality={currentQuality}
            onQualityChange={setCurrentQuality}
          />
          <button
            onClick={() => setShowSubtitleSettings(!showSubtitleSettings)}
            className="block w-full text-left py-2 px-3 hover:bg-gray-700 rounded mt-2"
          >
            Cài đặt phụ đề
          </button>
        </div>
      )}

      {showSubtitleSettings && (
        <SubtitleSettings
          onClose={() => setShowSubtitleSettings(false)}
        />
      )}

      {/* Play/Pause Center Button */}
      <div 
        className={`absolute inset-0 flex items-center justify-center transition-opacity duration-300 ${
          showControls ? 'opacity-100' : 'opacity-0'
        }`}
        onClick={handlePlayPause}
      >
        <button className="bg-black bg-opacity-50 rounded-full p-4 hover:bg-opacity-70 transition-all">
          {playing ? (
            <PauseIcon className="h-12 w-12 text-white" />
          ) : (
            <PlayIcon className="h-12 w-12 text-white ml-1" />
          )}
        </button>
      </div>

      {/* Bottom Controls */}
      <div 
        className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent transition-opacity duration-300 ${
          showControls ? 'opacity-100' : 'opacity-0'
        }`}
      >
        {/* Progress Bar */}
        <div className="px-4 pb-2">
          <input
            type="range"
            min={0}
            max={1}
            step="any"
            value={played}
            onChange={handleSeekChange}
            className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
          />
        </div>

        {/* Controls Row */}
        <div className="flex items-center justify-between px-4 pb-4">
          {/* Left Controls */}
          <div className="flex items-center space-x-4">
            <button
              onClick={handlePlayPause}
              className="text-white hover:text-red-400 transition-colors"
            >
              {playing ? (
                <PauseIcon className="h-6 w-6" />
              ) : (
                <PlayIcon className="h-6 w-6" />
              )}
            </button>

            {/* Volume */}
            <div className="flex items-center space-x-2">
              <button
                onClick={toggleMute}
                className="text-white hover:text-red-400 transition-colors"
              >
                {muted || volume === 0 ? (
                  <SpeakerXMarkIcon className="h-6 w-6" />
                ) : (
                  <SpeakerWaveIcon className="h-6 w-6" />
                )}
              </button>
              <input
                type="range"
                min={0}
                max={1}
                step="any"
                value={muted ? 0 : volume}
                onChange={handleVolumeChange}
                className="w-20 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
              />
            </div>

            {/* Time Display */}
            <div className="text-white text-sm">
              {formatTime(played * duration)} / {formatTime(duration)}
            </div>
          </div>

          {/* Right Controls */}
          <div className="flex items-center space-x-4">
            <div className="text-white text-sm bg-red-600 px-2 py-1 rounded">
              {currentQuality}
            </div>
            
            <button
              onClick={() => setShowSettings(!showSettings)}
              className="text-white hover:text-red-400 transition-colors"
            >
              <Cog6ToothIcon className="h-6 w-6" />
            </button>

            <button
              onClick={toggleFullscreen}
              className="text-white hover:text-red-400 transition-colors"
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

      {/* Loading Spinner */}
      {!playing && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
        </div>
      )}
    </div>
  );
}
