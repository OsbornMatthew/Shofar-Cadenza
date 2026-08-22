import React, { useState, useRef } from 'react';
import {
  Cloud,
  PlusCircle,
  HelpCircle,
  CheckCircle2,
  Copy,
  Upload
} from 'lucide-react';
import { useAudio } from '../context/AudioContext';

const PRESET_COVERS = [
  'https://images.unsplash.com/photo-1518895949257-7621c3c786d7?q=80&w=800&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?q=80&w=800&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1507838153414-b4b713384a76?q=80&w=800&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=800&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=800&auto=format&fit=crop'
];

const AddSongPage = () => {
  const { addNewSong, showToast, setActiveTab, clearEntireCloudAndLocalVault, openConfirmModal } = useAudio();

  const [title, setTitle] = useState('');
  const [artist, setArtist] = useState('');
  const [album, setAlbum] = useState('');
  const [audioUrl, setAudioUrl] = useState('');
  const [coverUrl, setCoverUrl] = useState(PRESET_COVERS[0]);
  const [genre, setGenre] = useState('Acoustic Pop');
  const [duration, setDuration] = useState('3:45');
  const [lyrics, setLyrics] = useState('');
  const [activeGuideTab, setActiveGuideTab] = useState('cloudinary');

  const fileInputRef = useRef(null);

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
      duration,
      lyrics
    });

    setTitle('');
    setArtist('');
    setAlbum('');
    setAudioUrl('');
    setLyrics('');
    setActiveTab('home');
  };

  const copyCodeSnippet = () => {
    const snippet = `{
  id: 'track-${Date.now()}',
  title: 'Your Song Title',
  artist: 'Artist Name',
  album: 'Album Name',
  duration: '3:30',
  durationSec: 210,
  audioUrl: 'https://res.cloudinary.com/YOUR_CLOUD_NAME/video/upload/your-song.mp3',
  coverUrl: 'https://images.unsplash.com/...',
  genre: 'Acoustic Pop',
  isCloudinary: true
}`;
    navigator.clipboard?.writeText(snippet);
    showToast('Code template copied');
  };

  return (
    <div className="app-content-scrollable">
      <div style={{ padding: '16px 16px 16px 16px', display: 'flex', flexDirection: 'column', gap: 16, width: '100%', boxSizing: 'border-box' }}>
        {/* Header */}
        <div style={{ width: '100%' }}>
          <span style={{ fontSize: 10.5, fontWeight: 700, color: 'var(--gold-flat)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
            Audio Manager
          </span>
          <h1 className="font-modern-heading" style={{ fontSize: 24, fontWeight: 900, color: '#fff', marginTop: 2 }}>
            Add to Shofar Cadenza
          </h1>
          <p style={{ fontSize: 11.5, color: 'var(--text-secondary)', marginTop: 2 }}>
            Stream any Cloudinary audio or direct MP3 link.
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

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 11, width: '100%' }}>
            {/* Audio URL */}
            <div style={{ width: '100%' }}>
              <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--gold-flat)', marginBottom: 4, display: 'block' }}>
                CLOUDINARY / AUDIO STREAM URL *
              </label>
              <input
                type="url"
                required
                placeholder="https://res.cloudinary.com/.../your-song.mp3"
                value={audioUrl}
                onChange={(e) => setAudioUrl(e.target.value)}
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
                  placeholder="e.g. Supermarket Flowers"
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
                  placeholder="e.g. Ed Sheeran"
                  value={artist}
                  onChange={(e) => setArtist(e.target.value)}
                  className="gold-input"
                />
              </div>
            </div>

            {/* Album & Genre */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, width: '100%' }}>
              <div>
                <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--gold-flat)', marginBottom: 4, display: 'block' }}>
                  ALBUM
                </label>
                <input
                  type="text"
                  placeholder="e.g. ÷ (Divide)"
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
                style={{ minHeight: 65, resize: 'vertical' }}
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
              style={{ width: '100%', padding: '11px', marginTop: 4 }}
            >
              <span>Add & Stream Song</span>
            </button>
          </form>
        </div>

        {/* Future Expansion Guide */}
        <div className="glass-card" style={{ borderRadius: 18, padding: '14px', border: '1px solid var(--border-gold-subtle)', width: '100%', boxSizing: 'border-box' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 10 }}>
            <HelpCircle size={16} color="var(--gold-flat)" />
            <h2 className="font-modern-heading" style={{ fontSize: 15, fontWeight: 800, color: '#fff' }}>
              Future Song Addition Guide
            </h2>
          </div>

          <div style={{ display: 'flex', gap: 6, marginBottom: 12, width: '100%' }}>
            <button
              onClick={() => setActiveGuideTab('cloudinary')}
              className={`glass-pill ${activeGuideTab === 'cloudinary' ? 'active' : ''}`}
              style={{ flex: 1, padding: '5px 0', fontSize: 11, cursor: 'pointer', textAlign: 'center' }}
            >
              Cloudinary
            </button>
            <button
              onClick={() => setActiveGuideTab('code')}
              className={`glass-pill ${activeGuideTab === 'code' ? 'active' : ''}`}
              style={{ flex: 1, padding: '5px 0', fontSize: 11, cursor: 'pointer', textAlign: 'center' }}
            >
              Code File
            </button>
            <button
              onClick={() => setActiveGuideTab('android')}
              className={`glass-pill ${activeGuideTab === 'android' ? 'active' : ''}`}
              style={{ flex: 1, padding: '5px 0', fontSize: 11, cursor: 'pointer', textAlign: 'center' }}
            >
              Android APK
            </button>
          </div>

          {activeGuideTab === 'cloudinary' && (
            <div style={{ fontSize: 11.5, lineHeight: '1.6', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: 7 }}>
              <div style={{ display: 'flex', gap: 7, alignItems: 'flex-start' }}>
                <CheckCircle2 size={15} color="var(--gold-flat)" style={{ flexShrink: 0, marginTop: 2 }} />
                <p><strong style={{ color: '#fff' }}>1.</strong> Go to <span style={{ color: 'var(--gold-flat)' }}>Cloudinary.com</span> (Free 25GB streaming).</p>
              </div>
              <div style={{ display: 'flex', gap: 7, alignItems: 'flex-start' }}>
                <CheckCircle2 size={15} color="var(--gold-flat)" style={{ flexShrink: 0, marginTop: 2 }} />
                <p><strong style={{ color: '#fff' }}>2.</strong> In Media Library, click <em>Upload</em> and drag your <code style={{ color: 'var(--gold-300)' }}>.mp3</code> files.</p>
              </div>
              <div style={{ display: 'flex', gap: 7, alignItems: 'flex-start' }}>
                <CheckCircle2 size={15} color="var(--gold-flat)" style={{ flexShrink: 0, marginTop: 2 }} />
                <p><strong style={{ color: '#fff' }}>3.</strong> Click <em>Copy Link</em> to get direct link ending with <code style={{ color: 'var(--gold-300)' }}>.mp3</code>.</p>
              </div>
              <div style={{ display: 'flex', gap: 7, alignItems: 'flex-start' }}>
                <CheckCircle2 size={15} color="var(--gold-flat)" style={{ flexShrink: 0, marginTop: 2 }} />
                <p><strong style={{ color: '#fff' }}>4.</strong> Paste into this form to stream immediately!</p>
              </div>
            </div>
          )}

          {activeGuideTab === 'code' && (
            <div>
              <p style={{ fontSize: 11, color: 'var(--text-secondary)', marginBottom: 6 }}>
                Add to <code style={{ color: 'var(--gold-flat)' }}>src/data/songs.js</code>:
              </p>
              <pre style={{
                background: '#08080a',
                border: '1px solid var(--border-gold-subtle)',
                borderRadius: 10,
                padding: '8px 10px',
                fontSize: 10.5,
                color: 'var(--gold-300)',
                overflowX: 'auto'
              }}>
{`{
  id: 'track-${Date.now()}',
  title: 'Song Title',
  artist: 'Artist',
  audioUrl: 'https://res.cloudinary.com/.../song.mp3',
  coverUrl: 'https://images.unsplash.com/...',
  duration: '3:45',
  genre: 'Acoustic Pop'
}`}
              </pre>
              <button
                onClick={copyCodeSnippet}
                className="btn-gold-outline"
                style={{ width: '100%', marginTop: 8, padding: '6px', fontSize: 11 }}
              >
                <Copy size={12} />
                <span>Copy Template</span>
              </button>
            </div>
          )}

          {activeGuideTab === 'android' && (
            <div style={{ fontSize: 11.5, lineHeight: '1.6', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: 6 }}>
              <p><strong style={{ color: '#fff' }}>Build Android APK:</strong></p>
              <ol style={{ paddingLeft: 16, display: 'flex', flexDirection: 'column', gap: 5 }}>
                <li>Run <code style={{ color: 'var(--gold-flat)' }}>npm run build</code></li>
                <li>Run <code style={{ color: 'var(--gold-flat)' }}>npx cap add android</code></li>
                <li>Run <code style={{ color: 'var(--gold-flat)' }}>npx cap open android</code></li>
                <li>Click <em>Build → Build APK(s)</em> in Android Studio!</li>
              </ol>
            </div>
          )}
        </div>

        {/* Cloud Database Maintenance Card */}
        <div className="glass-card" style={{ borderRadius: 18, padding: '14px', border: '1px solid rgba(255,107,107,0.3)', width: '100%', boxSizing: 'border-box' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
              <Cloud size={16} color="var(--gold-flat)" />
              <h2 className="font-modern-heading" style={{ fontSize: 14, fontWeight: 800, color: '#fff' }}>
                Firebase Cloud Sync
              </h2>
            </div>
            <span style={{ fontSize: 10.5, color: '#4ade80', fontWeight: 700 }}>● CONNECTED</span>
          </div>

          <p style={{ fontSize: 11.5, color: 'var(--text-secondary)', lineHeight: '1.5', marginBottom: 12 }}>
            All songs and playlists you create are automatically stored in Firebase Cloud so your music syncs across all your devices.
          </p>

          <button
            type="button"
            onClick={() => {
              openConfirmModal({
                title: 'Clear Entire Cloud Database',
                message: 'Are you sure you want to completely erase all songs, playlists, and cached tracks from Firebase and this device? You will start 100% clean.',
                confirmText: 'Wipe Everything',
                isDestructive: true,
                onConfirm: () => clearEntireCloudAndLocalVault()
              });
            }}
            style={{
              width: '100%',
              padding: '9px 12px',
              borderRadius: 10,
              background: 'rgba(255, 107, 107, 0.1)',
              border: '1px solid rgba(255, 107, 107, 0.35)',
              color: '#ff8888',
              fontSize: 12,
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 6
            }}
          >
            <span>Wipe & Reset Firebase Database</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddSongPage;
