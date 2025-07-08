import { useState, useRef, useEffect } from "react";
import { Play, Pause, SkipBack, SkipForward, Shuffle, Repeat, Volume2, Heart, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Track } from "@/pages/Index";
import { useMusicContext } from "@/contexts/MusicContext";

export const MusicPlayer = ({ onOpenSongInfo }: { onOpenSongInfo: () => void }) => {
  const [progress, setProgress] = useState([0]);
  const [volume, setVolume] = useState([75]);
  const [isShuffled, setIsShuffled] = useState(false);
  const [repeatMode, setRepeatMode] = useState<'off' | 'all' | 'one'>('off');
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isAudioReady, setIsAudioReady] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);
  const { 
    currentTrack, 
    isPlaying, 
    togglePlay, 
    playNext, 
    playPrevious,
    isLiked, 
    addToLikedSongs, 
    removeFromLikedSongs 
  } = useMusicContext();

  const isTrackLiked = currentTrack ? isLiked(currentTrack.id) : false;

  // Handle Media Session API
  useEffect(() => {
    if (currentTrack && 'mediaSession' in navigator) {
      navigator.mediaSession.metadata = new MediaMetadata({
        title: currentTrack.title,
        artist: currentTrack.artist,
        album: currentTrack.album,
        artwork: [
          { src: currentTrack.image, sizes: '96x96', type: 'image/png' },
          { src: currentTrack.image, sizes: '128x128', type: 'image/png' },
          { src: currentTrack.image, sizes: '192x192', type: 'image/png' },
          { src: currentTrack.image, sizes: '256x256', type: 'image/png' },
          { src: currentTrack.image, sizes: '384x384', type: 'image/png' },
          { src: currentTrack.image, sizes: '512x512', type: 'image/png' },
        ]
      });

      navigator.mediaSession.setActionHandler('play', () => togglePlay());
      navigator.mediaSession.setActionHandler('pause', () => togglePlay());
      navigator.mediaSession.setActionHandler('previoustrack', () => playPrevious());
      navigator.mediaSession.setActionHandler('nexttrack', () => playNext());
    }
  }, [currentTrack, isPlaying, playNext, playPrevious, togglePlay]);

  // Handle track change
  useEffect(() => {
    if (audioRef.current && currentTrack) {
      console.log('Loading new track:', currentTrack.title);
      setIsLoading(true);
      setIsAudioReady(false);
      setProgress([0]);
      setCurrentTime(0);
      setDuration(0);
      
      // Reset audio element
      audioRef.current.pause();
      
      // Use full track URL if available, otherwise use preview
      const audioUrl = currentTrack.fullTrackUrl || currentTrack.preview_url;
      if (audioUrl) {
        audioRef.current.src = audioUrl;
        audioRef.current.load();
      } else {
        console.error('No audio URL available for track:', currentTrack.title);
        setIsLoading(false);
      }
    }
  }, [currentTrack]);

  // Handle play/pause after audio is ready
  useEffect(() => {
    if (audioRef.current && isAudioReady) {
      if (isPlaying) {
        console.log('Playing audio');
        audioRef.current.play().catch((error) => {
          console.error('Error playing audio:', error);
          togglePlay();
        });
      } else {
        console.log('Pausing audio');
        audioRef.current.pause();
      }
    }
  }, [isPlaying, isAudioReady]);

  // Handle volume change
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume[0] / 100;
    }
  }, [volume]);

  // Audio event handlers
  const handleCanPlay = () => {
    console.log('Audio can play');
    setIsLoading(false);
    setIsAudioReady(true);
    if (audioRef.current) {
      const audioDuration = audioRef.current.duration;
      if (audioDuration && !isNaN(audioDuration) && isFinite(audioDuration)) {
        // Use the actual audio duration (preview duration)
        setDuration(audioDuration);
        console.log('Audio duration set to:', audioDuration);
      } else {
        // For preview URLs, use the track's preview duration
        const previewDuration = currentTrack?.previewDuration || 30;
        setDuration(previewDuration);
        console.log('Using preview duration:', previewDuration);
      }
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      const audioDuration = audioRef.current.duration;
      if (audioDuration && !isNaN(audioDuration) && isFinite(audioDuration)) {
        setDuration(audioDuration);
        console.log('Metadata loaded, duration:', audioDuration);
      } else {
        // For preview URLs, use the track's preview duration
        const previewDuration = currentTrack?.previewDuration || 30;
        setDuration(previewDuration);
        console.log('Using preview duration:', previewDuration);
      }
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      const current = audioRef.current.currentTime;
      setCurrentTime(current);
      if (duration > 0) {
        setProgress([(current / duration) * 100]);
      }
    }
  };

  const handleEnded = () => {
    console.log('Track ended');
    if (repeatMode === 'one') {
      // Repeat current track
      if (audioRef.current) {
        audioRef.current.currentTime = 0;
        audioRef.current.play();
      }
    } else {
      playNext();
    }
  };

  const handleError = (error: React.SyntheticEvent<HTMLAudioElement, Event>) => {
    console.error('Audio error:', error);
    setIsAudioReady(false);
    setIsLoading(false);
  };

  // Handle progress bar change
  const handleProgressChange = (value: number[]) => {
    if (audioRef.current && duration > 0 && isAudioReady) {
      const newTime = (value[0] / 100) * duration;
      audioRef.current.currentTime = newTime;
      setProgress(value);
      setCurrentTime(newTime);
    }
  };

  const handleLikeToggle = () => {
    if (currentTrack) {
      if (isTrackLiked) {
        removeFromLikedSongs(currentTrack.id);
      } else {
        addToLikedSongs(currentTrack);
      }
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getSourceIndicator = (track: Track) => {
    if (track.source === 'jiosaavn') {
      return (
        <span className="text-green-400 flex items-center gap-1">
          <span className="w-2 h-2 bg-green-400 rounded-full"></span>
          JioSaavn
        </span>
      );
    } else if (track.preview_url && !track.fullTrackUrl) {
      return (
        <span className="text-yellow-400 flex items-center gap-1">
          <span className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></span>
          Preview
        </span>
      );
    }
    return null;
  };

  if (!currentTrack) {
    return (
      <div className="h-20 bg-gradient-to-r from-neutral-900 to-black border-t border-neutral-800" />
    );
  }

  return (
    <div className="h-20 bg-gradient-to-r from-neutral-900 to-black border-t border-neutral-800 px-4 flex items-center animate-slide-up">
      {/* Hidden audio element */}
      <audio
        ref={audioRef}
        onCanPlay={handleCanPlay}
        onLoadedMetadata={handleLoadedMetadata}
        onTimeUpdate={handleTimeUpdate}
        onEnded={handleEnded}
        onError={handleError}
        preload="metadata"
      />

      {/* Track Info - Hidden on mobile */}
      <div className="hidden md:flex items-center gap-3 w-1/4 min-w-0 cursor-pointer" onClick={onOpenSongInfo}>
        <img
          src={currentTrack.image}
          alt={currentTrack.title}
          className="w-14 h-14 rounded object-cover"
        />
        <div className="min-w-0 flex-1">
          <h4 className="font-medium text-white truncate">{currentTrack.title}</h4>
          <p className="text-sm text-muted-foreground truncate">{currentTrack.artist}</p>
        </div>
        <Button
          className={`w-10 h-10 rounded-full ${isTrackLiked ? 'bg-blue-700 text-white' : 'bg-black text-muted-foreground'} border border-blue-700`}
          onClick={handleLikeToggle}
        >
          <Heart className="w-6 h-6" fill={isTrackLiked ? 'currentColor' : 'none'} />
        </Button>
      </div>

      {/* Mobile Track Info */}
      <div className="md:hidden flex items-center gap-2 w-1/3 min-w-0 cursor-pointer" onClick={onOpenSongInfo}>
        <img
          src={currentTrack.image}
          alt={currentTrack.title}
          className="w-10 h-10 rounded object-cover"
        />
        <div className="min-w-0 flex-1">
          <h4 className="font-medium text-white truncate text-sm">{currentTrack.title}</h4>
          <p className="text-xs text-muted-foreground truncate">{currentTrack.artist}</p>
        </div>
      </div>

      {/* Player Controls */}
      <div className="flex-1 flex flex-col items-center gap-2 max-w-2xl mx-4 md:mx-8">
        <div className="flex items-center gap-2 md:gap-4">
          <Button variant="ghost" size="sm" className="player-control text-muted-foreground" onClick={() => setIsShuffled(!isShuffled)}>
            <Shuffle className={`w-4 h-4 ${isShuffled ? 'text-primary' : ''}`} />
          </Button>
          <Button variant="ghost" size="sm" className="player-control text-muted-foreground" onClick={playPrevious}>
            <SkipBack className="w-5 h-5" fill="currentColor" />
          </Button>
          <Button
            className="player-control bg-blue-700 text-white rounded-full border-2 border-blue-400 w-16 h-16 flex items-center justify-center"
            onClick={togglePlay}
          >
            {isPlaying ? <Pause className="w-8 h-8" /> : <Play className="w-8 h-8" />}
          </Button>
          <Button variant="ghost" size="sm" className="player-control text-muted-foreground" onClick={playNext}>
            <SkipForward className="w-5 h-5" fill="currentColor" />
          </Button>
          <Button variant="ghost" size="sm" className="player-control text-muted-foreground" onClick={() => setRepeatMode(prev => prev === 'off' ? 'all' : prev === 'all' ? 'one' : 'off')}>
            <Repeat className={`w-4 h-4 ${repeatMode !== 'off' ? 'text-primary' : ''}`} />
          </Button>
        </div>

        {/* Progress Bar */}
        <div className="w-full flex flex-col gap-1">
          <div className="w-full flex items-center gap-2 text-xs text-muted-foreground">
            <span className="text-xs">{formatTime(currentTime)}</span>
            <Slider
              value={progress}
              onValueChange={handleProgressChange}
              max={100}
              step={1}
              className="flex-1 h-1"
              disabled={!isAudioReady}
            />
            <span className="text-xs">{formatTime(duration)}</span>
          </div>
          
          {/* Preview indicator and full duration */}
          {currentTrack && (
            <div className="flex items-center justify-between text-xs">
              {getSourceIndicator(currentTrack)}
              {currentTrack.duration > duration && (
                <span className="text-muted-foreground">
                  Full track: {formatTime(currentTrack.duration)}
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Volume Control - Hidden on mobile */}
      <div className="hidden md:flex items-center gap-2 w-1/4 justify-end">
        <Button variant="ghost" size="sm" className="player-control text-muted-foreground">
          <Volume2 className="w-4 h-4" />
        </Button>
        <Slider
          value={volume}
          onValueChange={setVolume}
          max={100}
          step={1}
          className="w-24 h-1"
        />
      </div>

      {/* Mobile Like Button and Open Full Player */}
      <div className="md:hidden flex items-center">
        <Button
          className={`w-10 h-10 rounded-full ${isTrackLiked ? 'bg-blue-700 text-white' : 'bg-black text-muted-foreground'} border border-blue-700`}
          onClick={handleLikeToggle}
        >
          <Heart className="w-6 h-6" fill={isTrackLiked ? 'currentColor' : 'none'} />
        </Button>
        <Button variant="ghost" size="icon" onClick={onOpenSongInfo}>
          <ChevronUp className="w-5 h-5" />
        </Button>
      </div>
    </div>
  );
};
