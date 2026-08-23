/**
 * Audio Utilities for Shofar Cadenza
 * Handles duration formatting, parsing, and dynamic audio duration detection.
 */

/**
 * Formats seconds into mm:ss or hh:mm:ss format
 * @param {number} secs 
 * @returns {string} e.g. "3:45", "12:04", "1:15:30"
 */
export function formatTime(secs) {
  if (secs === null || secs === undefined || isNaN(secs) || secs < 0 || !isFinite(secs)) {
    return '0:00';
  }

  const totalSeconds = Math.round(secs);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  const paddedSeconds = seconds < 10 ? `0${seconds}` : `${seconds}`;

  if (hours > 0) {
    const paddedMinutes = minutes < 10 ? `0${minutes}` : `${minutes}`;
    return `${hours}:${paddedMinutes}:${paddedSeconds}`;
  }

  return `${minutes}:${paddedSeconds}`;
}

/**
 * Parses a duration string (e.g. "3:45", "03:45", "1:20:15") into total seconds
 * @param {string|number} timeStr 
 * @returns {number} total seconds
 */
export function parseTimeToSeconds(timeStr) {
  if (typeof timeStr === 'number') {
    return isNaN(timeStr) || !isFinite(timeStr) ? 0 : Math.max(0, Math.round(timeStr));
  }

  if (!timeStr || typeof timeStr !== 'string') {
    return 0;
  }

  const parts = timeStr.trim().split(':').map(p => parseInt(p, 10));
  if (parts.some(isNaN)) return 0;

  if (parts.length === 3) {
    // hh:mm:ss
    return parts[0] * 3600 + parts[1] * 60 + parts[2];
  } else if (parts.length === 2) {
    // mm:ss
    return parts[0] * 60 + parts[1];
  } else if (parts.length === 1) {
    return parts[0];
  }

  return 0;
}

/**
 * Detects the real audio duration of an audio URL asynchronously by reading metadata
 * @param {string} audioUrl 
 * @param {number} timeoutMs 
 * @returns {Promise<{ duration: string, durationSec: number } | null>}
 */
export function detectAudioDuration(audioUrl, timeoutMs = 8000) {
  return new Promise((resolve) => {
    if (!audioUrl || typeof audioUrl !== 'string') {
      return resolve(null);
    }
    const trimmed = audioUrl.trim();
    if (!trimmed.startsWith('http://') && !trimmed.startsWith('https://') && !trimmed.startsWith('blob:') && !trimmed.startsWith('data:')) {
      return resolve(null);
    }

    try {
      const audio = new Audio();
      audio.preload = 'metadata';
      let isResolved = false;

      const cleanup = () => {
        audio.removeEventListener('loadedmetadata', onLoaded);
        audio.removeEventListener('durationchange', onLoaded);
        audio.removeEventListener('error', onError);
        clearTimeout(timer);
        audio.src = '';
      };

      const onLoaded = () => {
        if (isResolved) return;
        const dur = audio.duration;
        if (!isNaN(dur) && dur > 0 && isFinite(dur)) {
          isResolved = true;
          const durationSec = Math.round(dur);
          const duration = formatTime(dur);
          cleanup();
          resolve({ duration, durationSec });
        }
      };

      const onError = () => {
        if (isResolved) return;
        isResolved = true;
        cleanup();
        resolve(null);
      };

      const timer = setTimeout(() => {
        if (!isResolved) {
          isResolved = true;
          cleanup();
          resolve(null);
        }
      }, timeoutMs);

      audio.addEventListener('loadedmetadata', onLoaded);
      audio.addEventListener('durationchange', onLoaded);
      audio.addEventListener('error', onError);

      // Set src to start loading metadata
      audio.src = audioUrl.trim();
    } catch (err) {
      console.warn('detectAudioDuration error:', err);
      resolve(null);
    }
  });
}
