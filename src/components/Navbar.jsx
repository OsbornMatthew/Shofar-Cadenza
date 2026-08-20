import React from 'react';
import { Music2 } from 'lucide-react';
import { useAudio } from '../context/AudioContext';

const Navbar = ({ title }) => {
  const { isPlaying } = useAudio();

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <div style={{
      padding: '14px 18px 8px 18px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      position: 'sticky',
      top: 0,
      background: 'linear-gradient(180deg, rgba(6,6,8,0.95) 60%, rgba(6,6,8,0) 100%)',
      zIndex: 30,
      backdropFilter: 'blur(16px)'
    }}>
      {/* Brand & Greeting */}
      <div>
        <span style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: '0.12em', color: 'var(--gold-flat)', textTransform: 'uppercase' }}>
          Shofar Cadenza
        </span>
        <h1 className="font-cinzel" style={{ fontSize: 19, fontWeight: 800, marginTop: 2, color: '#fff' }}>
          {title || getGreeting()}
        </h1>
      </div>

      {/* Minimal Header Audio Status */}
      <div style={{
        padding: '5px 11px',
        borderRadius: 999,
        background: 'rgba(212, 175, 55, 0.08)',
        border: '1px solid var(--border-gold-subtle)',
        display: 'flex',
        alignItems: 'center',
        gap: 6
      }}>
        {isPlaying ? (
          <div className="gold-equalizer-bars" style={{ height: 12 }}>
            <div className="eq-bar" style={{ width: 2 }} />
            <div className="eq-bar" style={{ width: 2 }} />
            <div className="eq-bar" style={{ width: 2 }} />
          </div>
        ) : (
          <Music2 size={13} color="var(--gold-flat)" />
        )}
        <span style={{ fontSize: 10.5, fontWeight: 700, color: 'var(--gold-flat)', letterSpacing: '0.04em' }}>
          {isPlaying ? 'PLAYING' : 'READY'}
        </span>
      </div>
    </div>
  );
};

export default Navbar;
