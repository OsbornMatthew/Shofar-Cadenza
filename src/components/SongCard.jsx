import React from 'react';
import { Play } from 'lucide-react';

const SongCard = ({ title, subtitle, coverUrl, onClick, onPlay }) => {
  return (
    <div
      onClick={onClick}
      className="glass-card"
      style={{
        width: 140,
        flexShrink: 0,
        padding: 9,
        borderRadius: 16,
        cursor: 'pointer',
        position: 'relative',
        transition: 'transform 0.2s ease, border-color 0.2s ease',
        border: '1px solid var(--border-gold-subtle)'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-3px)';
        e.currentTarget.style.borderColor = 'var(--gold-flat)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.borderColor = 'var(--border-gold-subtle)';
      }}
    >
      {/* Cover Image */}
      <div style={{ position: 'relative', width: '100%', aspectRatio: '1/1', marginBottom: 8 }}>
        <img
          src={coverUrl}
          alt={title}
          style={{
            width: '100%',
            height: '100%',
            borderRadius: 12,
            objectFit: 'cover',
            boxShadow: '0 4px 12px rgba(0,0,0,0.5)'
          }}
        />

        {/* Quick Play Button */}
        {onPlay && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onPlay();
            }}
            style={{
              position: 'absolute',
              bottom: 6,
              right: 6,
              width: 30,
              height: 30,
              borderRadius: '50%',
              background: 'var(--gold-flat)',
              border: 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              boxShadow: '0 2px 8px rgba(0,0,0,0.6)'
            }}
            title="Play"
          >
            <Play size={13} fill="#060608" color="#060608" style={{ marginLeft: 1.5 }} />
          </button>
        )}
      </div>

      {/* Info */}
      <h3 style={{
        fontSize: 12.5,
        fontWeight: 700,
        color: '#fff',
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis'
      }}>
        {title}
      </h3>
      <p style={{
        fontSize: 11,
        color: 'var(--text-secondary)',
        marginTop: 2,
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis'
      }}>
        {subtitle}
      </p>
    </div>
  );
};

export default SongCard;
