import React from 'react';
import { X, Plus, Check } from 'lucide-react';
import { useAudio } from '../context/AudioContext';

const AddToPlaylistModal = () => {
  const {
    songForAddToPlaylist,
    setSongForAddToPlaylist,
    playlists,
    addSongToPlaylist,
    removeSongFromPlaylist,
    setIsCreatePlaylistOpen
  } = useAudio();

  if (!songForAddToPlaylist) return null;

  const handleTogglePlaylist = (pl, alreadyContains) => {
    if (alreadyContains) {
      removeSongFromPlaylist(pl.id, songForAddToPlaylist.id);
    } else {
      addSongToPlaylist(pl.id, songForAddToPlaylist.id);
    }
  };

  return (
    <div className="modal-overlay" onClick={() => setSongForAddToPlaylist(null)} style={{ zIndex: 120 }}>
      <div className="modal-content-sheet" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <div style={{ minWidth: 0, flex: 1, paddingRight: 10 }}>
            <h2 className="font-cinzel" style={{ fontSize: 17, color: '#fff', fontWeight: 800 }}>
              Add to Playlist
            </h2>
            <p style={{
              fontSize: 12,
              color: 'var(--gold-flat)',
              marginTop: 2,
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis'
            }}>
              "{songForAddToPlaylist.title}"
            </p>
          </div>
          <button
            onClick={() => setSongForAddToPlaylist(null)}
            className="btn-icon"
            style={{ width: 32, height: 32 }}
          >
            <X size={16} />
          </button>
        </div>

        {/* New Playlist Action */}
        <button
          onClick={() => {
            setSongForAddToPlaylist(null);
            setIsCreatePlaylistOpen(true);
          }}
          className="glass-card"
          style={{
            width: '100%',
            padding: '11px 14px',
            borderRadius: 14,
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            marginBottom: 12,
            border: '1px dashed var(--gold-flat)',
            cursor: 'pointer',
            textAlign: 'left'
          }}
        >
          <div style={{
            width: 38,
            height: 38,
            borderRadius: 10,
            background: 'var(--gold-flat)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#060608',
            flexShrink: 0
          }}>
            <Plus size={18} strokeWidth={3} />
          </div>
          <div>
            <p style={{ fontSize: 13, fontWeight: 700, color: '#fff' }}>New Playlist</p>
            <p style={{ fontSize: 11, color: 'var(--text-secondary)' }}>Create a new playlist for this track</p>
          </div>
        </button>

        {/* Playlist List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxHeight: 260, overflowY: 'auto' }}>
          {playlists.map((pl) => {
            const alreadyContains = (pl.songIds || []).includes(songForAddToPlaylist.id);

            return (
              <div
                key={pl.id}
                onClick={() => handleTogglePlaylist(pl, alreadyContains)}
                className="song-row-item"
                style={{
                  padding: '8px 10px',
                  borderRadius: 12,
                  background: alreadyContains ? 'rgba(212, 175, 55, 0.12)' : 'rgba(255,255,255,0.03)',
                  border: alreadyContains ? '1px solid var(--border-gold-strong)' : '1px solid transparent'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0, flex: 1 }}>
                  <img
                    src={pl.coverUrl}
                    alt={pl.name}
                    style={{ width: 40, height: 40, borderRadius: 8, objectFit: 'cover', flexShrink: 0 }}
                  />
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <p style={{
                      fontSize: 13,
                      fontWeight: 700,
                      color: '#fff',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis'
                    }}>
                      {pl.name}
                    </p>
                    <p style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                      {(pl.songIds || []).length} tracks {alreadyContains ? '• Added' : ''}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  style={{
                    background: alreadyContains ? 'var(--gold-flat)' : 'rgba(255,255,255,0.08)',
                    color: alreadyContains ? '#060608' : 'var(--gold-flat)',
                    border: alreadyContains ? 'none' : '1px solid var(--border-gold-subtle)',
                    borderRadius: 999,
                    padding: '5px 12px',
                    fontSize: 11,
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 4
                  }}
                >
                  {alreadyContains ? (
                    <>
                      <Check size={12} strokeWidth={3} />
                      <span>Added</span>
                    </>
                  ) : (
                    <span>+ Add</span>
                  )}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default AddToPlaylistModal;
