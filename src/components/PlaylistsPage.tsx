import { useState } from "react";
import { Plus, Music, Trash2, Download, Heart, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Track } from "@/pages/Index";
import { useMusicContext } from "@/contexts/MusicContext";

interface PlaylistsPageProps {
  onTrackSelect: (track: Track, queue: Track[]) => void;
  onImageClick?: (track: Track, queue: Track[]) => void;
}

export const PlaylistsPage = ({ onTrackSelect, onImageClick }: PlaylistsPageProps) => {
  const { playlists, createPlaylist, deletePlaylist, removeFromPlaylist, downloadTrack, isLiked, addToLikedSongs, removeFromLikedSongs } = useMusicContext();
  const [newPlaylistName, setNewPlaylistName] = useState("");
  const [selectedPlaylist, setSelectedPlaylist] = useState<string | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  const handleCreatePlaylist = () => {
    if (newPlaylistName.trim()) {
      createPlaylist(newPlaylistName.trim());
      setNewPlaylistName("");
      setIsCreateDialogOpen(false);
    }
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const selectedPlaylistData = selectedPlaylist ? playlists.find(p => p.id === selectedPlaylist) : null;

  return (
    <div className="h-full overflow-y-auto bg-black">
      <div className="p-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">Your Playlists</h1>
            <p className="text-muted-foreground">Create and manage your music collections</p>
          </div>
          
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-blue-700 text-white">
                <Plus className="w-4 h-4 mr-2" />
                Create Playlist
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-black border-blue-900">
              <DialogHeader>
                <DialogTitle className="text-white">Create New Playlist</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <Input
                  placeholder="Enter playlist name"
                  value={newPlaylistName}
                  onChange={(e) => setNewPlaylistName(e.target.value)}
                  className="bg-black border-blue-900 text-white"
                  onKeyPress={(e) => e.key === 'Enter' && handleCreatePlaylist()}
                />
                <Button onClick={handleCreatePlaylist} className="w-full bg-blue-700 text-white">
                  Create Playlist
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Playlists Grid or Selected Playlist */}
        {!selectedPlaylist ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {playlists.map((playlist) => (
              <div
                key={playlist.id}
                className="bg-black/60 p-6 rounded-xl group cursor-pointer border border-blue-900 shadow-lg backdrop-blur-md transition-all hover:bg-blue-900/30"
                onClick={() => setSelectedPlaylist(playlist.id)}
              >
                <div className="relative mb-4">
                  <div className="w-full aspect-square bg-gradient-to-br from-primary/20 to-purple-600/20 rounded-lg flex items-center justify-center">
                    {playlist.tracks.length > 0 ? (
                      <img
                        src={playlist.tracks[0].image}
                        alt={playlist.name}
                        className="w-full h-full object-cover rounded-xl shadow-md"
                      />
                    ) : (
                      <Music className="w-16 h-16 text-muted-foreground" />
                    )}
                  </div>
                  <Button
                    size="sm"
                    className="absolute bottom-2 right-2 w-12 h-12 rounded-full bg-blue-700/90 text-white shadow-xl backdrop-blur-md opacity-0 group-hover:opacity-100 transition-opacity transition-transform duration-200 hover:scale-110"
                  >
                    <Play className="w-5 h-5 ml-0.5" fill="currentColor" />
                  </Button>
                </div>
                
                <h3 className="font-semibold text-white truncate mb-2">{playlist.name}</h3>
                <p className="text-sm text-muted-foreground">
                  {playlist.tracks.length} {playlist.tracks.length === 1 ? 'song' : 'songs'}
                </p>
                
                <div className="flex items-center justify-between mt-4">
                  <span className="text-xs text-muted-foreground">
                    Created {new Date(playlist.createdAt).toLocaleDateString()}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-red-400"
                    onClick={(e) => {
                      e.stopPropagation();
                      deletePlaylist(playlist.id);
                    }}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* Selected Playlist View */
          <div>
            <div className="flex items-center gap-4 mb-8">
              <Button
                variant="ghost"
                onClick={() => setSelectedPlaylist(null)}
                className="text-blue-700"
              >
                ← Back to Playlists
              </Button>
            </div>

            {selectedPlaylistData && (
              <div>
                <div className="flex items-center gap-6 mb-8">
                  <div className="w-48 h-48 bg-gradient-to-br from-primary/20 to-purple-600/20 rounded-lg flex items-center justify-center">
                    {selectedPlaylistData.tracks.length > 0 ? (
                      <img
                        src={selectedPlaylistData.tracks[0].image}
                        alt={selectedPlaylistData.name}
                        className="w-full h-full object-cover rounded-xl shadow-md"
                      />
                    ) : (
                      <Music className="w-24 h-24 text-muted-foreground" />
                    )}
                  </div>
                  
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">PLAYLIST</p>
                    <h1 className="text-4xl font-bold text-white mb-4">{selectedPlaylistData.name}</h1>
                    <p className="text-muted-foreground">
                      {selectedPlaylistData.tracks.length} {selectedPlaylistData.tracks.length === 1 ? 'song' : 'songs'}
                    </p>
                  </div>
                </div>

                {/* Playlist Tracks */}
                <div className="space-y-2">
                  {selectedPlaylistData.tracks.map((track, index) => (
                    <div
                      key={track.id}
                      className="flex items-center gap-4 p-3 rounded-lg border border-blue-900 cursor-pointer"
                    >
                      <span className="text-muted-foreground w-8 text-center">{index + 1}</span>
                      <div className="relative">
                        <img
                          src={track.image}
                          alt={track.title}
                          className="w-12 h-12 rounded object-cover cursor-pointer"
                          onClick={(e) => {
                            e.stopPropagation();
                            if (onImageClick) { onImageClick(track, selectedPlaylistData.tracks); }
                          }}
                        />
                        <div className="absolute inset-0 bg-black/40 rounded flex items-center justify-center">
                          <Button
                            size="sm"
                            className="play-button w-6 h-6 rounded-full bg-blue-700 text-white"
                            onClick={(e) => {
                              e.stopPropagation();
                              onTrackSelect(track, selectedPlaylistData.tracks);
                            }}
                          >
                            <Play className="w-4 h-4" fill="currentColor" />
                          </Button>
                        </div>
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-white truncate">{track.title}</h4>
                        <p className="text-sm text-muted-foreground truncate">{track.artist}</p>
                      </div>
                      
                      <span className="text-sm text-muted-foreground">{formatDuration(track.duration)}</span>
                      
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
                            removeFromPlaylist(selectedPlaylistData.id, track.id);
                          }}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>

                {selectedPlaylistData.tracks.length === 0 && (
                  <div className="text-center py-12">
                    <Music className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-white mb-2">No songs in this playlist</h3>
                    <p className="text-muted-foreground">Add songs from search or your library</p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {playlists.length === 0 && (
          <div className="text-center py-12">
            <Music className="w-24 h-24 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-2xl font-semibold text-white mb-2">No playlists yet</h3>
            <p className="text-muted-foreground mb-6">Create your first playlist to organize your music</p>
            <Button onClick={() => setIsCreateDialogOpen(true)} className="bg-primary hover:bg-primary/90">
              <Plus className="w-4 h-4 mr-2" />
              Create Your First Playlist
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};
