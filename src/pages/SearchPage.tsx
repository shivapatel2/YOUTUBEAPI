import { useState } from 'react';
import { MusicTrack } from "@/services/musicApi";
import { searchTracksBackend } from "@/services/backendApi";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Search, Loader2 } from 'lucide-react';
import { decodeHtmlEntities } from '@/lib/utils';

interface SearchPageProps {
  currentTrack: MusicTrack | null;
  setCurrentTrack: (track: MusicTrack) => void;
  isPlaying: boolean;
  playPause: () => void;
}

const SearchPage = ({ currentTrack, setCurrentTrack, isPlaying, playPause }: SearchPageProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState<MusicTrack[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim() === "") return;

    setIsLoading(true);
    setSearchResults([]);

    try {
      const results = await searchTracksBackend(searchTerm);
      setSearchResults(results);
    } catch (error) {
      console.error("Error searching tracks:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <header className="bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b p-4">
        <form onSubmit={handleSearch} className="flex gap-2">
          <Input
            type="search"
            placeholder="Search for songs, artists, albums..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1"
          />
          <Button type="submit" disabled={isLoading}>
            {isLoading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Search className="mr-2 h-4 w-4" />
            )}
            Search
          </Button>
        </form>
      </header>

      <ScrollArea className="flex-1">
        <div className="p-4">
          {isLoading && searchResults.length === 0 ? (
            <div className="text-center text-muted-foreground">Searching...</div>
          ) : searchResults.length > 0 ? (
            <ul className="space-y-2">
              {searchResults.map((track) => (
                <li
                  key={track.id}
                  className={`flex items-center gap-4 p-2 rounded-md cursor-pointer transition-colors hover:bg-muted ${
                    currentTrack?.id === track.id ? 'bg-muted' : ''
                  }`}
                  onClick={() => {
                    if (currentTrack?.id === track.id) {
                      playPause();
                    } else {
                      setCurrentTrack(track);
                    }
                  }}
                >
                  <img
                    src={track.image}
                    alt={track.title}
                    className="w-12 h-12 rounded object-cover"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate text-white">{decodeHtmlEntities(track.title)}</p>
                    <p className="text-sm text-muted-foreground truncate">
                      {decodeHtmlEntities(track.artist)} • {decodeHtmlEntities(track.album)}
                    </p>
                  </div>
                  {currentTrack?.id === track.id && (
                    <div className="text-primary">
                      {isPlaying ? 'Playing' : 'Paused'}
                    </div>
                  )}
                </li>
              ))}
            </ul>
          ) : (
            !isLoading && <div className="text-center text-muted-foreground">No results found.</div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
};

export default SearchPage; 