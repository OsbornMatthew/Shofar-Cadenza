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
  subscribeToCloudPlaylists
} from '../services/cloudService';

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
  // Local fallback / cache with tombstone filtering
  const [cachedCloudSongs] = useState(() => {
    try {
      const deletedIds = getDeletedSongIds();
      const saved = localStorage.getItem('cadenza_cloud_songs_cache');
      const parsed = saved ? JSON.parse(saved) : INITIAL_SONGS;
      return parsed.filter(s => !deletedIds.includes(s.id));
    } catch {
      return INITIAL_SONGS;
    }
  });

  const [cachedCloudPlaylists] = useState(() => {
    try {
      const deletedIds = getDeletedPlaylistIds();
      const saved = localStorage.getItem('cadenza_cloud_playlists_cache');
      const parsed = saved ? JSON.parse(saved) : INITIAL_PLAYLISTS;
      return parsed.filter(p => !deletedIds.includes(p.id));
    } catch {
      return INITIAL_PLAYLISTS;
    }
  });

  // Master allSongs & playlists lists synced with Cloud Database
  const [allSongs, setAllSongs] = useState(cachedCloudSongs.length > 0 ? cachedCloudSongs : INITIAL_SONGS);
  const [playlists, setPlaylists] = useState(cachedCloudPlaylists.length > 0 ? cachedCloudPlaylists : INITIAL_PLAYLISTS);

  // Current Playback State
  const [currentSong, setCurrentSong] = useState(allSongs[0] || INITIAL_SONGS[0]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.85);
  const [isMuted, setIsMuted] = useState(false);
  const [isShuffle, setIsShuffle] = useState(false);
  const [repeatMode, setRepeatMode] = useState('off'); // 'off' | 'all' | 'one'
  const [queue, setQueue] = useState(allSongs);
  const [playbackError, setPlaybackError] = useState(null);

  // Liked Songs State (Stored on individual device)
  const [likedSongIds, setLikedSongIds] = useState(() => {
    try {
      const saved = localStorage.getItem('cadenza_liked_songs');
      return saved ? JSON.parse(saved) : ['track-1', 'track-2'];
    } catch {
      return ['track-1', 'track-2'];
    }
  });

  // Navigation & Modals State
  const [activeTab, setActiveTab] = useState('home');
  const [isNowPlayingOpen, setIsNowPlayingOpen] = useState(false);
  const [isCreatePlaylistOpen, setIsCreatePlaylistOpen] = useState(false);
  const [songForAddToPlaylist, setSongForAddToPlaylist] = useState(null);
  const [songToEdit, setSongToEdit] = useState(null);
  const [activePlaylistDetail, setActivePlaylistDetail] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);

  // Audio Ref
  const audioRef = useRef(new Audio());

  // 1. Subscribe to Live Realtime Cloud Songs Updates with tombstone protection
  useEffect(() => {
    fetchCloudSongs().then(songs => {
      if (songs && Array.isArray(songs) && songs.length > 0) {
        const deletedIds = getDeletedSongIds();
        const validSongs = songs.filter(s => !deletedIds.includes(s.id));
        if (validSongs.length > 0) {
          setAllSongs(validSongs);
          localStorage.setItem('cadenza_cloud_songs_cache', JSON.stringify(validSongs));
        }
      }
    });

    const unsubscribeSongs = subscribeToCloudSongs((updatedCloudSongs) => {
      if (updatedCloudSongs && Array.isArray(updatedCloudSongs)) {
        const deletedIds = getDeletedSongIds();
        const validSongs = updatedCloudSongs.filter(s => !deletedIds.includes(s.id));
        if (validSongs.length > 0) {
          setAllSongs(validSongs);
          localStorage.setItem('cadenza_cloud_songs_cache', JSON.stringify(validSongs));
        }
      }
    });

    return () => {
      if (unsubscribeSongs) unsubscribeSongs();
    };
  }, []);

  // 2. Subscribe to Live Realtime Cloud Playlists Updates with tombstone protection
  useEffect(() => {
    fetchCloudPlaylists().then(pls => {
      if (pls && Array.isArray(pls)) {
        const deletedIds = getDeletedPlaylistIds();
        const validPls = pls.filter(p => !deletedIds.includes(p.id));
        setPlaylists(validPls);
        localStorage.setItem('cadenza_cloud_playlists_cache', JSON.stringify(validPls));
      }
    });

    const unsubscribePlaylists = subscribeToCloudPlaylists((updatedCloudPlaylists) => {
      if (updatedCloudPlaylists && Array.isArray(updatedCloudPlaylists)) {
        const deletedIds = getDeletedPlaylistIds();
        const validPls = updatedCloudPlaylists.filter(p => !deletedIds.includes(p.id));
        setPlaylists(validPls);
        localStorage.setItem('cadenza_cloud_playlists_cache', JSON.stringify(validPls));
      }
    });

    return () => {
      if (unsubscribePlaylists) unsubscribePlaylists();
    };
  }, []);

  // Save Liked Songs to LocalStorage
  useEffect(() => {
    localStorage.setItem('cadenza_liked_songs', JSON.stringify(likedSongIds));
  }, [likedSongIds]);

  // Keep currentSong synced with real-time allSongs
  useEffect(() => {
    if (currentSong) {
      const updated = allSongs.find(s => s.id === currentSong.id);
      if (updated) {
        setCurrentSong(updated);
      }
    }
  }, [allSongs]);

  // Keep activePlaylistDetail synced with real-time playlists
  useEffect(() => {
    if (activePlaylistDetail && !activePlaylistDetail.isLikedSpecial && activePlaylistDetail.id !== 'liked-songs') {
      const updated = playlists.find(p => p.id === activePlaylistDetail.id);
      if (updated) {
        setActivePlaylistDetail(updated);
      }
    }
  }, [playlists]);

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
      if (!isNaN(audio.duration) && audio.duration > 0) {
        setDuration(audio.duration);
      }
    };

    const handleLoadedMetadata = () => {
      if (!isNaN(audio.duration) && audio.duration > 0) {
        setDuration(audio.duration);
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

  // Playlists Management (Instant 0ms UI + Background Cloud Sync + Tombstone Tracking)
  const createPlaylist = (name, description, coverUrl) => {
    const newPlaylist = {
      id: `pl-${Date.now()}`,
      name: name.trim() || 'My Playlist',
      description: description.trim() || '',
      coverUrl: coverUrl || 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?q=80&w=800&auto=format&fit=crop',
      songIds: []
    };

    // Remove from tombstone in case of ID collision
    removeDeletedPlaylistId(newPlaylist.id);
    
    // 0ms instant UI update
    setPlaylists(prev => {
      const next = [newPlaylist, ...prev];
      localStorage.setItem('cadenza_cloud_playlists_cache', JSON.stringify(next));
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

    // 0ms instant UI update
    setPlaylists(prev => {
      const next = prev.filter(p => p.id !== playlistId);
      localStorage.setItem('cadenza_cloud_playlists_cache', JSON.stringify(next));
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
          if (pl.songIds.includes(songId)) {
            showToast(`Song already in "${pl.name}"`);
            return pl;
          }
          showToast(`Added to "${pl.name}"`);
          updatedPl = {
            ...pl,
            songIds: [...pl.songIds, songId]
          };
          return updatedPl;
        }
        return pl;
      });
      localStorage.setItem('cadenza_cloud_playlists_cache', JSON.stringify(next));
      return next;
    });
    setSongForAddToPlaylist(null);

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
            songIds: pl.songIds.filter(id => id !== songId)
          };
          return updatedPl;
        }
        return pl;
      });
      localStorage.setItem('cadenza_cloud_playlists_cache', JSON.stringify(next));
      return next;
    });
    showToast('Removed from playlist');

    // Sync in background
    if (updatedPl) {
      updatePlaylistInCloud(playlistId, { songIds: updatedPl.songIds });
    }
  };

  // Add Custom Song (Instant 0ms UI + Background Cloud Sync)
  const addNewSong = (songData) => {
    const newTrack = {
      id: `track-${Date.now()}`,
      title: songData.title.trim(),
      artist: songData.artist?.trim() || 'Unknown Artist',
      album: songData.album?.trim() || 'Single',
      duration: songData.duration || '3:30',
      durationSec: 210,
      audioUrl: songData.audioUrl.trim(),
      coverUrl: songData.coverUrl?.trim() || 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=800&auto=format&fit=crop',
      genre: songData.genre || 'Acoustic Pop',
      isCloudinary: songData.audioUrl.includes('cloudinary.com'),
      isFeatured: false,
      lyrics: songData.lyrics?.trim() || 'No lyrics available.'
    };

    removeDeletedSongId(newTrack.id);

    // 0ms instant UI update
    setAllSongs(prev => {
      const next = [newTrack, ...prev.filter(s => s.id !== newTrack.id)];
      localStorage.setItem('cadenza_cloud_songs_cache', JSON.stringify(next));
      return next;
    });
    showToast(`Added "${newTrack.title}"!`);

    // Auto-play immediately
    playSong(newTrack, [newTrack, ...allSongs]);

    // Sync in background
    saveSongToCloud(newTrack);
  };

  // Edit Song (Instant 0ms UI + Background Cloud Sync)
  const editSong = (songId, updatedData) => {
    setAllSongs(prev => {
      const next = prev.map(s => s.id === songId ? { ...s, ...updatedData } : s);
      localStorage.setItem('cadenza_cloud_songs_cache', JSON.stringify(next));
      return next;
    });
    showToast('Song updated');
    setSongToEdit(null);

    // Sync in background
    updateSongInCloud(songId, updatedData);
  };

  // Delete Song (Instant 0ms UI + Background Cloud Sync + Tombstone)
  const deleteSong = (songId) => {
    addDeletedSongId(songId);

    if (currentSong?.id === songId) {
      audioRef.current.pause();
      setIsPlaying(false);
      const remaining = allSongs.filter(s => s.id !== songId);
      if (remaining.length > 0) {
        setCurrentSong(remaining[0]);
      }
    }

    setAllSongs(prev => {
      const next = prev.filter(s => s.id !== songId);
      localStorage.setItem('cadenza_cloud_songs_cache', JSON.stringify(next));
      return next;
    });

    setPlaylists(prev => {
      const next = prev.map(pl => ({
        ...pl,
        songIds: pl.songIds.filter(id => id !== songId)
      }));
      localStorage.setItem('cadenza_cloud_playlists_cache', JSON.stringify(next));
      return next;
    });

    setLikedSongIds(prev => prev.filter(id => id !== songId));
    showToast('Song removed');

    // Sync in background
    deleteSongFromCloud(songId);
  };

  // Editable Lyrics Handler (Instant 0ms UI + Background Cloud Sync)
  const updateSongLyrics = (songId, newLyricsText) => {
    setAllSongs(prev => {
      const next = prev.map(s => s.id === songId ? { ...s, lyrics: newLyricsText } : s);
      localStorage.setItem('cadenza_cloud_songs_cache', JSON.stringify(next));
      return next;
    });
    showToast('Lyrics updated');

    // Sync in background
    updateSongInCloud(songId, { lyrics: newLyricsText });
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
        showToast
      }}
    >
      {children}
    </AudioContext.Provider>
  );
};

export const useAudio = () => useContext(AudioContext);

