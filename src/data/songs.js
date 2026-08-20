// Default Songs Catalog - Preloaded with User Cloudinary Tracks
export const INITIAL_SONGS = [
  {
    id: 'track-1',
    title: 'Supermarket Flowers',
    artist: 'Ed Sheeran',
    album: '÷ (Divide) - Luxury Gold Edition',
    duration: '3:41',
    durationSec: 221,
    audioUrl: 'https://res.cloudinary.com/vkh68kb8/video/upload/v1787202139/SpotiMate.io_-_Supermarket_Flowers_-_Ed_Sheeran.mp3',
    coverUrl: 'https://images.unsplash.com/photo-1518895949257-7621c3c786d7?q=80&w=800&auto=format&fit=crop',
    genre: 'Broken',
    isCloudinary: true,
    isFeatured: true,
    lyrics: `[00:12] I took the supermarket flowers from the windowsill\n[00:18] Threw the day old tea from the cup\n[00:23] Packed up the photo album Matthew had made\n[00:28] Memories of a life that's been loved\n[00:34] Took the get well soon cards and stuffed animals\n[00:40] Poured the ginger beer down the sink\n[00:45] Dad always told me, "Don't you cry when you're down"\n[00:51] But mum, there's a tear every time that I blink\n[00:57] Oh, I'm in pieces, it's tearing me up, but I know\n[01:05] A heart that's broke is a heart that's been loved\n[01:13] So I'll sing Hallelujah, you were an angel in the shape of my mum\n[01:25] You got to see the person that I have become\n[01:31] Spread your wings and I know that when God took you back\n[01:38] He said, "Hallelujah, you're home"`
  },
  {
    id: 'track-2',
    title: 'Innai Yaaru (Acoustic Version)',
    artist: 'Peacemakers & Tripla Music',
    album: 'Acoustic Worship Gold Sessions',
    duration: '4:32',
    durationSec: 272,
    audioUrl: 'https://res.cloudinary.com/vkh68kb8/video/upload/v1787201868/SpotiMate.io_-_Innai_Yaaru_-_Acoustic_Version_-_Peacemakers__Tripla_Music.mp3',
    coverUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?q=80&w=800&auto=format&fit=crop',
    genre: 'Worship',
    isCloudinary: true,
    isFeatured: true,
    lyrics: `[00:15] Innai Yaaru endru ariviyo...\n[00:30] Um anbin aazhathai ariviyo...\n[00:48] En uyire, en anbe, en Yesuvey...\n[01:12] Kalvariyin siluvaiyin kaatchi...\n[01:35] Ennai meetka vandha thaaye...\n[02:00] Neere en nambikkai, Neere en vaazhvu...\n[02:30] Haleluya thudhiyudan paaduvom...`
  },
  {
    id: 'track-3',
    title: 'Golden Hour Symphony',
    artist: 'Cadenza Strings Ensemble',
    album: 'Royal Nocturnes',
    duration: '3:15',
    durationSec: 195,
    audioUrl: 'https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3?filename=inspiring-cinematic-ambient-116199.mp3',
    coverUrl: 'https://images.unsplash.com/photo-1507838153414-b4b713384a76?q=80&w=800&auto=format&fit=crop',
    genre: 'Divine Love',
    isCloudinary: false,
    isFeatured: true,
    lyrics: `[Instrumental Gold Masterpiece - Orchestral cello & violins resonating in deep resonance]`
  },
  {
    id: 'track-4',
    title: 'Midnight in Gold',
    artist: 'Luna Noir',
    album: 'Velvet Midnight Beats',
    duration: '2:48',
    durationSec: 168,
    audioUrl: 'https://cdn.pixabay.com/download/audio/2022/01/18/audio_d0a13f69d2.mp3?filename=lofi-study-112191.mp3',
    coverUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=800&auto=format&fit=crop',
    genre: 'Midnight',
    isCloudinary: false,
    isFeatured: false,
    lyrics: `[Mellow Rhodes keyboard chords layered with warm vinyl crackle and chill gold beats]`
  },
  {
    id: 'track-5',
    title: 'Obsidian Reverie',
    artist: 'Aurelius & The Gold Wave',
    album: 'Solar Eclipse',
    duration: '3:05',
    durationSec: 185,
    audioUrl: 'https://cdn.pixabay.com/download/audio/2022/11/06/audio_03d21b79e1.mp3?filename=chill-abstract-intention-12099.mp3',
    coverUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=800&auto=format&fit=crop',
    genre: 'Joyful',
    isCloudinary: false,
    isFeatured: false,
    lyrics: `[Ambient guitar harmonies sweeping through golden warmth]`
  }
];

export const INITIAL_PLAYLISTS = [
  {
    id: 'pl-gold-picks',
    name: 'Cloudinary Golden Picks',
    description: 'Your uploaded Cloudinary masterpieces with rich gold acoustic vibes.',
    coverUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?q=80&w=800&auto=format&fit=crop',
    songIds: ['track-1', 'track-2']
  },
  {
    id: 'pl-worship-sanctuary',
    name: 'Worship Sanctuary',
    description: 'Worship and Christian peaceful melodies.',
    coverUrl: 'https://images.unsplash.com/photo-1518895949257-7621c3c786d7?q=80&w=800&auto=format&fit=crop',
    songIds: ['track-1', 'track-2', 'track-5']
  },
  {
    id: 'pl-midnight-luxe',
    name: 'Midnight Velvet',
    description: 'Deep obsidian and gold sounds for late night relaxation.',
    coverUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=800&auto=format&fit=crop',
    songIds: ['track-3', 'track-4']
  }
];

// App Genre Categories
export const GENRE_CATEGORIES = [
  { id: 'cat-all', name: 'All' },
  { id: 'cat-divine-love', name: 'Divine Love' },
  { id: 'cat-worship', name: 'Worship' },
  { id: 'cat-joyful', name: 'Joyful' },
  { id: 'cat-broken', name: 'Broken' },
  { id: 'cat-midnight', name: 'Midnight' },
  { id: 'cat-christian', name: 'Christian' }
];

export const APP_GENRES = [
  'Divine Love',
  'Worship',
  'Joyful',
  'Broken',
  'Midnight',
  'Christian'
];
