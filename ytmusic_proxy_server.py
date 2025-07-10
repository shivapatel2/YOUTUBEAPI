from flask import Flask, request, jsonify, Response, redirect
from flask_cors import CORS
import requests
import re
import json
import subprocess
import os
import tempfile
from urllib.parse import urlparse, parse_qs
import sys
sys.stdout.reconfigure(line_buffering=True)
sys.stderr.reconfigure(line_buffering=True)
import time

stream_url_cache = {}  # video_id: (audio_url, expiry_time)
CACHE_TTL = 20 * 60  # 20 minutes

COOKIES_URL = "https://drive.google.com/uc?export=download&id=1nnF81yHbc9whn9ooEd79ggmnRZp-k60L"
COOKIES_PATH = "music.youtube.com_cookies.txt"

if not os.path.exists(COOKIES_PATH):
    print("Downloading cookies file from Google Drive...")
    r = requests.get(COOKIES_URL)
    with open(COOKIES_PATH, "wb") as f:
        f.write(r.content)
    print("Cookies file downloaded.")

app = Flask(__name__)
CORS(app)

# Note: This server attempts to extract audio streams from YouTube Music
# using yt-dlp. Make sure yt-dlp is installed: pip install yt-dlp

@app.route('/ytmusic/video/<video_id>')
def stream_video(video_id):
    """Stream video+audio from YouTube Music using yt-dlp"""
    try:
        url = f"https://music.youtube.com/watch?v={video_id}"
        print(f"Attempting to stream video for video ID: {video_id}")

        # Use yt-dlp to extract best video+audio stream URL
        cmd = [
            'yt-dlp',
            '-f', 'best[ext=mp4][vcodec!=none][acodec!=none]/best',
            '--get-url',
            '--no-playlist',
            '--no-warnings',
            '--quiet',
            '--cookies', 'music.youtube.com_cookies.txt',
            url
        ]

        print(f"Running command: {' '.join(cmd)}")
        result = subprocess.run(cmd, capture_output=True, text=True, timeout=90)

        if result.returncode == 0:
            video_url = result.stdout.strip()
            print(f"Extracted video URL: {video_url[:100]}...")
            if video_url:
                response = requests.get(video_url, stream=True)
                flask_response = Response(
                    response.iter_content(chunk_size=16384),
                    content_type='video/mp4',
                    headers={
                        'Content-Length': response.headers.get('content-length', ''),
                        'Accept-Ranges': 'bytes',
                        'Cache-Control': 'no-cache',
                        'Connection': 'keep-alive'
                    }
                )
                flask_response.headers['Access-Control-Allow-Origin'] = '*'
                flask_response.headers['Access-Control-Allow-Methods'] = 'GET, OPTIONS'
                flask_response.headers['Access-Control-Allow-Headers'] = 'Range'
                return flask_response
            else:
                print("No video URL extracted")
        else:
            print(f"yt-dlp failed with return code: {result.returncode}")
            print(f"yt-dlp stderr: {result.stderr}")

        return jsonify({'error': 'Failed to extract video stream'}), 500

    except subprocess.TimeoutExpired:
        print(f"Timeout extracting video for {video_id}")
        return jsonify({'error': 'Timeout extracting video'}), 500
    except Exception as e:
        print(f"Error streaming video for {video_id}:", e)
        return jsonify({'error': str(e)}), 500

# Update search endpoint to include videoUrl
@app.route('/ytmusic/search')
def search():
    query = request.args.get('query')
    limit = int(request.args.get('limit', 20))
    try:
        print(f"Received search query: {query}, limit: {limit}")
        
        # Use ytmusicapi for search
        from ytmusicapi import YTMusic
        ytmusic = YTMusic()
        results = ytmusic.search(query, limit=limit)  # Remove filter to get all types
        
        # Map results to a simplified format and filter out invalid ones
        mapped = []
        for item in results:
            video_id = item.get('videoId')
            
            # Skip items without video ID or with invalid data
            if not video_id or not item.get('title') or not item.get('artists'):
                continue
                
            # Only allow songs and videos
            if item.get('resultType') not in ['song', 'video']:
                continue
            
            # Extract views if available
            views = item.get('views', None)
            mapped.append({
                'id': video_id,
                'title': item.get('title', 'Unknown Title'),
                'artist': ', '.join([a['name'] for a in item.get('artists', [])]),
                'album': (item.get('album') or {}).get('name', 'Unknown Album'),
                'duration': item.get('duration_seconds', 0),
                'image': item.get('thumbnails', [{}])[-1].get('url', ''),
                'source': 'youtube_music',
                'license': 'YouTube Music',
                'genre': '',
                'preview_url': '',  # Will be populated by proxy
                'fullTrackUrl': f"https://music.youtube.com/watch?v={video_id}" if video_id else '',
                'streamUrl': f"/ytmusic/stream/{video_id}" if video_id else '',  # Proxy endpoint
                'downloadUrl': f"/ytmusic/download/{video_id}" if video_id else '',  # Download endpoint
                'videoUrl': f"/ytmusic/video/{video_id}" if video_id else '',  # Video endpoint
                'resultType': item.get('resultType', ''),
                'views': views,
            })
        
        print(f"Returning {len(mapped)} valid tracks (songs and videos)")
        return jsonify(mapped)
    except Exception as e:
        import traceback
        print("Exception in /ytmusic/search:", e)
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500

@app.route('/ytmusic/stream/<video_id>')
def stream_audio(video_id):
    """Stream audio from YouTube Music using yt-dlp"""
    try:
        now = time.time()
        # Check cache first
        if video_id in stream_url_cache:
            audio_url, expiry = stream_url_cache[video_id]
            if now < expiry:
                print(f"Cache hit for {video_id}")
                return redirect(audio_url, code=302)
            else:
                del stream_url_cache[video_id]  # Expired
        
        url = f"https://music.youtube.com/watch?v={video_id}"
        print(f"Attempting to stream audio for video ID: {video_id}")
        
        # NOTE: To bypass YouTube's bot check, you must upload a valid music.youtube.com_cookies.txt file from your browser (while logged in to YouTube Music) to the same directory as this script.
        # See: https://github.com/yt-dlp/yt-dlp/wiki/FAQ#how-do-i-pass-cookies-to-yt-dlp
        cmd = [
            'yt-dlp',
            '--extract-audio',
            '--audio-format', 'mp3',
            '--audio-quality', '0',
            '--get-url',
            '--no-playlist',
            '--no-warnings',
            '--quiet',
            '--cookies', 'music.youtube.com_cookies.txt',
            url
        ]
        
        print(f"Running command: {' '.join(cmd)}")
        result = subprocess.run(cmd, capture_output=True, text=True, timeout=90)
        print(f"yt-dlp return code: {result.returncode}")
        print(f"yt-dlp stdout: {result.stdout}")
        print(f"yt-dlp stderr: {result.stderr}")
        # Write errors to a file for debugging
        if result.returncode != 0 or not result.stdout.strip():
            with open("yt-dlp-error.log", "a") as f:
                f.write(f"video_id: {video_id}\n")
                f.write(f"yt-dlp return code: {result.returncode}\n")
                f.write(f"yt-dlp stdout: {result.stdout}\n")
                f.write(f"yt-dlp stderr: {result.stderr}\n")
                f.write("-" * 40 + "\n")
        
        if result.returncode == 0:
            audio_url = result.stdout.strip()
            print(f"Extracted audio URL: {audio_url[:100]}...")
            if audio_url:
                # Cache the result
                stream_url_cache[video_id] = (audio_url, now + CACHE_TTL)
                return redirect(audio_url, code=302)
            else:
                print("No audio URL extracted")
        else:
            print(f"yt-dlp failed with return code: {result.returncode}")
            print(f"yt-dlp stderr: {result.stderr}")
            return jsonify({'error': 'Failed to extract audio stream', 'yt_dlp_stderr': result.stderr}), 500
        
        return jsonify({'error': 'Failed to extract audio stream'}), 500
        
    except subprocess.TimeoutExpired:
        print(f"Timeout extracting audio for {video_id}")
        return jsonify({'error': 'Timeout extracting audio'}), 500
    except Exception as e:
        print(f"Error streaming audio for {video_id}:", e)
        return jsonify({'error': str(e)}), 500

@app.route('/ytmusic/download/<video_id>')
def download_audio(video_id):
    """Download audio from YouTube Music"""
    try:
        url = f"https://music.youtube.com/watch?v={video_id}"
        
        # Get video info first
        cmd_info = [
            'yt-dlp',
            '--dump-json',
            '--no-playlist',
            '--cookies', 'music.youtube.com_cookies.txt',
            url
        ]
        
        result = subprocess.run(cmd_info, capture_output=True, text=True, timeout=90)
        
        if result.returncode == 0:
            video_info = json.loads(result.stdout)
            title = video_info.get('title', 'unknown')
            artist = video_info.get('artist', 'unknown')
            
            # Download audio
            cmd_download = [
                'yt-dlp',
                '--extract-audio',
                '--audio-format', 'mp3',
                '--audio-quality', '0',
                '--output', f'{title}.%(ext)s',
                '--cookies', 'music.youtube.com_cookies.txt',
                url
            ]
            
            result = subprocess.run(cmd_download, capture_output=True, text=True, timeout=90)
            
            if result.returncode == 0:
                return jsonify({
                    'success': True,
                    'message': f'Downloaded {title} by {artist}',
                    'filename': f'{title}.mp3'
                })
        
        return jsonify({'error': 'Failed to download audio'}), 500
        
    except subprocess.TimeoutExpired:
        return jsonify({'error': 'Timeout downloading audio'}), 500
    except Exception as e:
        print(f"Error downloading audio for {video_id}:", e)
        return jsonify({'error': str(e)}), 500

@app.route('/ytmusic/info/<video_id>')
def get_video_info(video_id):
    """Get video information including available formats"""
    try:
        url = f"https://music.youtube.com/watch?v={video_id}"
        
        cmd = [
            'yt-dlp',
            '--dump-json',
            '--no-playlist',
            '--cookies', 'music.youtube.com_cookies.txt',
            url
        ]
        
        result = subprocess.run(cmd, capture_output=True, text=True, timeout=90)
        
        if result.returncode == 0:
            video_info = json.loads(result.stdout)
            return jsonify(video_info)
        
        return jsonify({'error': 'Failed to get video info'}), 500
        
    except subprocess.TimeoutExpired:
        return jsonify({'error': 'Timeout getting video info'}), 500
    except Exception as e:
        print(f"Error getting video info for {video_id}:", e)
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    import os
    port = int(os.environ.get('PORT', 5006))
    print(f"Starting YouTube Music Proxy Server on port {port}")
    print("Make sure yt-dlp is installed: pip install yt-dlp")
    app.run(host='0.0.0.0', port=port) 