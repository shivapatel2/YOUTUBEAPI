# 🎵 Soundscape Player Hub

A modern, responsive music player that streams full tracks from JioSaavn and YouTube Music. **No API keys required, no setup needed!**

## ✨ Features

- **Completely Free**: No API keys, no registration, no setup required
- **Multi-Source Streaming**: Access to thousands of complete songs from JioSaavn and YouTube Music
- **Indian & International Music**: Extensive collection of Indian music from JioSaavn and international music from YouTube Music
- **Modern UI**: Beautiful, responsive design with dark theme and an API status indicator
- **Cross-Platform**: Works on desktop and mobile devices
- **Real-time Search**: Instant search across multiple music catalogs
- **Playlist Management**: Create and manage your music playlists
- **Like System**: Save your favorite tracks
- **Download Support**: Download tracks when available

## 🚀 Quick Start

### Prerequisites

- Node.js 16+ 
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd soundscape-player-hub-main
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the backend server**
   ```bash
   cd music-backends/youtube-music-api
   npm start
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to `http://localhost:5173/` (or the port shown in your terminal)

**That's it! No API keys, no configuration needed!** 🎉

## 🎯 How It Works

The app uses multiple music sources for maximum coverage:

- **JioSaavn API**: Provides thousands of free, full-length tracks from JioSaavn's music catalog, with a focus on Indian music
- **YouTube Music API**: Unofficial YouTube Music API for international music and popular tracks
- **YouTube Search Fallback**: Uses yt-search as a fallback for international music when other APIs don't have results
- **Demo Tracks**: Reliable demo tracks that always work as a final fallback

The system includes proper error handling and fallbacks to ensure music is always available.

## 🎨 UI Features

- **Responsive Design**: Works perfectly on desktop, tablet, and mobile
- **Dark Theme**: Easy on the eyes with beautiful gradients
- **Smooth Animations**: Fluid transitions and hover effects
- **Source Indicators**: Shows whether a track is from "JioSaavn" (green) or "YouTube Music" (red)
- **API Status Indicator**: Real-time feedback on the connection status of the music APIs
- **Loading States**: Beautiful loading animations
- **Error Handling**: Graceful error messages and fallbacks to demo tracks if APIs fail

## 📱 Mobile Support

- **Touch Optimized**: Large touch targets and swipe gestures
- **Bottom Navigation**: Easy thumb navigation
- **Responsive Player**: Adapts to screen size
- **Offline Capable**: PWA features for better mobile experience

## 🛠️ Development

### Project Structure
```
src/
├── components/          # React components
├── contexts/           # React contexts
├── services/           # API services
├── pages/              # Page components
└── utils/              # Utility functions
```

### Key Files
- `src/services/musicApi.ts` - Main music API integration
- `src/services/jiosaavnApi.ts` - JioSaavn API client
- `src/services/youtubeMusicApi.ts` - YouTube Music API client
- `src/components/MusicPlayer.tsx` - Audio player
- `src/components/MainContent.tsx` - Home page, fetches and displays featured tracks
- `src/components/SearchPage.tsx` - Search functionality

### Available Scripts
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint
```

## 🐛 Troubleshooting

### Common Issues

1. **No music playing**
   - Check the API Status Indicator in the app header
   - Check browser console for errors
   - Verify your internet connection
   - Make sure the backend server is running on port 3001

2. **Slow loading**
   - The APIs may be slow during peak hours
   - Check your internet connection

### Testing APIs
Open `test-jiosaavn.html` in your browser to test all music APIs connectivity directly.

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 🙏 Acknowledgments

- **JioSaavn** for providing access to their music catalog
- **YouTube Music** for their extensive music library
- **Independent Artists** who share their music freely
- **Open Source Community** for making this possible

---

**Note**: This app streams music from JioSaavn's and YouTube Music's catalogs. All music is legally available for streaming under their respective terms of service.
