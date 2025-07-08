import { getApiStatus, searchTracks, getFeaturedTracks } from '@/services/musicApi';

export const runAPITests = async () => {
  console.log('🔍 Testing Music APIs...');

  try {
    // Test API Connections
    console.log('\n📡 Testing API Connections...');
    const apiResults = await getApiStatus();

    console.log('API Test Results:');
    Object.entries(apiResults).forEach(([api, working]) => {
      const status = working ? '✅' : '❌';
      console.log(`  ${status} ${api.toUpperCase()}: ${working ? 'Connected' : 'Failed'}`);
    });

    // Test search functionality
    console.log('\n🔎 Testing Search Functionality...');
    const searchResults = await searchTracks('jazz', 5);
    console.log(`Search Results: ${searchResults.length} tracks found`);

    searchResults.forEach((track, index) => {
      console.log(`  ${index + 1}. ${track.title} - ${track.artist} (${track.source})`);
      console.log(`     URL: ${track.preview_url || track.fullTrackUrl}`);
    });

    // Test featured tracks
    console.log('\n⭐ Testing Featured Tracks...');
    const featuredResults = await getFeaturedTracks();
    console.log(`Featured Tracks: ${featuredResults.length} tracks found`);

    featuredResults.slice(0, 3).forEach((track, index) => {
      console.log(`  ${index + 1}. ${track.title} - ${track.artist} (${track.source})`);
      console.log(`     URL: ${track.preview_url || track.fullTrackUrl}`);
    });

    // Summary
    const workingAPIs = Object.entries(apiResults).filter(([_, working]) => working);
    console.log(`\n📊 Summary: ${workingAPIs.length}/${Object.keys(apiResults).length} APIs working`);

    if (workingAPIs.length > 0) {
      console.log('🎉 At least one music API is working!');

      // Test if tracks are actually playable
      if (featuredResults.length > 0) {
        console.log('\n🎵 Testing track playback...');
        const testTrack = featuredResults[0];
        console.log(`Testing: ${testTrack.title} - ${testTrack.artist}`);
        const trackUrl = testTrack.preview_url || testTrack.fullTrackUrl;
        console.log(`Audio URL: ${trackUrl}`);

        if (trackUrl) {
            // Test if the audio URL is accessible
            try {
                const response = await fetch(trackUrl, { method: 'HEAD' });
                if (response.ok) {
                console.log('✅ Audio URL is accessible!');
                } else {
                console.log('⚠️  Audio URL returned status:', response.status);
                }
            } catch (error) {
                console.log('⚠️  Could not test audio URL:', error);
            }
        } else {
            console.log('⚠️ No audio URL to test.');
        }
      }

      return true;
    } else {
      console.log('⚠️ All music APIs are not working. Check your internet connection.');
      return false;
    }

  } catch (error) {
    console.error('❌ API Test Failed:', error);
    return false;
  }
};

// Function to get API status for UI
export const getAPIStatusForUI = async () => {
    const apiResults = await getApiStatus();
    const workingAPIs = Object.entries(apiResults).filter(([, working]) => working);
  
    const workingApiNames = workingAPIs.map(([api]) => api.charAt(0).toUpperCase() + api.slice(1)).join(', ');
  
    return {
      working: workingAPIs.map(([api]) => api),
      total: Object.keys(apiResults).length,
      status: workingAPIs.length > 0 ? 'success' : 'error',
      message: workingAPIs.length > 0 
        ? `${workingApiNames} Connected`
        : 'All API Connections Failed'
    };
  }; 