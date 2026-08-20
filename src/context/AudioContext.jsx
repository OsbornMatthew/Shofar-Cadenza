import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { INITIAL_SONGS, INITIAL_PLAYLISTS } from '../data/songs';
import {
  fetchCloudSongs,
  saveSongToCloud,
  updateSongInCloud,
  deleteSongFromCloud,
  subscribeToCloudSongs
} from '../services/cloudService';

const AudioContext = createContext();

export const AudioProvider = ({ children }) => {
  // Local fallback / cache
  const [cachedCloudSongs, setCachedCloudSongs] = useState(() => {
    try {
      const saved = localStorage.getItem('cadenza_cloud_songs_cache');
      return saved ? JSON.parse(saved) : INITIAL_SONGS;
    } catch {
      return INITIAL_SONGS;
    }
  });

  // Master allSongs list synced with Cloud Database
  const [allSongs, setAllSongs] = useState(cachedCloudSongs.length > 0 ? cachedCloudSongs : INITIAL_SONGS);

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

  // Liked Songs State
  const [likedSongIds, setLikedSongIds] = useState(() => {
    try {
      const saved = localStorage.getItem('cadenza_liked_songs');
      return saved ? JSON.parse(saved) : ['track-1', 'track-2'];
    } catch {
      return ['track-1', 'track-2'];
    }
  });

  // Playlists State
  const [playlists, setPlaylists] = useState(() => {
    try {
      const saved = localStorage.getItem('cadenza_playlists');
      return saved ? JSON.parse(saved) : INITIAL_PLAYLISTS;
    } catch {
      return INITIAL_PLAYLISTS;
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

  // Subscribe to Live Realtime Cloud Database Updates
  useEffect(() => {
    fetchCloudSongs().then(songs => {
      if (songs && songs.length > 0) {
        setAllSongs(songs);
        setCachedCloudSongs(songs);
        localStorage.setItem('cadenza_cloud_songs_cache', JSON.stringify(songs));
      }
    });

    const unsubscribe = subscribeToCloudSongs((updatedCloudSongs) => {
      if (updatedCloudSongs && Array.isArray(updatedCloudSongs)) {
        setAllSongs(updatedCloudSongs);
        setCachedCloudSongs(updatedCloudSongs);
        localStorage.setItem('cadenza_cloud_songs_cache', JSON.stringify(updatedCloudSongs));
      }
    });

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  // Save to LocalStorage
  useEffect(() => {
    localStorage.setItem('cadenza_liked_songs', JSON.stringify(likedSongIds));
  }, [likedSongIds]);

  useEffect(() => {
    localStorage.setItem('cadenza_playlists', JSON.stringify(playlists));
  }, [playlists]);

  // Keep currentSong synced with real-time allSongs
  useEffect(() => {
    if (currentSong) {
      const updated = allSongs.find(s => s.id === currentSong.id);
      if (updated) {
        setCurrentSong(updated);
      }
    }
  }, [allSongs]);

  // Android System Notification & Lockscreen Controls (MediaSession API)
  useEffect(() => {
    if ('mediaSession' in navigator && currentSong) {
      navigator.mediaSession.metadata = new MediaMetadata({
        title: currentSong.title,
        artist: currentSong.artist,
        album: currentSong.album || 'Shofar Cadenza',
        artwork: [
          { src: currentSong.coverUrl, sizes: '96x96', type: 'image/jpeg' },
          { src: currentSong.coverUrl, sizes: '128x128', type: 'image/jpeg' },
          { src: currentSong.coverUrl, sizes: '192x192', type: 'image/jpeg' },
          { src: currentSong.coverUrl, sizes: '256x256', type: 'image/jpeg' },
          { src: currentSong.coverUrl, sizes: '384x384', type: 'image/jpeg' },
          { src: currentSong.coverUrl, sizes: '512x512', type: 'image/jpeg' }
        ]
      });

      navigator.mediaSession.playbackState = isPlaying ? 'playing' : 'paused';

      // Register Notification Action Handlers
      try {
        navigator.mediaSession.setActionHandler('play', () => {
          audioRef.current.play().then(() => setIsPlaying(true)).catch(console.error);
        });
        navigator.mediaSession.setActionHandler('pause', () => {
          audioRef.current.pause();
          setIsPlaying(false);
        });
        navigator.mediaSession.setActionHandler('previoustrack', () => {
          handlePrevSong();
        });
        navigator.mediaSession.setActionHandler('nexttrack', () => {
          handleNextSong();
        });
        navigator.mediaSession.setActionHandler('seekto', (details) => {
          if (details.seekTime !== null && details.seekTime !== undefined) {
            seekTo(details.seekTime);
          }
        });
      } catch (err) {
        console.warn('MediaSession handler error:', err);
      }
    }
  }, [currentSong, isPlaying, queue]);

  // Update MediaSession Position State for live lockscreen seek bar
  useEffect(() => {
    if ('mediaSession' in navigator && 'setPositionState' in navigator.mediaSession && duration > 0) {
      try {
        navigator.mediaSession.setPositionState({
          duration: duration || 100,
          playbackRate: 1,
          position: Math.min(currentTime, duration) || 0
        });
      } catch (err) {
        // ignore fast position update errors
      }
    }
  }, [currentTime, duration]);

  // Trigger Toast
  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 2800);
  };

  // Audio Event Listeners Setup
  useEffect(() => {
    const audio = audioRef.current;
    audio.volume = volume;

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
      if (!isNaN(audio.duration)) {
        setDuration(audio.duration);
      }
    };

    const handleLoadedMetadata = () => {
      setDuration(audio.duration);
      setPlaybackError(null);
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
    };

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('error', handleError);

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('error', handleError);
    };
  }, [repeatMode, queue, currentSong]);

  // Load and play song
  const playSong = (song, customQueue = null) => {
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
          setPlaybackError('Tap anywhere to enable audio');
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
  };

  const togglePlay = () => {
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
  };

  const seekTo = (seconds) => {
    const audio = audioRef.current;
    if (audio) {
      audio.currentTime = seconds;
      setCurrentTime(seconds);
    }
  };

  const handleNextSong = () => {
    if (!queue.length) return;
    let nextIndex;
    const currentIndex = queue.findIndex(s => s.id === currentSong?.id);

    if (isShuffle) {
      nextIndex = Math.floor(Math.random() * queue.length);
    } else {
      nextIndex = (currentIndex + 1) % queue.length;
    }
    playSong(queue[nextIndex]);
  };

  const handlePrevSong = () => {
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
  };

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

  // Playlists Management
  const createPlaylist = (name, description, coverUrl) => {
    const newPlaylist = {
      id: `pl-${Date.now()}`,
      name: name.trim() || 'My Playlist',
      description: description.trim() || '',
      coverUrl: coverUrl || 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?q=80&w=800&auto=format&fit=crop',
      songIds: []
    };
    setPlaylists(prev => [newPlaylist, ...prev]);
    showToast(`Created "${newPlaylist.name}"`);
    setIsCreatePlaylistOpen(false);
  };

  const deletePlaylist = (playlistId) => {
    setPlaylists(prev => prev.filter(p => p.id !== playlistId));
    if (activePlaylistDetail?.id === playlistId) {
      setActivePlaylistDetail(null);
    }
    showToast('Playlist deleted');
  };

  const addSongToPlaylist = (playlistId, songId) => {
    setPlaylists(prev => prev.map(pl => {
      if (pl.id === playlistId) {
        if (pl.songIds.includes(songId)) {
          showToast(`Song already in "${pl.name}"`);
          return pl;
        }
        showToast(`Added to "${pl.name}"`);
        return {
          ...pl,
          songIds: [...pl.songIds, songId]
        };
      }
      return pl;
    }));
    setSongForAddToPlaylist(null);
  };

  const removeSongFromPlaylist = (playlistId, songId) => {
    setPlaylists(prev => prev.map(pl => {
      if (pl.id === playlistId) {
        return {
          ...pl,
          songIds: pl.songIds.filter(id => id !== songId)
        };
      }
      return pl;
    }));
    showToast('Removed from playlist');
  };

  // Add Custom Song -> Synchronizes directly to Firebase Cloud in real time
  const addNewSong = async (songData) => {
    const newTrack = {
      id: `track-${Date.now()}`,
      title: songData.title.trim(),
      artist: songData.artist.trim() || 'Unknown Artist',
      album: songData.album.trim() || 'Single',
      duration: songData.duration || '3:30',
      durationSec: 210,
      audioUrl: songData.audioUrl.trim(),
      coverUrl: songData.coverUrl?.trim() || 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=800&auto=format&fit=crop',
      genre: songData.genre || 'Acoustic Pop',
      isCloudinary: songData.audioUrl.includes('cloudinary.com'),
      isFeatured: false,
      lyrics: songData.lyrics?.trim() || 'No lyrics available.'
    };

    setAllSongs(prev => [newTrack, ...prev.filter(s => s.id !== newTrack.id)]);
    showToast(`Added "${newTrack.title}" to Cloud Library!`);

    await saveSongToCloud(newTrack);
    playSong(newTrack, [newTrack, ...allSongs]);
  };

  // Edit Song -> Updates in Firebase Cloud in real time
  const editSong = async (songId, updatedData) => {
    setAllSongs(prev => prev.map(s => s.id === songId ? { ...s, ...updatedData } : s));
    showToast('Song updated in cloud');
    setSongToEdit(null);

    await updateSongInCloud(songId, updatedData);
  };

  // Delete Song -> Removes from Firebase Cloud in real time
  const deleteSong = async (songId) => {
    if (currentSong?.id === songId) {
      audioRef.current.pause();
      setIsPlaying(false);
      const remaining = allSongs.filter(s => s.id !== songId);
      if (remaining.length > 0) {
        setCurrentSong(remaining[0]);
      }
    }

    setAllSongs(prev => prev.filter(s => s.id !== songId));

    setPlaylists(prev => prev.map(pl => ({
      ...pl,
      songIds: pl.songIds.filter(id => id !== songId)
    })));

    setLikedSongIds(prev => prev.filter(id => id !== songId));

    showToast('Song removed from cloud');
    await deleteSongFromCloud(songId);
  };

  // Editable Lyrics Handler
  const updateSongLyrics = async (songId, newLyricsText) => {
    setAllSongs(prev => prev.map(s => s.id === songId ? { ...s, lyrics: newLyricsText } : s));
    showToast('Lyrics updated in cloud');

    await updateSongInCloud(songId, { lyrics: newLyricsText });
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
