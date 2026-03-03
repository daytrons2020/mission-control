# Quick Reference - Video Producer Agent

## File Structure
```
/workspace/projects/youtube-empire/video-production/
├── VIDEO_PRODUCTION_GUIDE.md    # Main production guide
├── TOOL_COST_ANALYSIS.md        # Free vs paid tool comparison
├── first_video_script.md        # Ready-to-produce script
├── ffmpeg_library.sh            # Reusable FFmpeg commands
└── assets/                      # Create this folder for your assets
    ├── images/
    ├── audio/
    ├── fonts/
    └── output/
```

## Quick Commands

### Load FFmpeg Library
```bash
cd /workspace/projects/youtube-empire/video-production
source ./ffmpeg_library.sh
```

### Create First Video
```bash
# 1. Create black video with audio (simplest test)
create_black_video audio.mp3 240 output.mp4

# 2. Create from images
ffmpeg -framerate 1/5 -i img%03d.jpg -i audio.mp3 -c:v libx264 -pix_fmt yuv420p -shortest output.mp4

# 3. Export for YouTube
export_youtube_1080p input.mp4 output.mp4
```

## Resource Priority
1. **Kimi K2.5** - Scripts, descriptions, planning
2. **FFmpeg** - Video assembly (installed)
3. **Free tools** - Canva, CapCut, OBS
4. **Paid tools** - Only if necessary

## Free Tool Quick Links
- **Images:** Bing Image Creator, Leonardo.ai (150/day)
- **Music:** YouTube Audio Library, Udio (600/mo), Suno (50/day)
- **Editing:** CapCut (free), DaVinci Resolve (free)
- **Thumbnails:** Canva (free)
- **TTS:** Google Cloud TTS (1M chars/mo), ElevenLabs (10k chars/mo)

## Channel Types
1. **Kids Education** - Shapes, numbers, letters (3-5 min)
2. **Lofi Music** - Study beats (1 hour, loopable)
3. **Ambient Sleep** - White noise/rain (10 hours, black screen)
4. **Kids Sleep** - Gentle lullabies (2 hours)
5. **Kids Stories** - 10-min narrated tales

## First Video
**Title:** "Learn Shapes with Cute Animals! 🟡🔺🟦"  
**Duration:** 4 minutes  
**Cost:** $0  
**Time:** 5-6 hours production

See `first_video_script.md` for complete script and asset list.
