import React, { useState } from 'react';
import {
  Heart,
  Plus,
  Play,
  Shuffle,
  Trash2,
  ArrowLeft,
  Music,
  ListMusic,
  Disc3,
  Search as SearchIcon
} from 'lucide-react';
import { useAudio } from '../context/AudioContext';
import SongRow from '../components/SongRow';

const Library = () => {
  const {
    allSongs,
    playlists,
    likedSongIds,
    activePlaylistDetail,
    setActivePlaylistDetail,
    setIsCreatePlaylistOpen,
    deletePlaylist,
    removeSongFromPlaylist,
    playSong,
    isShuffle,
    toggleShuffle,
    openConfirmModal
  } = useAudio();

  const [libraryTab, setLibraryTab] = useState('playlists'); // 'playlists' | 'all-songs'
  const [songFilterQuery, setSongFilterQuery] = useState('');

  const likedSongs = allSongs.filter(s => likedSongIds.includes(s.id));

  // Detail View of a single playlist or Liked Songs
  if (activePlaylistDetail) {
    let currentSongsList = [];
    let isLikedView = activePlaylistDetail.isLikedSpecial || activePlaylistDetail.id === 'liked-songs';

    if (isLikedView) {
      currentSongsList = likedSongs;
    } else {
      const pl = playlists.find(p => p.id === activePlaylistDetail.id) || activePlaylistDetail;
      currentSongsList = allSongs.filter(s => pl.songIds?.includes(s.id));
    }

    const handlePlayAll = () => {
      if (currentSongsList.length > 0) {
        playSong(currentSongsList[0], currentSongsList);
      }
    };

    const handleShufflePlay = () => {
      if (currentSongsList.length > 0) {
        if (!isShuffle) toggleShuffle();
        const randomIndex = Math.floor(Math.random() * currentSongsList.length);
        playSong(currentSongsList[randomIndex], currentSongsList);
      }
    };

    const handleDeletePlaylist = () => {
      openConfirmModal({
        title: 'Delete Playlist',
        message: `Are you sure you want to permanently delete "${activePlaylistDetail.name}"? The songs inside will remain in your library.`,
        confirmText: 'Delete Playlist',
        isDestructive: true,
        onConfirm: () => {
          deletePlaylist(activePlaylistDetail.id);
        }
      });
    };

    return (
      <div className="app-content-scrollable">
        <div style={{ padding: '16px 16px 16px 16px', display: 'flex', flexDirection: 'column', gap: 16, width: '100%', boxSizing: 'border-box' }}>
          {/* Back button */}
          <div>
            <button
              onClick={() => setActivePlaylistDetail(null)}
              className="btn-icon"
              style={{ width: 36, height: 36 }}
            >
              <ArrowLeft size={18} strokeWidth={2.2} color="var(--gold-flat)" />
            </button>
          </div>

          {/* Playlist Detail Header */}
          <div style={{ display: 'flex', gap: 14, alignItems: 'center', width: '100%' }}>
            <div style={{ position: 'relative', width: 85, height: 85, flexShrink: 0 }}>
              {isLikedView ? (
                <div style={{
                  width: '100%',
                  height: '100%',
                  borderRadius: 14,
                  background: 'rgba(212, 175, 55, 0.16)',
                  border: '1.5px solid var(--gold-flat)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 4px 15px rgba(212, 175, 55, 0.25)'
                }}>
                  <Heart size={38} strokeWidth={2.2} fill="var(--gold-flat)" color="var(--gold-flat)" />
                </div>
              ) : (
                <img
                  src={activePlaylistDetail.coverUrl}
                  alt={activePlaylistDetail.name}
                  style={{
                    width: '100%',
                    height: '100%',
                    borderRadius: 14,
                    objectFit: 'cover',
                    border: '1.5px solid var(--gold-flat)'
                  }}
                />
              )}
            </div>

            <div style={{ flex: 1, minWidth: 0 }}>
              <span style={{ fontSize: 10, letterSpacing: '0.1em', fontWeight: 800, color: 'var(--gold-flat)', textTransform: 'uppercase' }}>
                {isLikedView ? 'COLLECTION' : 'PLAYLIST'}
              </span>
              <h2 className="font-modern-heading" style={{
                fontSize: 20,
                fontWeight: 800,
                color: '#fff',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                marginTop: 2
              }}>
                {activePlaylistDetail.name}
              </h2>
              <p style={{ fontSize: 11.5, color: 'var(--text-secondary)', marginTop: 2 }}>
                {activePlaylistDetail.description || `${currentSongsList.length} tracks`}
              </p>
              <p style={{ fontSize: 11, color: 'var(--gold-flat)', fontWeight: 600, marginTop: 4 }}>
                {currentSongsList.length} Tracks
              </p>
            </div>
          </div>

          {/* Action Row */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <button
                onClick={handlePlayAll}
                className="btn-gold-primary"
                style={{ padding: '8px 18px', fontSize: 12 }}
                disabled={currentSongsList.length === 0}
              >
                <Play size={15} strokeWidth={2.5} fill="#060608" color="#060608" />
                <span>Play All</span>
              </button>

              <button
                onClick={handleShufflePlay}
                className="btn-gold-outline"
                style={{ padding: '8px 14px', fontSize: 12 }}
                disabled={currentSongsList.length === 0}
              >
                <Shuffle size={14} strokeWidth={2.2} />
                <span>Shuffle</span>
              </button>
            </div>

            {!isLikedView && (
              <button
                onClick={handleDeletePlaylist}
                className="btn-icon"
                style={{ width: 36, height: 36, color: '#ff6b6b', background: 'rgba(255,107,107,0.1)', border: '1px solid rgba(255,107,107,0.3)' }}
                title="Delete Playlist"
              >
                <Trash2 size={17} strokeWidth={2.2} />
              </button>
            )}
          </div>

          {/* Song List */}
          {currentSongsList.length > 0 ? (
            <div className="glass-card" style={{ borderRadius: 16, padding: '4px', width: '100%', boxSizing: 'border-box' }}>
              {currentSongsList.map((song, idx) => (
                <SongRow
                  key={song.id}
                  song={song}
                  index={idx}
                  playlistContext={{ songs: currentSongsList }}
                  onRemoveFromPlaylist={!isLikedView ? (songId) => removeSongFromPlaylist(activePlaylistDetail.id, songId) : null}
                />
              ))}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-muted)' }}>
              <Music size={32} strokeWidth={2} color="var(--gold-600)" style={{ marginBottom: 10 }} />
              <p style={{ fontSize: 14, color: '#fff', fontWeight: 600 }}>No songs in this playlist</p>
              <p style={{ fontSize: 12, marginTop: 4 }}>Add songs using the 3-dots menu on any track</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Filtered all songs list for All Songs tab
  const filteredAllSongs = allSongs.filter(s =>
    s.title.toLowerCase().includes(songFilterQuery.toLowerCase().trim()) ||
    s.artist.toLowerCase().includes(songFilterQuery.toLowerCase().trim()) ||
    s.album?.toLowerCase().includes(songFilterQuery.toLowerCase().trim())
  );

  return (
    <div className="app-content-scrollable">
      <div style={{ padding: '16px 16px 16px 16px', display: 'flex', flexDirection: 'column', gap: 16, width: '100%', boxSizing: 'border-box' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
          <h1 className="font-modern-heading" style={{ fontSize: 24, fontWeight: 900, color: '#fff' }}>
            Your Library
          </h1>

          {libraryTab === 'playlists' && (
            <button
              onClick={() => setIsCreatePlaylistOpen(true)}
              className="btn-gold-primary"
              style={{ padding: '7px 14px', fontSize: 12 }}
            >
              <Plus size={15} strokeWidth={3} />
              <span>New Playlist</span>
            </button>
          )}
        </div>

        {/* Tab Segment Switcher: Playlists vs All Songs */}
        <div style={{ display: 'flex', gap: 10, width: '100%' }}>
          <button
            onClick={() => setLibraryTab('playlists')}
            className={`glass-pill ${libraryTab === 'playlists' ? 'active' : ''}`}
            style={{
              flex: 1,
              padding: '9px 0',
              fontSize: 12.5,
              cursor: 'pointer',
              textAlign: 'center',
              borderRadius: 999,
              border: libraryTab === 'playlists' ? 'none' : '1px solid var(--border-glass)'
            }}
          >
            Playlists ({playlists.length})
          </button>
          <button
            onClick={() => setLibraryTab('all-songs')}
            className={`glass-pill ${libraryTab === 'all-songs' ? 'active' : ''}`}
            style={{
              flex: 1,
              padding: '9px 0',
              fontSize: 12.5,
              cursor: 'pointer',
              textAlign: 'center',
              borderRadius: 999,
              border: libraryTab === 'all-songs' ? 'none' : '1px solid var(--border-glass)'
            }}
          >
            All Songs ({allSongs.length})
          </button>
        </div>

        {/* TAB 1: PLAYLISTS VIEW */}
        {libraryTab === 'playlists' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16, width: '100%' }}>
            {/* 1. Liked Songs Card */}
            <div
              onClick={() => setActivePlaylistDetail({
                id: 'liked-songs',
                name: 'Liked Songs',
                description: 'Your favorite tracks',
                coverUrl: 'https://images.unsplash.com/photo-1518895949257-7621c3c786d7?q=80&w=800&auto=format&fit=crop',
                songIds: likedSongIds,
                isLikedSpecial: true
              })}
              className="glass-card"
              style={{
                borderRadius: 18,
                padding: '14px 16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                border: '1.5px solid var(--border-gold-strong)',
                cursor: 'pointer',
                width: '100%',
                boxSizing: 'border-box'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{
                  width: 48,
                  height: 48,
                  borderRadius: 12,
                  background: 'rgba(212, 175, 55, 0.16)',
                  border: '1.5px solid var(--gold-flat)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 3px 12px rgba(212,175,55,0.25)',
                  flexShrink: 0
                }}>
                  <Heart size={24} strokeWidth={2.2} fill="var(--gold-flat)" color="var(--gold-flat)" />
                </div>

                <div>
                  <h2 className="font-modern-heading" style={{ fontSize: 16, fontWeight: 800, color: '#fff' }}>
                    Liked Songs
                  </h2>
                  <p style={{ fontSize: 12, color: 'var(--gold-flat)', fontWeight: 600, marginTop: 2 }}>
                    {likedSongs.length} favorites
                  </p>
                </div>
              </div>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  if (likedSongs.length > 0) playSong(likedSongs[0], likedSongs);
                }}
                style={{
                  width: 38,
                  height: 38,
                  borderRadius: '50%',
                  background: 'var(--gold-flat)',
                  border: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  boxShadow: '0 3px 12px rgba(212,175,55,0.4)',
                  transition: 'transform 0.15s ease'
                }}
                title="Play Liked Songs"
              >
                <Play size={16} strokeWidth={2.5} fill="#060608" color="#060608" style={{ marginLeft: 2 }} />
              </button>
            </div>

            {/* 2. User Playlists */}
            <div style={{ width: '100%' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                <span style={{ fontSize: 11.5, fontWeight: 800, color: 'var(--gold-flat)', letterSpacing: '0.04em' }}>
                  PLAYLISTS ({playlists.length})
                </span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, width: '100%' }}>
                {playlists.map((pl) => (
                  <div
                    key={pl.id}
                    onClick={() => setActivePlaylistDetail(pl)}
                    className="glass-card"
                    style={{
                      padding: '10px 14px',
                      borderRadius: 14,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      cursor: 'pointer',
                      width: '100%',
                      boxSizing: 'border-box'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0, flex: 1 }}>
                      <img
                        src={pl.coverUrl}
                        alt={pl.name}
                        style={{
                          width: 44,
                          height: 44,
                          borderRadius: 8,
                          objectFit: 'cover',
                          border: '1px solid rgba(212,175,55,0.2)',
                          flexShrink: 0
                        }}
                      />
                      <div style={{ minWidth: 0, flex: 1 }}>
                        <h3 className="font-modern-heading" style={{
                          fontSize: 13.5,
                          fontWeight: 700,
                          color: '#fff',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis'
                        }}>
                          {pl.name}
                        </h3>
                        <p style={{ fontSize: 11, color: 'var(--text-secondary)', marginTop: 2 }}>
                          Playlist • {pl.songIds?.length || 0} tracks
                        </p>
                      </div>
                    </div>

                    <div
                      style={{ display: 'flex', alignItems: 'center', gap: 6, marginLeft: 8 }}
                      onClick={(e) => e.stopPropagation()}
                    >
                      {/* Delete Playlist button on list card */}
                      <button
                        onClick={() => {
                          openConfirmModal({
                            title: 'Delete Playlist',
                            message: `Are you sure you want to permanently delete "${pl.name}"? The songs inside will remain in your library.`,
                            confirmText: 'Delete Playlist',
                            isDestructive: true,
                            onConfirm: () => deletePlaylist(pl.id)
                          });
                        }}
                        className="btn-icon"
                        style={{ width: 32, height: 32, color: '#ff7777' }}
                        title="Delete Playlist"
                      >
                        <Trash2 size={15} />
                      </button>

                      <ListMusic size={18} strokeWidth={2} color="var(--gold-flat)" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: ALL SONGS VIEW (EDIT, DELETE, SEARCH) */}
        {libraryTab === 'all-songs' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, width: '100%' }}>
            {/* Search Filter for All Songs */}
            <div style={{ position: 'relative', width: '100%' }}>
              <div style={{
                position: 'absolute',
                left: 12,
                top: '50%',
                transform: 'translateY(-50%)',
                pointerEvents: 'none',
                display: 'flex',
                alignItems: 'center'
              }}>
                <SearchIcon size={16} color="var(--gold-flat)" />
              </div>

              <input
                type="text"
                placeholder="Filter library songs..."
                value={songFilterQuery}
                onChange={(e) => setSongFilterQuery(e.target.value)}
                className="gold-input"
                style={{ paddingLeft: 38, fontSize: 13, borderRadius: 12, width: '100%' }}
              />
            </div>

            {/* Quick Play Action Row */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <button
                  onClick={() => {
                    if (filteredAllSongs.length > 0) playSong(filteredAllSongs[0], filteredAllSongs);
                  }}
                  className="btn-gold-primary"
                  style={{ padding: '6px 14px', fontSize: 11.5 }}
                >
                  <Play size={13} strokeWidth={2.5} fill="#060608" color="#060608" />
                  <span>Play All</span>
                </button>

                <button
                  onClick={() => {
                    if (filteredAllSongs.length > 0) {
                      if (!isShuffle) toggleShuffle();
                      const randIdx = Math.floor(Math.random() * filteredAllSongs.length);
                      playSong(filteredAllSongs[randIdx], filteredAllSongs);
                    }
                  }}
                  className="btn-gold-outline"
                  style={{ padding: '6px 12px', fontSize: 11.5 }}
                >
                  <Shuffle size={13} strokeWidth={2.2} />
                  <span>Shuffle</span>
                </button>
              </div>

              <span style={{ fontSize: 11.5, color: 'var(--gold-flat)', fontWeight: 600 }}>
                {filteredAllSongs.length} Songs
              </span>
            </div>

            {/* Songs List */}
            {filteredAllSongs.length > 0 ? (
              <div className="glass-card" style={{ borderRadius: 16, padding: '4px', width: '100%', boxSizing: 'border-box' }}>
                {filteredAllSongs.map((song, idx) => (
                  <SongRow
                    key={song.id}
                    song={song}
                    index={idx}
                    playlistContext={{ songs: filteredAllSongs }}
                  />
                ))}
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-muted)' }}>
                <Music size={32} strokeWidth={2} color="var(--gold-600)" style={{ marginBottom: 10 }} />
                <p style={{ fontSize: 14, color: '#fff', fontWeight: 600 }}>No songs found</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Library;
