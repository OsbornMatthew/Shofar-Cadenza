// Firebase Realtime Database Cloud Sync Service
import { INITIAL_SONGS } from '../data/songs.js';

const FIREBASE_DB_URL = 'https://shofar-cadenzaz-default-rtdb.firebaseio.com';

// Fetch all songs from cloud database
export async function fetchCloudSongs() {
  try {
    const response = await fetch(`${FIREBASE_DB_URL}/songs.json`);
    if (!response.ok) throw new Error('Cloud fetch failed');
    const data = await response.json();

    if (!data || Object.keys(data).length === 0) {
      // Seed default songs to cloud if empty
      await seedDefaultSongs();
      return INITIAL_SONGS;
    }

    // Convert object dictionary to array
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

// Add new song to cloud
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

// Update song details / lyrics in cloud
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

// Delete song from cloud
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

// Listen to live real-time cloud changes via Server-Sent Events (SSE)
export function subscribeToCloudSongs(onUpdate) {
  let eventSource;
  try {
    eventSource = new EventSource(`${FIREBASE_DB_URL}/songs.json`);

    eventSource.addEventListener('put', (event) => {
      try {
        const payload = JSON.parse(event.data);
        if (payload && payload.path === '/') {
          const songsObj = payload.data;
          if (songsObj) {
            const songsList = Object.values(songsObj);
            onUpdate(songsList);
          } else {
            onUpdate([]);
          }
        } else if (payload && payload.path && payload.path !== '/') {
          // A single song was updated or added
          // Re-fetch or trigger sync
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
      // SSE connection error, close and fallback to periodic polling
      if (eventSource) eventSource.close();
    };
  } catch (err) {
    console.warn('EventSource not supported, using polling fallback');
  }

  // Backup polling every 8 seconds to ensure synchronization
  const interval = setInterval(() => {
    fetchCloudSongs().then(songs => {
      if (songs) onUpdate(songs);
    });
  }, 8000);

  return () => {
    if (eventSource) eventSource.close();
    clearInterval(interval);
  };
}
