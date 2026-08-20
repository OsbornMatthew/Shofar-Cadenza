import React from 'react';
import { useAudio } from '../context/AudioContext';

const AndroidFrame = ({ children }) => {
  const { toastMessage } = useAudio();

  return (
    <div className="app-viewport-wrapper">
      <div className="app-main-container">
        {/* Dynamic Toast Notification */}
        {toastMessage && (
          <div style={{
            position: 'absolute',
            top: 20,
            left: 20,
            right: 20,
            zIndex: 150,
            background: 'rgba(18, 18, 24, 0.95)',
            border: '1px solid var(--gold-flat)',
            borderRadius: 14,
            padding: '10px 16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 8px 25px rgba(0,0,0,0.7)',
            animation: 'fadeIn 0.2s ease'
          }}>
            <span style={{ fontSize: 13, fontWeight: 600, color: '#fff', textAlign: 'center' }}>
              {toastMessage}
            </span>
          </div>
        )}

        {/* Main App Content Viewport */}
        {children}
      </div>
    </div>
  );
};

export default AndroidFrame;
