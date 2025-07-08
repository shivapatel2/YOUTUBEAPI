from flask import Flask, request, jsonify
from flask_cors import CORS
from ytmusicapi import YTMusic

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes
ytmusic = YTMusic()

@app.route('/ytmusic/search')
def search():
    query = request.args.get('query')
    limit = int(request.args.get('limit', 20))
    results = ytmusic.search(query, filter='songs', limit=limit)
    # Map results to a simplified format
    mapped = []
    for item in results:
        mapped.append({
            'id': item.get('videoId'),
            'title': item.get('title'),
            'artist': ', '.join([a['name'] for a in item.get('artists', [])]),
            'album': item.get('album', {}).get('name', ''),
            'duration': item.get('duration_seconds', 0),
            'image': item.get('thumbnails', [{}])[-1].get('url', ''),
            'source': 'youtube_music',
            'license': 'YouTube Music',
            'genre': '',
            'preview_url': '',
            'fullTrackUrl': f"https://music.youtube.com/watch?v={item.get('videoId')}" if item.get('videoId') else '',
            'streamUrl': '',
            'downloadUrl': '',
        })
    return jsonify(mapped)

if __name__ == '__main__':
    import os
    port = int(os.environ.get('PORT', 5005))
    app.run(host='0.0.0.0', port=port) 
