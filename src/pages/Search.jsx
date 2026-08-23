import React, { useState, useMemo, useCallback } from 'react';
import { Search as SearchIcon, X, Music } from 'lucide-react';
import { useAudio } from '../context/AudioContext';
import { GENRE_CATEGORIES } from '../data/songs';
import SongRow from '../components/SongRow';

const Search = () => {
  const { allSongs, playSong } = useAudio();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('cat-all');

  // Stored recent searches (empty by default, never hardcoded dummy items)
  const [recentSearches, setRecentSearches] = useState(() => {
    try {
      const saved = localStorage.getItem('cadenza_recent_searches');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const addRecentSearch = useCallback((term) => {
    const trimmed = term?.trim();
    if (!trimmed || trimmed.length < 2) return;
    setRecentSearches(prev => {
      const filtered = prev.filter(t => t.toLowerCase() !== trimmed.toLowerCase());
      const updated = [trimmed, ...filtered].slice(0, 10);
      try {
        localStorage.setItem('cadenza_recent_searches', JSON.stringify(updated));
      } catch (err) {}
      return updated;
    });
  }, []);

  const handleClearAllRecent = () => {
    setRecentSearches([]);
    try {
      localStorage.setItem('cadenza_recent_searches', JSON.stringify([]));
    } catch (err) {}
  };

  const handleRemoveSingleRecent = (termToRemove) => {
    setRecentSearches(prev => {
      const updated = prev.filter(t => t !== termToRemove);
      try {
        localStorage.setItem('cadenza_recent_searches', JSON.stringify(updated));
      } catch (err) {}
      return updated;
    });
  };

  // Helper to match genre categories robustly across variations, case, and aliases
  const matchesGenreCategory = useCallback((song, categoryId) => {
    if (!categoryId || categoryId === 'cat-all') return true;

    const rawGenre = (song.genre || song.category || '').toLowerCase().trim();
    const normGenre = rawGenre.replace(/[^a-z0-9]/g, '');

    switch (categoryId) {
      case 'cat-divine-love':
        return normGenre.includes('divinelove') || normGenre.includes('divine') || normGenre.includes('love') || rawGenre.includes('divine');
      case 'cat-worship':
        return normGenre.includes('worship') || normGenre.includes('praise') || rawGenre.includes('worship');
      case 'cat-joyful':
        return normGenre.includes('joyful') || normGenre.includes('joy') || normGenre.includes('celebration');
      case 'cat-broken':
        return normGenre.includes('broken') || normGenre.includes('healing') || normGenre.includes('cry') || normGenre.includes('comfort');
      case 'cat-midnight':
        return normGenre.includes('midnight') || normGenre.includes('night') || normGenre.includes('peace') || normGenre.includes('calm');
      case 'cat-christian':
        return normGenre.includes('christian') || normGenre.includes('gospel') || normGenre.includes('worship') || normGenre.includes('hymn') || normGenre.includes('divine');
      default: {
        const catObj = GENRE_CATEGORIES.find(c => c.id === categoryId);
        const catName = (catObj ? catObj.name : categoryId.replace('cat-', '')).toLowerCase().trim();
        const normCatName = catName.replace(/[^a-z0-9]/g, '');
        return normGenre.includes(normCatName) || normCatName.includes(normGenre);
      }
    }
  }, []);

  // Filter songs based on search query and category
  const filteredSongs = useMemo(() => {
    let list = allSongs.filter(s => matchesGenreCategory(s, selectedCategory));

    if (!searchQuery.trim()) {
      return list;
    }

    const q = searchQuery.toLowerCase().trim();
    return list.filter(song =>
      song.title.toLowerCase().includes(q) ||
      song.artist.toLowerCase().includes(q) ||
      song.album?.toLowerCase().includes(q) ||
      song.genre?.toLowerCase().includes(q)
    );
  }, [allSongs, searchQuery, selectedCategory, matchesGenreCategory]);

  const handleSelectRecent = (term) => {
    setSearchQuery(term);
  };

  const handleClearSearch = () => {
    setSearchQuery('');
  };

  const handleCategoryClick = (catId) => {
    setSelectedCategory(catId);
  };

  const handlePlaySong = (song, list) => {
    if (searchQuery.trim()) {
      addRecentSearch(searchQuery);
    }
    playSong(song, list);
  };

  return (
    <div className="app-content-scrollable">
      <div style={{ padding: '16px 16px 16px 16px', display: 'flex', flexDirection: 'column', gap: 16, width: '100%', boxSizing: 'border-box' }}>
        {/* Header */}
        <h1 className="font-modern-heading" style={{ fontSize: 24, fontWeight: 900, color: '#fff' }}>
          Search
        </h1>

        {/* Search Bar Input */}
        <div style={{ position: 'relative', width: '100%' }}>
          <div style={{
            position: 'absolute',
            left: 14,
            top: '50%',
            transform: 'translateY(-50%)',
            pointerEvents: 'none',
            display: 'flex',
            alignItems: 'center'
          }}>
            <SearchIcon size={17} color="var(--gold-flat)" />
          </div>

          <input
            type="text"
            placeholder="Search songs, artists, albums..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && searchQuery.trim()) {
                addRecentSearch(searchQuery);
              }
            }}
            onBlur={() => {
              window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
              if (searchQuery.trim()) addRecentSearch(searchQuery);
            }}
            className="gold-input"
            style={{
              paddingLeft: 40,
              paddingRight: searchQuery ? 38 : 14,
              fontSize: 13.5,
              borderRadius: 14,
              width: '100%'
            }}
          />

          {searchQuery && (
            <button
              onClick={handleClearSearch}
              style={{
                position: 'absolute',
                right: 12,
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'transparent',
                border: 'none',
                color: 'var(--text-muted)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center'
              }}
            >
              <X size={16} />
            </button>
          )}
        </div>

        {/* Filter Categories Chips */}
        <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 4, width: '100%' }}>
          {GENRE_CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => handleCategoryClick(cat.id)}
              className={`glass-pill ${selectedCategory === cat.id ? 'active' : ''}`}
              style={{
                padding: '7px 16px',
                borderRadius: 999,
                fontSize: 12.5,
                fontWeight: 600,
                cursor: 'pointer',
                whiteSpace: 'nowrap'
              }}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* Recent Searches (Only shown if user actually searched, cleanly clearable) */}
        {!searchQuery && selectedCategory === 'cat-all' && recentSearches.length > 0 && (
          <div style={{ width: '100%' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
              <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.05em' }}>
                RECENT SEARCHES
              </span>
              <button
                onClick={handleClearAllRecent}
                style={{ background: 'transparent', border: 'none', color: 'var(--gold-flat)', fontSize: 11, cursor: 'pointer', fontWeight: 600 }}
              >
                Clear
              </button>
            </div>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, width: '100%' }}>
              {recentSearches.map((term, i) => (
                <div
                  key={i}
                  onClick={() => handleSelectRecent(term)}
                  className="glass-card"
                  style={{
                    padding: '6px 12px',
                    borderRadius: 999,
                    fontSize: 12,
                    color: 'var(--gold-200)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6
                  }}
                >
                  <span>{term}</span>
                  <X
                    size={12}
                    color="var(--text-muted)"
                    style={{ cursor: 'pointer' }}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemoveSingleRecent(term);
                    }}
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Search Results Title */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
          <span style={{ fontSize: 12, fontWeight: 800, color: 'var(--gold-flat)', letterSpacing: '0.04em' }}>
            {searchQuery ? `RESULTS (${filteredSongs.length})` : 'ALL SONGS'}
          </span>
          {filteredSongs.length > 0 && (
            <button
              onClick={() => handlePlaySong(filteredSongs[0], filteredSongs)}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--gold-flat)',
                fontSize: 11.5,
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              Play All
            </button>
          )}
        </div>

        {/* Results List */}
        {filteredSongs.length > 0 ? (
          <div className="glass-card" style={{ borderRadius: 16, padding: '4px', width: '100%', boxSizing: 'border-box' }}>
            {filteredSongs.map((song, idx) => (
              <SongRow
                key={song.id}
                song={song}
                index={idx}
                playlistContext={{ songs: filteredSongs }}
              />
            ))}
          </div>
        ) : (
          <div style={{
            textAlign: 'center',
            padding: '40px 20px',
            color: 'var(--text-muted)'
          }}>
            <Music size={32} color="var(--gold-600)" style={{ marginBottom: 10 }} />
            <p style={{ fontSize: 14, fontWeight: 600, color: '#fff' }}>No songs found in this category</p>
            <p style={{ fontSize: 12, marginTop: 4 }}>Try selecting "All" or searching for a track title</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Search;
