import React from 'react';
import { Play, Pause, SkipBack, SkipForward, Heart } from 'lucide-react';
import { useAudio } from '../context/AudioContext';

const MiniPlayer = () => {
  const {
    currentSong,
    isPlaying,
    togglePlay,
    handleNextSong,
    handlePrevSong,
    currentTime,
    duration,
    setIsNowPlayingOpen,
    isLiked,
    toggleLike
  } = useAudio();

  if (!currentSong) return null;

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;
  const liked = isLiked(currentSong.id);

  return (
    <div
      className="mini-player-bar"
      onClick={() => setIsNowPlayingOpen(true)}
    >
      {/* Progress line */}
      <div className="mini-player-progress">
        <div
          className="mini-player-progress-fill"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      {/* Album Artwork */}
      <div style={{ position: 'relative', width: 40, height: 40, flexShrink: 0 }}>
        <img
          src={currentSong.coverUrl}
          alt={currentSong.title}
          style={{
            width: '100%',
            height: '100%',
            borderRadius: 8,
            objectFit: 'cover',
            border: '1.5px solid var(--gold-flat)'
          }}
        />
        {isPlaying && (
          <div style={{
            position: 'absolute',
            inset: 0,
            background: 'rgba(0,0,0,0.35)',
            borderRadius: 8,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <div className="gold-equalizer-bars" style={{ height: 11 }}>
              <div className="eq-bar" style={{ width: 2 }} />
              <div className="eq-bar" style={{ width: 2 }} />
              <div className="eq-bar" style={{ width: 2 }} />
            </div>
          </div>
        )}
      </div>

      {/* Title & Artist */}
      <div style={{ flex: 1, minWidth: 0, paddingRight: 4 }}>
        <p style={{
          fontSize: 13,
          fontWeight: 700,
          color: '#fff',
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          letterSpacing: '-0.01em'
        }}>
          {currentSong.title}
        </p>
        <p style={{
          fontSize: 11,
          color: 'var(--text-secondary)',
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          marginTop: 1
        }}>
          {currentSong.artist}
        </p>
      </div>

      {/* Action Buttons */}
      <div
        style={{ display: 'flex', alignItems: 'center', gap: 4 }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Like Button */}
        <button
          onClick={() => toggleLike(currentSong.id)}
          style={{
            background: 'transparent',
            border: 'none',
            color: liked ? 'var(--gold-flat)' : 'var(--text-muted)',
            cursor: 'pointer',
            padding: 5,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
          title={liked ? 'Unlike' : 'Like'}
        >
          <Heart
            size={18}
            strokeWidth={2.2}
            fill={liked ? 'var(--gold-flat)' : 'none'}
            color={liked ? 'var(--gold-flat)' : 'var(--text-secondary)'}
          />
        </button>

        {/* Previous Song Button */}
        <button
          onClick={handlePrevSong}
          style={{
            background: 'transparent',
            border: 'none',
            color: 'var(--text-secondary)',
            cursor: 'pointer',
            padding: 5,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
          title="Previous"
        >
          <SkipBack size={18} strokeWidth={2.2} />
        </button>

        {/* Play / Pause - Gold Button */}
        <button
          onClick={togglePlay}
          style={{
            width: 34,
            height: 34,
            borderRadius: '50%',
            background: 'var(--gold-flat)',
            border: 'none',
            color: '#060608',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            boxShadow: '0 2px 10px rgba(212,175,55,0.4)',
            transition: 'transform 0.15s ease'
          }}
          title={isPlaying ? 'Pause' : 'Play'}
        >
          {isPlaying ? (
            <Pause size={16} strokeWidth={2.5} fill="#060608" color="#060608" />
          ) : (
            <Play size={16} strokeWidth={2.5} fill="#060608" color="#060608" style={{ marginLeft: 1.5 }} />
          )}
        </button>

        {/* Next Song Button */}
        <button
          onClick={handleNextSong}
          style={{
            background: 'transparent',
            border: 'none',
            color: 'var(--text-secondary)',
            cursor: 'pointer',
            padding: 5,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
          title="Next"
        >
          <SkipForward size={18} strokeWidth={2.2} />
        </button>
      </div>
    </div>
  );
};

export default MiniPlayer;
