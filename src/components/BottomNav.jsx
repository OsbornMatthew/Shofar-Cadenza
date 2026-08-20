import React from 'react';
import { Home, Search, ListMusic, PlusCircle } from 'lucide-react';
import { useAudio } from '../context/AudioContext';

const BottomNav = () => {
  const { activeTab, setActiveTab, setActivePlaylistDetail } = useAudio();

  const navItems = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'search', label: 'Search', icon: Search },
    { id: 'library', label: 'Library', icon: ListMusic },
    { id: 'add-song', label: 'Add Song', icon: PlusCircle, isSpecial: true }
  ];

  const handleTabClick = (tabId) => {
    setActiveTab(tabId);
    if (tabId !== 'library') {
      setActivePlaylistDetail(null);
    }
  };

  return (
    <nav className="android-bottom-nav">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = activeTab === item.id;

        return (
          <button
            key={item.id}
            onClick={() => handleTabClick(item.id)}
            className={`nav-item-btn ${isActive ? 'active' : ''}`}
          >
            <div className="nav-icon-container" style={{ position: 'relative' }}>
              <Icon
                size={item.isSpecial ? 23 : 21}
                strokeWidth={isActive ? 2.5 : 2}
                color={item.isSpecial && !isActive ? 'var(--gold-flat)' : undefined}
              />
              {item.isSpecial && (
                <span style={{
                  position: 'absolute',
                  top: -1,
                  right: -2,
                  width: 5,
                  height: 5,
                  borderRadius: '50%',
                  background: 'var(--gold-flat)'
                }} />
              )}
            </div>
            <span className="nav-label" style={{ color: isActive ? 'var(--gold-flat)' : undefined }}>
              {item.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
};

export default BottomNav;
