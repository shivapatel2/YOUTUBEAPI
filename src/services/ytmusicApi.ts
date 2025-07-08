import { MusicTrack } from './musicApi';

interface YTMusicApiTrack {
  id: string;
  title: string;
  artist: string;
  album: string;
  duration: number;
  previewDuration?: number;
  image: string;
  preview_url: string;
  fullTrackUrl: string;
  streamUrl: string;
  downloadUrl: string;
  source: string;
  license: string;
  genre: string;
}

export const searchYouTubeMusic = async (query: string, limit: number = 20): Promise<MusicTrack[]> => {
  try {
    const url = `https://ytmusicapi-main.onrender.com/ytmusic/search?query=${encodeURIComponent(query)}&limit=${limit}`;
    console.log('Fetching YouTube Music:', url);
    const response = await fetch(url);
    if (!response.ok) {
      console.error('YouTube Music API error:', response.status, response.statusText);
      throw new Error('YouTube Music API error');
    }
    const data: YTMusicApiTrack[] = await response.json();
    console.log('YouTube Music API data:', data);
    return data.map((item: YTMusicApiTrack) => ({
      id: item.id,
      title: item.title,
      artist: item.artist,
      album: item.album,
      duration: item.duration,
      previewDuration: 30,
      image: item.image,
      preview_url: item.preview_url,
      fullTrackUrl: item.fullTrackUrl,
      streamUrl: item.streamUrl,
      downloadUrl: item.downloadUrl,
      source: 'youtube_music',
      license: item.license,
      genre: item.genre,
    }));
  } catch (error) {
    console.error('searchYouTubeMusic failed:', error);
    return [];
  }
}; 