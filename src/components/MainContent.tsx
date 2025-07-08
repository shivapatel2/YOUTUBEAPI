import { useState, useEffect } from "react";
import { Play, Heart, Download, Plus, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MusicTrack } from "@/services/musicApi";
import { getFeaturedTracks } from "@/services/musicApi";
import { useMusicContext } from "@/contexts/MusicContext";

interface MainContentProps {
  onTrackSelect: (track: MusicTrack, queue: MusicTrack[]) => void;
  onImageClick?: (track: MusicTrack, queue: MusicTrack[]) => void;
}

export const MainContent = ({ onTrackSelect, onImageClick }: MainContentProps) => {
  const [featuredTracks, setFeaturedTracks] = useState<MusicTrack[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { isLiked, addToLikedSongs, removeFromLikedSongs, downloadTrack } = useMusicContext();

  useEffect(() => {
    const loadInitialData = async () => {
      try {
        console.log('Loading initial data...');
        const tracks = await getFeaturedTracks();
        console.log('Loaded tracks:', tracks.length);
        if (tracks.length > 0) {
          setFeaturedTracks(tracks);
          console.log('Tracks set successfully');
        } else {
          console.log('No tracks returned, this should not happen with fallback');
        }
      } catch (error) {
        console.error('Failed to load featured tracks:', error);
        // Even if API fails, we should have demo tracks
        try {
          const tracks = await getFeaturedTracks();
          if (tracks.length > 0) {
            setFeaturedTracks(tracks);
          }
        } catch (fallbackError) {
          console.error('Even fallback failed:', fallbackError);
        }
      } finally {
        setIsLoading(false);
      }
    };
    loadInitialData();
  }, []);

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  };

  const getSourceIndicator = (track: MusicTrack) => {
    if (track.source === 'jiosaavn') {
      return (
        <span className="text-green-400 flex items-center gap-1">
          <span className="w-1.5 h-1.5 bg-green-400 rounded-full"></span>
          JioSaavn
        </span>
      );
    } 
    
    if (track.preview_url && !track.fullTrackUrl) {
      return (
        <span className="text-yellow-400 flex items-center gap-1">
          <span className="w-1.5 h-1.5 bg-yellow-400 rounded-full"></span>
          Preview
        </span>
      );
    }
    return null;
  };

  return (
    <div className="h-full overflow-y-auto bg-black text-white">
      {/* Hero Header */}
      <div className="p-8 pb-6 bg-black">
        <div className="flex items-center gap-4 mb-4">
          <div className="relative">
            <Zap className="text-primary w-12 h-12 animate-glow-pulse" fill="currentColor" />
            <div className="absolute -top-1 -right-1 w-4 h-4 bg-yellow-400 rounded-full animate-pulse"></div>
          </div>
          <div className="flex-1">
            <h1 className="text-4xl font-bold text-white mb-1 text-gradient">
              {getGreeting()}
            </h1>
            <p className="text-muted-foreground text-lg">Ready to discover amazing music?</p>
          </div>
        </div>
        
        <div className="flex gap-2">
          <div className="visualizer-bar"></div>
          <div className="visualizer-bar"></div>
          <div className="visualizer-bar"></div>
          <div className="visualizer-bar"></div>
          <div className="visualizer-bar"></div>
        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="px-8 pb-8">
          <div className="text-center py-12">
            <div className="animate-spin-slow rounded-full h-16 w-16 border-4 border-primary/20 border-t-primary mx-auto mb-4"></div>
            <p className="text-white text-lg">Loading amazing tracks<span className="loading-dots"></span></p>
          </div>
        </div>
      )}

      {/* Featured Section */}
      {!isLoading && featuredTracks.length > 0 && (
        <div className="px-8 pb-8">
          {/* Speedify Music Header */}
          <h2 className="text-4xl font-extrabold text-blue-700 mb-2 tracking-tight">Speedify Music</h2>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-3xl font-bold text-white text-glow">Featured for You</h2>
            <Button variant="outline" className="border-blue-700 text-blue-700">
              <Plus className="w-4 h-4 mr-2" />
              View All
            </Button>
          </div>
          {/* Responsive grid for music cards */}
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-6">
            {featuredTracks.map((track, index) => (
              <div
                key={track.id}
                className="music-card bg-black/60 p-4 rounded-xl group relative border border-blue-900 shadow-lg backdrop-blur-md transition-all hover:bg-blue-900/30"
              >
                <div className="relative mb-4">
                  <img
                    src={track.image}
                    alt={track.title}
                    className="w-full aspect-square object-cover rounded-xl cursor-pointer shadow-md"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (onImageClick) { onImageClick(track, featuredTracks); }
                    }}
                  />
                  <div className="absolute inset-0 flex items-center justify-center rounded-xl bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      size="lg"
                      className="play-button w-12 h-12 rounded-full bg-blue-700/90 text-white shadow-xl backdrop-blur-md transition-transform duration-200 hover:scale-110"
                      onClick={(e) => {
                        e.stopPropagation();
                        onTrackSelect(track, featuredTracks);
                      }}
                    >
                      <Play className="w-6 h-6" fill="currentColor" />
                    </Button>
                  </div>
                </div>
                <h3 className="font-semibold text-white truncate mb-1">{track.title}</h3>
                <p className="text-sm text-muted-foreground truncate">{track.artist}</p>
                <p className="text-xs text-muted-foreground/70 truncate">{track.album}</p>
                <div className="flex items-center gap-2 mt-2">
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
                      downloadTrack(track);
                    }}
                  >
                    <Download className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-muted-foreground"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (onImageClick) { onImageClick(track, featuredTracks); }
                    }}
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* No Tracks State */}
      {!isLoading && featuredTracks.length === 0 && (
        <div className="px-8 pb-8">
          <div className="text-center py-12">
            <div className="w-24 h-24 bg-muted/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Zap className="w-12 h-12 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">No tracks available</h3>
            <p className="text-muted-foreground mb-4">
              Unable to load tracks from JioSaavn API. Please check your internet connection.
            </p>
            <Button 
              onClick={() => window.location.reload()} 
              className="bg-primary hover:bg-primary/90"
            >
              Try Again
            </Button>
          </div>
        </div>
      )}

      {/* Recently Played */}
      {!isLoading && featuredTracks.length > 0 && (
        <div className="px-8 pb-8">
          <h2 className="text-3xl font-bold text-white mb-6 text-glow">Recently Played</h2>
          <div className="space-y-2">
            {featuredTracks.slice(0, 6).map((track, index) => (
              <div
                key={`recent-${track.id}`}
                className="music-card flex items-center gap-4 p-4 rounded-lg group glass-effect animate-fade-in"
                style={{ animationDelay: `${index * 0.05}s` }}
                onClick={() => onTrackSelect(track, featuredTracks)}
              >
                <div className="relative">
                  <img
                    src={track.image}
                    alt={track.title}
                    className="w-14 h-14 rounded object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300&h=300&fit=crop';
                    }}
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded flex items-center justify-center">
                    <Play className="w-5 h-5 text-white" fill="currentColor" />
                  </div>
                </div>
                
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-white group-hover:text-primary transition-colors">
                    {track.title}
                  </h4>
                  <p className="text-sm text-muted-foreground">{track.artist}</p>
                </div>
                
                <div className="flex flex-col items-end gap-1">
                  <span className="text-sm text-muted-foreground">
                    {formatDuration(track.duration)}
                  </span>
                  {getSourceIndicator(track)}
                </div>
                
                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button
                    variant="ghost"
                    size="sm"
                    className={`${isLiked(track.id) ? 'text-red-400' : 'text-muted-foreground hover:text-red-400'}`}
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
                    className="text-muted-foreground hover:text-primary"
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
    </div>
  );
};
