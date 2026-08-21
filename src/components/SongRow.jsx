import React, { useState } from 'react';
import { Heart, MoreVertical, Plus, Trash2, Edit2 } from 'lucide-react';
import { useAudio } from '../context/AudioContext';

const SongRow = ({ song, index, playlistContext = null, onRemoveFromPlaylist = null }) => {
  const {
    currentSong,
    isPlaying,
    playSong,
    toggleLike,
    isLiked,
    setSongForAddToPlaylist,
    setSongToEdit,
    deleteSong,
    allSongs,
    openConfirmModal
  } = useAudio();

  const [showMenu, setShowMenu] = useState(false);

  const isCurrentActive = currentSong?.id === song.id;
  const liked = isLiked(song.id);

  const handleRowClick = () => {
    playSong(song, playlistContext ? playlistContext.songs : allSongs);
  };

  const handleDeleteSong = () => {
    setShowMenu(false);
    openConfirmModal({
      title: 'Delete Song',
      message: `Are you sure you want to permanently delete "${song.title}" by ${song.artist}? This will remove it from all playlists and cannot be undone.`,
      confirmText: 'Delete Song',
      isDestructive: true,
      onConfirm: () => deleteSong(song.id)
    });
  };

  return (
    <div
      className={`song-row-item ${isCurrentActive ? 'active-playing' : ''}`}
      onClick={handleRowClick}
      style={{ position: 'relative' }}
    >
      {/* Index or Equalizer */}
      <div style={{
        width: 22,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 6,
        flexShrink: 0
      }}>
        {isCurrentActive && isPlaying ? (
          <div className="gold-equalizer-bars" style={{ height: 13 }}>
            <div className="eq-bar" style={{ width: 2 }} />
            <div className="eq-bar" style={{ width: 2 }} />
            <div className="eq-bar" style={{ width: 2 }} />
          </div>
        ) : (
          <span style={{
            fontSize: 12,
            fontWeight: 600,
            color: isCurrentActive ? 'var(--gold-flat)' : 'var(--text-muted)'
          }}>
            {index !== undefined ? index + 1 : '•'}
          </span>
        )}
      </div>

      {/* Thumbnail */}
      <div style={{ position: 'relative', width: 42, height: 42, marginRight: 10, flexShrink: 0 }}>
        <img
          src={song.coverUrl}
          alt={song.title}
          style={{
            width: '100%',
            height: '100%',
            borderRadius: 8,
            objectFit: 'cover',
            border: isCurrentActive ? '1.5px solid var(--gold-flat)' : '1px solid rgba(255,255,255,0.06)'
          }}
        />
      </div>

      {/* Song Info */}
      <div style={{ flex: 1, minWidth: 0, paddingRight: 6 }}>
        <p style={{
          fontSize: 13,
          fontWeight: 700,
          color: isCurrentActive ? 'var(--gold-flat)' : '#fff',
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          letterSpacing: '-0.01em'
        }}>
          {song.title}
        </p>
        <p style={{
          fontSize: 11,
          color: 'var(--text-secondary)',
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          marginTop: 2
        }}>
          {song.artist}
        </p>
      </div>

      {/* Right Actions */}
      <div
        style={{ display: 'flex', alignItems: 'center', gap: 6 }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Duration */}
        <span style={{ fontSize: 11, color: 'var(--text-muted)', marginRight: 2 }}>
          {song.duration}
        </span>

        {/* Like Heart */}
        <button
          onClick={() => toggleLike(song.id)}
          style={{
            background: 'transparent',
            border: 'none',
            color: liked ? 'var(--gold-flat)' : 'var(--text-muted)',
            cursor: 'pointer',
            padding: 4,
            display: 'flex',
            alignItems: 'center'
          }}
          title={liked ? 'Unlike' : 'Like'}
        >
          <Heart
            size={16}
            strokeWidth={2.2}
            fill={liked ? 'var(--gold-flat)' : 'none'}
            color={liked ? 'var(--gold-flat)' : 'var(--text-muted)'}
          />
        </button>

        {/* 3-Dots Menu */}
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => setShowMenu(!showMenu)}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--text-secondary)',
              cursor: 'pointer',
              padding: 4,
              display: 'flex',
              alignItems: 'center'
            }}
            title="Options"
          >
            <MoreVertical size={16} />
          </button>

          {showMenu && (
            <div
              className="glass-card"
              style={{
                position: 'absolute',
                top: 24,
                right: 0,
                width: 175,
                borderRadius: 12,
                padding: '5px 0',
                zIndex: 70,
                boxShadow: '0 8px 24px rgba(0,0,0,0.85)',
                border: '1px solid var(--border-gold-strong)'
              }}
            >
              {/* Add to Playlist */}
              <button
                onClick={() => {
                  setSongForAddToPlaylist(song);
                  setShowMenu(false);
                }}
                style={{
                  width: '100%',
                  textAlign: 'left',
                  background: 'transparent',
                  border: 'none',
                  color: '#fff',
                  padding: '7px 12px',
                  fontSize: 12,
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  cursor: 'pointer'
                }}
              >
                <Plus size={14} color="var(--gold-flat)" />
                <span>Add to Playlist</span>
              </button>

              {/* Edit Song */}
              <button
                onClick={() => {
                  setSongToEdit(song);
                  setShowMenu(false);
                }}
                style={{
                  width: '100%',
                  textAlign: 'left',
                  background: 'transparent',
                  border: 'none',
                  color: '#fff',
                  padding: '7px 12px',
                  fontSize: 12,
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  cursor: 'pointer'
                }}
              >
                <Edit2 size={13} color="var(--gold-flat)" />
                <span>Edit Song</span>
              </button>

              {/* Remove from Playlist (if in playlist view) */}
              {onRemoveFromPlaylist && (
                <button
                  onClick={() => {
                    setShowMenu(false);
                    onRemoveFromPlaylist(song.id);
                  }}
                  style={{
                    width: '100%',
                    textAlign: 'left',
                    background: 'transparent',
                    border: 'none',
                    color: '#ff8888',
                    padding: '7px 12px',
                    fontSize: 12,
                    fontWeight: 600,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    cursor: 'pointer'
                  }}
                >
                  <Trash2 size={13} />
                  <span>Remove from List</span>
                </button>
              )}

              {/* Delete Song Completely */}
              <button
                onClick={handleDeleteSong}
                style={{
                  width: '100%',
                  textAlign: 'left',
                  background: 'transparent',
                  border: 'none',
                  color: '#ff6b6b',
                  padding: '7px 12px',
                  fontSize: 12,
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  cursor: 'pointer',
                  borderTop: '1px solid rgba(255,255,255,0.06)'
                }}
              >
                <Trash2 size={13} />
                <span>Delete Song</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SongRow;
