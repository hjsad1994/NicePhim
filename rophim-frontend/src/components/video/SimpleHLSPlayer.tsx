'use client';

import React, { useRef, useEffect, useState } from 'react';
import Hls from 'hls.js';

interface SimpleHLSPlayerProps {
  hlsUrl: string;
  title?: string;
  className?: string;
}

const SimpleHLSPlayer: React.FC<SimpleHLSPlayerProps> = ({ 
  hlsUrl, 
  title, 
  className = '' 
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<Hls | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [controlsTimeout, setControlsTimeout] = useState<NodeJS.Timeout | null>(null);
  const [showQualityMenu, setShowQualityMenu] = useState(false);
  const [showSpeedMenu, setShowSpeedMenu] = useState(false);
  const [currentQuality, setCurrentQuality] = useState('1080p');
  const [playbackRate, setPlaybackRate] = useState(1);

  // Initialize HLS
  useEffect(() => {
    if (!hlsUrl || !videoRef.current) return;

    const video = videoRef.current;

    if (Hls.isSupported()) {
      const hls = new Hls();
      hlsRef.current = hls;
      hls.loadSource(hlsUrl);
      hls.attachMedia(video);
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = hlsUrl;
    }

    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
      }
    };
  }, [hlsUrl]);

  // Video event handlers
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleTimeUpdate = () => setCurrentTime(video.currentTime);
    const handleDurationChange = () => setDuration(video.duration);
    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);

    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('durationchange', handleDurationChange);
    video.addEventListener('play', handlePlay);
    video.addEventListener('pause', handlePause);

    return () => {
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('durationchange', handleDurationChange);
      video.removeEventListener('play', handlePlay);
      video.removeEventListener('pause', handlePause);
    };
  }, []);

  // Control functions
  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;
    
    if (video.paused) {
      video.play();
    } else {
      video.pause();
    }
  };

  const handleSeek = (time: number) => {
    const video = videoRef.current;
    if (!video) return;
    video.currentTime = time;
  };

  const seekForward = () => {
    const video = videoRef.current;
    if (!video) return;
    video.currentTime = Math.min(video.currentTime + 10, video.duration);
  };

  const seekBackward = () => {
    const video = videoRef.current;
    if (!video) return;
    video.currentTime = Math.max(video.currentTime - 10, 0);
  };

  const handleVolumeChange = (newVolume: number) => {
    const video = videoRef.current;
    if (!video) return;
    
    video.volume = newVolume;
    setVolume(newVolume);
    
    if (newVolume === 0) {
      video.muted = true;
      setIsMuted(true);
    } else {
      video.muted = false;
      setIsMuted(false);
    }
  };

  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;
    
    video.muted = !video.muted;
    setIsMuted(video.muted);
  };

  const toggleFullscreen = () => {
    const video = videoRef.current;
    if (!video) return;

    if (!document.fullscreenElement) {
      // Enter fullscreen
      if (video.requestFullscreen) {
        video.requestFullscreen();
      } else if ((video as any).webkitRequestFullscreen) {
        (video as any).webkitRequestFullscreen();
      } else if ((video as any).msRequestFullscreen) {
        (video as any).msRequestFullscreen();
      }
    } else {
      // Exit fullscreen
      if (document.exitFullscreen) {
        document.exitFullscreen();
      } else if ((document as any).webkitExitFullscreen) {
        (document as any).webkitExitFullscreen();
      } else if ((document as any).msExitFullscreen) {
        (document as any).msExitFullscreen();
      }
    }
  };

  const handleQualityChange = (quality: string) => {
    console.log('Before quality change:', currentQuality);
    setCurrentQuality(quality);
    setShowQualityMenu(false);
    console.log('After quality change:', quality);
    // Force re-render by updating state
    setTimeout(() => {
      console.log('Quality after timeout:', quality);
    }, 100);
    // TODO: Implement actual quality switching with HLS.js
  };

  const handlePlaybackRateChange = (rate: number) => {
    const video = videoRef.current;
    if (!video) return;
    
    console.log('Before speed change:', playbackRate);
    video.playbackRate = rate;
    setPlaybackRate(rate);
    setShowSpeedMenu(false);
    console.log('After speed change:', rate);
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  // Show/hide controls on mouse move
  const handleMouseMove = () => {
    setShowControls(true);
    
    // Clear existing timeout
    if (controlsTimeout) {
      clearTimeout(controlsTimeout);
    }
    
    // Set new timeout
    const timeout = setTimeout(() => {
      setShowControls(false);
    }, 3000);
    
    setControlsTimeout(timeout);
  };

  const handleMouseLeave = () => {
    // Clear existing timeout
    if (controlsTimeout) {
      clearTimeout(controlsTimeout);
    }
    
    // Set shorter timeout when leaving
    const timeout = setTimeout(() => {
      setShowControls(false);
    }, 1000);
    
    setControlsTimeout(timeout);
  };

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (controlsTimeout) {
        clearTimeout(controlsTimeout);
      }
    };
  }, [controlsTimeout]);

  // Debug state changes
  useEffect(() => {
    console.log('Current quality state:', currentQuality);
  }, [currentQuality]);

  useEffect(() => {
    console.log('Current playback rate state:', playbackRate);
  }, [playbackRate]);

  // Close menus when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showQualityMenu) {
        setShowQualityMenu(false);
      }
      if (showSpeedMenu) {
        setShowSpeedMenu(false);
      }
    };

    if (showQualityMenu || showSpeedMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showQualityMenu, showSpeedMenu]);

  return (
    <div 
      className={`relative bg-black rounded-lg overflow-hidden ${className}`}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ overflow: 'visible' }}
    >
      {/* Video Element */}
      <video
        ref={videoRef}
        className="w-full h-full cursor-pointer"
        onClick={(e) => {
          e.stopPropagation();
          togglePlay();
        }}
        onDoubleClick={(e) => {
          e.stopPropagation();
          toggleFullscreen();
        }}
      />


      {/* Controls Overlay */}
      {showControls && (
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none">
          {/* Title */}
          {title && (
            <div className="absolute top-4 left-4 text-white font-medium">
              {title}
            </div>
          )}

          {/* Bottom Controls */}
          <div className="absolute bottom-8 left-4 right-4">
            {/* Time Display and Progress Bar */}
            <div className="mb-4 pointer-events-auto">
              <div className="flex items-center justify-between text-white text-sm mb-2">
                <span>{formatTime(currentTime)}</span>
                <span>{formatTime(duration)}</span>
              </div>
              <input
                type="range"
                min="0"
                max={duration || 0}
                value={currentTime}
                onChange={(e) => handleSeek(parseFloat(e.target.value))}
                className="w-full h-1 bg-white/30 rounded-lg appearance-none cursor-pointer"
                style={{
                  background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${(currentTime / duration) * 100}%, rgba(255,255,255,0.3) ${(currentTime / duration) * 100}%, rgba(255,255,255,0.3) 100%)`
                }}
              />
            </div>

            {/* Control Buttons */}
            <div className="flex items-center justify-between pointer-events-auto">
              {/* Left Controls */}
              <div className="flex items-center space-x-3">
                {/* Play/Pause Button */}
                <button
                  onClick={togglePlay}
                  className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center text-white hover:bg-white/30 transition-colors"
                >
                  {isPlaying ? (
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 00-1 1v2a1 1 0 102 0V9a1 1 0 00-1-1zm6 0a1 1 0 00-1 1v2a1 1 0 102 0V9a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5 ml-0.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                    </svg>
                  )}
                </button>

                {/* Seek Backward Button */}
                <button
                  onClick={seekBackward}
                  className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center text-white hover:bg-white/30 transition-colors"
                  title="Tua lại 10 giây"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M8.445 14.832A1 1 0 0010 14v-2.798l5.445 3.63A1 1 0 0017 14V6a1 1 0 00-1.555-.832L10 8.798V6a1 1 0 00-1.555-.832l-6 4a1 1 0 000 1.664l6 4z"/>
                  </svg>
                </button>

                {/* Seek Forward Button */}
                <button
                  onClick={seekForward}
                  className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center text-white hover:bg-white/30 transition-colors"
                  title="Tua tới 10 giây"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M4.555 5.168A1 1 0 003 6v8a1 1 0 001.555.832L10 11.202V14a1 1 0 001.555.832l6-4a1 1 0 000-1.664l-6-4A1 1 0 0010 6v2.798L4.555 5.168z"/>
                  </svg>
                </button>

                {/* Volume Control */}
                <div className="flex items-center space-x-2">
                  <button
                    onClick={toggleMute}
                    className="text-white hover:text-gray-300 transition-colors"
                    title={isMuted ? "Bật âm thanh" : "Tắt âm thanh"}
                  >
                    {isMuted || volume === 0 ? (
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM12.293 7.293a1 1 0 011.414 0L15 8.586l1.293-1.293a1 1 0 111.414 1.414L16.414 10l1.293 1.293a1 1 0 01-1.414 1.414L15 11.414l-1.293 1.293a1 1 0 01-1.414-1.414L13.586 10l-1.293-1.293a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    ) : (
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM14.657 2.929a1 1 0 011.414 0A9.972 9.972 0 0119 10a9.972 9.972 0 01-2.929 7.071 1 1 0 01-1.414-1.414A7.971 7.971 0 0017 10c0-2.21-.894-4.208-2.343-5.657a1 1 0 010-1.414zm-2.829 2.828a1 1 0 011.415 0A5.983 5.983 0 0115 10a5.984 5.984 0 01-1.757 4.243 1 1 0 01-1.415-1.415A3.984 3.984 0 0013 10a3.983 3.983 0 00-1.172-2.828 1 1 0 010-1.415z" clipRule="evenodd" />
                      </svg>
                    )}
                  </button>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={isMuted ? 0 : volume}
                    onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
                    className="w-16 h-1 bg-white/30 rounded-lg appearance-none cursor-pointer"
                    style={{
                      background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${(isMuted ? 0 : volume) * 100}%, rgba(255,255,255,0.3) ${(isMuted ? 0 : volume) * 100}%, rgba(255,255,255,0.3) 100%)`
                    }}
                  />
                </div>
              </div>

              {/* Right Controls */}
              <div className="flex items-center space-x-3">
                {/* Quality Selector */}
                <div className="relative">
                  <button 
                    onClick={() => {
                      setShowQualityMenu(!showQualityMenu);
                      setShowSpeedMenu(false);
                    }}
                    className="px-3 py-2 bg-white/20 rounded-full flex items-center justify-center text-white hover:bg-white/30 transition-colors relative z-10"
                  >
                    <span key={currentQuality} className="text-xs font-medium">{currentQuality}</span>
                  </button>
                  
                  {/* Quality Menu */}
                  {showQualityMenu && (
                    <div className="absolute bottom-12 right-0 bg-black/90 rounded-lg p-2 min-w-[120px] z-20">
                      <div className="text-white text-xs font-medium mb-2 px-2">Chất lượng video</div>
                      {['360p', '480p', '720p', '1080p'].map((quality) => (
                        <button
                          key={quality}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleQualityChange(quality);
                          }}
                          className={`w-full text-left px-2 py-1 text-sm rounded hover:bg-white/20 transition-colors ${
                            currentQuality === quality ? 'text-blue-400' : 'text-white'
                          }`}
                        >
                          {quality}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Speed Selector */}
                <div className="relative">
                  <button 
                    onClick={() => {
                      setShowSpeedMenu(!showSpeedMenu);
                      setShowQualityMenu(false);
                    }}
                    className="px-3 py-2 bg-white/20 rounded-full flex items-center justify-center text-white hover:bg-white/30 transition-colors relative z-10"
                  >
                    <span key={playbackRate} className="text-xs font-medium">{playbackRate}x</span>
                  </button>
                  
                  {/* Speed Menu */}
                  {showSpeedMenu && (
                    <div className="absolute bottom-12 right-0 bg-black/90 rounded-lg p-2 min-w-[100px] z-20">
                      <div className="text-white text-xs font-medium mb-2 px-2">Tốc độ phát</div>
                      {[0.5, 0.75, 1, 1.25, 1.5, 2].map((rate) => (
                        <button
                          key={rate}
                          onClick={(e) => {
                            e.stopPropagation();
                            handlePlaybackRateChange(rate);
                          }}
                          className={`w-full text-left px-2 py-1 text-sm rounded hover:bg-white/20 transition-colors ${
                            playbackRate === rate ? 'text-blue-400' : 'text-white'
                          }`}
                        >
                          {rate}x
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Fullscreen Button */}
                <button 
                  onClick={toggleFullscreen}
                  className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center text-white hover:bg-white/30 transition-colors relative z-10 overflow-visible"
                  title="Toàn màn hình"
                >
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z"/>
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SimpleHLSPlayer;
