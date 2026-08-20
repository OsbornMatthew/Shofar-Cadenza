import React, { useState, useEffect } from 'react';
import {
  ChevronDown,
  Heart,
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Shuffle,
  Repeat,
  Repeat1,
  Volume2,
  VolumeX,
  ListPlus,
  Mic2,
  Disc,
  Share2,
  Edit3,
  Check
} from 'lucide-react';
import { useAudio } from '../context/AudioContext';

const NowPlayingModal = () => {
  const {
    currentSong,
    isPlaying,
    togglePlay,
    handleNextSong,
    handlePrevSong,
    currentTime,
    duration,
    seekTo,
    volume,
    isMuted,
    changeVolume,
    toggleMute,
    isShuffle,
    toggleShuffle,
    repeatMode,
    cycleRepeat,
    isNowPlayingOpen,
    setIsNowPlayingOpen,
    isLiked,
    toggleLike,
    setSongForAddToPlaylist,
    updateSongLyrics,
    showToast
  } = useAudio();

  const [activeView, setActiveView] = useState('vinyl'); // 'vinyl' | 'lyrics'
  const [isEditingLyrics, setIsEditingLyrics] = useState(false);
  const [editedLyrics, setEditedLyrics] = useState('');

  // Sync lyrics state when currentSong changes
  useEffect(() => {
    if (currentSong) {
      setEditedLyrics(currentSong.lyrics || '');
      setIsEditingLyrics(false);
    }
  }, [currentSong]);

  if (!currentSong) return null;

  const formatTime = (secs) => {
    if (isNaN(secs) || secs < 0) return '0:00';
    const minutes = Math.floor(secs / 60);
    const seconds = Math.floor(secs % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  const handleSeekChange = (e) => {
    const newTime = parseFloat(e.target.value);
    seekTo(newTime);
  };

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(currentSong.audioUrl);
      showToast('Audio URL copied to clipboard');
    } else {
      showToast('Audio link ready');
    }
  };

  const handleSaveLyrics = () => {
    updateSongLyrics(currentSong.id, editedLyrics);
    setIsEditingLyrics(false);
  };

  const liked = isLiked(currentSong.id);

  return (
    <div className={`now-playing-sheet ${isNowPlayingOpen ? 'open' : ''}`}>
      {/* Top Bar */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 16
      }}>
        <button
          onClick={() => setIsNowPlayingOpen(false)}
          className="btn-icon"
          title="Minimize"
        >
          <ChevronDown size={22} color="var(--gold-flat)" />
        </button>

        <div style={{ textAlign: 'center' }}>
          <span style={{ fontSize: 10, letterSpacing: '0.12em', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>
            PLAYING
          </span>
          <p style={{ fontSize: 12, fontWeight: 700, color: 'var(--gold-flat)', marginTop: 1 }}>
            {currentSong.album}
          </p>
        </div>

        <button
          onClick={handleShare}
          className="btn-icon"
          title="Share"
        >
          <Share2 size={18} color="var(--text-secondary)" />
        </button>
      </div>

      {/* View Switcher (Vinyl vs Lyrics) */}
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        gap: 8,
        marginBottom: 18
      }}>
        <button
          onClick={() => setActiveView('vinyl')}
          className={`glass-pill ${activeView === 'vinyl' ? 'active' : ''}`}
          style={{
            padding: '5px 14px',
            borderRadius: 999,
            fontSize: 11,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 5
          }}
        >
          <Disc size={13} />
          <span>Vinyl</span>
        </button>

        <button
          onClick={() => setActiveView('lyrics')}
          className={`glass-pill ${activeView === 'lyrics' ? 'active' : ''}`}
          style={{
            padding: '5px 14px',
            borderRadius: 999,
            fontSize: 11,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 5
          }}
        >
          <Mic2 size={13} />
          <span>Lyrics</span>
        </button>
      </div>

      {/* Center Display (Vinyl or Editable Lyrics) */}
      <div style={{
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 260,
        margin: '8px 0'
      }}>
        {activeView === 'vinyl' ? (
          <div className="vinyl-wrapper" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div className={`spinning-gold-vinyl ${isPlaying ? 'playing' : ''}`}>
              <div className="vinyl-grooves" />
              <img
                src={currentSong.coverUrl}
                alt={currentSong.title}
                className="vinyl-center-art"
              />
              <div className="vinyl-center-hole" />
            </div>

            {/* Live Visualizer Equalizer */}
            <div style={{ marginTop: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
              <div className={`gold-equalizer-bars ${!isPlaying ? 'paused-eq' : ''}`}>
                <div className="eq-bar" />
                <div className="eq-bar" />
                <div className="eq-bar" />
                <div className="eq-bar" />
                <div className="eq-bar" />
              </div>
              <span style={{ fontSize: 11, color: 'var(--gold-flat)', fontWeight: 600, letterSpacing: '0.04em' }}>
                {isPlaying ? 'AUDIO ACTIVE' : 'PAUSED'}
              </span>
              <div className={`gold-equalizer-bars ${!isPlaying ? 'paused-eq' : ''}`}>
                <div className="eq-bar" />
                <div className="eq-bar" />
                <div className="eq-bar" />
                <div className="eq-bar" />
                <div className="eq-bar" />
              </div>
            </div>
          </div>
        ) : (
          <div className="glass-card" style={{
            width: '100%',
            height: '270px',
            borderRadius: 18,
            padding: '16px',
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            gap: 10
          }}>
            {/* Lyrics Header with Edit Toggle */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border-gold-subtle)', paddingBottom: 8 }}>
              <span style={{ fontSize: 11.5, fontWeight: 700, color: 'var(--gold-flat)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                {isEditingLyrics ? 'Editing Lyrics' : 'Song Lyrics'}
              </span>
              
              {isEditingLyrics ? (
                <button
                  onClick={handleSaveLyrics}
                  className="btn-gold-primary"
                  style={{ padding: '4px 10px', fontSize: 11, gap: 4 }}
                >
                  <Check size={13} />
                  <span>Save</span>
                </button>
              ) : (
                <button
                  onClick={() => setIsEditingLyrics(true)}
                  className="glass-pill"
                  style={{ padding: '4px 10px', fontSize: 11, color: 'var(--gold-flat)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}
                >
                  <Edit3 size={12} />
                  <span>Edit Lyrics</span>
                </button>
              )}
            </div>

            {/* Editable Textarea or Formatted Lyrics */}
            {isEditingLyrics ? (
              <textarea
                value={editedLyrics}
                onChange={(e) => setEditedLyrics(e.target.value)}
                placeholder="Type or paste lyrics here..."
                style={{
                  width: '100%',
                  flex: 1,
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid var(--gold-flat)',
                  borderRadius: 10,
                  color: '#fff',
                  padding: 10,
                  fontSize: 13,
                  fontFamily: 'inherit',
                  lineHeight: '1.6',
                  resize: 'none',
                  outline: 'none'
                }}
              />
            ) : (
              <div style={{
                whiteSpace: 'pre-line',
                fontSize: 13.5,
                lineHeight: '1.7',
                color: '#f0f0f5',
                fontFamily: 'inherit'
              }}>
                {currentSong.lyrics || 'No lyrics added yet. Tap "Edit Lyrics" above to write or paste lyrics!'}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Song Info & Like Action */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginTop: 8,
        marginBottom: 14
      }}>
        <div style={{ minWidth: 0, flex: 1, paddingRight: 10 }}>
          <h2 className="font-cinzel" style={{
            fontSize: 19,
            fontWeight: 800,
            color: '#fff',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis'
          }}>
            {currentSong.title}
          </h2>
          <p style={{
            fontSize: 13.5,
            color: 'var(--gold-flat)',
            marginTop: 3,
            fontWeight: 600
          }}>
            {currentSong.artist}
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          {/* Add to Playlist button */}
          <button
            onClick={() => setSongForAddToPlaylist(currentSong)}
            className="btn-icon"
            title="Add to Playlist"
          >
            <ListPlus size={19} color="var(--gold-flat)" />
          </button>

          {/* Like Heart */}
          <button
            onClick={() => toggleLike(currentSong.id)}
            className="btn-icon"
            style={{
              borderColor: liked ? 'var(--gold-flat)' : undefined,
              background: liked ? 'rgba(212, 175, 55, 0.12)' : undefined
            }}
            title={liked ? 'Unlike' : 'Like'}
          >
            <Heart
              size={19}
              fill={liked ? 'var(--gold-flat)' : 'none'}
              color={liked ? 'var(--gold-flat)' : 'var(--text-secondary)'}
            />
          </button>
        </div>
      </div>

      {/* Interactive Scrub Bar */}
      <div style={{ marginBottom: 12 }}>
        <input
          type="range"
          min="0"
          max={duration || 100}
          step="0.1"
          value={currentTime}
          onChange={handleSeekChange}
          className="gold-slider"
        />
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          marginTop: 6,
          fontSize: 11,
          color: 'var(--text-secondary)',
          fontWeight: 600
        }}>
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(duration || currentSong.durationSec)}</span>
        </div>
      </div>

      {/* Main Playback Controls Bar */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 6px',
        marginBottom: 16
      }}>
        {/* Shuffle */}
        <button
          onClick={toggleShuffle}
          style={{
            background: 'transparent',
            border: 'none',
            color: isShuffle ? 'var(--gold-flat)' : 'var(--text-muted)',
            cursor: 'pointer',
            padding: 8
          }}
          title={isShuffle ? 'Shuffle On' : 'Shuffle Off'}
        >
          <Shuffle size={19} />
        </button>

        {/* Previous */}
        <button
          onClick={handlePrevSong}
          style={{
            background: 'transparent',
            border: 'none',
            color: '#fff',
            cursor: 'pointer',
            padding: 8
          }}
          title="Previous Track"
        >
          <SkipBack size={25} fill="#fff" />
        </button>

        {/* Play / Pause - Flat Gold Button */}
        <button
          onClick={togglePlay}
          style={{
            width: 60,
            height: 60,
            borderRadius: '50%',
            background: 'var(--gold-flat)',
            border: 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            boxShadow: '0 4px 16px rgba(0,0,0,0.6)',
            transition: 'transform 0.15s ease'
          }}
          title={isPlaying ? 'Pause' : 'Play'}
        >
          {isPlaying ? (
            <Pause size={28} fill="#060608" color="#060608" />
          ) : (
            <Play size={28} fill="#060608" color="#060608" style={{ marginLeft: 3 }} />
          )}
        </button>

        {/* Next */}
        <button
          onClick={handleNextSong}
          style={{
            background: 'transparent',
            border: 'none',
            color: '#fff',
            cursor: 'pointer',
            padding: 8
          }}
          title="Next Track"
        >
          <SkipForward size={25} fill="#fff" />
        </button>

        {/* Repeat */}
        <button
          onClick={cycleRepeat}
          style={{
            background: 'transparent',
            border: 'none',
            color: repeatMode !== 'off' ? 'var(--gold-flat)' : 'var(--text-muted)',
            cursor: 'pointer',
            padding: 8,
            position: 'relative'
          }}
          title={`Repeat: ${repeatMode}`}
        >
          {repeatMode === 'one' ? <Repeat1 size={19} /> : <Repeat size={19} />}
          {repeatMode !== 'off' && (
            <span style={{
              position: 'absolute',
              bottom: 3,
              right: 8,
              width: 4,
              height: 4,
              borderRadius: '50%',
              background: 'var(--gold-flat)'
            }} />
          )}
        </button>
      </div>

      {/* Volume Bar */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        padding: '6px 4px'
      }}>
        <button
          onClick={toggleMute}
          style={{
            background: 'transparent',
            border: 'none',
            color: 'var(--gold-flat)',
            cursor: 'pointer',
            padding: 4
          }}
          title={isMuted ? 'Unmute' : 'Mute'}
        >
          {isMuted || volume === 0 ? <VolumeX size={17} /> : <Volume2 size={17} />}
        </button>

        <input
          type="range"
          min="0"
          max="1"
          step="0.01"
          value={isMuted ? 0 : volume}
          onChange={(e) => changeVolume(parseFloat(e.target.value))}
          className="gold-slider"
          style={{ flex: 1, height: 3 }}
        />
      </div>
    </div>
  );
};

export default NowPlayingModal;
