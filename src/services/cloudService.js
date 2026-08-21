// Firebase Realtime Database Cloud Sync Service
import { INITIAL_SONGS, INITIAL_PLAYLISTS } from '../data/songs.js';

const FIREBASE_DB_URL = 'https://shofar-cadenzaz-default-rtdb.firebaseio.com';

// Helper with timeout to prevent network hanging
async function fetchWithTimeout(url, options = {}, timeoutMs = 7000) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal
    });
    clearTimeout(id);
    return response;
  } catch (err) {
    clearTimeout(id);
    throw err;
  }
}

// ---------------------- SONGS CLOUD SYNC ----------------------

// Fetch all songs from cloud database
export async function fetchCloudSongs() {
  try {
    const response = await fetchWithTimeout(`${FIREBASE_DB_URL}/songs.json`, {}, 5000);
    if (!response.ok) throw new Error(`Cloud fetch failed with status ${response.status}`);
    const data = await response.json();

    if (!data || Object.keys(data).length === 0) {
      seedDefaultSongs().catch(() => {});
      return INITIAL_SONGS;
    }

    return Object.values(data);
  } catch (error) {
    console.warn('[Firebase Cloud] fetchCloudSongs error:', error);
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

    await fetchWithTimeout(`${FIREBASE_DB_URL}/songs.json`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(seedData)
    }, 6000);
    console.log('[Firebase Cloud] Default songs seeded');
  } catch (err) {
    console.warn('[Firebase Cloud] seedDefaultSongs error:', err);
  }
}

// Add new song to cloud (Background sync)
export async function saveSongToCloud(song) {
  try {
    const res = await fetchWithTimeout(`${FIREBASE_DB_URL}/songs/${song.id}.json`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(song)
    }, 6000);
    if (res.ok) {
      console.log(`[Firebase Cloud] Song saved to cloud: ${song.title} (${song.id})`);
      return true;
    }
    console.warn(`[Firebase Cloud] Failed to save song, status: ${res.status}`);
    return false;
  } catch (err) {
    console.warn('[Firebase Cloud] Failed to save song to cloud:', err);
    return false;
  }
}

// Update song details, title, lyrics in cloud (Background sync)
export async function updateSongInCloud(songId, updatedData) {
  try {
    const res = await fetchWithTimeout(`${FIREBASE_DB_URL}/songs/${songId}.json`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updatedData)
    }, 6000);
    if (res.ok) {
      console.log(`[Firebase Cloud] Song updated in cloud: ${songId}`);
      return true;
    }
    console.warn(`[Firebase Cloud] Failed to update song, status: ${res.status}`);
    return false;
  } catch (err) {
    console.warn('[Firebase Cloud] Failed to update song in cloud:', err);
    return false;
  }
}

// Delete song from cloud (Background sync)
export async function deleteSongFromCloud(songId) {
  try {
    const res = await fetchWithTimeout(`${FIREBASE_DB_URL}/songs/${songId}.json`, {
      method: 'DELETE'
    }, 6000);
    if (res.ok) {
      console.log(`[Firebase Cloud] Song deleted from cloud: ${songId}`);
      return true;
    }
    console.warn(`[Firebase Cloud] Failed to delete song, status: ${res.status}`);
    return false;
  } catch (err) {
    console.warn('[Firebase Cloud] Failed to delete song from cloud:', err);
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
        // silent
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
    // silent
  }

  const interval = setInterval(() => {
    fetchCloudSongs().then(songs => {
      if (songs) onUpdate(songs);
    });
  }, 10000);

  return () => {
    if (eventSource) eventSource.close();
    clearInterval(interval);
  };
}


// ---------------------- PLAYLISTS CLOUD SYNC ----------------------

// Fetch all playlists from cloud database
export async function fetchCloudPlaylists() {
  try {
    const response = await fetchWithTimeout(`${FIREBASE_DB_URL}/playlists.json`, {}, 5000);
    if (!response.ok) throw new Error(`Cloud playlists fetch failed with status ${response.status}`);
    const data = await response.json();

    if (!data || Object.keys(data).length === 0) {
      seedDefaultPlaylists().catch(() => {});
      return INITIAL_PLAYLISTS;
    }

    return Object.values(data);
  } catch (error) {
    console.warn('[Firebase Cloud] fetchCloudPlaylists error:', error);
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

    await fetchWithTimeout(`${FIREBASE_DB_URL}/playlists.json`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(seedData)
    }, 6000);
    console.log('[Firebase Cloud] Default playlists seeded');
  } catch (err) {
    console.warn('[Firebase Cloud] seedDefaultPlaylists error:', err);
  }
}

// Save or create playlist in cloud (Background sync)
export async function savePlaylistToCloud(playlist) {
  try {
    const res = await fetchWithTimeout(`${FIREBASE_DB_URL}/playlists/${playlist.id}.json`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(playlist)
    }, 6000);
    if (res.ok) {
      console.log(`[Firebase Cloud] Playlist saved to cloud: ${playlist.name} (${playlist.id})`);
      return true;
    }
    console.warn(`[Firebase Cloud] Failed to save playlist, status: ${res.status}`);
    return false;
  } catch (err) {
    console.warn('[Firebase Cloud] Failed to save playlist to cloud:', err);
    return false;
  }
}

// Update playlist (add song, remove song, rename) in cloud (Background sync)
export async function updatePlaylistInCloud(playlistId, updatedData) {
  try {
    const res = await fetchWithTimeout(`${FIREBASE_DB_URL}/playlists/${playlistId}.json`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updatedData)
    }, 6000);
    if (res.ok) {
      console.log(`[Firebase Cloud] Playlist updated in cloud: ${playlistId}`);
      return true;
    }
    console.warn(`[Firebase Cloud] Failed to update playlist, status: ${res.status}`);
    return false;
  } catch (err) {
    console.warn('[Firebase Cloud] Failed to update playlist in cloud:', err);
    return false;
  }
}

// Delete playlist from cloud (Background sync)
export async function deletePlaylistFromCloud(playlistId) {
  try {
    const res = await fetchWithTimeout(`${FIREBASE_DB_URL}/playlists/${playlistId}.json`, {
      method: 'DELETE'
    }, 6000);
    if (res.ok) {
      console.log(`[Firebase Cloud] Playlist deleted from cloud: ${playlistId}`);
      return true;
    }
    console.warn(`[Firebase Cloud] Failed to delete playlist, status: ${res.status}`);
    return false;
  } catch (err) {
    console.warn('[Firebase Cloud] Failed to delete playlist from cloud:', err);
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
        // silent
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
    // silent
  }

  const interval = setInterval(() => {
    fetchCloudPlaylists().then(pls => {
      if (pls) onUpdate(pls);
    });
  }, 10000);

  return () => {
    if (eventSource) eventSource.close();
    clearInterval(interval);
  };
}
