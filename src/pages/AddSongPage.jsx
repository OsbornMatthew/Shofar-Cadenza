import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Cloud,
  PlusCircle,
  Upload,
  Clock,
  Sparkles,
  Check
} from 'lucide-react';
import { useAudio } from '../context/AudioContext';
import { detectAudioDuration, parseTimeToSeconds, formatTime } from '../utils/audioUtils';
import { APP_GENRES } from '../data/songs';

const PRESET_COVERS = [
  'https://images.unsplash.com/photo-1518895949257-7621c3c786d7?q=80&w=800&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?q=80&w=800&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1507838153414-b4b713384a76?q=80&w=800&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=800&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=800&auto=format&fit=crop'
];

const AddSongPage = () => {
  const { addNewSong, showToast, setActiveTab } = useAudio();

  const [title, setTitle] = useState('');
  const [artist, setArtist] = useState('');
  const [album, setAlbum] = useState('');
  const [audioUrl, setAudioUrl] = useState('');
  const [coverUrl, setCoverUrl] = useState(PRESET_COVERS[0]);
  const [genre, setGenre] = useState('Divine Love');
  const [duration, setDuration] = useState('');
  const [durationSec, setDurationSec] = useState(0);
  const [isDetectingDuration, setIsDetectingDuration] = useState(false);
  const [durationAutoDetected, setDurationAutoDetected] = useState(false);
  const [lyrics, setLyrics] = useState('');

  const fileInputRef = useRef(null);

  // Auto-detect exact audio duration from URL
  const fetchDuration = useCallback(async (urlToProbe) => {
    if (!urlToProbe) return;
    const trimmed = urlToProbe.trim();
    if (!trimmed.startsWith('http://') && !trimmed.startsWith('https://') && !trimmed.startsWith('blob:') && !trimmed.startsWith('data:')) {
      return;
    }

    setIsDetectingDuration(true);
    setDurationAutoDetected(false);

    try {
      const res = await detectAudioDuration(trimmed, 7000);
      if (res && res.duration && res.durationSec > 0) {
        setDuration(res.duration);
        setDurationSec(res.durationSec);
        setDurationAutoDetected(true);
      }
    } catch (err) {
      console.warn('Duration detection error:', err);
    } finally {
      setIsDetectingDuration(false);
    }
  }, []);

  // Trigger auto-detect with a small debounce whenever audioUrl changes
  useEffect(() => {
    if (!audioUrl.trim()) {
      setDurationAutoDetected(false);
      return;
    }

    const timer = setTimeout(() => {
      fetchDuration(audioUrl);
    }, 400);

    return () => clearTimeout(timer);
  }, [audioUrl, fetchDuration]);

  const handleAudioUrlBlur = () => {
    if (audioUrl.trim() && (!duration || duration === '0:00')) {
      fetchDuration(audioUrl);
    }
  };

  const handleAudioUrlPaste = (e) => {
    const pasted = e.clipboardData?.getData('text');
    if (pasted) {
      fetchDuration(pasted);
    }
  };

  // Compress image before saving to eliminate huge base64 lags
  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          const maxDim = 400;
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
          setCoverUrl(canvas.toDataURL('image/jpeg', 0.8));
          showToast('Cover photo loaded');
        };
        img.onerror = () => {
          setCoverUrl(event.target.result);
          showToast('Cover photo loaded');
        };
        img.src = event.target.result;
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim() || !audioUrl.trim()) {
      showToast('Please enter at least Title and Audio URL');
      return;
    }

    addNewSong({
      title,
      artist,
      album,
      audioUrl,
      coverUrl,
      genre,
      duration: duration.trim() || undefined,
      durationSec: durationSec || (duration.trim() ? parseTimeToSeconds(duration) : undefined),
      lyrics
    });

    setTitle('');
    setArtist('');
    setAlbum('');
    setAudioUrl('');
    setDuration('');
    setDurationSec(0);
    setDurationAutoDetected(false);
    setLyrics('');
    setActiveTab('home');
  };

  return (
    <div className="app-content-scrollable">
      <div style={{ padding: '16px 16px 20px 16px', display: 'flex', flexDirection: 'column', gap: 16, width: '100%', boxSizing: 'border-box' }}>
        {/* Header */}
        <div style={{ width: '100%' }}>
          <span style={{ fontSize: 10.5, fontWeight: 700, color: 'var(--gold-flat)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
            Audio Manager
          </span>
          <h1 className="font-modern-heading" style={{ fontSize: 24, fontWeight: 900, color: '#fff', marginTop: 2 }}>
            Add to Shofar Cadenza
          </h1>
          <p style={{ fontSize: 11.5, color: 'var(--text-secondary)', marginTop: 2 }}>
            Add any audio URL or Cloudinary stream link with auto-detected duration.
          </p>
        </div>

        {/* Form Card */}
        <div className="glass-card" style={{ borderRadius: 18, padding: '16px 14px', border: '1px solid var(--border-gold-strong)', width: '100%', boxSizing: 'border-box' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
              <PlusCircle size={17} color="var(--gold-flat)" />
              <h2 style={{ fontSize: 14, fontWeight: 700, color: '#fff' }}>
                New Track Details
              </h2>
            </div>
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12, width: '100%' }}>
            {/* Audio URL */}
            <div style={{ width: '100%' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--gold-flat)' }}>
                  AUDIO STREAM URL *
                </label>
                {isDetectingDuration && (
                  <span style={{ fontSize: 10, color: 'var(--gold-300)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}>
                    <Sparkles size={11} className="spin-slow" /> Detecting duration...
                  </span>
                )}
                {durationAutoDetected && !isDetectingDuration && (
                  <span style={{ fontSize: 10, color: '#4ade80', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 3 }}>
                    <Check size={11} /> Duration auto-detected ({duration})
                  </span>
                )}
              </div>
              <input
                type="url"
                required
                placeholder="https://res.cloudinary.com/.../your-song.mp3"
                value={audioUrl}
                onChange={(e) => setAudioUrl(e.target.value)}
                onBlur={handleAudioUrlBlur}
                onPaste={handleAudioUrlPaste}
                className="gold-input"
              />
            </div>

            {/* Song Title & Artist */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, width: '100%' }}>
              <div>
                <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--gold-flat)', marginBottom: 4, display: 'block' }}>
                  SONG TITLE *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Divine Melody"
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
                  placeholder="e.g. Shofar Acoustic"
                  value={artist}
                  onChange={(e) => setArtist(e.target.value)}
                  className="gold-input"
                />
              </div>
            </div>

            {/* Album, Genre & Duration */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, width: '100%' }}>
              <div>
                <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--gold-flat)', marginBottom: 4, display: 'block' }}>
                  ALBUM
                </label>
                <input
                  type="text"
                  placeholder="e.g. Cadenza Vol 1"
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
                  {APP_GENRES.map((g) => (
                    <option key={g} value={g}>{g}</option>
                  ))}
                </select>
              </div>

              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                  <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--gold-flat)', display: 'block' }}>
                    DURATION
                  </label>
                  {audioUrl.trim() && (
                    <button
                      type="button"
                      onClick={() => fetchDuration(audioUrl)}
                      title="Re-detect duration"
                      style={{
                        background: 'none',
                        border: 'none',
                        color: 'var(--gold-300)',
                        fontSize: 9.5,
                        fontWeight: 700,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 2,
                        padding: 0
                      }}
                    >
                      <Clock size={10} />
                      <span>{isDetectingDuration ? 'Detecting' : 'Detect'}</span>
                    </button>
                  )}
                </div>
                <input
                  type="text"
                  placeholder={isDetectingDuration ? 'Detecting...' : 'e.g. 3:42'}
                  value={duration}
                  onChange={(e) => {
                    setDuration(e.target.value);
                    setDurationSec(parseTimeToSeconds(e.target.value));
                    setDurationAutoDetected(false);
                  }}
                  className="gold-input"
                />
              </div>
            </div>

            {/* Optional Lyrics */}
            <div style={{ width: '100%' }}>
              <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--gold-flat)', marginBottom: 4, display: 'block' }}>
                LYRICS (EDITABLE ANYTIME)
              </label>
              <textarea
                placeholder="Paste or write song lyrics here..."
                value={lyrics}
                onChange={(e) => setLyrics(e.target.value)}
                className="gold-input"
                style={{ minHeight: 70, resize: 'vertical' }}
              />
            </div>

            {/* Cover Art (Gallery Picker + Presets) */}
            <div style={{ width: '100%' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--gold-flat)' }}>
                  COVER ARTWORK
                </label>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="glass-pill"
                  style={{ padding: '3px 9px', fontSize: 10.5, color: 'var(--gold-flat)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}
                >
                  <Upload size={12} />
                  <span>Choose from Gallery</span>
                </button>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                style={{ display: 'none' }}
              />

              <div style={{ display: 'flex', alignItems: 'center', gap: 8, overflowX: 'auto', paddingBottom: 4, width: '100%' }}>
                <div style={{
                  width: 46,
                  height: 46,
                  borderRadius: 10,
                  overflow: 'hidden',
                  flexShrink: 0,
                  border: '2px solid var(--gold-flat)'
                }}>
                  <img src={coverUrl} alt="Selected cover" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>

                <div style={{ width: 1, height: 32, background: 'rgba(255,255,255,0.1)', margin: '0 4px', flexShrink: 0 }} />

                {PRESET_COVERS.map((url, idx) => (
                  <div
                    key={idx}
                    onClick={() => setCoverUrl(url)}
                    style={{
                      width: 42,
                      height: 42,
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

            {/* Submit Button */}
            <button
              type="submit"
              className="btn-gold-primary"
              style={{ width: '100%', padding: '12px', marginTop: 4 }}
            >
              <span>Add & Stream Song</span>
            </button>
          </form>
        </div>

        {/* Firebase Cloud Sync Status Card */}
        <div className="glass-card" style={{ borderRadius: 18, padding: '14px 16px', border: '1px solid var(--border-gold-subtle)', width: '100%', boxSizing: 'border-box' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
              <Cloud size={16} color="var(--gold-flat)" />
              <h2 className="font-modern-heading" style={{ fontSize: 13.5, fontWeight: 800, color: '#fff' }}>
                Firebase Cloud Sync
              </h2>
            </div>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 5,
              padding: '3px 9px',
              borderRadius: 999,
              background: 'rgba(74, 222, 128, 0.12)',
              border: '1px solid rgba(74, 222, 128, 0.3)'
            }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#4ade80' }} />
              <span style={{ fontSize: 10.5, color: '#4ade80', fontWeight: 700, letterSpacing: '0.04em' }}>CONNECTED</span>
            </div>
          </div>

          <p style={{ fontSize: 11.5, color: 'var(--text-secondary)', lineHeight: '1.5', margin: 0 }}>
            All songs and playlists are automatically synchronized to Firebase Cloud, ensuring instant real-time access across all your devices.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AddSongPage;
