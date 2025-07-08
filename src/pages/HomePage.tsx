import { useState } from "react";
import { Sidebar } from "@/components/Sidebar";
import { MainContent } from "@/components/MainContent";
import { MusicPlayer } from "@/components/MusicPlayer";
import { SearchPage } from "@/components/SearchPage";
import { LibraryPage } from "@/components/LibraryPage";
import { PlaylistsPage } from "@/components/PlaylistsPage";
import { SettingsPage } from "@/components/SettingsPage";
import { BottomNav } from "@/components/BottomNav";
import { MusicTrack } from "@/services/musicApi";

// Use the enhanced MusicTrack interface
export type Track = MusicTrack;

const HomePage = () => {
  const [currentView, setCurrentView] = useState<'home' | 'search' | 'library' | 'playlists' | 'settings'>('home');
  const [isTransitioning, setIsTransitioning] = useState(false);

  const handleViewChange = (view: 'home' | 'search' | 'library' | 'playlists' | 'settings') => {
    if (view !== currentView) {
      setIsTransitioning(true);
      setTimeout(() => {
        setCurrentView(view);
        setIsTransitioning(false);
      }, 150);
    }
  };

  const renderContent = () => {
    switch (currentView) {
      case 'search':
        return <SearchPage />;
      case 'library':
        return <LibraryPage />;
      case 'playlists':
        return <PlaylistsPage />;
      case 'settings':
        return <SettingsPage />;
      default:
        return <MainContent />;
    }
  };

  return (
    <div className="h-screen flex flex-col bg-black">
      {/* Desktop Layout */}
      <div className="hidden md:flex flex-1 gap-2 p-2">
        {/* Desktop Sidebar */}
        <Sidebar currentView={currentView} onViewChange={handleViewChange} />
        
        {/* Main Content */}
        <main className={`flex-1 bg-gradient-to-b from-neutral-900 to-black rounded-lg overflow-hidden transition-all duration-300 ${
          isTransitioning ? 'opacity-50 scale-95' : 'opacity-100 scale-100'
        }`}>
          <div className={`h-full transition-all duration-300 ${
            isTransitioning ? 'transform translate-x-4' : 'transform translate-x-0'
          }`}>
          {renderContent()}
          </div>
        </main>
      </div>
      
      {/* Mobile Layout */}
      <div className="md:hidden mobile-layout">
        {/* Main Content Area - Scrollable */}
        <div className="mobile-content">
          <main className={`min-h-full transition-all duration-300 ${
            isTransitioning ? 'opacity-50 scale-95' : 'opacity-100 scale-100'
          }`}>
            <div className={`transition-all duration-300 ${
              isTransitioning ? 'transform translate-x-4' : 'transform translate-x-0'
            }`}>
              {renderContent()}
            </div>
          </main>
        </div>
      </div>
      
      {/* Music Player - Fixed at bottom */}
      <div className="mobile-bottom">
        <MusicPlayer />
      </div>
      
      {/* Mobile Bottom Navigation - Fixed at bottom */}
      <div className="md:hidden mobile-bottom">
        <BottomNav currentView={currentView} onViewChange={handleViewChange} />
      </div>
    </div>
  );
}

export default HomePage;
