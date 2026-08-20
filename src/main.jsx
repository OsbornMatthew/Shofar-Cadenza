import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import { AudioProvider } from './context/AudioContext.jsx';
import './styles/index.css';

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
