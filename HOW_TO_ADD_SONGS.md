# 🎵 How to Add Songs to Shofar Cadenza

This guide explains all the ways you can add new songs (from Cloudinary or any MP3 source) to your **Shofar Cadenza** Android Music App.

---

## 🌟 Method 1: Instant In-App Song Addition (No Coding Required)

You can add songs directly from inside the mobile app:

1. Open the app and tap the **"Add Song"** tab (with the glowing gold `+` icon) on the bottom navigation bar.
2. Enter your details:
   - **Cloudinary / Direct MP3 URL**: (e.g., `https://res.cloudinary.com/your-cloud-id/video/upload/v123456/song.mp3`)
   - **Song Title**: (e.g., *Supermarket Flowers*)
   - **Artist Name**: (e.g., *Ed Sheeran*)
   - **Album Name**: (e.g., *÷ (Divide)*)
   - **Genre**: Pick from Acoustic Pop, Acoustic Worship, Classical, Lo-Fi, Soul, etc.
   - **Cover Artwork**: Select one of the minimal luxury artwork presets or paste an image URL.
3. Click **"Add & Stream Song"**.
4. The song will immediately appear in your Library, start streaming, and persist in your device's LocalStorage!

---

## ☁️ Method 2: How to Upload & Host Songs on Cloudinary

Cloudinary provides free cloud storage with fast CDN streaming for audio files:

1. **Sign up / Log in**: Go to [Cloudinary.com](https://cloudinary.com/) (Free plan includes 25 GB monthly bandwidth).
2. **Open Media Library**:
   - Go to **Dashboard** → **Media Library**.
   - Create a folder (e.g., `shofar-music`).
3. **Upload Your MP3 File**:
   - Click the **"Upload"** button.
   - Select your `.mp3`, `.wav`, or `.m4a` audio file.
4. **Copy the Public Audio URL**:
   - Once uploaded, click on the **Link Icon / Copy Link** next to the file.
   - The URL will look like:
     ```
     https://res.cloudinary.com/<YOUR_CLOUD_NAME>/video/upload/v1787202139/<SONG_NAME>.mp3
     ```
   *(Note: Audio files on Cloudinary are stored under the `/video/upload/` path)*.
5. Paste this URL into Shofar Cadenza's **Add Song** tab!

---

## 💻 Method 3: Permanently Adding Songs in Code (`src/data/songs.js`)

To make new songs permanently available to all users by default, edit [`src/data/songs.js`](file:///d:/Shofar%20Cadenza/src/data/songs.js):

Open `src/data/songs.js` and add a new item to the `INITIAL_SONGS` array:

```javascript
{
  id: 'track-your-song-id',
  title: 'Song Title',
  artist: 'Artist Name',
  album: 'Album Title',
  duration: '3:45',
  durationSec: 225,
  audioUrl: 'https://res.cloudinary.com/vkh68kb8/video/upload/v1787202139/Your_Song.mp3',
  coverUrl: 'https://images.unsplash.com/photo-1518895949257-7621c3c786d7?q=80&w=800&auto=format&fit=crop',
  genre: 'Acoustic Pop',
  isCloudinary: true,
  isFeatured: true,
  lyrics: `[00:10] Lyrics line 1\n[00:25] Lyrics line 2`
}
```

---

## 📱 Method 4: Building & Installing as a Native Android App (APK)

This project is pre-configured with **Capacitor** and **PWA Web App Manifest**.

### To Generate an Android APK:
1. Build the production web bundle:
   ```bash
   npm run build
   ```
2. Initialize and sync Android platform:
   ```bash
   npx cap add android
   npx cap sync android
   ```
3. Open in Android Studio:
   ```bash
   npx cap open android
   ```
4. In Android Studio:
   - Click **Build** → **Build Bundle(s) / APK(s)** → **Build APK(s)**.
   - Transfer the `.apk` file to your Android phone and install!

### To Install as an Android PWA (Instant One-Click):
1. Open the app in **Google Chrome** on your Android phone.
2. Tap the Chrome three-dot menu `⋮` and select **"Add to Home Screen"** or **"Install App"**.
3. **Shofar Cadenza** will install as a standalone mobile app with its own gold icon, full-screen playback, and dark gold status bar!
