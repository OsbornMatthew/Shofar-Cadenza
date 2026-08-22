import React from 'react';
import { Play, Disc, Heart, Music2, ListMusic } from 'lucide-react';
import { useAudio } from '../context/AudioContext';
import Navbar from '../components/Navbar';
import SongCard from '../components/SongCard';
import SongRow from '../components/SongRow';

const Home = () => {
  const {
    allSongs,
    playlists,
    playSong,
    setActiveTab,
    setActivePlaylistDetail,
    likedSongIds
  } = useAudio();

  const homePlaylists = playlists.slice(0, 3);
  const featuredTracks = allSongs.slice(0, 8);

  const handleOpenPlaylist = (pl) => {
    setActivePlaylistDetail(pl);
    setActiveTab('library');
  };

  const handleOpenLiked = () => {
    setActivePlaylistDetail({
      id: 'liked-songs',
      name: 'Liked Songs',
      description: 'Your favorite tracks in Shofar Cadenza',
      coverUrl: 'https://images.unsplash.com/photo-1518895949257-7621c3c786d7?q=80&w=800&auto=format&fit=crop',
      songIds: likedSongIds,
      isLikedSpecial: true
    });
    setActiveTab('library');
  };

  return (
    <div className="app-content-scrollable">
      <Navbar />

      <div style={{ padding: '8px 16px 16px 16px', display: 'flex', flexDirection: 'column', gap: 18, width: '100%', boxSizing: 'border-box' }}>
        {/* Quick Grid: 1 Liked Songs + Max 3 Playlists (4 items max) */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, width: '100%' }}>
          {/* 1. Liked Songs Item with Gold Heart */}
          <div
            onClick={handleOpenLiked}
            className="glass-card"
            style={{
              padding: '10px 12px',
              borderRadius: 14,
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              cursor: 'pointer',
              border: '1px solid var(--border-gold-subtle)',
              width: '100%',
              boxSizing: 'border-box'
            }}
          >
            <div style={{
              width: 38,
              height: 38,
              borderRadius: 8,
              background: 'rgba(212, 175, 55, 0.16)',
              border: '1px solid var(--gold-flat)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}>
              <Heart size={18} strokeWidth={2.2} fill="var(--gold-flat)" color="var(--gold-flat)" />
            </div>
            <div style={{ minWidth: 0, flex: 1 }}>
              <p className="font-modern-heading" style={{ fontSize: 13, fontWeight: 700, color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                Liked Songs
              </p>
              <p style={{ fontSize: 11, color: 'var(--gold-flat)', fontWeight: 600 }}>{likedSongIds.length} tracks</p>
            </div>
          </div>

          {/* 2, 3, 4. Up to 3 User Playlists */}
          {homePlaylists.map((pl) => (
            <div
              key={pl.id}
              onClick={() => handleOpenPlaylist(pl)}
              className="glass-card"
              style={{
                padding: '10px 12px',
                borderRadius: 14,
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                cursor: 'pointer',
                border: '1px solid var(--border-gold-subtle)',
                width: '100%',
                boxSizing: 'border-box'
              }}
            >
              <img
                src={pl.coverUrl}
                alt={pl.name}
                style={{ width: 38, height: 38, borderRadius: 8, objectFit: 'cover', flexShrink: 0 }}
              />
              <div style={{ minWidth: 0, flex: 1 }}>
                <p className="font-modern-heading" style={{ fontSize: 13, fontWeight: 700, color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {pl.name}
                </p>
                <p style={{ fontSize: 11, color: 'var(--text-secondary)' }}>
                  {pl.songIds?.length || 0} tracks
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Section 1: Songs (Horizontal Cards) */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <Music2 size={16} strokeWidth={2.2} color="var(--gold-flat)" />
              <h3 className="font-modern-heading" style={{ fontSize: 17, fontWeight: 800, color: '#fff' }}>
                Songs
              </h3>
            </div>
            <span style={{ fontSize: 11.5, color: 'var(--gold-flat)', fontWeight: 600 }}>
              {allSongs.length} Tracks
            </span>
          </div>

          {allSongs.length > 0 ? (
            <div style={{ display: 'flex', gap: 10, overflowX: 'auto', paddingBottom: 4 }}>
              {allSongs.map((song) => (
                <SongCard
                  key={song.id}
                  title={song.title}
                  subtitle={song.artist}
                  coverUrl={song.coverUrl}
                  onClick={() => playSong(song, allSongs)}
                  onPlay={() => playSong(song, allSongs)}
                />
              ))}
            </div>
          ) : (
            <div
              className="glass-card"
              style={{
                borderRadius: 16,
                padding: '24px 16px',
                textAlign: 'center',
                border: '1px dashed var(--border-gold-strong)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 8
              }}
            >
              <Music2 size={28} color="var(--gold-flat)" />
              <p className="font-modern-heading" style={{ fontSize: 14, fontWeight: 700, color: '#fff' }}>
                No Songs in Library
              </p>
              <p style={{ fontSize: 11.5, color: 'var(--text-secondary)', maxWidth: 260 }}>
                Upload or stream your music tracks using Cloudinary or MP3 links.
              </p>
              <button
                onClick={() => setActiveTab('add-song')}
                className="btn-gold-primary"
                style={{ marginTop: 4, padding: '7px 18px', fontSize: 12 }}
              >
                + Add First Song
              </button>
            </div>
          )}
        </div>

        {/* Section 2: All Tracks List */}
        {allSongs.length > 0 && (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
              <h3 className="font-modern-heading" style={{ fontSize: 17, fontWeight: 800, color: '#fff' }}>
                All Tracks
              </h3>
              <button
                onClick={() => playSong(allSongs[0], allSongs)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--gold-flat)',
                  fontSize: 12,
                  fontWeight: 700,
                  fontFamily: 'Outfit, sans-serif',
                  cursor: 'pointer'
                }}
              >
                Play All
              </button>
            </div>

            <div className="glass-card" style={{ borderRadius: 16, padding: '4px', width: '100%', boxSizing: 'border-box' }}>
              {featuredTracks.map((song, index) => (
                <SongRow
                  key={song.id}
                  song={song}
                  index={index}
                  playlistContext={{ songs: allSongs }}
                />
              ))}
            </div>
          </div>
        )}

        {/* Section 3: Playlists Carousel */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <ListMusic size={16} strokeWidth={2.2} color="var(--gold-flat)" />
              <h3 className="font-modern-heading" style={{ fontSize: 17, fontWeight: 800, color: '#fff' }}>
                Playlists
              </h3>
            </div>
            <button
              onClick={() => setActiveTab('library')}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--gold-flat)',
                fontSize: 12,
                fontWeight: 700,
                fontFamily: 'Outfit, sans-serif',
                cursor: 'pointer'
              }}
            >
              Library
            </button>
          </div>

          {playlists.length > 0 ? (
            <div style={{ display: 'flex', gap: 10, overflowX: 'auto', paddingBottom: 4 }}>
              {playlists.map((pl) => (
                <SongCard
                  key={pl.id}
                  title={pl.name}
                  subtitle={`${pl.songIds?.length || 0} tracks`}
                  coverUrl={pl.coverUrl}
                  onClick={() => handleOpenPlaylist(pl)}
                />
              ))}
            </div>
          ) : (
            <div
              className="glass-card"
              style={{
                borderRadius: 14,
                padding: '16px',
                textAlign: 'center',
                color: 'var(--text-secondary)',
                fontSize: 12
              }}
            >
              No custom playlists created yet • Open Library to create one
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Home;
