// Backend API Service
// Connects to our local backend server for YouTube Music and other APIs

import { MusicTrack } from './musicApi';

const BACKEND_BASE_URL = 'http://localhost:3001';
const JIOSAAVN_API_URL = 'https://jiosaavnapi-six.vercel.app/api/search/songs';

// Define a type for JioSaavnTrack
interface JioSaavnTrack {
  id: string;
  name: string;
  album: { name: string };
  duration: string;
  artists: { primary: { name: string }[] };
  image: { url: string; quality?: string }[];
  downloadUrl: { url: string; quality?: string }[];
  language: string;
}

// Search tracks using JioSaavn API directly
export const searchTracksBackend = async (query: string, limit: number = 20): Promise<MusicTrack[]> => {
  try {
    console.log('Searching JioSaavn API for:', query);
    const response = await fetch(`${JIOSAAVN_API_URL}?query=${encodeURIComponent(query)}&limit=${limit}`);
    if (!response.ok) {
      throw new Error(`JioSaavn API error: ${response.status}`);
    }
    const data = await response.json();
    const tracks = data.data.results || [];
    return tracks.map((track: JioSaavnTrack) => {
      // Find the highest quality download URL (prefer 320kbps)
      const highQualityDownload = track.downloadUrl?.find(dl => dl.quality === '320kbps') || track.downloadUrl?.[track.downloadUrl.length - 1];
      // Find the highest quality image (prefer 500x500)
      const highQualityImage = track.image?.find(img => img.quality === '500x500') || track.image?.[0];
      return {
        id: `jiosaavn_${track.id}`,
        title: track.name || 'Unknown Title',
        artist: track.artists?.primary?.[0]?.name || 'Unknown Artist',
        album: track.album?.name || 'Unknown Album',
        duration: parseInt(track.duration, 10) || 0,
        previewDuration: 30,
        image: highQualityImage?.url || '',
        preview_url: highQualityDownload?.url || '',
        fullTrackUrl: highQualityDownload?.url || '',
        streamUrl: highQualityDownload?.url || '',
        downloadUrl: highQualityDownload?.url || '',
        source: 'jiosaavn',
        license: 'JioSaavn',
        genre: track.language || 'Unknown Genre',
      };
    });
  } catch (error) {
    console.error('JioSaavn API error:', error);
    return [];
  }
};

// Test backend connection
export const testBackendAPI = async (): Promise<boolean> => {
  try {
    console.log('Testing backend API connection...');
    
    const response = await fetch(`${BACKEND_BASE_URL}/health`);
    
    if (response.ok) {
      console.log('Backend API is working');
      return true;
    } else {
      console.log('Backend API is not responding');
      return false;
    }
  } catch (error) {
    console.error('Backend API test error:', error);
    return false;
  }
};

// Get general search results from backend
export const searchGeneralBackend = async (query: string, limit: number = 20): Promise<MusicTrack[]> => {
  try {
    console.log('Searching general backend for:', query);
    
    const response = await fetch(`${BACKEND_BASE_URL}/search?query=${encodeURIComponent(query)}&limit=${limit}`);
    
    if (!response.ok) {
      throw new Error(`General search API error: ${response.status}`);
    }
    
    const tracks = await response.json();
    console.log(`Found ${tracks.length} general tracks from backend for query: ${query}`);
    return tracks;
  } catch (error) {
    console.error('General backend API error:', error);
    return [];
  }
}; 