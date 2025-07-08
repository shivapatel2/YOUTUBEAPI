import { useState, useEffect } from "react";
import { Search, Heart, Play, Download, Plus, ListMusic } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Track } from "@/pages/Index";
import { searchTracksBackend } from "@/services/backendApi";
import { useMusicContext } from "@/contexts/MusicContext";
import { decodeHtmlEntities } from "@/utils/textUtils";
import { searchYouTubeMusic } from '@/services/ytmusicApi';

interface SearchPageProps {
  onTrackSelect: (track: Track, queue: Track[]) => void;
  onImageClick?: (track: Track, queue: Track[]) => void;
}

export const SearchPage = ({ onTrackSelect, onImageClick }: SearchPageProps) => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Track[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedTrack, setSelectedTrack] = useState<Track | null>(null);
  const [isAddToPlaylistOpen, setIsAddToPlaylistOpen] = useState(false);
  const [source, setSource] = useState<'jiosaavn' | 'youtube_music'>('jiosaavn');

  const { 
    isLiked, 
    addToLikedSongs, 
    removeFromLikedSongs, 
    downloadTrack, 
    playlists, 
    addToPlaylist 
  } = useMusicContext();

  useEffect(() => {
    const searchMusic = async () => {
      if (query.trim() === "") {
        setResults([]);
        return;
      }
      setIsLoading(true);
      try {
        let tracks: Track[] = [];
        if (source === 'jiosaavn') {
          tracks = await searchTracksBackend(query, 50);
        } else if (source === 'youtube_music') {
          tracks = await searchYouTubeMusic(query, 50);
        }
        console.log('Search results:', tracks); // Debug log
        setResults(tracks);
      } catch (error) {
        console.error('Search failed:', error);
        setResults([]);
      } finally {
        setIsLoading(false);
      }
    };
    const debounceTimer = setTimeout(searchMusic, 300);
    return () => clearTimeout(debounceTimer);
  }, [query, source]);

  const handleAddToPlaylist = (playlistId: string) => {
    if (selectedTrack) {
      addToPlaylist(playlistId, selectedTrack);
      setIsAddToPlaylistOpen(false);
      setSelectedTrack(null);
    }
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getSourceIndicator = (track: Track) => {
    if (track.source === 'jiosaavn') {
      return (
        <span className="text-green-400 text-xs flex items-center gap-1">
          <span className="w-1 h-1 bg-green-400 rounded-full"></span>
          JioSaavn
        </span>
      );
    } else if (track.preview_url) {
      return (
        <span className="text-yellow-400 text-xs flex items-center gap-1">
          <span className="w-1 h-1 bg-yellow-400 rounded-full"></span>
          Preview
        </span>
      );
    }
    return null;
  };

  return (
    <div className="h-full overflow-y-auto bg-black">
      <div className="p-8">
        {/* Source Selector */}
        <div className="mb-4 flex gap-4">
          <button
            className={`px-4 py-2 rounded-lg font-semibold ${source === 'jiosaavn' ? 'bg-blue-700 text-white' : 'bg-neutral-800 text-muted-foreground'}`}
            onClick={() => setSource('jiosaavn')}
          >
            JioSaavn
          </button>
          <button
            className={`px-4 py-2 rounded-lg font-semibold ${source === 'youtube_music' ? 'bg-red-600 text-white' : 'bg-neutral-800 text-muted-foreground'}`}
            onClick={() => setSource('youtube_music')}
          >
            YouTube Music
          </button>
        </div>
        {/* Search Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gradient mb-6">Search</h1>
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-primary w-5 h-5" />
            <Input
              type="text"
              placeholder="Search for songs, artists, or albums..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="pl-10 bg-card/80 border-blue-900/40 text-white placeholder-muted-foreground h-12 text-lg rounded-xl shadow-lg"
            />
          </div>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-white">Searching for music...</p>
          </div>
        )}

        {/* Search Results */}
        {!isLoading && results.length > 0 && (
          <div>
            <h2 className="text-2xl font-bold text-white mb-6">
              Search Results ({results.length})
            </h2>
            <div className="space-y-2">
              {results.map((track, index) => (
                <div
                  key={track.id}
                  className="music-card flex items-center gap-4 p-3 rounded-xl group cursor-pointer bg-black/60 border border-blue-900 shadow-lg backdrop-blur-md transition-all hover:bg-blue-900/30"
                >
                  <span className="text-muted-foreground w-8 text-center">{index + 1}</span>
                  
                  <div className="relative">
                    <img
                      src={track.image}
                      alt={track.title}
                      className="w-14 h-14 rounded-lg object-cover cursor-pointer shadow-md"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (onImageClick) { onImageClick(track, results); }
                        onTrackSelect(track, results);
                      }}
                    />
                    <div className="absolute inset-0 flex items-center justify-center rounded-lg bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        size="sm"
                        className="play-button w-10 h-10 rounded-full bg-blue-700/90 text-white shadow-xl backdrop-blur-md transition-transform duration-200 hover:scale-110"
                        onClick={(e) => {
                          e.stopPropagation();
                          onTrackSelect(track, results);
                        }}
                      >
                        <Play className="w-5 h-5" fill="currentColor" />
                      </Button>
                    </div>
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-white">{decodeHtmlEntities(track.title)}</h4>
                    <p className="text-sm text-muted-foreground">{decodeHtmlEntities(track.artist)}</p>
                    <p className="text-xs text-muted-foreground/70">{decodeHtmlEntities(track.album)}</p>
                  </div>
                  
                  <div className="hidden sm:flex flex-col items-end gap-1">
                    <span className="text-sm text-muted-foreground">{formatDuration(track.duration)}</span>
                    {getSourceIndicator(track)}
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      className={`${isLiked(track.id) ? 'text-blue-700' : 'text-muted-foreground'}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        if (isLiked(track.id)) {
                          removeFromLikedSongs(track.id);
                        } else {
                          addToLikedSongs(track);
                        }
                      }}
                    >
                      <Heart className="w-4 h-4" fill={isLiked(track.id) ? 'currentColor' : 'none'} />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-muted-foreground"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedTrack(track);
                        setIsAddToPlaylistOpen(true);
                      }}
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-muted-foreground"
                      onClick={(e) => {
                        e.stopPropagation();
                        downloadTrack(track);
                      }}
                    >
                      <Download className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* No Results */}
        {!isLoading && query && results.length === 0 && (
          <div className="text-center py-12">
            <Search className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">No results found</h3>
            <p className="text-muted-foreground">
              Try searching for different keywords or check your spelling
            </p>
          </div>
        )}

        {/* Default State */}
        {!query && (
          <div className="text-center py-12">
            <Search className="w-24 h-24 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-2xl font-semibold text-white mb-2">Start searching</h3>
            <p className="text-muted-foreground">
              Find your favorite songs, artists, and albums
            </p>
          </div>
        )}

        {/* Add to Playlist Dialog */}
        <Dialog open={isAddToPlaylistOpen} onOpenChange={setIsAddToPlaylistOpen}>
          <DialogContent className="bg-neutral-900 border-neutral-800">
            <DialogHeader>
              <DialogTitle className="text-white">Add to Playlist</DialogTitle>
            </DialogHeader>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {playlists.map((playlist) => (
                <Button
                  key={playlist.id}
                  variant="ghost"
                  className="w-full justify-start text-left h-12 hover:bg-muted/20"
                  onClick={() => handleAddToPlaylist(playlist.id)}
                >
                  <ListMusic className="w-4 h-4 mr-3" />
                  <div>
                    <p className="text-white">{playlist.name}</p>
                    <p className="text-xs text-muted-foreground">{playlist.tracks.length} songs</p>
                  </div>
                </Button>
              ))}
              {playlists.length === 0 && (
                <p className="text-muted-foreground text-center py-4">
                  No playlists available. Create one first!
                </p>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};
