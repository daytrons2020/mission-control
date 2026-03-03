# YouTube Empire - Automation Scripts

## Overview
This folder contains scripts and workflows for automating the YouTube content pipeline.

---

## 1. YouTube Upload Automation

### Prerequisites
```bash
pip install google-api-python-client google-auth-httplib2 google-auth-oauthlib
```

### Upload Script
```python
#!/usr/bin/env python3
"""
youtube_uploader.py - Automated YouTube video uploader
"""
import os
import json
import datetime
from googleapiclient.discovery import build
from googleapiclient.http import MediaFileUpload
from google.auth.transport.requests import Request
from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import InstalledAppFlow

SCOPES = ['https://www.googleapis.com/auth/youtube.upload']

class YouTubeUploader:
    def __init__(self, credentials_path='credentials.json'):
        self.credentials_path = credentials_path
        self.youtube = self._get_authenticated_service()
    
    def _get_authenticated_service(self):
        creds = None
        if os.path.exists('token.json'):
            creds = Credentials.from_authorized_user_file('token.json', SCOPES)
        
        if not creds or not creds.valid:
            if creds and creds.expired and creds.refresh_token:
                creds.refresh(Request())
            else:
                flow = InstalledAppFlow.from_client_secrets_file(
                    self.credentials_path, SCOPES)
                creds = flow.run_local_server(port=0)
            
            with open('token.json', 'w') as token:
                token.write(creds.to_json())
        
        return build('youtube', 'v3', credentials=creds)
    
    def upload_video(self, file_path, title, description, tags, category='22', 
                     privacy='private', publish_at=None):
        """
        Upload a video to YouTube
        
        Args:
            file_path: Path to video file
            title: Video title
            description: Video description
            tags: List of tags
            category: Category ID (22 = People & Blogs, 27 = Education, 10 = Music)
            privacy: 'private', 'unlisted', or 'public'
            publish_at: ISO 8601 datetime for scheduled publishing
        """
        body = {
            'snippet': {
                'title': title,
                'description': description,
                'tags': tags,
                'categoryId': category
            },
            'status': {
                'privacyStatus': privacy,
                'selfDeclaredMadeForKids': False
            }
        }
        
        if publish_at:
            body['status']['publishAt'] = publish_at
            body['status']['privacyStatus'] = 'private'
        
        media = MediaFileUpload(file_path, resumable=True)
        
        request = self.youtube.videos().insert(
            part='snippet,status',
            body=body,
            media_body=media
        )
        
        response = None
        while response is None:
            status, response = request.next_chunk()
            if status:
                print(f"Uploaded {int(status.progress() * 100)}%")
        
        print(f"Video uploaded: https://youtube.com/watch?v={response['id']}")
        return response['id']
    
    def set_thumbnail(self, video_id, thumbnail_path):
        """Set custom thumbnail for a video"""
        media = MediaFileUpload(thumbnail_path)
        response = self.youtube.thumbnails().set(
            videoId=video_id,
            media_body=media
        ).execute()
        print(f"Thumbnail set for video {video_id}")
        return response

# Example usage
if __name__ == '__main__':
    uploader = YouTubeUploader()
    
    # Schedule a video for tomorrow at 9 AM
    tomorrow = datetime.datetime.now() + datetime.timedelta(days=1)
    publish_time = tomorrow.replace(hour=9, minute=0).isoformat() + 'Z'
    
    video_id = uploader.upload_video(
        file_path='videos/my_video.mp4',
        title='Learn Shapes for Kids!',
        description='Fun educational video for toddlers...',
        tags=['kids', 'education', 'shapes', 'toddlers'],
        category='27',  # Education
        privacy='private',
        publish_at=publish_time
    )
```

---

## 2. Content Generation Pipeline

### AI Script Generator
```python
#!/usr/bin/env python3
"""
script_generator.py - Generate video scripts using AI
"""
import os
import json
from datetime import datetime

class ScriptGenerator:
    def __init__(self):
        self.templates = {
            'kids_education': self._kids_ed_template,
            'lofi_music': self._lofi_template,
            'ambient_sleep': self._sleep_template,
            'kids_sleep_music': self._sleep_music_template,
            'kids_stories': self._story_template
        }
    
    def _kids_ed_template(self, topic):
        return f"""
# Kids Education Script: {topic}

## Opening (30 seconds)
- Catchy intro music
- Friendly character introduction
- "Hey kids! Today we're learning about {topic}!"

## Main Content (5-7 minutes)
- Introduce concept with examples
- Interactive call-and-response
- Song or chant about {topic}
- Visual demonstrations
- Practice questions

## Closing (1 minute)
- Review what was learned
- Encouragement and praise
- Teaser for next video
- Outro music

## SEO Elements
Title: "Learn {topic} for Kids! | Fun Educational Video"
Description: "Join us as we explore {topic} in a fun, engaging way perfect for toddlers and preschoolers!"
Tags: kids, education, {topic}, toddlers, preschool, learning
"""
    
    def _lofi_template(self, theme):
        return f"""
# Lofi Music Video: {theme}

## Track Info
- Duration: 2-3 hours
- BPM: 70-85
- Key: Minor (relaxing)
- Mood: Study, focus, chill

## Visual Description
- Anime-style room scene
- Rain on window (optional)
- Desk with study materials
- Warm lighting
- Subtle animation loop

## Metadata
Title: "{theme} Lofi Beats 🎵 2 Hours of Chill Study Music"
Description: "Relax and focus with these {theme} lofi beats. Perfect for studying, working, or relaxing."
Tags: lofi, study music, chill beats, {theme}, background music, focus
"""
    
    def _sleep_template(self, sound_type):
        return f"""
# Ambient Sleep Video: {sound_type}

## Audio Specs
- Duration: 10-12 hours
- Type: {sound_type}
- Volume: Consistent, not jarring
- Loop: Seamless

## Visual Options
- Black screen (recommended for sleep)
- OR: Very dark, slow-moving nature scene
- No bright flashes or sudden changes

## Metadata
Title: "{sound_type} for Sleep | 10 Hours | Black Screen"
Description: "Drift off to sleep with continuous {sound_type}. No ads, no interruptions, just pure relaxation."
Tags: sleep sounds, {sound_type}, insomnia, relaxation, white noise, sleep aid
"""
    
    def _sleep_music_template(self, instrument):
        return f"""
# Kids Sleep Music: {instrument} Lullabies

## Music Specs
- Duration: 2-3 hours
- Instrument: {instrument}
- Tempo: 50-60 BPM
- Mood: Gentle, dreamy, calming

## Visual Description
- Soft night sky with twinkling stars
- Sleeping moon character
- Gentle cloud movement
- Soft color palette (blues, purples)

## Metadata
Title: "{instrument} Lullabies for Kids | 2 Hours Sleep Music"
Description: "Help your little ones drift off with these gentle {instrument} lullabies. Perfect for bedtime routines."
Tags: lullaby, sleep music, kids, bedtime, {instrument}, relaxation
"""
    
    def _story_template(self, story_type):
        return f"""
# Kids Story Script: {story_type}

## Story Structure (8-10 minutes)

### Beginning (2 min)
- Introduce main character
- Set the scene
- Present the problem/adventure

### Middle (5-6 min)
- Character faces challenges
- Makes friends/learns lessons
- Builds toward resolution

### End (1-2 min)
- Problem solved
- Happy ending
- Gentle moral/lesson
- Goodnight message

## Narration Notes
- Warm, engaging tone
- Pause for dramatic effect
- Character voices (subtle)
- Background music: Soft, unobtrusive

## Metadata
Title: "The {story_type} Adventure | Bedtime Story for Kids"
Description: "Join our hero on a magical {story_type} adventure! Perfect for bedtime or anytime listening."
Tags: kids stories, bedtime story, {story_type}, children, audiobook, moral story
"""
    
    def generate(self, channel_type, topic, output_dir='scripts'):
        """Generate and save a script"""
        if channel_type not in self.templates:
            raise ValueError(f"Unknown channel type: {channel_type}")
        
        script = self.templates[channel_type](topic)
        
        os.makedirs(output_dir, exist_ok=True)
        filename = f"{output_dir}/{channel_type}_{topic.replace(' ', '_').lower()}_{datetime.now().strftime('%Y%m%d')}.md"
        
        with open(filename, 'w') as f:
            f.write(script)
        
        return filename

# Example usage
if __name__ == '__main__':
    generator = ScriptGenerator()
    
    # Generate scripts for each channel
    generator.generate('kids_education', 'Shapes')
    generator.generate('lofi_music', 'Rainy Day Study')
    generator.generate('ambient_sleep', 'Brown Noise')
    generator.generate('kids_sleep_music', 'Piano')
    generator.generate('kids_stories', 'Forest Friend')
```

---

## 3. Batch Upload Scheduler

```python
#!/usr/bin/env python3
"""
batch_scheduler.py - Schedule multiple videos for upload
"""
import json
import csv
from datetime import datetime, timedelta
from youtube_uploader import YouTubeUploader

class BatchScheduler:
    def __init__(self):
        self.uploader = YouTubeUploader()
    
    def schedule_from_csv(self, csv_path):
        """
        CSV format:
        file_path,title,description,tags,category,privacy,channel,schedule_date,schedule_time
        """
        scheduled = []
        
        with open(csv_path, 'r') as f:
            reader = csv.DictReader(f)
            for row in reader:
                # Parse schedule datetime
                date_str = f"{row['schedule_date']} {row['schedule_time']}"
                publish_at = datetime.strptime(date_str, '%Y-%m-%d %H:%M')
                publish_at_iso = publish_at.isoformat() + 'Z'
                
                # Upload video
                video_id = self.uploader.upload_video(
                    file_path=row['file_path'],
                    title=row['title'],
                    description=row['description'],
                    tags=row['tags'].split(','),
                    category=row['category'],
                    privacy=row['privacy'],
                    publish_at=publish_at_iso
                )
                
                scheduled.append({
                    'video_id': video_id,
                    'title': row['title'],
                    'scheduled_for': publish_at_iso
                })
        
        return scheduled
    
    def create_weekly_schedule(self, channel, start_date, videos):
        """
        Create a week's worth of scheduled uploads
        
        Args:
            channel: Channel name
            start_date: Starting date (datetime)
            videos: List of video dicts with file_path, title, etc.
        """
        schedule = []
        
        for i, video in enumerate(videos):
            # Calculate publish time
            publish_time = start_date + timedelta(days=i)
            
            # Set optimal times per channel
            if channel == 'kids_education':
                publish_time = publish_time.replace(hour=9, minute=0)
            elif channel == 'lofi_music':
                # 2x daily
                if i % 2 == 0:
                    publish_time = publish_time.replace(hour=8, minute=0)
                else:
                    publish_time = publish_time.replace(hour=20, minute=0)
            elif channel == 'ambient_sleep':
                publish_time = publish_time.replace(hour=21, minute=0)
            elif channel == 'kids_sleep_music':
                publish_time = publish_time.replace(hour=19, minute=0)
            elif channel == 'kids_stories':
                # 2x daily
                if i % 2 == 0:
                    publish_time = publish_time.replace(hour=9, minute=0)
                else:
                    publish_time = publish_time.replace(hour=19, minute=0)
            
            schedule.append({
                **video,
                'publish_at': publish_time.isoformat() + 'Z'
            })
        
        return schedule

# Example usage
if __name__ == '__main__':
    scheduler = BatchScheduler()
    
    # Example weekly schedule for Kids Education
    videos = [
        {'file_path': 'videos/shapes.mp4', 'title': 'Learn Shapes!', 'tags': 'kids,shapes'},
        {'file_path': 'videos/numbers.mp4', 'title': 'Counting 1-10', 'tags': 'kids,numbers'},
        # ... more videos
    ]
    
    schedule = scheduler.create_weekly_schedule(
        channel='kids_education',
        start_date=datetime.now() + timedelta(days=1),
        videos=videos
    )
    
    print(json.dumps(schedule, indent=2))
```

---

## 4. Analytics Dashboard Script

```python
#!/usr/bin/env python3
"""
analytics_dashboard.py - Track channel performance
"""
import json
from googleapiclient.discovery import build
from datetime import datetime, timedelta

class AnalyticsDashboard:
    def __init__(self, api_key):
        self.youtube = build('youtube', 'v3', developerKey=api_key)
    
    def get_channel_stats(self, channel_id):
        """Get basic channel statistics"""
        response = self.youtube.channels().list(
            part='statistics,snippet',
            id=channel_id
        ).execute()
        
        if not response['items']:
            return None
        
        channel = response['items'][0]
        return {
            'title': channel['snippet']['title'],
            'subscribers': channel['statistics']['subscriberCount'],
            'views': channel['statistics']['viewCount'],
            'videos': channel['statistics']['videoCount']
        }
    
    def get_video_performance(self, channel_id, max_results=50):
        """Get recent video performance"""
        # Get video IDs
        videos_response = self.youtube.search().list(
            part='id',
            channelId=channel_id,
            maxResults=max_results,
            order='date',
            type='video'
        ).execute()
        
        video_ids = [item['id']['videoId'] for item in videos_response['items']]
        
        # Get video statistics
        stats_response = self.youtube.videos().list(
            part='statistics,snippet',
            id=','.join(video_ids)
        ).execute()
        
        videos = []
        for video in stats_response['items']:
            videos.append({
                'title': video['snippet']['title'],
                'published': video['snippet']['publishedAt'],
                'views': video['statistics'].get('viewCount', 0),
                'likes': video['statistics'].get('likeCount', 0),
                'comments': video['statistics'].get('commentCount', 0)
            })
        
        return videos
    
    def generate_report(self, channels):
        """Generate performance report for all channels"""
        report = {
            'generated_at': datetime.now().isoformat(),
            'channels': []
        }
        
        for channel_id, channel_name in channels.items():
            stats = self.get_channel_stats(channel_id)
            if stats:
                recent_videos = self.get_video_performance(channel_id, max_results=10)
                
                report['channels'].append({
                    'name': channel_name,
                    'stats': stats,
                    'recent_videos': recent_videos
                })
        
        return report

# Example usage
if __name__ == '__main__':
    dashboard = AnalyticsDashboard(api_key='YOUR_API_KEY')
    
    channels = {
        'CHANNEL_ID_1': 'Kids Education',
        'CHANNEL_ID_2': 'Lofi Music',
        'CHANNEL_ID_3': 'Ambient Sleep',
        'CHANNEL_ID_4': 'Kids Sleep Music',
        'CHANNEL_ID_5': 'Kids Stories'
    }
    
    report = dashboard.generate_report(channels)
    
    with open(f"reports/analytics_{datetime.now().strftime('%Y%m%d')}.json", 'w') as f:
        json.dump(report, f, indent=2)
```

---

## 5. FFmpeg Automation Scripts

### Video Processing
```bash
#!/bin/bash
# process_video.sh - Batch video processing with FFmpeg

INPUT_DIR="raw_videos"
OUTPUT_DIR="processed_videos"

mkdir -p "$OUTPUT_DIR"

for video in "$INPUT_DIR"/*.mp4; do
    filename=$(basename "$video")
    
    # Process: 1080p, 60fps, optimized for YouTube
    ffmpeg -i "$video" \
        -c:v libx264 \
        -preset slow \
        -crf 18 \
        -r 60 \
        -s 1920x1080 \
        -c:a aac \
        -b:a 192k \
        -movflags +faststart \
        "$OUTPUT_DIR/$filename"
    
    echo "Processed: $filename"
done
```

### Audio Looping for Sleep Videos
```bash
#!/bin/bash
# create_sleep_video.sh - Create 10-hour sleep video

AUDIO_FILE="$1"
OUTPUT_FILE="$2"
DURATION_HOURS=10

# Calculate total seconds
TOTAL_SECONDS=$((DURATION_HOURS * 3600))

# Create black video with looped audio
ffmpeg -f lavfi -i "color=c=black:s=1280x720:r=30" \
    -i "$AUDIO_FILE" \
    -stream_loop -1 \
    -t "$TOTAL_SECONDS" \
    -c:v libx264 -preset veryfast -crf 28 \
    -c:a aac -b:a 128k \
    -shortest \
    -pix_fmt yuv420p \
    "$OUTPUT_FILE"

echo "Created: $OUTPUT_FILE (${DURATION_HOURS} hours)"
```

### Thumbnail Generator
```bash
#!/bin/bash
# generate_thumbnail.sh - Create YouTube thumbnails

TITLE="$1"
OUTPUT="$2"

# Create 1280x720 thumbnail with text
convert -size 1280x720 xc:lightblue \
    -pointsize 60 \
    -fill black \
    -gravity center \
    -annotate +0+0 "$TITLE" \
    "$OUTPUT"

echo "Thumbnail created: $OUTPUT"
```

---

## 6. Workflow Automation with Make.com/Zapier

### Trigger: New Video in Dropbox/Google Drive
```
1. Trigger: New file in /videos/ready folder
2. Action: Run Python script to generate metadata
3. Action: Upload to YouTube (scheduled)
4. Action: Log to Airtable/Notion
5. Action: Send notification (Discord/Slack)
```

### Airtable Base Structure
```
Table: Content Calendar
- Video ID (auto)
- Channel (single select)
- Title (text)
- Description (long text)
- Tags (text)
- Status (single select: Script → Recording → Editing → Ready → Uploaded → Published)
- Scheduled Date (date)
- YouTube URL (URL)
- Views (number)
- Notes (long text)
```

---

## Setup Instructions

### 1. YouTube API Setup
1. Go to Google Cloud Console
2. Create new project
3. Enable YouTube Data API v3
4. Create OAuth 2.0 credentials
5. Download client_secret.json as credentials.json

### 2. Environment Variables
```bash
export YOUTUBE_API_KEY="your_api_key"
export YOUTUBE_CLIENT_ID="your_client_id"
export YOUTUBE_CLIENT_SECRET="your_client_secret"
```

### 3. Directory Structure
```
youtube-empire/
├── scripts/
│   ├── youtube_uploader.py
│   ├── script_generator.py
│   ├── batch_scheduler.py
│   └── analytics_dashboard.py
├── videos/
│   ├── raw/
│   ├── processed/
│   └── ready/
├── thumbnails/
├── credentials/
│   └── credentials.json
├── reports/
└── schedules/
```

---

*Automation Scripts Version: 1.0*
