import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import { AudioProvider } from './context/AudioContext.jsx';
import './styles/index.css';

// Prevent Android/Capacitor WebView viewport scroll displacement
if (typeof window !== 'undefined') {
  const resetScroll = () => {
    if (window.scrollY !== 0 || window.scrollX !== 0 || document.body.scrollTop !== 0 || document.documentElement.scrollTop !== 0) {
      window.scrollTo(0, 0);
      document.body.scrollTop = 0;
      document.documentElement.scrollTop = 0;
    }
  };

  window.addEventListener('scroll', resetScroll, { passive: true });
  window.addEventListener('resize', resetScroll, { passive: true });
  document.addEventListener('focusout', () => {
    setTimeout(resetScroll, 30);
    setTimeout(resetScroll, 150);
  });

  if (window.visualViewport) {
    window.visualViewport.addEventListener('resize', resetScroll);
    window.visualViewport.addEventListener('scroll', resetScroll);
  }
}

// Register Service Worker for PWA / Android installability
if ('serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(err => {
      console.log('SW registration note:', err);
    });
  });
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AudioProvider>
      <App />
    </AudioProvider>
  </React.StrictMode>,
);
