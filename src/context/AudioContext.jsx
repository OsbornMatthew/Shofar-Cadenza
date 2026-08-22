import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { INITIAL_SONGS, INITIAL_PLAYLISTS } from '../data/songs';
import {
  fetchCloudSongs,
  saveSongToCloud,
  updateSongInCloud,
  deleteSongFromCloud,
  subscribeToCloudSongs,
  fetchCloudPlaylists,
  savePlaylistToCloud,
  updatePlaylistInCloud,
  deletePlaylistFromCloud,
  subscribeToCloudPlaylists,
  clearAllCloudData
} from '../services/cloudService';
import {
  formatTime,
  parseTimeToSeconds,
  detectAudioDuration
} from '../utils/audioUtils';

const AudioContext = createContext();

// Tombstone helpers to guarantee deleted playlists and songs never re-appear from cloud polling
const getDeletedPlaylistIds = () => {
  try {
    const saved = localStorage.getItem('cadenza_deleted_playlist_ids');
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
};

const addDeletedPlaylistId = (id) => {
  try {
    const current = getDeletedPlaylistIds();
    if (!current.includes(id)) {
      const next = [...current, id];
      localStorage.setItem('cadenza_deleted_playlist_ids', JSON.stringify(next));
    }
  } catch {
    // silent
  }
};

const removeDeletedPlaylistId = (id) => {
  try {
    const current = getDeletedPlaylistIds();
    const next = current.filter(item => item !== id);
    localStorage.setItem('cadenza_deleted_playlist_ids', JSON.stringify(next));
  } catch {
    // silent
  }
};

const getDeletedSongIds = () => {
  try {
    const saved = localStorage.getItem('cadenza_deleted_song_ids');
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
};

const addDeletedSongId = (id) => {
  try {
    const current = getDeletedSongIds();
    if (!current.includes(id)) {
      const next = [...current, id];
      localStorage.setItem('cadenza_deleted_song_ids', JSON.stringify(next));
    }
  } catch {
    // silent
  }
};

const removeDeletedSongId = (id) => {
  try {
    const current = getDeletedSongIds();
    const next = current.filter(item => item !== id);
    localStorage.setItem('cadenza_deleted_song_ids', JSON.stringify(next));
  } catch {
    // silent
  }
};

export const AudioProvider = ({ children }) => {
  // Local cache with tombstone filtering (starts completely clean & empty)
  const [allSongs, setAllSongs] = useState(() => {
    try {
      const deletedIds = getDeletedSongIds();
      const saved = localStorage.getItem('cadenza_cloud_songs_cache');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          return parsed.filter(s => s && s.id && !deletedIds.includes(s.id));
        }
      }
      return [];
    } catch {
      return [];
    }
  });

  const [playlists, setPlaylists] = useState(() => {
    try {
      const deletedIds = getDeletedPlaylistIds();
      const saved = localStorage.getItem('cadenza_cloud_playlists_cache');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          return parsed.filter(p => p && p.id && !deletedIds.includes(p.id));
        }
      }
      return [];
    } catch {
      return [];
    }
  });

  // Current Playback State (null when empty)
  const [currentSong, setCurrentSong] = useState(() => allSongs[0] || null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.85);
  const [isMuted, setIsMuted] = useState(false);
  const [isShuffle, setIsShuffle] = useState(false);
  const [repeatMode, setRepeatMode] = useState('off'); // 'off' | 'all' | 'one'
  const [queue, setQueue] = useState(() => allSongs || []);
  const [playbackError, setPlaybackError] = useState(null);

  // Liked Songs State (Stored on individual device, starts empty)
  const [likedSongIds, setLikedSongIds] = useState(() => {
    try {
      const saved = localStorage.getItem('cadenza_liked_songs');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Navigation & Modals State with Navigation History Stack
  const [activeTab, setActiveTabState] = useState('home');
  const [tabHistory, setTabHistory] = useState(['home']);

  const setActiveTab = useCallback((tab) => {
    setActiveTabState(tab);
    setTabHistory(prev => {
      if (prev[prev.length - 1] === tab) return prev;
      return [...prev, tab];
    });
  }, []);

  const [isNowPlayingOpen, setIsNowPlayingOpen] = useState(false);
  const [isCreatePlaylistOpen, setIsCreatePlaylistOpen] = useState(false);
  const [songForAddToPlaylist, setSongForAddToPlaylist] = useState(null);
  const [songToEdit, setSongToEdit] = useState(null);
  const [activePlaylistDetail, setActivePlaylistDetail] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);

  // Confirmation Modal State (replaces window.confirm)
  const [confirmModalState, setConfirmModalState] = useState({
    isOpen: false,
    title: '',
    message: '',
    confirmText: 'Delete',
    isDestructive: true,
    onConfirm: null
  });

  const openConfirmModal = useCallback(({ title, message, confirmText = 'Delete', isDestructive = true, onConfirm }) => {
    setConfirmModalState({
      isOpen: true,
      title,
      message,
      confirmText,
      isDestructive,
      onConfirm
    });
  }, []);

  const closeConfirmModal = useCallback(() => {
    setConfirmModalState(prev => ({ ...prev, isOpen: false }));
  }, []);

  // Audio Ref
  const audioRef = useRef(new Audio());

  // Global Back Gesture Handler across all modals, playlist views, and tabs
  useEffect(() => {
    window.cadenzaHandleBack = () => {
      // 0. Confirm Modal
      if (confirmModalState.isOpen) {
        closeConfirmModal();
        return true;
      }
      // 1. Fullscreen Now Playing Modal
      if (isNowPlayingOpen) {
        setIsNowPlayingOpen(false);
        return true;
      }
      // 2. Edit Song Modal
      if (songToEdit) {
        setSongToEdit(null);
        return true;
      }
      // 3. Add to Playlist Modal
      if (songForAddToPlaylist) {
        setSongForAddToPlaylist(null);
        return true;
      }
      // 4. Create Playlist Modal
      if (isCreatePlaylistOpen) {
        setIsCreatePlaylistOpen(false);
        return true;
      }
      // 5. Playlist Tracks Detail View
      if (activePlaylistDetail) {
        setActivePlaylistDetail(null);
        return true;
      }
      // 6. Navigation Tabs History
      if (tabHistory.length > 1) {
        const newHistory = [...tabHistory];
        newHistory.pop();
        const prevTab = newHistory[newHistory.length - 1] || 'home';
        setTabHistory(newHistory);
        setActiveTabState(prevTab);
        return true;
      } else if (activeTab !== 'home') {
        setActiveTabState('home');
        setTabHistory(['home']);
        return true;
      }
      return false;
    };

    const handlePopState = (e) => {
      if (window.cadenzaHandleBack && window.cadenzaHandleBack()) {
        e.preventDefault();
        window.history.pushState(null, '', window.location.pathname);
      }
    };
    window.history.pushState(null, '', window.location.pathname);
    window.addEventListener('popstate', handlePopState);

    return () => {
      delete window.cadenzaHandleBack;
      window.removeEventListener('popstate', handlePopState);
    };
  }, [
    confirmModalState.isOpen,
    closeConfirmModal,
    isNowPlayingOpen,
    songToEdit,
    songForAddToPlaylist,
    isCreatePlaylistOpen,
    activePlaylistDetail,
    tabHistory,
    activeTab
  ]);

  // Helper: Synchronize songs with cloud (Cloud is Source of Truth, plus any unsynced local songs)
  const mergeSongsWithCloud = useCallback((cloudSongsList) => {
    if (!cloudSongsList || !Array.isArray(cloudSongsList)) return;
    const deletedIds = getDeletedSongIds();

    setAllSongs(prevSongs => {
      const songsMap = new Map();

      // 1. Add all valid cloud songs
      cloudSongsList.forEach(cs => {
        if (cs && cs.id && !deletedIds.includes(cs.id)) {
          songsMap.set(cs.id, cs);
        }
      });

      // 2. Preserve only recently created local songs (within last 30s) waiting for cloud sync
      const now = Date.now();
      prevSongs.forEach(s => {
        if (s && s.id && !deletedIds.includes(s.id) && !songsMap.has(s.id)) {
          const createdAt = s.createdAt || (s.id.startsWith('track-') ? parseInt(s.id.replace('track-', '')) : 0);
          if (createdAt && now - createdAt < 30000) {
            songsMap.set(s.id, s);
          }
        }
      });

      const merged = Array.from(songsMap.values());
      try {
        localStorage.setItem('cadenza_cloud_songs_cache', JSON.stringify(merged));
      } catch (err) {
        // silent
      }
      return merged;
    });
  }, []);

  // Helper: Synchronize playlists with cloud (Cloud is Source of Truth, plus any unsynced local playlists)
  const mergePlaylistsWithCloud = useCallback((cloudPlaylistsList) => {
    if (!cloudPlaylistsList || !Array.isArray(cloudPlaylistsList)) return;
    const deletedIds = getDeletedPlaylistIds();

    setPlaylists(prevPlaylists => {
      const plMap = new Map();

      // 1. Add all valid cloud playlists
      cloudPlaylistsList.forEach(cp => {
        if (cp && cp.id && !deletedIds.includes(cp.id)) {
          plMap.set(cp.id, cp);
        }
      });

      // 2. Preserve only recently created local playlists (within last 30s) waiting for cloud sync
      const now = Date.now();
      prevPlaylists.forEach(p => {
        if (p && p.id && !deletedIds.includes(p.id) && !plMap.has(p.id)) {
          const createdAt = p.createdAt || (p.id.startsWith('pl-') ? parseInt(p.id.replace('pl-', '')) : 0);
          if (createdAt && now - createdAt < 30000) {
            plMap.set(p.id, p);
          }
        }
      });

      const merged = Array.from(plMap.values());
      try {
        localStorage.setItem('cadenza_cloud_playlists_cache', JSON.stringify(merged));
      } catch (err) {
        // silent
      }
      return merged;
    });
  }, []);

  // 1. Subscribe to Live Realtime Cloud Songs Updates with tombstone protection
  useEffect(() => {
    fetchCloudSongs().then(songs => {
      if (songs && Array.isArray(songs)) {
        mergeSongsWithCloud(songs);
      }
    });

    const unsubscribeSongs = subscribeToCloudSongs((updatedCloudSongs) => {
      if (updatedCloudSongs && Array.isArray(updatedCloudSongs)) {
        mergeSongsWithCloud(updatedCloudSongs);
      }
    });

    return () => {
      if (unsubscribeSongs) unsubscribeSongs();
    };
  }, [mergeSongsWithCloud]);

  // 2. Subscribe to Live Realtime Cloud Playlists Updates with tombstone protection
  useEffect(() => {
    fetchCloudPlaylists().then(pls => {
      if (pls && Array.isArray(pls)) {
        mergePlaylistsWithCloud(pls);
      }
    });

    const unsubscribePlaylists = subscribeToCloudPlaylists((updatedCloudPlaylists) => {
      if (updatedCloudPlaylists && Array.isArray(updatedCloudPlaylists)) {
        mergePlaylistsWithCloud(updatedCloudPlaylists);
      }
    });

    return () => {
      if (unsubscribePlaylists) unsubscribePlaylists();
    };
  }, [mergePlaylistsWithCloud]);

  // Save Liked Songs to LocalStorage
  useEffect(() => {
    try {
      localStorage.setItem('cadenza_liked_songs', JSON.stringify(likedSongIds));
    } catch {
      // silent
    }
  }, [likedSongIds]);

  // Keep currentSong synced with real-time allSongs and ensure fallback if deleted
  useEffect(() => {
    if (allSongs.length === 0) {
      if (currentSong !== null) setCurrentSong(null);
      return;
    }
    if (currentSong) {
      const updated = allSongs.find(s => s.id === currentSong.id);
      if (updated) {
        setCurrentSong(updated);
      } else {
        setCurrentSong(allSongs[0] || null);
      }
    }
  }, [allSongs, currentSong]);

  // Keep activePlaylistDetail synced with real-time playlists
  useEffect(() => {
    if (activePlaylistDetail && !activePlaylistDetail.isLikedSpecial && activePlaylistDetail.id !== 'liked-songs') {
      const updated = playlists.find(p => p.id === activePlaylistDetail.id);
      if (updated) {
        setActivePlaylistDetail(updated);
      } else {
        setActivePlaylistDetail(null);
      }
    }
  }, [playlists, activePlaylistDetail]);

  // Trigger Toast
  const showToast = useCallback((msg) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 2500);
  }, []);

  // Seek Function
  const seekTo = useCallback((seconds) => {
    const audio = audioRef.current;
    if (audio && !isNaN(seconds)) {
      audio.currentTime = seconds;
      setCurrentTime(seconds);
    }
  }, []);

  // Play a specific song
  const playSong = useCallback((song, customQueue = null) => {
    const audio = audioRef.current;
    if (!song) return;

    if (customQueue) {
      setQueue(customQueue);
    } else if (!queue.some(s => s.id === song.id)) {
      setQueue(allSongs);
    }

    if (currentSong?.id === song.id && audio.src) {
      if (audio.paused) {
        audio.play().then(() => setIsPlaying(true)).catch(err => {
          console.error(err);
          setPlaybackError('Tap to enable audio playback');
        });
      } else {
        audio.pause();
        setIsPlaying(false);
      }
      return;
    }

    const resolvedSong = allSongs.find(s => s.id === song.id) || song;
    setCurrentSong(resolvedSong);
    setPlaybackError(null);
    audio.src = resolvedSong.audioUrl;
    audio.load();
    audio.play()
      .then(() => {
        setIsPlaying(true);
      })
      .catch((err) => {
        console.warn('Play error:', err);
        setIsPlaying(false);
      });
  }, [allSongs, currentSong, queue]);

  // Toggle Play/Pause
  const togglePlay = useCallback(() => {
    if (!currentSong) return;
    const audio = audioRef.current;
    if (!audio.src && currentSong) {
      playSong(currentSong);
      return;
    }

    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else {
      audio.play().then(() => setIsPlaying(true)).catch(err => {
        console.error(err);
        setPlaybackError('Tap anywhere to enable audio');
      });
    }
  }, [currentSong, isPlaying, playSong]);

  // Next Track
  const handleNextSong = useCallback(() => {
    if (!queue.length) return;
    let nextIndex;
    const currentIndex = queue.findIndex(s => s.id === currentSong?.id);

    if (isShuffle) {
      nextIndex = Math.floor(Math.random() * queue.length);
    } else {
      nextIndex = (currentIndex + 1) % queue.length;
    }
    playSong(queue[nextIndex]);
  }, [currentSong, isShuffle, playSong, queue]);

  // Previous Track
  const handlePrevSong = useCallback(() => {
    if (!queue.length) return;
    const audio = audioRef.current;
    if (audio.currentTime > 3) {
      audio.currentTime = 0;
      setCurrentTime(0);
      return;
    }
    const currentIndex = queue.findIndex(s => s.id === currentSong?.id);
    const prevIndex = (currentIndex - 1 + queue.length) % queue.length;
    playSong(queue[prevIndex]);
  }, [currentSong, playSong, queue]);

  // Expose global dispatcher for Native Android Notification buttons
  useEffect(() => {
    window.cadenzaMediaAction = (action) => {
      if (!action) return;
      if (action === 'toggle') {
        togglePlay();
      } else if (action === 'next') {
        handleNextSong();
      } else if (action === 'prev') {
        handlePrevSong();
      } else if (action === 'stop') {
        const audio = audioRef.current;
        if (audio) {
          audio.pause();
          setIsPlaying(false);
        }
      } else if (action.startsWith('seek:')) {
        const sec = parseFloat(action.split(':')[1]);
        if (!isNaN(sec)) {
          seekTo(sec);
        }
      }
    };

    return () => {
      delete window.cadenzaMediaAction;
    };
  }, [togglePlay, handleNextSong, handlePrevSong, seekTo]);

  // Helper: Update song duration in allSongs and cloud
  const updateSongDuration = useCallback((songId, formattedDuration, durationSec) => {
    if (!songId || !formattedDuration) return;

    setAllSongs(prev => {
      let changed = false;
      const next = prev.map(s => {
        if (s.id === songId) {
          if (s.duration !== formattedDuration || s.durationSec !== durationSec) {
            changed = true;
            return {
              ...s,
              duration: formattedDuration,
              durationSec: durationSec
            };
          }
        }
        return s;
      });

      if (!changed) return prev;

      try {
        localStorage.setItem('cadenza_cloud_songs_cache', JSON.stringify(next));
      } catch (err) {}
      return next;
    });

    setCurrentSong(prev => {
      if (prev && prev.id === songId) {
        if (prev.duration !== formattedDuration || prev.durationSec !== durationSec) {
          return {
            ...prev,
            duration: formattedDuration,
            durationSec: durationSec
          };
        }
      }
      return prev;
    });

    // Update in cloud in background
    updateSongInCloud(songId, {
      duration: formattedDuration,
      durationSec: durationSec
    });
  }, []);

  // Automatic background duration resolution for legacy / unprobed songs
  const probedSongIdsRef = useRef(new Set());

  useEffect(() => {
    if (!allSongs || allSongs.length === 0) return;

    allSongs.forEach(song => {
      if (!song || !song.id || !song.audioUrl) return;
      if (probedSongIdsRef.current.has(song.id)) return;

      const isDefaultOrMissing =
        !song.duration ||
        song.duration === '3:45' ||
        song.duration === '3:30' ||
        song.duration === '0:00' ||
        !song.durationSec ||
        song.durationSec === 210;

      if (isDefaultOrMissing) {
        probedSongIdsRef.current.add(song.id);
        detectAudioDuration(song.audioUrl).then(result => {
          if (result && result.duration && result.durationSec > 0) {
            updateSongDuration(song.id, result.duration, result.durationSec);
          }
        }).catch(() => {});
      }
    });
  }, [allSongs, updateSongDuration]);

  // Native Android Media Notification Bridge Sync with live timings
  useEffect(() => {
    if (window.AndroidMediaNotification && currentSong) {
      try {
        const songDuration = duration || currentSong.durationSec || parseTimeToSeconds(currentSong.duration) || 0;
        window.AndroidMediaNotification.updateNotification(
          currentSong.title || 'Shofar Cadenza',
          currentSong.artist || 'Unknown Artist',
          currentSong.album || 'Shofar Cadenza',
          currentSong.coverUrl || '',
          isPlaying,
          currentTime || 0,
          songDuration
        );
      } catch (err) {
        // silent
      }
    }
  }, [currentSong, isPlaying, duration, currentTime]);

  // Clear native notification when app closes or unloads
  useEffect(() => {
    const handleAppClose = () => {
      if (window.AndroidMediaNotification) {
        try {
          window.AndroidMediaNotification.clearNotification();
        } catch (e) {}
      }
    };

    window.addEventListener('beforeunload', handleAppClose);
    window.addEventListener('pagehide', handleAppClose);
    return () => {
      window.removeEventListener('beforeunload', handleAppClose);
      window.removeEventListener('pagehide', handleAppClose);
    };
  }, []);

  // Android System Notification & Lockscreen Media Controls (MediaSession API)
  useEffect(() => {
    if ('mediaSession' in navigator && currentSong) {
      document.title = `${currentSong.title} • ${currentSong.artist}`;

      const cover = currentSong.coverUrl || 'https://images.unsplash.com/photo-1518895949257-7621c3c786d7?q=80&w=800&auto=format&fit=crop';
      try {
        navigator.mediaSession.metadata = new MediaMetadata({
          title: currentSong.title,
          artist: currentSong.artist,
          album: currentSong.album || 'Shofar Cadenza',
          artwork: [
            { src: cover, sizes: '96x96', type: 'image/jpeg' },
            { src: cover, sizes: '128x128', type: 'image/jpeg' },
            { src: cover, sizes: '192x192', type: 'image/jpeg' },
            { src: cover, sizes: '256x256', type: 'image/jpeg' },
            { src: cover, sizes: '384x384', type: 'image/jpeg' },
            { src: cover, sizes: '512x512', type: 'image/jpeg' }
          ]
        });
      } catch (e) {
        // silent
      }

      navigator.mediaSession.playbackState = isPlaying ? 'playing' : 'paused';

      const actionHandlers = [
        ['play', () => {
          audioRef.current.play().then(() => setIsPlaying(true)).catch(() => {});
        }],
        ['pause', () => {
          audioRef.current.pause();
          setIsPlaying(false);
        }],
        ['previoustrack', () => handlePrevSong()],
        ['nexttrack', () => handleNextSong()],
        ['seekto', (details) => {
          if (details.seekTime !== null && details.seekTime !== undefined) {
            seekTo(details.seekTime);
          }
        }],
        ['seekbackward', (details) => {
          const skipTime = details?.seekOffset || 10;
          seekTo(Math.max(0, audioRef.current.currentTime - skipTime));
        }],
        ['seekforward', (details) => {
          const skipTime = details?.seekOffset || 10;
          seekTo(Math.min(audioRef.current.duration || 9999, audioRef.current.currentTime + skipTime));
        }],
        ['stop', () => {
          audioRef.current.pause();
          setIsPlaying(false);
        }]
      ];

      for (const [action, handler] of actionHandlers) {
        try {
          navigator.mediaSession.setActionHandler(action, handler);
        } catch (err) {
          // ignore unsupported actions
        }
      }
    }
  }, [currentSong, isPlaying, handleNextSong, handlePrevSong, seekTo]);

  // Update MediaSession Position State for live lockscreen seek bar
  useEffect(() => {
    if ('mediaSession' in navigator && 'setPositionState' in navigator.mediaSession && duration > 0 && !isNaN(duration)) {
      try {
        navigator.mediaSession.setPositionState({
          duration: Math.max(1, duration),
          playbackRate: 1,
          position: Math.min(Math.max(0, currentTime), duration)
        });
      } catch (err) {
        // ignore fast position update errors
      }
    }
  }, [currentTime, duration]);

  // Audio Event Listeners Setup
  useEffect(() => {
    const audio = audioRef.current;
    audio.volume = volume;

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
      if (!isNaN(audio.duration) && audio.duration > 0 && isFinite(audio.duration)) {
        setDuration(audio.duration);
      }
    };

    const handleLoadedMetadata = () => {
      if (!isNaN(audio.duration) && audio.duration > 0 && isFinite(audio.duration)) {
        const exactDurationSec = Math.round(audio.duration);
        const exactDurationStr = formatTime(audio.duration);
        setDuration(audio.duration);

        if (currentSong?.id) {
          if (currentSong.duration !== exactDurationStr || Math.abs((currentSong.durationSec || 0) - exactDurationSec) > 1) {
            updateSongDuration(currentSong.id, exactDurationStr, exactDurationSec);
          }
        }
      }
      setPlaybackError(null);
    };

    const handlePlayEvent = () => {
      setIsPlaying(true);
      if ('mediaSession' in navigator) {
        navigator.mediaSession.playbackState = 'playing';
      }
    };

    const handlePauseEvent = () => {
      setIsPlaying(false);
      if ('mediaSession' in navigator) {
        navigator.mediaSession.playbackState = 'paused';
      }
    };

    const handleEnded = () => {
      if (repeatMode === 'one') {
        audio.currentTime = 0;
        audio.play().catch(console.error);
      } else {
        handleNextSong();
      }
    };

    const handleError = (e) => {
      console.warn('Audio playback error:', e);
      setPlaybackError('Could not stream audio. Check network or link.');
      setIsPlaying(false);
      if ('mediaSession' in navigator) {
        navigator.mediaSession.playbackState = 'paused';
      }
    };

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('play', handlePlayEvent);
    audio.addEventListener('pause', handlePauseEvent);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('error', handleError);

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('play', handlePlayEvent);
      audio.removeEventListener('pause', handlePauseEvent);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('error', handleError);
    };
  }, [repeatMode, handleNextSong, volume]);

  const changeVolume = (newVol) => {
    const vol = Math.max(0, Math.min(1, newVol));
    setVolume(vol);
    audioRef.current.volume = vol;
    setIsMuted(vol === 0);
  };

  const toggleMute = () => {
    if (isMuted) {
      audioRef.current.volume = volume || 0.7;
      setIsMuted(false);
    } else {
      audioRef.current.volume = 0;
      setIsMuted(true);
    }
  };

  const toggleShuffle = () => {
    setIsShuffle(prev => !prev);
    showToast(!isShuffle ? 'Shuffle On' : 'Shuffle Off');
  };

  const cycleRepeat = () => {
    const modes = ['off', 'all', 'one'];
    const nextMode = modes[(modes.indexOf(repeatMode) + 1) % modes.length];
    setRepeatMode(nextMode);
    if (nextMode === 'one') showToast('Repeat Current');
    else if (nextMode === 'all') showToast('Repeat Queue');
    else showToast('Repeat Off');
  };

  // Like Song System
  const toggleLike = (songId) => {
    setLikedSongIds(prev => {
      const exists = prev.includes(songId);
      if (exists) {
        showToast('Removed from Liked Songs');
        return prev.filter(id => id !== songId);
      } else {
        showToast('Added to Liked Songs');
        return [...prev, songId];
      }
    });
  };

  const isLiked = (songId) => likedSongIds.includes(songId);

  // Playlists Management (Instant 0ms UI + Immediate LocalStorage + Background Cloud Sync)
  const createPlaylist = (name, description, coverUrl) => {
    const newPlaylist = {
      id: `pl-${Date.now()}`,
      createdAt: Date.now(),
      name: name.trim() || 'My Playlist',
      description: description.trim() || '',
      coverUrl: coverUrl || 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?q=80&w=800&auto=format&fit=crop',
      songIds: []
    };

    // Remove from tombstone in case of ID collision
    removeDeletedPlaylistId(newPlaylist.id);
    
    // 0ms instant UI update and save to localStorage
    setPlaylists(prev => {
      const next = [newPlaylist, ...prev.filter(p => p.id !== newPlaylist.id)];
      try {
        localStorage.setItem('cadenza_cloud_playlists_cache', JSON.stringify(next));
      } catch (err) {}
      return next;
    });
    showToast(`Created "${newPlaylist.name}"`);
    setIsCreatePlaylistOpen(false);

    // Sync in background without blocking UI
    savePlaylistToCloud(newPlaylist);
  };

  const deletePlaylist = (playlistId) => {
    // Register in tombstone to block cloud polling resurrection
    addDeletedPlaylistId(playlistId);

    // 0ms instant UI update and save to localStorage
    setPlaylists(prev => {
      const next = prev.filter(p => p.id !== playlistId);
      try {
        localStorage.setItem('cadenza_cloud_playlists_cache', JSON.stringify(next));
      } catch (err) {}
      return next;
    });

    if (activePlaylistDetail?.id === playlistId) {
      setActivePlaylistDetail(null);
    }
    showToast('Playlist deleted');

    // Sync in background without blocking UI
    deletePlaylistFromCloud(playlistId);
  };

  const addSongToPlaylist = (playlistId, songId) => {
    let updatedPl = null;
    setPlaylists(prev => {
      const next = prev.map(pl => {
        if (pl.id === playlistId) {
          if (pl.songIds && pl.songIds.includes(songId)) {
            showToast(`Song already in "${pl.name}"`);
            return pl;
          }
          showToast(`Added to "${pl.name}"`);
          updatedPl = {
            ...pl,
            songIds: [...(pl.songIds || []), songId]
          };
          return updatedPl;
        }
        return pl;
      });
      try {
        localStorage.setItem('cadenza_cloud_playlists_cache', JSON.stringify(next));
      } catch (err) {}
      return next;
    });
    setSongForAddToPlaylist(null);

    // If active detail view is this playlist, update detail view immediately
    if (activePlaylistDetail?.id === playlistId && updatedPl) {
      setActivePlaylistDetail(updatedPl);
    }

    // Sync in background
    if (updatedPl) {
      updatePlaylistInCloud(playlistId, { songIds: updatedPl.songIds });
    }
  };

  const removeSongFromPlaylist = (playlistId, songId) => {
    let updatedPl = null;
    setPlaylists(prev => {
      const next = prev.map(pl => {
        if (pl.id === playlistId) {
          updatedPl = {
            ...pl,
            songIds: (pl.songIds || []).filter(id => id !== songId)
          };
          return updatedPl;
        }
        return pl;
      });
      try {
        localStorage.setItem('cadenza_cloud_playlists_cache', JSON.stringify(next));
      } catch (err) {}
      return next;
    });
    showToast('Removed from playlist');

    // If active detail view is this playlist, update detail view immediately
    if (activePlaylistDetail?.id === playlistId && updatedPl) {
      setActivePlaylistDetail(updatedPl);
    }

    // Sync in background
    if (updatedPl) {
      updatePlaylistInCloud(playlistId, { songIds: updatedPl.songIds });
    }
  };

  // Add Custom Song (Instant 0ms UI + Immediate LocalStorage + Background Cloud Sync)
  const addNewSong = async (songData) => {
    let finalDuration = songData.duration;
    let finalDurationSec = songData.durationSec;

    if (!finalDurationSec && finalDuration && finalDuration !== '3:45' && finalDuration !== '3:30') {
      finalDurationSec = parseTimeToSeconds(finalDuration);
    }

    // If duration not provided or legacy default, attempt quick metadata probe
    if (!finalDuration || finalDuration === '3:45' || finalDuration === '3:30' || !finalDurationSec) {
      try {
        const detected = await Promise.race([
          detectAudioDuration(songData.audioUrl, 2500),
          new Promise(res => setTimeout(() => res(null), 2000))
        ]);
        if (detected) {
          finalDuration = detected.duration;
          finalDurationSec = detected.durationSec;
        }
      } catch (e) {}
    }

    const newTrack = {
      id: `track-${Date.now()}`,
      createdAt: Date.now(),
      title: songData.title.trim(),
      artist: songData.artist?.trim() || 'Unknown Artist',
      album: songData.album?.trim() || 'Single',
      duration: finalDuration || '0:00',
      durationSec: finalDurationSec || 0,
      audioUrl: songData.audioUrl.trim(),
      coverUrl: songData.coverUrl?.trim() || 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=800&auto=format&fit=crop',
      genre: songData.genre || 'Acoustic Pop',
      isCloudinary: songData.audioUrl.includes('cloudinary.com'),
      isFeatured: false,
      lyrics: songData.lyrics?.trim() || 'No lyrics available.'
    };

    removeDeletedSongId(newTrack.id);

    // 0ms instant UI update and save to localStorage
    setAllSongs(prev => {
      const next = [newTrack, ...prev.filter(s => s.id !== newTrack.id)];
      try {
        localStorage.setItem('cadenza_cloud_songs_cache', JSON.stringify(next));
      } catch (err) {}
      return next;
    });
    showToast(`Added "${newTrack.title}"!`);

    // Auto-play immediately
    playSong(newTrack, [newTrack, ...allSongs]);

    // Sync in background
    saveSongToCloud(newTrack);

    // If duration was not detected initially, trigger background probe
    if (!newTrack.duration || newTrack.duration === '0:00') {
      detectAudioDuration(newTrack.audioUrl).then(res => {
        if (res && res.duration && res.durationSec > 0) {
          updateSongDuration(newTrack.id, res.duration, res.durationSec);
        }
      }).catch(() => {});
    }
  };

  // Edit Song (Instant 0ms UI + Immediate LocalStorage + Background Cloud Sync)
  const editSong = (songId, updatedData) => {
    let toUpdate = { ...updatedData };
    if (toUpdate.duration && !toUpdate.durationSec) {
      toUpdate.durationSec = parseTimeToSeconds(toUpdate.duration);
    }
    setAllSongs(prev => {
      const next = prev.map(s => s.id === songId ? { ...s, ...toUpdate } : s);
      try {
        localStorage.setItem('cadenza_cloud_songs_cache', JSON.stringify(next));
      } catch (err) {}
      return next;
    });
    showToast('Song updated');
    setSongToEdit(null);

    // Sync in background
    updateSongInCloud(songId, toUpdate);
  };

  // Delete Song (Instant 0ms UI + Immediate LocalStorage + Background Cloud Sync + Tombstone)
  const deleteSong = (songId) => {
    addDeletedSongId(songId);

    if (currentSong?.id === songId) {
      audioRef.current.pause();
      audioRef.current.src = '';
      setIsPlaying(false);
      const remaining = allSongs.filter(s => s.id !== songId);
      if (remaining.length > 0) {
        setCurrentSong(remaining[0]);
      } else {
        setCurrentSong(null);
      }
    }

    setAllSongs(prev => {
      const next = prev.filter(s => s.id !== songId);
      try {
        localStorage.setItem('cadenza_cloud_songs_cache', JSON.stringify(next));
      } catch (err) {}
      return next;
    });

    setPlaylists(prev => {
      const next = prev.map(pl => ({
        ...pl,
        songIds: (pl.songIds || []).filter(id => id !== songId)
      }));
      try {
        localStorage.setItem('cadenza_cloud_playlists_cache', JSON.stringify(next));
      } catch (err) {}
      return next;
    });

    setLikedSongIds(prev => prev.filter(id => id !== songId));
    showToast('Song removed');

    // Sync in background
    deleteSongFromCloud(songId);
  };

  // Editable Lyrics Handler (Instant 0ms UI + Immediate LocalStorage + Background Cloud Sync)
  const updateSongLyrics = (songId, newLyricsText) => {
    setAllSongs(prev => {
      const next = prev.map(s => s.id === songId ? { ...s, lyrics: newLyricsText } : s);
      try {
        localStorage.setItem('cadenza_cloud_songs_cache', JSON.stringify(next));
      } catch (err) {}
      return next;
    });
    showToast('Lyrics updated');

    // Sync in background
    updateSongInCloud(songId, { lyrics: newLyricsText });
  };

  // Reset entire cloud and local vault (wipes Firebase songs/playlists & local cache)
  const clearEntireCloudAndLocalVault = async () => {
    setAllSongs([]);
    setPlaylists([]);
    setLikedSongIds([]);
    setCurrentSong(null);
    setQueue([]);
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = '';
    }
    try {
      localStorage.removeItem('cadenza_cloud_songs_cache');
      localStorage.removeItem('cadenza_cloud_playlists_cache');
      localStorage.removeItem('cadenza_liked_songs');
      localStorage.removeItem('cadenza_deleted_song_ids');
      localStorage.removeItem('cadenza_deleted_playlist_ids');
      localStorage.removeItem('cadenza_recent_searches');
    } catch (e) {}

    const ok = await clearAllCloudData();
    if (ok) {
      showToast('Firebase DB & local library cleared!');
    } else {
      showToast('Local library cleared.');
    }
  };

  return (
    <AudioContext.Provider
      value={{
        allSongs,
        likedSongIds,
        playlists,
        currentSong,
        isPlaying,
        currentTime,
        duration,
        volume,
        isMuted,
        isShuffle,
        repeatMode,
        playbackError,
        queue,
        playSong,
        togglePlay,
        seekTo,
        handleNextSong,
        handlePrevSong,
        changeVolume,
        toggleMute,
        toggleShuffle,
        cycleRepeat,
        toggleLike,
        isLiked,
        createPlaylist,
        deletePlaylist,
        addSongToPlaylist,
        removeSongFromPlaylist,
        addNewSong,
        editSong,
        deleteSong,
        updateSongLyrics,
        clearEntireCloudAndLocalVault,
        activeTab,
        setActiveTab,
        isNowPlayingOpen,
        setIsNowPlayingOpen,
        isCreatePlaylistOpen,
        setIsCreatePlaylistOpen,
        songForAddToPlaylist,
        setSongForAddToPlaylist,
        songToEdit,
        setSongToEdit,
        activePlaylistDetail,
        setActivePlaylistDetail,
        toastMessage,
        showToast,
        confirmModalState,
        openConfirmModal,
        closeConfirmModal,
        updateSongDuration,
        formatTime,
        parseTimeToSeconds,
        detectAudioDuration
      }}
    >
      {children}
    </AudioContext.Provider>
  );
};

export const useAudio = () => useContext(AudioContext);
