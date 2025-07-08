import express from 'express';
import cors from 'cors';
import { searchYouTubeMusicTracks, testYouTubeMusicAPI } from './src/services/youtubeMusicApi.js';

const app = express();
const PORT = 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Server is running' });
});

// General search endpoint
app.get('/search', async (req, res) => {
  try {
    const { query = '', limit = 20 } = req.query;
    
    if (!query) {
      return res.status(400).json({ error: 'Query parameter is required' });
    }

    console.log(`Searching for: ${query}, limit: ${limit}`);
    
    // For now, return mock data since we're using mock implementation
    const mockTracks = [
      {
        id: 'demo_1',
        title: 'Sample Track',
        artist: 'Sample Artist',
        album: 'Sample Album',
        duration: 180,
        previewDuration: 180,
        image: 'https://via.placeholder.com/300x300?text=Sample',
        source: 'jiosaavn',
        license: 'Demo',
        genre: 'Pop',
      }
    ];

    res.json(mockTracks);
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/health`);
  console.log(`Search endpoint: http://localhost:${PORT}/search?query=test`);
}); 