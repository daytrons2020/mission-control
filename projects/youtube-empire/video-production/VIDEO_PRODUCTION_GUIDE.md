# YouTube Empire - Video Production Guide

## Resource Priority
1. **Kimi K2.5** (available) - Scripts, image descriptions, planning
2. **FFmpeg** (installed) - Video assembly, transitions, rendering
3. **Free tools** - Canva, CapCut, OBS
4. **Paid tools** - Only if necessary

---

## 1. Video Production Workflow

### Phase 1: Pre-Production (Kimi K2.5)
```
1. Generate script using Kimi
2. Create shot list with image descriptions
3. Plan music/ambient audio
4. Design thumbnail concept
```

### Phase 2: Asset Creation
```
For visuals:
- Use Kimi to generate detailed image descriptions
- Use free AI image generators (Leonardo.ai free tier, Bing Image Creator)
- Or create in Canva free tier

For audio:
- Free music: YouTube Audio Library, Free Music Archive
- AI music: Udio free tier, Suno free tier
- Voice: Kimi can guide TTS, or use free TTS tools
```

### Phase 3: Assembly (FFmpeg)
```
1. Combine images/video clips
2. Add audio tracks
3. Apply transitions
4. Add text overlays
5. Export final video
```

### Phase 4: Post-Production
```
1. Create thumbnail (Canva free)
2. Write description/tags (Kimi)
3. Schedule upload
```

---

## 2. Script Templates

### Kids Education - Shapes
```
TITLE: "Learn Shapes with Fun Animals! 🟡🔺🟦"
DURATION: 3-5 minutes
TARGET: Ages 2-5

STRUCTURE:
0:00-0:10 - Catchy intro jingle + title card
0:10-0:30 - Host/character introduction
0:30-1:00 - Circle (show real examples: ball, cookie, sun)
1:00-1:30 - Square (show: box, window, cracker)
1:30-2:00 - Triangle (show: pizza slice, mountain, tent)
2:00-2:30 - Rectangle (show: door, book, phone)
2:30-3:00 - Review game - "Find the shape!"
3:00-3:30 - Shape song/dance
3:30-3:45 - Outro + subscribe call

VISUAL STYLE: Bright colors, simple animations, real object photos
AUDIO: Upbeat instrumental, clear narration, sound effects
```

### Kids Education - Numbers
```
TITLE: "Counting 1 to 10 with Cute Animals! 🔢"
DURATION: 4-6 minutes
TARGET: Ages 2-5

STRUCTURE:
0:00-0:10 - Number train intro animation
0:10-0:30 - "Let's count together!"
0:30-1:00 - Number 1 (one sun, one apple)
1:00-1:30 - Number 2 (two birds, two shoes)
[Continue through 10...]
4:30-5:00 - Counting song 1-10
5:00-5:30 - Quiz: "How many do you see?"
5:30-5:45 - Outro with number review

VISUAL STYLE: Animated numbers, cute animals, counting objects
AUDIO: Cheerful music, counting voice, animal sounds
```

### Kids Education - Letters
```
TITLE: "ABC Adventure - Learn Your Letters! 🔤"
DURATION: 5-8 minutes
TARGET: Ages 3-6

STRUCTURE:
0:00-0:15 - Alphabet song intro
0:15-0:45 - Letters A-E with words and images
0:45-1:15 - Letters F-J
[Continue in groups of 5...]
6:00-6:30 - "Find the letter" game
6:30-7:00 - Full ABC song with animation
7:00-7:15 - Outro

VISUAL STYLE: Letter characters, word associations, bright backgrounds
AUDIO: Alphabet song variations, phonics sounds, cheerful music
```

### Lofi Music - Study Beats
```
TITLE: "Lofi Study Beats 🌙 1 Hour Relaxing Music for Focus"
DURATION: 1 hour (loopable)
TARGET: Students, workers, anyone needing focus

STRUCTURE:
0:00-0:30 - Fade in from black, title appears
0:30-60:00 - Continuous lofi beat with animated background
- Loop every 3-5 minutes with subtle variations
- Visual: Animated room, rain window, studying character
60:00-60:30 - Fade out

VISUAL STYLE: Anime-style room, cozy atmosphere, subtle animations
AUDIO: Lofi hip-hop beat, vinyl crackle, rain sounds optional
```

### Ambient Sleep - White Noise
```
TITLE: "10 Hours Rain Sounds for Deep Sleep 🌧️ Black Screen"
DURATION: 10 hours
TARGET: People with sleep issues

STRUCTURE:
0:00-0:30 - Gentle fade in
0:30-10:00:00 - Continuous rain sounds
- Optional: Very dark, dim visual (or pure black)
- No sudden changes in volume
10:00:00 - Gentle fade out (or loop)

VISUAL STYLE: Pure black OR very dim rain on window
AUDIO: Seamless rain loop, no music, consistent volume
```

### Kids Sleep Music - Gentle Lullabies
```
TITLE: "Gentle Lullabies for Babies 🌙 2 Hours Sleep Music"
DURATION: 2 hours
TARGET: Babies, toddlers, parents

STRUCTURE:
0:00-1:00 - Soft fade in, stars appearing
1:00-120:00 - Gentle instrumental lullabies
- Slow tempo (60-80 BPM)
- Simple melodies
- Soft instruments: piano, music box, strings
120:00 - Soft fade out

VISUAL STYLE: Slow-moving stars, moon, sleeping animals, soft colors
AUDIO: Gentle lullaby melodies, no sudden sounds, consistent low volume
```

### Kids Stories - 10-Minute Narrated
```
TITLE: "The Brave Little Rabbit 🐰 Bedtime Story for Kids"
DURATION: 10 minutes
TARGET: Ages 3-8

STRUCTURE:
0:00-0:30 - Title card with gentle music
0:30-1:00 - "Once upon a time..." intro
1:00-3:00 - Character introduction, setting the scene
3:00-6:00 - Problem/adventure begins
6:00-8:00 - Climax and resolution
8:00-9:30 - Happy ending, moral of story
9:30-10:00 - "The end" + gentle outro music

VISUAL STYLE: Storybook illustrations, gentle animations between scenes
AUDIO: Clear narration, background music, subtle sound effects

EXAMPLE STORY: "The Brave Little Rabbit"
- Little Rabbit is afraid of the dark
- Gets lost in the forest at dusk
- Makes friends with a firefly who lights the way
- Learns that friends help us face our fears
- Returns home safe and brave
```

---

## 3. FFmpeg Command Library

### Basic Video Creation
```bash
# Create video from single image + audio
ffmpeg -loop 1 -i image.jpg -i audio.mp3 -c:v libx264 -tune stillimage -c:a aac -b:a 192k -pix_fmt yuv420p -shortest output.mp4

# Create video from multiple images (5 seconds each)
ffmpeg -framerate 1/5 -i img%03d.jpg -c:v libx264 -r 30 -pix_fmt yuv420p output.mp4

# Create video with specific duration
ffmpeg -loop 1 -i image.jpg -c:v libx264 -t 3600 -pix_fmt yuv420p -vf "fps=30,format=yuv420p" output.mp4
```

### Adding Text Overlays
```bash
# Add title text
ffmpeg -i input.mp4 -vf "drawtext=text='My Title':fontcolor=white:fontsize=72:x=(w-text_w)/2:y=(h-text_h)/2" output.mp4

# Add scrolling credits
ffmpeg -i input.mp4 -vf "drawtext=text='Credits Here':fontcolor=white:fontsize=36:x=(w-text_w)/2:y=h-t*50" output.mp4

# Add text with background box
ffmpeg -i input.mp4 -vf "drawbox=y=0:color=black@0.5:width=iw:height=100:t=fill,drawtext=text='Title':fontcolor=white:fontsize=48:x=(w-text_w)/2:y=25" output.mp4
```

### Audio Operations
```bash
# Add background music to video (ducked)
ffmpeg -i video.mp4 -i music.mp3 -filter_complex "[1:a]volume=0.3[bg];[0:a][bg]amix=inputs=2:duration=first" -c:v copy output.mp4

# Loop audio to match video length
ffmpeg -i video.mp4 -stream_loop -1 -i audio.mp3 -shortest -c:v copy -c:a aac output.mp4

# Create audio-only video (black screen + audio)
ffmpeg -f lavfi -i "color=c=black:s=1920x1080:r=30" -i audio.mp3 -shortest -c:v libx264 -c:a copy output.mp4
```

### Transitions
```bash
# Crossfade between two videos
ffmpeg -i video1.mp4 -i video2.mp4 -filter_complex "xfade=transition=fade:duration=1:offset=4" output.mp4

# Fade in from black
ffmpeg -i input.mp4 -vf "fade=in:0:30" output.mp4

# Fade out to black
ffmpeg -i input.mp4 -vf "fade=out:st=55:d=5" output.mp4
```

### Concatenating Videos
```bash
# Create file list
echo "file 'video1.mp4'" > list.txt
echo "file 'video2.mp4'" >> list.txt

# Concatenate
ffmpeg -f concat -i list.txt -c copy output.mp4
```

### YouTube Optimized Export
```bash
# 1080p optimized for YouTube
ffmpeg -i input.mp4 -c:v libx264 -preset slow -crf 18 -c:a aac -b:a 192k -pix_fmt yuv420p -movflags +faststart output.mp4

# 4K optimized
ffmpeg -i input.mp4 -c:v libx264 -preset slow -crf 18 -c:a aac -b:a 320k -pix_fmt yuv420p -movflags +faststart output.mp4
```

### Kids Content Specific
```bash
# Create 1-hour lofi video (looping image + audio)
ffmpeg -stream_loop -1 -i lofi_image.jpg -stream_loop -1 -i lofi_music.mp3 -c:v libx264 -t 3600 -pix_fmt yuv420p -vf "fps=30,format=yuv420p" lofi_1hour.mp4

# Create 10-hour sleep video (black screen + rain audio)
ffmpeg -f lavfi -i "color=c=black:s=1920x1080:r=1" -stream_loop -1 -i rain.mp3 -t 36000 -c:v libx264 -crf 28 -c:a copy -pix_fmt yuv420p sleep_10hours.mp4

# Create kids story video (images + narration + bg music)
ffmpeg -framerate 1/10 -i story_page_%03d.jpg -i narration.mp3 -i bg_music.mp3 -filter_complex "[1:a][2:a]amix=inputs=2:duration=first[audio]" -map 0:v -map "[audio]" -c:v libx264 -r 30 -pix_fmt yuv420p -shortest story.mp4
```

---

## 4. Free Tool Recommendations with Cost Analysis

### Image Generation
| Tool | Free Tier | Paid Cost | Why Paid? | Recommendation |
|------|-----------|-----------|-----------|----------------|
| **Leonardo.ai** | 150 tokens/day | $10-30/mo | Faster, more tokens | FREE tier sufficient |
| **Bing Image Creator** | Unlimited (slow) | N/A | Powered by DALL-E 3 | Use FREE |
| **Canva AI** | Limited | $12.99/mo | More features | FREE tier sufficient |
| **Midjourney** | None | $10/mo | Best quality | Not needed |

**VERDICT:** Use Bing Image Creator (free) + Canva free tier

### Music/Audio
| Tool | Free Tier | Paid Cost | Why Paid? | Recommendation |
|------|-----------|-----------|-----------|----------------|
| **YouTube Audio Library** | Unlimited | Free | 100% free, safe for YT | Use FREE |
| **Udio** | 600 credits/mo | $10/mo | More credits, commercial | FREE tier sufficient |
| **Suno** | 50 credits/day | $10/mo | More credits | FREE tier sufficient |
| **Epidemic Sound** | None | $15/mo | Huge library | Not needed |

**VERDICT:** YouTube Audio Library (100% free) + Udio/Suno free tiers for custom music

### Video Editing
| Tool | Free Tier | Paid Cost | Why Paid? | Recommendation |
|------|-----------|-----------|-----------|----------------|
| **FFmpeg** | Unlimited | Free | Command line | Use FREE |
| **CapCut** | Unlimited | $7.99/mo | Effects, no watermark | FREE tier sufficient |
| **DaVinci Resolve** | Full features | $295 one-time | Advanced color | FREE tier sufficient |
| **Canva Video** | Limited | $12.99/mo | More templates | FREE for simple edits |

**VERDICT:** FFmpeg for automation + CapCut free for manual edits

### Thumbnail Creation
| Tool | Free Tier | Paid Cost | Why Paid? | Recommendation |
|------|-----------|-----------|-----------|----------------|
| **Canva** | Full features | $12.99/mo | More templates | FREE tier sufficient |
| **Photopea** | Unlimited | Free | Photoshop alternative | Use FREE |
| **GIMP** | Unlimited | Free | Full image editor | Use FREE |

**VERDICT:** Canva free tier is perfect for thumbnails

### Voice/TTS
| Tool | Free Tier | Paid Cost | Why Paid? | Recommendation |
|------|-----------|-----------|-----------|----------------|
| **Kimi K2.5** | Available | N/A | Script writing, descriptions | Use FREE |
| **TTS MP3** | Limited | $10/mo | More voices | FREE tier sufficient |
| **ElevenLabs** | 10k chars/mo | $5/mo | Best quality voices | FREE for testing |
| **Google TTS** | Limited | Pay per use | Natural voices | FREE tier sufficient |

**VERDICT:** Start with free TTS tools, upgrade to ElevenLabs only if needed

### Screen Recording
| Tool | Free Tier | Paid Cost | Why Paid? | Recommendation |
|------|-----------|-----------|-----------|----------------|
| **OBS Studio** | Full features | Free | Professional quality | Use FREE |
| **ShareX** | Full features | Free | Great for quick clips | Use FREE |

**VERDICT:** OBS Studio (completely free)

### TOTAL MONTHLY COST IF USING FREE TIERS: **$0**

### What You'd Pay for Premium:
- Midjourney: $10/mo
- ElevenLabs: $5/mo
- Epidemic Sound: $15/mo
- Canva Pro: $13/mo
- **Total: ~$43/mo**

**RECOMMENDATION:** Start with ALL free tools. Only upgrade when:
1. You're making consistent revenue
2. Free tier limits are blocking production
3. Quality improvement justifies the cost

---

## 5. First Video Script - Ready to Produce

### "Learn Shapes with Cute Animals! 🟡🔺🟦"
**Channel:** Kids Education
**Duration:** 4 minutes
**Style:** Simple, colorful, educational

---

#### FULL SCRIPT

**[0:00-0:10] OPENING JINGLE**
- Visual: Colorful title card with bouncing shapes
- Text: "Learn Shapes with Cute Animals!"
- Audio: Upbeat 5-second jingle, "Let's learn shapes!"

**[0:10-0:30] INTRODUCTION**
- Visual: Friendly cartoon host (bear character) waves
- Host: "Hi friends! I'm Benny the Bear! Today we're going to learn about SHAPES! Are you ready? Let's go!"
- Audio: Cheerful background music begins

**[0:30-1:00] CIRCLE**
- Visual: Big yellow circle appears
- Text overlay: "CIRCLE"
- Host: "This is a CIRCLE! It's round like a..."
- Visual: Show real circle objects appearing:
  - Orange (0:38)
  - Cookie (0:42)
  - Ball (0:46)
  - Sun (0:50)
- Host: "Circle! Can you say circle? C-I-R-C-L-E!"
- Audio: "Circle!" sound effect, cheerful ding

**[1:00-1:30] SQUARE**
- Visual: Red square appears
- Text overlay: "SQUARE"
- Host: "Now we have a SQUARE! It has four equal sides!"
- Visual: Show real square objects:
  - Present box (1:08)
  - Window (1:12)
  - Cracker (1:16)
  - Dice (1:20)
- Host: "Square! Four sides, all the same! S-Q-U-A-R-E!"
- Audio: "Square!" sound effect

**[1:30-2:00] TRIANGLE**
- Visual: Blue triangle appears
- Text overlay: "TRIANGLE"
- Host: "Look at this TRIANGLE! It has three sides and three corners!"
- Visual: Show real triangle objects:
  - Pizza slice (1:38)
  - Mountain (1:42)
  - Tent (1:46)
  - Party hat (1:50)
- Host: "Triangle! One, two, three sides! T-R-I-A-N-G-L-E!"
- Audio: "Triangle!" sound effect

**[2:00-2:30] RECTANGLE**
- Visual: Green rectangle appears
- Text overlay: "RECTANGLE"
- Host: "This is a RECTANGLE! Like a square but longer!"
- Visual: Show real rectangle objects:
  - Door (2:08)
  - Book (2:12)
  - Phone (2:16)
  - Chocolate bar (2:20)
- Host: "Rectangle! Two long sides, two short sides! R-E-C-T-A-N-G-L-E!"
- Audio: "Rectangle!" sound effect

**[2:30-3:00] REVIEW GAME - "Find the Shape!"**
- Visual: Four shapes appear on screen
- Host: "Now let's play Find the Shape! Point to the CIRCLE!"
- Visual: Circle highlights/bounces
- Host: "Yes! Now find the SQUARE!"
- Visual: Square highlights
- Host: "Great job! Where's the TRIANGLE?"
- Visual: Triangle highlights
- Host: "Perfect! And the RECTANGLE?"
- Visual: Rectangle highlights
- Host: "You're so smart!"
- Audio: Applause sound, happy music

**[3:00-3:30] SHAPE SONG**
- Visual: All four shapes dance together with animal friends
- Lyrics on screen:
  "Circle, square, triangle, rectangle
   Shapes are everywhere!
   Circle, square, triangle, rectangle
   Shapes are fun to share!"
- Audio: Catchy shape song with music

**[3:30-3:45] OUTRO**
- Visual: Benny the Bear waves goodbye
- Host: "Thanks for learning shapes with me! Don't forget to like and subscribe for more fun! Bye friends!"
- Visual: Subscribe button animation, end screen with suggested videos
- Audio: Outro jingle fades out

---

#### ASSETS NEEDED

**Visuals to Create:**
1. Title card (1920x1080) - Colorful with bouncing shapes
2. Benny the Bear character - Friendly cartoon bear
3. Shape graphics - Circle (yellow), Square (red), Triangle (blue), Rectangle (green)
4. Real object images (16 total):
   - Circle: orange, cookie, ball, sun
   - Square: present, window, cracker, dice
   - Triangle: pizza, mountain, tent, party hat
   - Rectangle: door, book, phone, chocolate
5. End screen template

**Audio to Source:**
1. Opening jingle (5 sec) - YouTube Audio Library
2. Background music (upbeat, kid-friendly) - YouTube Audio Library
3. Sound effects (ding, applause) - Free SFX
4. Shape song - Create with Udio free tier OR use royalty-free kids music
5. Outro jingle - YouTube Audio Library

**Voiceover:**
- Record yourself OR use free TTS
- Script provided above

---

#### PRODUCTION CHECKLIST

- [ ] Generate all image descriptions with Kimi
- [ ] Create/obtain all visual assets
- [ ] Record/source all audio
- [ ] Record voiceover
- [ ] Assemble video with FFmpeg
- [ ] Create thumbnail in Canva
- [ ] Write video description
- [ ] Upload to YouTube

---

## Quick Start Commands

```bash
# Navigate to project folder
cd /workspace/projects/youtube-empire/video-production

# Create assets folder structure
mkdir -p assets/{images,audio,fonts,output}

# Create first video (after assets ready)
ffmpeg -framerate 1/5 -i assets/images/shape_%03d.jpg \
       -i assets/audio/background_music.mp3 \
       -i assets/audio/voiceover.mp3 \
       -filter_complex "[1:a][2:a]amix=inputs=2:duration=first[audio]" \
       -map 0:v -map "[audio]" \
       -c:v libx264 -r 30 -pix_fmt yuv420p \
       -shortest assets/output/learn_shapes.mp4
```

---

*Generated by Video Producer Agent for YouTube Empire Project*
