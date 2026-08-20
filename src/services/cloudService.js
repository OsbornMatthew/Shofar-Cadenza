// Firebase Realtime Database Cloud Sync Service
import { INITIAL_SONGS, INITIAL_PLAYLISTS } from '../data/songs.js';

const FIREBASE_DB_URL = 'https://shofar-cadenzaz-default-rtdb.firebaseio.com';

// ---------------------- SONGS CLOUD SYNC ----------------------

// Fetch all songs from cloud database
export async function fetchCloudSongs() {
  try {
    const response = await fetch(`${FIREBASE_DB_URL}/songs.json`);
    if (!response.ok) throw new Error('Cloud fetch failed');
    const data = await response.json();

    if (!data || Object.keys(data).length === 0) {
      await seedDefaultSongs();
      return INITIAL_SONGS;
    }

    return Object.values(data);
  } catch (error) {
    console.warn('Cloud songs fetch error, falling back to local:', error);
    return null;
  }
}

// Seed default initial songs to Firebase
export async function seedDefaultSongs() {
  try {
    const seedData = {};
    INITIAL_SONGS.forEach(song => {
      seedData[song.id] = song;
    });

    await fetch(`${FIREBASE_DB_URL}/songs.json`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(seedData)
    });
  } catch (err) {
    console.warn('Seed error:', err);
  }
}

// Add new song to cloud (Instantly syncs to all shared APKs)
export async function saveSongToCloud(song) {
  try {
    const response = await fetch(`${FIREBASE_DB_URL}/songs/${song.id}.json`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(song)
    });
    return response.ok;
  } catch (err) {
    console.error('Failed to save song to cloud:', err);
    return false;
  }
}

// Update song details, title, lyrics in cloud (Instantly syncs to all shared APKs)
export async function updateSongInCloud(songId, updatedData) {
  try {
    const response = await fetch(`${FIREBASE_DB_URL}/songs/${songId}.json`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updatedData)
    });
    return response.ok;
  } catch (err) {
    console.error('Failed to update song in cloud:', err);
    return false;
  }
}

// Delete song from cloud (Instantly syncs to all shared APKs)
export async function deleteSongFromCloud(songId) {
  try {
    const response = await fetch(`${FIREBASE_DB_URL}/songs/${songId}.json`, {
      method: 'DELETE'
    });
    return response.ok;
  } catch (err) {
    console.error('Failed to delete song from cloud:', err);
    return false;
  }
}

// Listen to live real-time cloud changes for songs via SSE
export function subscribeToCloudSongs(onUpdate) {
  let eventSource;
  try {
    eventSource = new EventSource(`${FIREBASE_DB_URL}/songs.json`);

    eventSource.addEventListener('put', (event) => {
      try {
        const payload = JSON.parse(event.data);
        if (payload && payload.path === '/') {
          const songsObj = payload.data;
          onUpdate(songsObj ? Object.values(songsObj) : []);
        } else {
          fetchCloudSongs().then(songs => {
            if (songs) onUpdate(songs);
          });
        }
      } catch (e) {
        console.warn('Error parsing cloud SSE event:', e);
      }
    });

    eventSource.addEventListener('patch', () => {
      fetchCloudSongs().then(songs => {
        if (songs) onUpdate(songs);
      });
    });

    eventSource.onerror = () => {
      if (eventSource) eventSource.close();
    };
  } catch (err) {
    console.warn('EventSource not supported');
  }

  const interval = setInterval(() => {
    fetchCloudSongs().then(songs => {
      if (songs) onUpdate(songs);
    });
  }, 5000);

  return () => {
    if (eventSource) eventSource.close();
    clearInterval(interval);
  };
}


// ---------------------- PLAYLISTS CLOUD SYNC ----------------------

// Fetch all playlists from cloud database
export async function fetchCloudPlaylists() {
  try {
    const response = await fetch(`${FIREBASE_DB_URL}/playlists.json`);
    if (!response.ok) throw new Error('Cloud playlists fetch failed');
    const data = await response.json();

    if (!data || Object.keys(data).length === 0) {
      await seedDefaultPlaylists();
      return INITIAL_PLAYLISTS;
    }

    return Object.values(data);
  } catch (error) {
    console.warn('Cloud playlists fetch error, falling back to local:', error);
    return null;
  }
}

// Seed default initial playlists to Firebase
export async function seedDefaultPlaylists() {
  try {
    const seedData = {};
    INITIAL_PLAYLISTS.forEach(pl => {
      seedData[pl.id] = pl;
    });

    await fetch(`${FIREBASE_DB_URL}/playlists.json`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(seedData)
    });
  } catch (err) {
    console.warn('Seed playlists error:', err);
  }
}

// Save or create playlist in cloud (Instantly syncs to all shared APKs)
export async function savePlaylistToCloud(playlist) {
  try {
    const response = await fetch(`${FIREBASE_DB_URL}/playlists/${playlist.id}.json`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(playlist)
    });
    return response.ok;
  } catch (err) {
    console.error('Failed to save playlist to cloud:', err);
    return false;
  }
}

// Update playlist (add song, remove song, rename) in cloud (Instantly syncs to all shared APKs)
export async function updatePlaylistInCloud(playlistId, updatedData) {
  try {
    const response = await fetch(`${FIREBASE_DB_URL}/playlists/${playlistId}.json`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updatedData)
    });
    return response.ok;
  } catch (err) {
    console.error('Failed to update playlist in cloud:', err);
    return false;
  }
}

// Delete playlist from cloud (Instantly syncs to all shared APKs)
export async function deletePlaylistFromCloud(playlistId) {
  try {
    const response = await fetch(`${FIREBASE_DB_URL}/playlists/${playlistId}.json`, {
      method: 'DELETE'
    });
    return response.ok;
  } catch (err) {
    console.error('Failed to delete playlist from cloud:', err);
    return false;
  }
}

// Listen to live real-time cloud changes for playlists via SSE
export function subscribeToCloudPlaylists(onUpdate) {
  let eventSource;
  try {
    eventSource = new EventSource(`${FIREBASE_DB_URL}/playlists.json`);

    eventSource.addEventListener('put', (event) => {
      try {
        const payload = JSON.parse(event.data);
        if (payload && payload.path === '/') {
          const plObj = payload.data;
          onUpdate(plObj ? Object.values(plObj) : []);
        } else {
          fetchCloudPlaylists().then(pls => {
            if (pls) onUpdate(pls);
          });
        }
      } catch (e) {
        console.warn('Error parsing playlists SSE event:', e);
      }
    });

    eventSource.addEventListener('patch', () => {
      fetchCloudPlaylists().then(pls => {
        if (pls) onUpdate(pls);
      });
    });

    eventSource.onerror = () => {
      if (eventSource) eventSource.close();
    };
  } catch (err) {
    console.warn('EventSource playlists not supported');
  }

  const interval = setInterval(() => {
    fetchCloudPlaylists().then(pls => {
      if (pls) onUpdate(pls);
    });
  }, 5000);

  return () => {
    if (eventSource) eventSource.close();
    clearInterval(interval);
  };
}
