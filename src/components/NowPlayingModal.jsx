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
import { formatTime, parseTimeToSeconds } from '../utils/audioUtils';

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
    <div
      className={`now-playing-sheet ${isNowPlayingOpen ? 'open' : ''}`}
      style={{
        visibility: isNowPlayingOpen ? 'visible' : 'hidden',
        pointerEvents: isNowPlayingOpen ? 'auto' : 'none'
      }}
    >
      {/* Top Drag Indicator & Minimize Bar */}
      <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        {/* Swipe Down Handle */}
        <div
          onClick={() => setIsNowPlayingOpen(false)}
          style={{
            width: 38,
            height: 4,
            borderRadius: 999,
            background: 'rgba(255, 255, 255, 0.25)',
            marginBottom: 8,
            cursor: 'pointer'
          }}
        />

        {/* Top Header Bar */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          width: '100%',
          marginBottom: 8
        }}>
          <button
            onClick={() => setIsNowPlayingOpen(false)}
            className="btn-icon"
            style={{ width: 36, height: 36 }}
            title="Minimize"
          >
            <ChevronDown size={22} color="var(--gold-flat)" />
          </button>

          <div style={{ textAlign: 'center', minWidth: 0, padding: '0 8px' }}>
            <span style={{ fontSize: 9.5, letterSpacing: '0.12em', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>
              NOW PLAYING
            </span>
            <p style={{
              fontSize: 12,
              fontWeight: 700,
              color: 'var(--gold-flat)',
              marginTop: 1,
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              maxWidth: 190
            }}>
              {currentSong.album || 'Shofar Cadenza'}
            </p>
          </div>

          <button
            onClick={handleShare}
            className="btn-icon"
            style={{ width: 36, height: 36 }}
            title="Share"
          >
            <Share2 size={16} color="var(--text-secondary)" />
          </button>
        </div>

        {/* View Switcher (Vinyl vs Lyrics) */}
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          gap: 6,
          marginBottom: 8
        }}>
          <button
            onClick={() => setActiveView('vinyl')}
            className={`glass-pill ${activeView === 'vinyl' ? 'active' : ''}`}
            style={{
              padding: '4px 12px',
              borderRadius: 999,
              fontSize: 11,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 4
            }}
          >
            <Disc size={12} />
            <span>Vinyl</span>
          </button>

          <button
            onClick={() => setActiveView('lyrics')}
            className={`glass-pill ${activeView === 'lyrics' ? 'active' : ''}`}
            style={{
              padding: '4px 12px',
              borderRadius: 999,
              fontSize: 11,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 4
            }}
          >
            <Mic2 size={12} />
            <span>Lyrics</span>
          </button>
        </div>
      </div>

      {/* Center Viewport (Vinyl or Contained Scrollable Lyrics) */}
      <div style={{
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 0,
        margin: '4px 0',
        width: '100%',
        position: 'relative'
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
            <div style={{ marginTop: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
              <div className={`gold-equalizer-bars ${!isPlaying ? 'paused-eq' : ''}`}>
                <div className="eq-bar" />
                <div className="eq-bar" />
                <div className="eq-bar" />
                <div className="eq-bar" />
                <div className="eq-bar" />
              </div>
              <span style={{ fontSize: 10, color: 'var(--gold-flat)', fontWeight: 700, letterSpacing: '0.05em' }}>
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
            height: '100%',
            maxHeight: '260px',
            borderRadius: 16,
            padding: '12px 14px',
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            gap: 8,
            boxSizing: 'border-box'
          }}>
            {/* Lyrics Header with Edit Toggle */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border-gold-subtle)', paddingBottom: 6 }}>
              <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--gold-flat)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                {isEditingLyrics ? 'Editing Lyrics' : 'Song Lyrics'}
              </span>
              
              {isEditingLyrics ? (
                <button
                  onClick={handleSaveLyrics}
                  className="btn-gold-primary"
                  style={{ padding: '3px 10px', fontSize: 10.5, gap: 4 }}
                >
                  <Check size={12} />
                  <span>Save</span>
                </button>
              ) : (
                <button
                  onClick={() => setIsEditingLyrics(true)}
                  className="glass-pill"
                  style={{ padding: '3px 9px', fontSize: 10.5, color: 'var(--gold-flat)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}
                >
                  <Edit3 size={11} />
                  <span>Edit</span>
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
                  padding: 8,
                  fontSize: 12.5,
                  fontFamily: 'inherit',
                  lineHeight: '1.5',
                  resize: 'none',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
              />
            ) : (
              <div style={{
                whiteSpace: 'pre-line',
                fontSize: 12.5,
                lineHeight: '1.6',
                color: '#f0f0f5',
                fontFamily: 'inherit',
                overflowY: 'auto'
              }}>
                {currentSong.lyrics || 'No lyrics added yet. Tap "Edit" above to write or paste lyrics!'}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Bottom Controls Area (Pinned & Always Visible) */}
      <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 10 }}>
        {/* Song Info & Actions */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          width: '100%'
        }}>
          <div style={{ minWidth: 0, flex: 1, paddingRight: 10 }}>
            <h2 className="font-modern-heading" style={{
              fontSize: 18,
              fontWeight: 800,
              color: '#fff',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis'
            }}>
              {currentSong.title}
            </h2>
            <p style={{
              fontSize: 13,
              color: 'var(--gold-flat)',
              marginTop: 2,
              fontWeight: 600,
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis'
            }}>
              {currentSong.artist}
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            {/* Add to Playlist button */}
            <button
              onClick={() => setSongForAddToPlaylist(currentSong)}
              className="btn-icon"
              style={{ width: 36, height: 36 }}
              title="Add to Playlist"
            >
              <ListPlus size={18} color="var(--gold-flat)" />
            </button>

            {/* Like Heart */}
            <button
              onClick={() => toggleLike(currentSong.id)}
              className="btn-icon"
              style={{
                width: 36,
                height: 36,
                borderColor: liked ? 'var(--gold-flat)' : undefined,
                background: liked ? 'rgba(212, 175, 55, 0.14)' : undefined
              }}
              title={liked ? 'Unlike' : 'Like'}
            >
              <Heart
                size={18}
                fill={liked ? 'var(--gold-flat)' : 'none'}
                color={liked ? 'var(--gold-flat)' : 'var(--text-secondary)'}
              />
            </button>
          </div>
        </div>

        {/* Interactive Scrub Bar */}
        <div>
          <input
            type="range"
            min="0"
            max={duration > 0 ? duration : (currentSong.durationSec || parseTimeToSeconds(currentSong.duration) || 100)}
            step="0.1"
            value={currentTime}
            onChange={handleSeekChange}
            className="gold-slider"
          />
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            marginTop: 4,
            fontSize: 11,
            color: 'var(--text-secondary)',
            fontWeight: 600
          }}>
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration > 0 ? duration : (currentSong.durationSec || parseTimeToSeconds(currentSong.duration) || 0))}</span>
          </div>
        </div>

        {/* Main Playback Controls Bar */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 4px'
        }}>
          {/* Shuffle */}
          <button
            onClick={toggleShuffle}
            style={{
              background: 'transparent',
              border: 'none',
              color: isShuffle ? 'var(--gold-flat)' : 'var(--text-muted)',
              cursor: 'pointer',
              padding: 6
            }}
            title={isShuffle ? 'Shuffle On' : 'Shuffle Off'}
          >
            <Shuffle size={18} />
          </button>

          {/* Previous */}
          <button
            onClick={handlePrevSong}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#fff',
              cursor: 'pointer',
              padding: 6
            }}
            title="Previous Track"
          >
            <SkipBack size={22} fill="#fff" />
          </button>

          {/* Play / Pause - Flat Gold Button */}
          <button
            onClick={togglePlay}
            style={{
              width: 54,
              height: 54,
              borderRadius: '50%',
              background: 'var(--gold-flat)',
              border: 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              boxShadow: '0 4px 16px rgba(212,175,55,0.4)',
              transition: 'transform 0.15s ease'
            }}
            title={isPlaying ? 'Pause' : 'Play'}
          >
            {isPlaying ? (
              <Pause size={24} fill="#060608" color="#060608" />
            ) : (
              <Play size={24} fill="#060608" color="#060608" style={{ marginLeft: 2.5 }} />
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
              padding: 6
            }}
            title="Next Track"
          >
            <SkipForward size={22} fill="#fff" />
          </button>

          {/* Repeat */}
          <button
            onClick={cycleRepeat}
            style={{
              background: 'transparent',
              border: 'none',
              color: repeatMode !== 'off' ? 'var(--gold-flat)' : 'var(--text-muted)',
              cursor: 'pointer',
              padding: 6,
              position: 'relative'
            }}
            title={`Repeat: ${repeatMode}`}
          >
            {repeatMode === 'one' ? <Repeat1 size={18} /> : <Repeat size={18} />}
            {repeatMode !== 'off' && (
              <span style={{
                position: 'absolute',
                bottom: 2,
                right: 6,
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
          gap: 10,
          padding: '2px 4px'
        }}>
          <button
            onClick={toggleMute}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--gold-flat)',
              cursor: 'pointer',
              padding: 2
            }}
            title={isMuted ? 'Unmute' : 'Mute'}
          >
            {isMuted || volume === 0 ? <VolumeX size={16} /> : <Volume2 size={16} />}
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
    </div>
  );
};

export default NowPlayingModal;
