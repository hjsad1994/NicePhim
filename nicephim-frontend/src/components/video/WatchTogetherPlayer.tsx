'use client';

import React, { useRef, useEffect, useState, useCallback } from 'react';
import Hls, { Level } from 'hls.js';
import SockJS from 'sockjs-client';
import { Client } from '@stomp/stompjs';

// Define proper types for fullscreen API
interface FullscreenElement extends Element {
  webkitRequestFullscreen?: () => Promise<void>;
  webkitExitFullscreen?: () => Promise<void>;
  msRequestFullscreen?: () => Promise<void>;
  msExitFullscreen?: () => Promise<void>;
}

interface FullscreenDocument extends Document {
  webkitExitFullscreen?: () => Promise<void>;
  msExitFullscreen?: () => Promise<void>;
}

interface WatchTogetherPlayerProps {
  hlsUrl: string;
  title?: string;
  roomId: string;
  isHost: boolean;
  onHostChange: (isHost: boolean) => void;
  roomCreator: string;
  currentUser: string;
  broadcastMode?: boolean;
  broadcastStartTime?: number;
  broadcastStatus?: string;
  className?: string;
}

interface ChatMessage {
  username: string;
  message: string;
  timestamp: number;
  type: 'chat' | 'system' | 'user_join';
}

interface ControlMessage {
  type: 'control' | 'global_control' | 'error';
  action: 'play' | 'pause' | 'seek';
  time: number;
  username: string;
  timestamp: number;
  error?: string; // For error messages
  currentPosition?: number; // For global controls
}

const WatchTogetherPlayer: React.FC<WatchTogetherPlayerProps> = ({
  hlsUrl,
  title,
  roomId,
  isHost,
  onHostChange,
  roomCreator,
  currentUser,
  broadcastMode = false,
  broadcastStartTime,
  broadcastStatus,
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
  const [availableLevels, setAvailableLevels] = useState<Level[]>([]);
  const [currentLevel, setCurrentLevel] = useState(-1);

  // WebSocket state
  const [stompClient, setStompClient] = useState<Client | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  
  // Broadcast mode state
  const [serverTime, setServerTime] = useState(0);
  const [broadcastActive, setBroadcastActive] = useState(false);

  // Chat state
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [newChatMessage, setNewChatMessage] = useState('');
  const [showChat, setShowChat] = useState(true);
  const [editingUsername, setEditingUsername] = useState(false);
  const [tempUsername, setTempUsername] = useState(currentUser);

  // Log props in useEffect to avoid accessing currentUser before initialization
  useEffect(() => {
    console.log('🎬 WatchTogetherPlayer props:', {
      hlsUrl,
      title,
      roomId,
      isHost,
      roomCreator,
      currentUser
    });
  }, [hlsUrl, title, roomId, isHost, roomCreator, currentUser]);

  // Initialize HLS
  useEffect(() => {
    if (!hlsUrl || !videoRef.current) return;

    const video = videoRef.current;
    console.log('🎬 Initializing HLS with URL:', hlsUrl);

    if (Hls.isSupported()) {
      const hls = new Hls({
        enableWorker: true,
        lowLatencyMode: false,
        backBufferLength: 90,
        maxBufferLength: 30,
        maxMaxBufferLength: 600,
        liveSyncDurationCount: 0,
        liveMaxLatencyDurationCount: 5,
        // Add these for better browser compatibility
        debug: true,
        enableSoftwareAES: true,
        capLevelToPlayerSize: true,
        startLevel: -1,
        testBandwidth: true,
        xhrSetup: (xhr, url) => {
          console.log('🔄 HLS XHR request to:', url);
          // Add cache-busting headers and better CORS handling
          xhr.setRequestHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
          xhr.setRequestHeader('Pragma', 'no-cache');
          xhr.setRequestHeader('Expires', '0');
          // Some browsers need this for CORS
          xhr.withCredentials = false;
        }
      });

      hlsRef.current = hls;

      // Listen for manifest loaded to get available levels
      hls.on(Hls.Events.MANIFEST_PARSED, (event, data) => {
        console.log('🎯 HLS Manifest loaded, available levels:', data.levels);
        setAvailableLevels(data.levels);

        // Set initial quality to highest available
        if (data.levels.length > 0) {
          const highestLevel = data.levels.length - 1;
          hls.currentLevel = highestLevel;
          setCurrentLevel(highestLevel);

          // Update quality display based on actual level
          const level = data.levels[highestLevel];
          const qualityText = getQualityTextFromLevel(level);
          setCurrentQuality(qualityText);
          console.log('🎯 Set initial quality to:', qualityText, 'Level:', highestLevel);
        }
      });

      // Listen for level changes
      hls.on(Hls.Events.LEVEL_SWITCHED, (event, data) => {
        console.log('🎯 Level switched to:', data.level);
        setCurrentLevel(data.level);

        // Get current levels from HLS instance
        const currentLevels = hls.levels;
        if (data.level >= 0 && currentLevels && currentLevels[data.level]) {
          const level = currentLevels[data.level];
          const qualityText = getQualityTextFromLevel(level);
          setCurrentQuality(qualityText);
          console.log('🎯 Updated quality display to:', qualityText);
        }
      });

      // Add comprehensive error handling
      hls.on(Hls.Events.ERROR, (event, data) => {
        console.error('❌ HLS Error:', data.type, data.details, data);
        if (data.fatal) {
          switch (data.type) {
            case Hls.ErrorTypes.NETWORK_ERROR:
              console.error('🌐 Network error, trying to recover...');
              hls.startLoad();
              break;
            case Hls.ErrorTypes.MEDIA_ERROR:
              console.error('🎥 Media error, trying to recover...');
              hls.recoverMediaError();
              break;
            default:
              console.error('💥 Fatal error, cannot recover');
              break;
          }
        }
      });

      hls.on(Hls.Events.MANIFEST_LOADED, (event, data) => {
        console.log('✅ HLS Manifest loaded successfully:', data);
      });

      hls.on(Hls.Events.LEVEL_LOADED, (event, data) => {
        console.log('📺 Level loaded:', data.level, data.details);
      });

      hls.loadSource(hlsUrl);
      hls.attachMedia(video);
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      console.log('🍎 Using native HLS support for Safari');
      video.src = hlsUrl;
    } else {
      console.error('❌ HLS not supported in this browser');
    }

    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
      }
    };
  }, [hlsUrl]);

  // Utility function to format time
  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  
  
  // Initialize WebSocket connection
  useEffect(() => {
    console.log('🔌 Initializing WebSocket connection...');
    console.log('📍 Backend URL: http://localhost:8080/ws');
    console.log('📋 Room ID:', roomId);

    const socket = new SockJS('http://localhost:8080/ws');
    const client = new Client({
      webSocketFactory: () => socket,
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
      debug: (str) => {
        console.log('🔌 STOMP Debug:', str);
      }
    });

    client.onConnect = () => {
      console.log('✅ WebSocket connected successfully');
      console.log('📡 Subscribing to room topic:', `/topic/room.${roomId}`);
      console.log('📋 Client state before setting connected:', isConnected);

      // Set connected state immediately
      setIsConnected(true);
      console.log('📋 Client state after setting connected:', true);

      // Subscribe to room messages
      try {
        const topic = `/topic/room.${roomId}`;
        console.log('📨 Subscribing to topic:', topic);
        const subscription = client.subscribe(topic, (message) => {
          console.log('📨 Received message from room topic:', topic);
          console.log('📋 Message body:', message.body);
          console.log('📋 Message headers:', message.headers);
          try {
            const data = JSON.parse(message.body);
            console.log('📋 Parsed message data:', data);
            handleRoomMessage(data);
          } catch (error) {
            console.error('❌ Error parsing WebSocket message:', error);
            console.log('Raw message:', message.body);
          }
        });
        console.log('✅ Subscription successful:', subscription);
        console.log('✅ Subscription ID:', subscription.id);
      } catch (error) {
        console.error('❌ Error subscribing to room topic:', error);
      }

      // Join room
      console.log('📋 Sending join message...');
      sendJoin(client);
    };

    client.onStompError = (frame) => {
      console.error('❌ WebSocket STOMP error:', frame);
      console.error('Error details:', frame.headers, frame.body);
      setIsConnected(false);
    };

    client.onWebSocketError = (error) => {
      console.error('❌ WebSocket connection error:', error);
      setIsConnected(false);
    };

    client.onWebSocketClose = () => {
      console.log('🔌 WebSocket connection closed');
      setIsConnected(false);
    };

    client.beforeConnect = () => {
      console.log('🔄 WebSocket about to connect...');
    };

    client.onDisconnect = () => {
      console.log('🔌 WebSocket disconnected');
      setIsConnected(false);
    };

    console.log('🚀 Activating STOMP client...');
    try {
      client.activate();
      setStompClient(client);
      console.log('✅ STOMP client activated successfully');
    } catch (error) {
      console.error('❌ Error activating STOMP client:', error);
    }

    return () => {
      if (client && client.connected) {
        console.log('🔌 Deactivating STOMP client...');
        client.deactivate();
        setIsConnected(false);
      }
    };
  }, [roomId]);

  const handleRoomMessage = useCallback((data: unknown) => {
    console.log('📨 Received WebSocket message:', data);

    const messageData = data as ControlMessage | ChatMessage | { type: string; [key: string]: unknown };

    switch(messageData.type) {
      case 'control':
      case 'global_control':
        console.log('🎮 Control message received:', messageData);
        // Basic control message handling
        const controlData = messageData as ControlMessage;
        console.log('🎮 Control action:', controlData.action);
        break;
      case 'local_control':
        console.log('🎮 Local control message received:', messageData);
        // Local control messages are just for information, no action needed
        break;
      case 'error':
        console.log('❌ Error message received:', messageData);
        setChatMessages(prev => [...prev, {
          username: 'system',
          message: `❌ ${(messageData as ControlMessage).error}`,
          timestamp: Date.now(),
          type: 'system'
        }]);
        break;
      case 'chat':
        console.log('💬 Chat message received:', messageData);
        console.log('💬 Chat message details:', {
          username: (messageData as ChatMessage).username,
          message: (messageData as ChatMessage).message,
          timestamp: (messageData as ChatMessage).timestamp
        });
        // Handle async username resolution
        (async () => {
          const receivedUsername = (messageData as ChatMessage).username || 'Anonymous';
          const displayUsername = await getDisplayUsername(receivedUsername);

          console.log('💬 Processing chat message:', {
            receivedUsername,
            displayUsername,
            isUUID: receivedUsername !== displayUsername
          });

          setChatMessages(prev => {
            const newMessages = [...prev, {
              username: displayUsername,
              message: (messageData as ChatMessage).message,
              timestamp: (messageData as ChatMessage).timestamp,
              type: 'chat'
            }];
            console.log('💬 Updated chat messages:', newMessages);
            return newMessages;
          });
        })();
        break;
      case 'user_join':
        console.log('👋 User join message received');
        // Handle async username resolution for join messages
        (async () => {
          const joinUsername = (messageData as ChatMessage).username || 'Anonymous';
          const displayJoinUsername = await getDisplayUsername(joinUsername);

          setChatMessages(prev => [...prev, {
            username: 'system',
            message: `${displayJoinUsername} đã tham gia phòng`,
            timestamp: (messageData as ChatMessage).timestamp,
            type: 'user_join'
          }]);
        })();
        break;
      default:
        console.log('❓ Unknown message type:', messageData.type);
    }
  }, [currentUser, stompClient, isConnected, roomId, roomCreator]);

  
  
  // Helper function to check WebSocket connection reliably
  const isWebSocketConnected = useCallback(() => {
    return stompClient && stompClient.connected;
  }, [stompClient]);

  const sendControl = useCallback((action: 'play' | 'pause' | 'seek', time: number) => {
    if (isWebSocketConnected()) {
      // All users can send control messages, server will validate permissions
      stompClient.publish({
        destination: `/app/room/${roomId}/control`,
        body: JSON.stringify({
          type: 'control',
          action,
          time,
          username: currentUser,
          timestamp: Date.now()
        })
      });
    }
  }, [stompClient, isConnected, roomId, currentUser]);

  // Cache for UUID to username mappings to avoid repeated API calls
  const [usernameCache, setUsernameCache] = useState<Map<string, string>>(new Map());

  // Helper function to convert UUID to username if needed
  const getDisplayUsername = useCallback(async (username: string): Promise<string> => {
    // Check if the username looks like a UUID
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

    if (!uuidRegex.test(username)) {
      return username; // Not a UUID, return as-is
    }

    // Check cache first
    if (usernameCache.has(username)) {
      return usernameCache.get(username)!;
    }

    try {
      // Try to get username from backend API
      const response = await fetch(`http://localhost:8080/api/auth/users/${username}/username`);
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.username) {
          // Update cache
          setUsernameCache(prev => new Map(prev).set(username, data.username));
          return data.username;
        }
      }
    } catch (error) {
      console.warn('Failed to fetch username for UUID:', username, error);
    }

    // Fallback: return a truncated version of the UUID
    return `User_${username.substring(0, 8)}`;
  }, [usernameCache]);

  const sendChat = useCallback((message: string) => {
    console.log('💬 sendChat called:', {
      message,
      currentUser,
      roomId,
      connected: isWebSocketConnected(),
      stompClientExists: !!stompClient,
      stompClientConnected: stompClient?.connected
    });

    if (isWebSocketConnected()) {
      const chatMessage = {
        type: 'chat',
        message,
        username: currentUser,
        timestamp: Date.now()
      };
      console.log('💬 Sending chat message:', chatMessage);
      console.log('💬 Destination:', `/app/room/${roomId}/chat`);

      stompClient.publish({
        destination: `/app/room/${roomId}/chat`,
        body: JSON.stringify(chatMessage)
      });
      console.log('💬 Chat message sent successfully');
    } else {
      console.error('💬 Cannot send chat - WebSocket not connected');
    }
  }, [stompClient, isConnected, roomId, currentUser]);

  const sendJoin = useCallback((client: Client) => {
    console.log('📋 Sending join message...');
    console.log('📋 Username:', currentUser);
    console.log('📋 Room ID:', roomId);
    console.log('📋 Client connected:', client.connected);

    if (client.connected) {
      try {
        client.publish({
          destination: `/app/room/${roomId}/join`,
          body: JSON.stringify({
            username: currentUser
          })
        });
        console.log('✅ Join message sent successfully');
      } catch (error) {
        console.error('❌ Error sending join message:', error);
      }
    } else {
      console.error('❌ Cannot send join message - client not connected');
    }
  }, [roomId, currentUser]);

  // Video event handlers
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleTimeUpdate = () => {
      setCurrentTime(video.currentTime);
    };
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
  }, [currentUser, roomCreator]);

  // Helper function to convert HLS level to quality text
  const getQualityTextFromLevel = (level: Level) => {
    if (!level || !level.height) return 'Unknown';

    const height = level.height;
    if (height <= 360) return '360p';
    if (height <= 480) return '480p';
    if (height <= 720) return '720p';
    if (height <= 1080) return '1080p';
    return '4K';
  };

  // Helper function to find level index by quality text
  const getLevelIndexByQuality = (qualityText: string) => {
    const targetHeight = qualityText === '360p' ? 360 :
                        qualityText === '480p' ? 480 :
                        qualityText === '720p' ? 720 :
                        qualityText === '1080p' ? 1080 : 1080;

    return availableLevels.findIndex(level => level.height === targetHeight);
  };

  // Control functions
  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;

    // Just control local video, don't broadcast to others
    if (video.paused) {
      video.play().catch(err => console.error('Error playing video:', err));
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
      if (video.requestFullscreen) {
        video.requestFullscreen();
      } else {
        const fullscreenVideo = video as FullscreenElement;
        if (fullscreenVideo.webkitRequestFullscreen) {
          fullscreenVideo.webkitRequestFullscreen();
        } else if (fullscreenVideo.msRequestFullscreen) {
          fullscreenVideo.msRequestFullscreen();
        }
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      } else {
        const fullscreenDoc = document as FullscreenDocument;
        if (fullscreenDoc.webkitExitFullscreen) {
          fullscreenDoc.webkitExitFullscreen();
        } else if (fullscreenDoc.msExitFullscreen) {
          fullscreenDoc.msExitFullscreen();
        }
      }
    }
  };

  const handleQualityChange = (quality: string) => {
    if (hlsRef.current && availableLevels.length > 0) {
      const targetLevelIndex = getLevelIndexByQuality(quality);

      if (targetLevelIndex >= 0) {
        hlsRef.current.currentLevel = targetLevelIndex;
      } else {
        setShowQualityMenu(false);
        return;
      }
    }

    setCurrentQuality(quality);
    setShowQualityMenu(false);
  };

  const handlePlaybackRateChange = (rate: number) => {
    const video = videoRef.current;
    if (!video) return;

    video.playbackRate = rate;
    setPlaybackRate(rate);
    setShowSpeedMenu(false);
  };

  const sendChatMessage = () => {
    const message = newChatMessage.trim();
    if (message) {
      sendChat(message);
      setNewChatMessage('');
    }
  };

  // Show/hide controls on mouse move
  const handleMouseMove = () => {
    setShowControls(true);

    if (controlsTimeout) {
      clearTimeout(controlsTimeout);
    }

    const timeout = setTimeout(() => {
      setShowControls(false);
    }, 3000);

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

  // WebSocket connection state monitoring
  useEffect(() => {
    if (stompClient) {
      const actualConnected = stompClient.connected;
      console.log('🔍 WebSocket state monitoring:');
      console.log('📋 stompClient.connected:', stompClient.connected);
      console.log('📋 stompClient.connected:', stompClient.connected);
      console.log('📋 isConnected state:', isConnected);
      console.log('📋 actualConnected:', actualConnected);

      // Update state if there's a mismatch (use more comprehensive check)
      if (actualConnected !== isConnected) {
        console.log('🔄 Updating WebSocket connection state:', actualConnected);
        setIsConnected(actualConnected);
      }
    }
  }, [stompClient, isConnected]);

  // Connection retry mechanism
  useEffect(() => {
    const actualConnected = stompClient && stompClient.connected;
    if (!actualConnected) {
      console.log('🔄 WebSocket not connected, checking if reconnection needed...');
      console.log('📋 Reconnection check:', {
        stompClient: !!stompClient,
        actualConnected,
        roomId: !!roomId,
        currentUser: !!currentUser
      });

      // Only attempt reconnection if we have a room ID and user, and client doesn't exist
      if (roomId && currentUser && !stompClient) {
        console.log('🔄 Attempting to reconnect WebSocket...');

        const reconnectTimer = setTimeout(() => {
          console.log('🔄 Reconnecting WebSocket...');
          const socket = new SockJS('http://localhost:8080/ws');
          const client = new Client({
            webSocketFactory: () => socket,
            reconnectDelay: 5000,
            heartbeatIncoming: 4000,
            heartbeatOutgoing: 4000,
            debug: (str) => {
              console.log('🔌 STOMP Debug (reconnect):', str);
            }
          });

          client.onConnect = () => {
            console.log('✅ WebSocket reconnected successfully');
            setIsConnected(true);
            setStompClient(client);

            // Subscribe to room messages
            client.subscribe(`/topic/room.${roomId}`, (message) => {
              console.log('📨 Received message from room topic (reconnect)');
              try {
                const data = JSON.parse(message.body);
                handleRoomMessage(data);
              } catch (error) {
                console.error('❌ Error parsing WebSocket message (reconnect):', error);
              }
            });

            // Join room
            sendJoin(client);
          };

          client.onStompError = (frame) => {
            console.error('❌ WebSocket STOMP error (reconnect):', frame);
            setIsConnected(false);
          };

          client.onWebSocketError = (error) => {
            console.error('❌ WebSocket connection error (reconnect):', error);
            setIsConnected(false);
          };

          client.onWebSocketClose = () => {
            console.log('🔌 WebSocket connection closed (reconnect)');
            setIsConnected(false);
          };

          try {
            client.activate();
            console.log('✅ STOMP client activated (reconnect)');
          } catch (error) {
            console.error('❌ Error activating STOMP client (reconnect):', error);
          }
        }, 3000);

        return () => clearTimeout(reconnectTimer);
      }
    }
  }, [stompClient, isConnected, roomId, currentUser]);

  // Close menus when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;

      if (showQualityMenu && !target.closest('[data-quality-menu]')) {
        setShowQualityMenu(false);
      }
      if (showSpeedMenu && !target.closest('[data-speed-menu]')) {
        setShowSpeedMenu(false);
      }
    };

    if (showQualityMenu || showSpeedMenu) {
      document.addEventListener('click', handleClickOutside);
    }

    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [showQualityMenu, showSpeedMenu]);

  return (
    <div className={`relative bg-black rounded-lg overflow-hidden w-full ${className}`}>
      {/* Video Element */}
      <div className="relative">
        <video
          ref={videoRef}
          className="w-full h-auto cursor-pointer"
          onClick={(e) => {
            e.stopPropagation();
            togglePlay();
          }}
          onDoubleClick={(e) => {
            e.stopPropagation();
            toggleFullscreen();
          }}
        />

        {/* Connection Status */}
        <div className={`absolute top-2 right-2 px-2 py-1 rounded text-xs font-medium ${
          stompClient?.connected ? 'bg-green-500/80 text-white' : 'bg-red-500/80 text-white'
        }`}>
          {stompClient?.connected ? '🟢 Đã kết nối' : '🔴 Mất kết nối'}
        </div>

        {/* Broadcast Status */}
        {broadcastMode && (
          <div className={`absolute top-2 left-2 px-2 py-1 rounded text-xs font-medium ${
            broadcastActive ? 'bg-blue-500/80 text-white' : 'bg-yellow-500/80 text-white'
          }`}>
            {broadcastActive ? '📺 Đang phát' : '⏰ Chờ phát'}
          </div>
        )}

        {/* User Status */}
        <div className={`absolute top-2 left-2 px-2 py-1 rounded text-xs font-medium ${
          currentUser === roomCreator ? 'bg-blue-500/80 text-white' : 'bg-gray-500/80 text-white'
        }`}>
          {editingUsername ? (
            <div className="flex items-center space-x-2">
              <input
                type="text"
                value={tempUsername}
                onChange={(e) => setTempUsername(e.target.value)}
                className="bg-black/50 text-white px-2 py-1 rounded text-xs border border-white/30 focus:border-white/60 focus:outline-none"
                placeholder="Nhập tên..."
                autoFocus
                onBlur={() => {
                  if (tempUsername.trim()) {
                    // Update localStorage
                    try {
                      localStorage.setItem('watchTogetherUser', tempUsername.trim());
                      // Force page reload to update currentUser
                      window.location.reload();
                    } catch (error) {
                      console.error('Error updating username:', error);
                    }
                  }
                  setEditingUsername(false);
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.currentTarget.blur();
                  } else if (e.key === 'Escape') {
                    setTempUsername(currentUser);
                    setEditingUsername(false);
                  }
                }}
              />
            </div>
          ) : (
            <div className="flex items-center space-x-2 cursor-pointer" onClick={() => setEditingUsername(true)}>
              <span>{currentUser === roomCreator ? '👑' : '👥'}</span>
              <span className="truncate max-w-32">{currentUser}</span>
              <span className="text-xs opacity-70">(✏️)</span>
            </div>
          )}
        </div>

        {/* Controls Overlay */}
        {showControls && (
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none">
            {/* Bottom Controls */}
            <div className="absolute bottom-4 left-4 right-4">
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
                  {/* Play/Pause Button - All users can control */}
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
                  <div className="relative" data-quality-menu>
                    <button
                      onClick={() => {
                        setShowQualityMenu(!showQualityMenu);
                        setShowSpeedMenu(false);
                      }}
                      className="px-3 py-2 bg-white/20 rounded-full flex items-center justify-center text-white hover:bg-white/30 transition-colors relative z-10"
                    >
                      <span className="text-xs font-medium">{currentQuality}</span>
                    </button>

                    {showQualityMenu && (
                      <div className="absolute bottom-12 right-0 bg-black/90 rounded-lg p-2 min-w-[120px] z-20">
                        <div className="text-white text-xs font-medium mb-2 px-2">Chất lượng video</div>
                        {availableLevels.length > 0 ? (
                          availableLevels.map((level, index) => {
                            const qualityText = getQualityTextFromLevel(level);
                            return (
                              <button
                                key={index}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleQualityChange(qualityText);
                                }}
                                className={`w-full text-left px-2 py-1 text-sm rounded hover:bg-white/20 transition-colors ${
                                  currentLevel === index ? 'text-blue-400' : 'text-white'
                                }`}
                              >
                                {qualityText} {level.height ? `(${level.height}p)` : ''}
                              </button>
                            );
                          })
                        ) : (
                          ['360p', '480p', '720p', '1080p'].map((quality) => (
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
                          ))
                        )}
                      </div>
                    )}
                  </div>

                  {/* Speed Selector */}
                  <div className="relative" data-speed-menu>
                    <button
                      onClick={() => {
                        setShowSpeedMenu(!showSpeedMenu);
                        setShowQualityMenu(false);
                      }}
                      className="px-3 py-2 bg-white/20 rounded-full flex items-center justify-center text-white hover:bg-white/30 transition-colors relative z-10"
                    >
                      <span className="text-xs font-medium">{playbackRate}x</span>
                    </button>

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

                  {/* Chat Toggle */}
                  <button
                    onClick={() => setShowChat(!showChat)}
                    className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center text-white hover:bg-white/30 transition-colors"
                    title={showChat ? "Ẩn chat" : "Hiện chat"}
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 5v8a2 2 0 01-2 2h-5l-5 4v-4H4a2 2 0 01-2-2V5a2 2 0 012-2h12a2 2 0 012 2zM7 8H5v2h2V8zm2 0h2v2H9V8zm6 0h-2v2h2V8z" clipRule="evenodd" />
                    </svg>
                  </button>

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

      {/* Chat Panel */}
      {showChat && (
        <div className="absolute bottom-20 right-4 w-80 bg-black/90 rounded-lg border border-gray-400/30 flex flex-col" style={{ maxHeight: '300px' }}>
          {/* Chat Header */}
          <div className="flex items-center justify-between p-3 border-b border-gray-400/30">
            <h3 className="text-white font-medium text-sm">Chat phòng</h3>
            <span className="text-gray-400 text-xs">{chatMessages.length} tin nhắn</span>
          </div>

          {/* Chat Messages */}
          <div className="flex-1 overflow-y-auto p-3 space-y-2">
            {chatMessages.map((msg, index) => (
              <div key={index} className={`text-sm ${
                msg.type === 'system' ? 'text-yellow-400 italic' :
                msg.type === 'user_join' ? 'text-green-400 italic' :
                'text-white'
              }`}>
                {msg.type !== 'system' && msg.type !== 'user_join' && (
                  <span className="font-medium text-blue-400">{msg.username}: </span>
                )}
                {msg.message}
              </div>
            ))}
          </div>

          {/* Chat Input */}
          <div className="p-3 border-t border-gray-400/30">
            <div className="flex gap-2">
              <input
                type="text"
                value={newChatMessage}
                onChange={(e) => setNewChatMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && sendChatMessage()}
                placeholder="Nhập tin nhắn..."
                maxLength={500}
                className="flex-1 px-3 py-2 bg-white/10 border border-gray-400/30 rounded text-white text-sm placeholder:text-gray-400 outline-none focus:border-blue-500/50"
              />
              <button
                onClick={sendChatMessage}
                disabled={!newChatMessage.trim()}
                className="px-3 py-2 bg-blue-500/20 hover:bg-blue-500/30 disabled:bg-gray-500/20 text-white rounded text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Gửi
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WatchTogetherPlayer;