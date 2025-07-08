const API_URL = 'https://api.lyrics.ovh/v1';

/**
 * Fetches lyrics for a given artist and title.
 * @param artist - The name of the artist.
 * @param title - The title of the song.
 * @returns A promise that resolves to the lyrics string.
 */
export const getLyrics = async (artist: string, title: string): Promise<string> => {
  try {
    const response = await fetch(`${API_URL}/${encodeURIComponent(artist)}/${encodeURIComponent(title)}`);
    if (!response.ok) {
      if (response.status === 404) {
        return "Lyrics not found.";
      }
      throw new Error(`Lyrics.ovh API error: ${response.status}`);
    }
    const data = await response.json();
    return data.lyrics || "Lyrics not found.";
  } catch (error) {
    console.error('Error fetching lyrics:', error);
    return "Could not fetch lyrics. Please try again later.";
  }
}; 