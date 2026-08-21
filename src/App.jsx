import React from 'react';
import { useAudio } from './context/AudioContext';
import AndroidFrame from './components/AndroidFrame';
import BottomNav from './components/BottomNav';
import MiniPlayer from './components/MiniPlayer';
import NowPlayingModal from './components/NowPlayingModal';
import PlaylistModal from './components/PlaylistModal';
import AddToPlaylistModal from './components/AddToPlaylistModal';
import EditSongModal from './components/EditSongModal';
import ConfirmModal from './components/ConfirmModal';
import Home from './pages/Home';
import Search from './pages/Search';
import Library from './pages/Library';
import AddSongPage from './pages/AddSongPage';

function AppContent() {
  const { activeTab } = useAudio();

  const renderActiveScreen = () => {
    switch (activeTab) {
      case 'home':
        return <Home />;
      case 'search':
        return <Search />;
      case 'library':
        return <Library />;
      case 'add-song':
        return <AddSongPage />;
      default:
        return <Home />;
    }
  };

  return (
    <AndroidFrame>
      {/* Active Screen View */}
      {renderActiveScreen()}

      {/* Persistent Mini Player Bar */}
      <MiniPlayer />

      {/* Android Bottom Navigation */}
      <BottomNav />

      {/* Fullscreen Player Sheet Modal */}
      <NowPlayingModal />

      {/* Create Playlist Modal */}
      <PlaylistModal />

      {/* Add to Playlist Selector Modal */}
      <AddToPlaylistModal />

      {/* Edit Song Details Modal */}
      <EditSongModal />

      {/* In-App Confirmation Modal */}
      <ConfirmModal />
    </AndroidFrame>
  );
}

export default function App() {
  return <AppContent />;
}
