import React from 'react';
import { X, Plus } from 'lucide-react';
import { useAudio } from '../context/AudioContext';

const AddToPlaylistModal = () => {
  const {
    songForAddToPlaylist,
    setSongForAddToPlaylist,
    playlists,
    addSongToPlaylist,
    setIsCreatePlaylistOpen
  } = useAudio();

  if (!songForAddToPlaylist) return null;

  return (
    <div className="modal-overlay" onClick={() => setSongForAddToPlaylist(null)}>
      <div className="modal-content-sheet" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <div>
            <h2 className="font-cinzel" style={{ fontSize: 17, color: '#fff', fontWeight: 800 }}>
              Add to Playlist
            </h2>
            <p style={{ fontSize: 12, color: 'var(--gold-flat)', marginTop: 2 }}>
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
            color: '#060608'
          }}>
            <Plus size={18} strokeWidth={3} />
          </div>
          <div>
            <p style={{ fontSize: 13, fontWeight: 700, color: '#fff' }}>New Playlist</p>
            <p style={{ fontSize: 11, color: 'var(--text-secondary)' }}>Create and add this song</p>
          </div>
        </button>

        {/* Playlist List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxHeight: 260, overflowY: 'auto' }}>
          {playlists.map((pl) => {
            const alreadyContains = pl.songIds?.includes(songForAddToPlaylist.id);

            return (
              <div
                key={pl.id}
                onClick={() => addSongToPlaylist(pl.id, songForAddToPlaylist.id)}
                className="song-row-item"
                style={{
                  padding: '8px 10px',
                  borderRadius: 12,
                  background: alreadyContains ? 'rgba(212, 175, 55, 0.08)' : 'rgba(255,255,255,0.03)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <img
                    src={pl.coverUrl}
                    alt={pl.name}
                    style={{ width: 40, height: 40, borderRadius: 8, objectFit: 'cover' }}
                  />
                  <div>
                    <p style={{ fontSize: 13, fontWeight: 700, color: '#fff' }}>{pl.name}</p>
                    <p style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                      {pl.songIds?.length || 0} tracks {alreadyContains ? '• Added' : ''}
                    </p>
                  </div>
                </div>

                <button
                  style={{
                    background: alreadyContains ? 'transparent' : 'var(--gold-flat)',
                    color: alreadyContains ? 'var(--gold-flat)' : '#060608',
                    border: alreadyContains ? '1px solid var(--gold-flat)' : 'none',
                    borderRadius: 999,
                    padding: '5px 12px',
                    fontSize: 11,
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  {alreadyContains ? 'Added ✓' : 'Add +'}
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
