import React, { useState, useEffect, useRef } from 'react';
import { X, Upload, Trash2, Check, Edit2 } from 'lucide-react';
import { useAudio } from '../context/AudioContext';

const PRESET_COVERS = [
  'https://images.unsplash.com/photo-1518895949257-7621c3c786d7?q=80&w=800&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?q=80&w=800&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1507838153414-b4b713384a76?q=80&w=800&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=800&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=800&auto=format&fit=crop'
];

const EditSongModal = () => {
  const { songToEdit, setSongToEdit, editSong, deleteSong, showToast } = useAudio();

  const [title, setTitle] = useState('');
  const [artist, setArtist] = useState('');
  const [album, setAlbum] = useState('');
  const [genre, setGenre] = useState('');
  const [audioUrl, setAudioUrl] = useState('');
  const [coverUrl, setCoverUrl] = useState('');
  const [lyrics, setLyrics] = useState('');

  const fileInputRef = useRef(null);

  useEffect(() => {
    if (songToEdit) {
      setTitle(songToEdit.title || '');
      setArtist(songToEdit.artist || '');
      setAlbum(songToEdit.album || '');
      setGenre(songToEdit.genre || 'Acoustic Pop');
      setAudioUrl(songToEdit.audioUrl || '');
      setCoverUrl(songToEdit.coverUrl || PRESET_COVERS[0]);
      setLyrics(songToEdit.lyrics || '');
    }
  }, [songToEdit]);

  if (!songToEdit) return null;

  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setCoverUrl(event.target.result);
          showToast('Cover updated from gallery');
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim()) {
      showToast('Title cannot be empty');
      return;
    }

    editSong(songToEdit.id, {
      title: title.trim(),
      artist: artist.trim() || 'Unknown Artist',
      album: album.trim() || 'Single',
      genre: genre || 'Acoustic Pop',
      audioUrl: audioUrl.trim() || songToEdit.audioUrl,
      coverUrl: coverUrl || songToEdit.coverUrl,
      lyrics: lyrics.trim()
    });
  };

  const handleDelete = () => {
    if (window.confirm(`Are you sure you want to delete "${songToEdit.title}"?`)) {
      deleteSong(songToEdit.id);
      setSongToEdit(null);
    }
  };

  return (
    <div className="modal-overlay" onClick={() => setSongToEdit(null)}>
      <div className="modal-content-sheet" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <Edit2 size={16} color="var(--gold-flat)" />
            <h2 className="font-modern-heading" style={{ fontSize: 17, color: '#fff', fontWeight: 800 }}>
              Edit Song
            </h2>
          </div>
          <button
            onClick={() => setSongToEdit(null)}
            className="btn-icon"
            style={{ width: 32, height: 32 }}
          >
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 11 }}>
          {/* Title & Artist */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            <div>
              <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--gold-flat)', marginBottom: 4, display: 'block' }}>
                SONG TITLE *
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="gold-input"
              />
            </div>

            <div>
              <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--gold-flat)', marginBottom: 4, display: 'block' }}>
                ARTIST
              </label>
              <input
                type="text"
                value={artist}
                onChange={(e) => setArtist(e.target.value)}
                className="gold-input"
              />
            </div>
          </div>

          {/* Album / Description & Genre */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            <div>
              <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--gold-flat)', marginBottom: 4, display: 'block' }}>
                ALBUM / DESCRIPTION
              </label>
              <input
                type="text"
                value={album}
                onChange={(e) => setAlbum(e.target.value)}
                className="gold-input"
              />
            </div>

            <div>
              <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--gold-flat)', marginBottom: 4, display: 'block' }}>
                GENRE
              </label>
              <select
                value={genre}
                onChange={(e) => setGenre(e.target.value)}
                className="gold-input"
                style={{ background: '#121217' }}
              >
                <option value="Divine Love">Divine Love</option>
                <option value="Worship">Worship</option>
                <option value="Joyful">Joyful</option>
                <option value="Broken">Broken</option>
                <option value="Midnight">Midnight</option>
                <option value="Christian">Christian</option>
              </select>
            </div>
          </div>

          {/* Audio Streaming URL */}
          <div>
            <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--gold-flat)', marginBottom: 4, display: 'block' }}>
              AUDIO STREAMING URL
            </label>
            <input
              type="url"
              value={audioUrl}
              onChange={(e) => setAudioUrl(e.target.value)}
              className="gold-input"
            />
          </div>

          {/* Cover Art (Gallery Picker + Presets) */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 5 }}>
              <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--gold-flat)' }}>
                COVER ARTWORK
              </label>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="glass-pill"
                style={{ padding: '3px 9px', fontSize: 10.5, color: 'var(--gold-flat)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}
              >
                <Upload size={11} />
                <span>Gallery Photo</span>
              </button>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              style={{ display: 'none' }}
            />

            <div style={{ display: 'flex', alignItems: 'center', gap: 8, overflowX: 'auto', paddingBottom: 4 }}>
              <div style={{
                width: 44,
                height: 44,
                borderRadius: 8,
                overflow: 'hidden',
                flexShrink: 0,
                border: '2px solid var(--gold-flat)'
              }}>
                <img src={coverUrl} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>

              <div style={{ width: 1, height: 28, background: 'rgba(255,255,255,0.1)', margin: '0 4px', flexShrink: 0 }} />

              {PRESET_COVERS.map((url, idx) => (
                <div
                  key={idx}
                  onClick={() => setCoverUrl(url)}
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 8,
                    overflow: 'hidden',
                    cursor: 'pointer',
                    flexShrink: 0,
                    opacity: coverUrl === url ? 1 : 0.6,
                    border: coverUrl === url ? '1.5px solid var(--gold-flat)' : '1px solid rgba(255,255,255,0.06)'
                  }}
                >
                  <img src={url} alt="preset" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
              ))}
            </div>
          </div>

          {/* Editable Lyrics */}
          <div>
            <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--gold-flat)', marginBottom: 4, display: 'block' }}>
              SONG LYRICS
            </label>
            <textarea
              value={lyrics}
              onChange={(e) => setLyrics(e.target.value)}
              placeholder="Paste or write lyrics here..."
              className="gold-input"
              style={{ minHeight: 65, resize: 'vertical' }}
            />
          </div>

          {/* Action Buttons: Save Changes & Delete Song */}
          <div style={{ display: 'flex', gap: 10, marginTop: 6 }}>
            <button
              type="submit"
              className="btn-gold-primary"
              style={{ flex: 1, padding: '11px', fontSize: 13 }}
            >
              <Check size={16} />
              <span>Save Changes</span>
            </button>

            <button
              type="button"
              onClick={handleDelete}
              style={{
                background: 'rgba(255, 75, 75, 0.12)',
                border: '1px solid rgba(255, 75, 75, 0.4)',
                color: '#ff6b6b',
                padding: '0 16px',
                borderRadius: 999,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 6,
                fontWeight: 600,
                fontSize: 12
              }}
              title="Delete Song"
            >
              <Trash2 size={16} />
              <span>Delete</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditSongModal;
