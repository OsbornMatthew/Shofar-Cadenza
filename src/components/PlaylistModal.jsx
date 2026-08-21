import React, { useState, useRef } from 'react';
import { X, Upload } from 'lucide-react';
import { useAudio } from '../context/AudioContext';

const PRESET_COVERS = [
  'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?q=80&w=800&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1518895949257-7621c3c786d7?q=80&w=800&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=800&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1507838153414-b4b713384a76?q=80&w=800&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=800&auto=format&fit=crop'
];

const PlaylistModal = () => {
  const { isCreatePlaylistOpen, setIsCreatePlaylistOpen, createPlaylist, showToast } = useAudio();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedCover, setSelectedCover] = useState(PRESET_COVERS[0]);
  const [isCompressing, setIsCompressing] = useState(false);
  const fileInputRef = useRef(null);

  if (!isCreatePlaylistOpen) return null;

  // Compress image before saving to eliminate huge base64 payloads that fail in Firebase
  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsCompressing(true);
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          const maxDim = 320;
          let w = img.width;
          let h = img.height;
          if (w > h && w > maxDim) {
            h = Math.round((h * maxDim) / w);
            w = maxDim;
          } else if (h > maxDim) {
            w = Math.round((w * maxDim) / h);
            h = maxDim;
          }
          const canvas = document.createElement('canvas');
          canvas.width = w;
          canvas.height = h;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, w, h);
          const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.75);
          setSelectedCover(compressedDataUrl);
          setIsCompressing(false);
          showToast('Cover loaded from gallery');
        };
        img.onerror = () => {
          setSelectedCover(event.target.result);
          setIsCompressing(false);
          showToast('Cover loaded from gallery');
        };
        img.src = event.target.result;
      };
      reader.readAsDataURL(file);
    }
  };

  const handleClose = () => {
    if (document.activeElement && typeof document.activeElement.blur === 'function') {
      document.activeElement.blur();
    }
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    setIsCreatePlaylistOpen(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) {
      showToast('Please enter a playlist name');
      return;
    }
    if (document.activeElement && typeof document.activeElement.blur === 'function') {
      document.activeElement.blur();
    }
    createPlaylist(name, description, selectedCover);
    setName('');
    setDescription('');
    setSelectedCover(PRESET_COVERS[0]);
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  };

  return (
    <div className="modal-overlay" onClick={handleClose} style={{ zIndex: 120 }}>
      <div className="modal-content-sheet" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <h2 className="font-cinzel" style={{ fontSize: 17, color: '#fff', fontWeight: 800 }}>
            Create Playlist
          </h2>
          <button
            type="button"
            onClick={handleClose}
            className="btn-icon"
            style={{ width: 32, height: 32 }}
          >
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {/* Playlist Name */}
          <div>
            <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--gold-flat)', marginBottom: 4, display: 'block' }}>
              PLAYLIST NAME *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. My Favorites"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onBlur={() => window.scrollTo({ top: 0, left: 0, behavior: 'instant' })}
              className="gold-input"
            />
          </div>

          {/* Description */}
          <div>
            <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--gold-flat)', marginBottom: 4, display: 'block' }}>
              DESCRIPTION
            </label>
            <input
              type="text"
              placeholder="Add an optional description..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              onBlur={() => window.scrollTo({ top: 0, left: 0, behavior: 'instant' })}
              className="gold-input"
            />
          </div>

          {/* Cover Art Selection (Gallery + Presets) */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
              <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--gold-flat)' }}>
                PLAYLIST COVER
              </label>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="glass-pill"
                style={{ padding: '3px 9px', fontSize: 10.5, color: 'var(--gold-flat)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}
              >
                <Upload size={12} />
                <span>{isCompressing ? 'Compressing...' : 'Upload from Gallery'}</span>
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
              {/* Active Cover Preview */}
              <div style={{
                width: 46,
                height: 46,
                borderRadius: 10,
                overflow: 'hidden',
                flexShrink: 0,
                border: '2px solid var(--gold-flat)'
              }}>
                <img src={selectedCover} alt="Active Cover" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>

              <div style={{ width: 1, height: 32, background: 'rgba(255,255,255,0.1)', margin: '0 4px', flexShrink: 0 }} />

              {PRESET_COVERS.map((url, idx) => (
                <div
                  key={idx}
                  onClick={() => setSelectedCover(url)}
                  style={{
                    width: 42,
                    height: 42,
                    borderRadius: 8,
                    overflow: 'hidden',
                    cursor: 'pointer',
                    flexShrink: 0,
                    opacity: selectedCover === url ? 1 : 0.6,
                    border: selectedCover === url ? '1.5px solid var(--gold-flat)' : '1px solid rgba(255,255,255,0.06)'
                  }}
                >
                  <img src={url} alt="Cover preset" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
              ))}
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="btn-gold-primary"
            style={{ width: '100%', marginTop: 6, padding: 12 }}
          >
            <span>Create Playlist</span>
          </button>
        </form>
      </div>
    </div>
  );
};

export default PlaylistModal;
