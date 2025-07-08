// Provides music search and streaming from JioSaavn only

import { searchTracksJioSaavn, testJioSaavnAPI as testJioSaavn } from './jiosaavnApi';

export interface MusicTrack {
  id: string;
  title: string;
  artist: string;
  album: string;
  duration: number;
  previewDuration: number;
  image: string;
  preview_url?: string;
  fullTrackUrl?: string;
  streamUrl?: string;
  downloadUrl?: string;
  source: 'jiosaavn' | 'youtube_music';
  license?: string;
  genre?: string;
}

// Demo tracks as fallback
const getDemoTracks = (): MusicTrack[] => {
  return [
    {
      id: 'demo_1',
      title: 'Jazz Improvisation',
      artist: 'Free Jazz Collective',
      album: 'Open Source Jazz',
      duration: 180,
      previewDuration: 180,
      image: 'https://images.unsplash.com/photo-1511192336575-5a79af67a629?w=300&h=300&fit=crop',
      preview_url: 'https://audio-samples.github.io/samples/mp3/blizzard_biased/blizzard_biased.mp3',
      fullTrackUrl: 'https://audio-samples.github.io/samples/mp3/blizzard_biased/blizzard_biased.mp3',
      streamUrl: 'https://audio-samples.github.io/samples/mp3/blizzard_biased/blizzard_biased.mp3',
      downloadUrl: 'https://audio-samples.github.io/samples/mp3/blizzard_biased/blizzard_biased.mp3',
      source: 'jiosaavn',
      license: 'Creative Commons',
      genre: 'Jazz',
    },
    {
      id: 'demo_2',
      title: 'Classical Symphony',
      artist: 'Open Orchestra',
      album: 'Public Domain Classics',
      duration: 240,
      previewDuration: 240,
      image: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300&h=300&fit=crop',
      preview_url: 'https://audio-samples.github.io/samples/mp3/blizzard_biased/blizzard_biased.mp3',
      fullTrackUrl: 'https://audio-samples.github.io/samples/mp3/blizzard_biased/blizzard_biased.mp3',
      streamUrl: 'https://audio-samples.github.io/samples/mp3/blizzard_biased/blizzard_biased.mp3',
      downloadUrl: 'https://audio-samples.github.io/samples/mp3/blizzard_biased/blizzard_biased.mp3',
      source: 'jiosaavn',
      license: 'Creative Commons',
      genre: 'Classical',
    },
    {
      id: 'demo_3',
      title: 'Electronic Beats',
      artist: 'Digital Commons',
      album: 'Free Electronic Music',
      duration: 200,
      previewDuration: 200,
      image: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300&h=300&fit=crop',
      preview_url: 'https://audio-samples.github.io/samples/mp3/blizzard_biased/blizzard_biased.mp3',
      fullTrackUrl: 'https://audio-samples.github.io/samples/mp3/blizzard_biased/blizzard_biased.mp3',
      streamUrl: 'https://audio-samples.github.io/samples/mp3/blizzard_biased/blizzard_biased.mp3',
      downloadUrl: 'https://audio-samples.github.io/samples/mp3/blizzard_biased/blizzard_biased.mp3',
      source: 'jiosaavn',
      license: 'Creative Commons',
      genre: 'Electronic',
    },
    {
      id: 'demo_4',
      title: 'Folk Ballad',
      artist: 'Traditional Folk',
      album: 'Public Domain Folk',
      duration: 160,
      previewDuration: 160,
      image: 'https://images.unsplash.com/photo-1511192336575-5a79af67a629?w=300&h=300&fit=crop',
      preview_url: 'https://audio-samples.github.io/samples/mp3/blizzard_biased/blizzard_biased.mp3',
      fullTrackUrl: 'https://audio-samples.github.io/samples/mp3/blizzard_biased/blizzard_biased.mp3',
      streamUrl: 'https://audio-samples.github.io/samples/mp3/blizzard_biased/blizzard_biased.mp3',
      downloadUrl: 'https://audio-samples.github.io/samples/mp3/blizzard_biased/blizzard_biased.mp3',
      source: 'jiosaavn',
      license: 'Creative Commons',
      genre: 'Folk',
    },
    {
      id: 'demo_5',
      title: 'Rock Anthem',
      artist: 'Indie Rock Band',
      album: 'Open Source Rock',
      duration: 220,
      previewDuration: 220,
      image: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300&h=300&fit=crop',
      preview_url: 'https://audio-samples.github.io/samples/mp3/blizzard_biased/blizzard_biased.mp3',
      fullTrackUrl: 'https://audio-samples.github.io/samples/mp3/blizzard_biased/blizzard_biased.mp3',
      streamUrl: 'https://audio-samples.github.io/samples/mp3/blizzard_biased/blizzard_biased.mp3',
      downloadUrl: 'https://audio-samples.github.io/samples/mp3/blizzard_biased/blizzard_biased.mp3',
      source: 'jiosaavn',
      license: 'Creative Commons',
      genre: 'Rock',
    },
    {
      id: 'demo_6',
      title: 'Blues Guitar',
      artist: 'Delta Blues',
      album: 'Public Domain Blues',
      duration: 190,
      previewDuration: 190,
      image: 'https://images.unsplash.com/photo-1511192336575-5a79af67a629?w=300&h=300&fit=crop',
      preview_url: 'https://audio-samples.github.io/samples/mp3/blizzard_biased/blizzard_biased.mp3',
      fullTrackUrl: 'https://audio-samples.github.io/samples/mp3/blizzard_biased/blizzard_biased.mp3',
      streamUrl: 'https://audio-samples.github.io/samples/mp3/blizzard_biased/blizzard_biased.mp3',
      downloadUrl: 'https://audio-samples.github.io/samples/mp3/blizzard_biased/blizzard_biased.mp3',
      source: 'jiosaavn',
      license: 'Creative Commons',
      genre: 'Blues',
    }
  ];
};

// Main search function - uses only JioSaavn
export const searchTracks = async (query: string, limit: number = 20): Promise<MusicTrack[]> => {
  try {
    console.log('Searching JioSaavn for:', query);
      const jiosaavnTracks = await searchTracksJioSaavn(query, limit);
      if (jiosaavnTracks.length > 0) {
        console.log(`Found ${jiosaavnTracks.length} tracks from JioSaavn for query: ${query}`);
        return jiosaavnTracks;
      }
    console.log('No tracks found from JioSaavn, using demo tracks');
    return getDemoTracks();
  } catch (error) {
    console.error('Error searching tracks:', error);
    return getDemoTracks();
  }
};

// Get featured tracks from JioSaavn
export const getFeaturedTracks = async (): Promise<MusicTrack[]> => {
  try {
    // Use a popular search term to get featured tracks
    return await searchTracks('top hits', 12);
  } catch (error) {
    console.error('Error getting featured tracks:', error);
    return getDemoTracks();
  }
};

// Enhanced featured tracks with better fallback
export const getFeaturedTracksEnhanced = async (): Promise<MusicTrack[]> => {
  return await getFeaturedTracks();
};

// Test JioSaavn API connection
export const testJioSaavnAPI = async (): Promise<boolean> => {
  try {
    console.log('Testing JioSaavn API connection...');
    const result = await testJioSaavn();
    console.log('JioSaavn API test result:', result);
    return result;
  } catch (error) {
    console.error('JioSaavn API test error:', error);
    return false;
  }
};

// Get best track source (only JioSaavn)
export const getBestTrackSource = async (query: string): Promise<MusicTrack[]> => {
  return await searchTracks(query);
};

export type MusicApiResponse = MusicTrack[];