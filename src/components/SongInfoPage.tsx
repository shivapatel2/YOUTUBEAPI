import { useState, useEffect } from "react";
import { ChevronDown, Heart, Music, Mic2, Share2, SkipBack, Play, Pause, SkipForward, Shuffle, Repeat } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useMusicContext } from "@/contexts/MusicContext";
import { getLyrics } from "@/services/lyricsApi";
import { Track } from "@/pages/Index";

interface SongInfoPageProps {
  onClose: () => void;
  track: Track;
  queue: Track[];
}

export const SongInfoPage = ({ onClose, track }: SongInfoPageProps) => {
  const {
    isPlaying,
    togglePlay,
    playNext,
    playPrevious,
    isLiked,
    addToLikedSongs,
    removeFromLikedSongs
  } = useMusicContext();
  const [lyrics, setLyrics] = useState("Loading lyrics...");

  useEffect(() => {
    if (track) {
      setLyrics("Loading lyrics...");
      getLyrics(track.artist, track.title).then(setLyrics);
    }
  }, [track]);

  if (!track) {
    return (
      <div className="fixed inset-0 bg-black/80 backdrop-blur-lg z-50 flex items-center justify-center animate-fade-in">
        <p className="text-white">No song is currently selected.</p>
        <Button onClick={onClose} className="absolute top-4 right-4">Close</Button>
      </div>
    );
  }

  const isTrackLiked = isLiked(track.id);

  return (
    <div className="fixed inset-0 bg-gradient-to-b from-black via-blue-950 to-black text-white z-50 flex flex-col animate-slide-up-fast overflow-y-auto">
      {/* Header */}
      <div className="sticky top-0 bg-gradient-to-b from-black to-transparent p-4 z-10">
        <div className="flex items-center justify-between">
          <Button variant="ghost" size="icon" onClick={onClose}>
            <ChevronDown className="w-6 h-6" />
          </Button>
          <div className="text-center">
            <p className="text-sm text-muted-foreground">NOW PLAYING</p>
            <h2 className="font-bold truncate">{track.title}</h2>
          </div>
          <Button variant="ghost" size="icon">
            <Share2 className="w-5 h-5" />
          </Button>
        </div>
      </div>

      <div className="p-4 flex-grow">
        {/* Album Art */}
        <div className="mb-8">
          <img
            src={track.image.replace('150x150', '500x500')}
            alt={track.title}
            className="w-full max-w-md mx-auto aspect-square rounded-lg shadow-2xl shadow-black/50 object-cover"
          />
        </div>

        {/* Track Info & Like */}
        <div className="flex justify-between items-start mb-6">
          <div className="flex-1">
            <h1 className="text-3xl font-bold">{track.title}</h1>
            <p className="text-lg text-muted-foreground">{track.artist}</p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="w-12 h-12"
            onClick={() => isTrackLiked ? removeFromLikedSongs(track.id) : addToLikedSongs(track)}
          >
            <Heart className={`w-6 h-6 transition-all ${isTrackLiked ? 'text-primary' : 'text-gray-400'}`} fill={isTrackLiked ? 'currentColor' : 'none'}/>
          </Button>
        </div>

        {/* Lyrics Section */}
        <div className="bg-card/80 rounded-lg p-4 mb-8 shadow-lg backdrop-blur-md border border-blue-900/20">
          <h3 className="text-lg font-bold mb-4">Lyrics</h3>
          <pre className="whitespace-pre-wrap text-base font-sans text-muted-foreground max-h-64 overflow-y-auto lyrics-scrollbar">
            {lyrics}
          </pre>
        </div>
        <style>
          {`
            .lyrics-scrollbar::-webkit-scrollbar {
              width: 8px;
            }
            .lyrics-scrollbar::-webkit-scrollbar-thumb {
              background: #6b7280;
              border-radius: 4px;
            }
            .lyrics-scrollbar::-webkit-scrollbar-track {
              background: transparent;
            }
          `}
        </style>
      </div>
      
      {/* Controls */}
      <div className="sticky bottom-0 bg-gradient-to-t from-black to-transparent p-4">
        <div className="flex items-center justify-around mb-4">
          <Button variant="ghost" size="icon" className="text-muted-foreground">
            <Shuffle className="w-5 h-5" />
          </Button>
          <Button variant="ghost" size="icon" className="text-white" onClick={playPrevious}>
            <SkipBack className="w-8 h-8" fill="currentColor"/>
          </Button>
          <Button variant="ghost" size="icon" className="w-20 h-20 bg-primary rounded-full text-black" onClick={togglePlay}>
            {isPlaying ? <Pause className="w-10 h-10" fill="currentColor"/> : <Play className="w-10 h-10 ml-1" fill="currentColor"/>}
          </Button>
          <Button variant="ghost" size="icon" className="text-white" onClick={playNext}>
            <SkipForward className="w-8 h-8" fill="currentColor"/>
          </Button>
          <Button variant="ghost" size="icon" className="text-muted-foreground">
            <Repeat className="w-5 h-5" />
          </Button>
        </div>
      </div>
    </div>
  );
}; 