# First Video Script - Ready to Produce

## "Learn Shapes with Cute Animals! 🟡🔺🟦"

**Channel:** Kids Education  
**Duration:** 4 minutes  
**Target Audience:** Ages 2-5  
**Style:** Simple, colorful, educational, engaging  
**Production Cost:** $0 (using free tools)

---

## FULL VIDEO SCRIPT

### [0:00-0:10] OPENING JINGLE

**Visual:**
- Colorful animated title card
- Background: Gradient of rainbow colors
- Bouncing shapes (circle, square, triangle, rectangle) enter from sides
- Title text: "Learn Shapes with Cute Animals!" in fun, rounded font
- Cute animal characters peek from corners (bear, rabbit, bird, cat)

**Audio:**
- Upbeat 5-second jingle
- Sound effect: "Let's learn shapes!" (child voice or friendly character)
- Music: Cheerful xylophone melody

**FFmpeg Note:**
```bash
# Create title card with bouncing animation
ffmpeg -loop 1 -i title_card.jpg -i intro_jingle.mp3 -t 10 \
       -vf "zoompan=z='min(zoom+0.0015,1.5)':d=300:s=1920x1080" \
       -c:v libx264 -pix_fmt yuv420p -shortest intro.mp4
```

---

### [0:10-0:30] INTRODUCTION

**Visual:**
- Scene transitions to friendly cartoon host
- Character: Benny the Bear (brown bear, big smile, wearing colorful scarf)
- Background: Sunny meadow with flowers
- Benny waves at camera

**On-Screen Text:** "Hi Friends!"

**Voiceover Script:**
> "Hi friends! I'm Benny the Bear! Today we're going to learn about SHAPES! Are you ready? Let's go!"

**Audio:**
- Cheerful background music begins (soft, not overwhelming)
- Sound effect: Magical chime when Benny appears

**Assets Needed:**
- [ ] Benny the Bear character image (1920x1080)
- [ ] Meadow background
- [ ] Voiceover recording (or TTS)

---

### [0:30-1:00] CIRCLE

**Visual:**
- Big yellow circle appears center screen with bounce animation
- Text overlay: "CIRCLE" (large, yellow, rounded font)
- Circle has a friendly smiley face

**Voiceover Script:**
> "This is a CIRCLE! It's round like a..."

**Visual Transitions (each appears for 3 seconds):**
1. **0:38** - Orange (real photo with white background)
2. **0:42** - Cookie (chocolate chip cookie)
3. **0:46** - Ball (colorful beach ball)
4. **0:50** - Sun (cartoon sun with sunglasses)

**Voiceover Script:**
> "Circle! Can you say circle? C-I-R-C-L-E! Circle!"

**On-Screen Text:** "C-I-R-C-L-E" appears as letters are spoken

**Audio:**
- "Circle!" sound effect (cheerful ding)
- Background music continues

**Assets Needed:**
- [ ] Yellow circle graphic with face
- [ ] Orange photo
- [ ] Cookie photo
- [ ] Beach ball photo
- [ ] Cartoon sun image

---

### [1:00-1:30] SQUARE

**Visual:**
- Red square appears with rotation animation
- Text overlay: "SQUARE" (red, blocky font)
- Square has a friendly face

**Voiceover Script:**
> "Now we have a SQUARE! It has four equal sides! One, two, three, four!"

**Visual Transitions (each for 3 seconds):**
1. **1:08** - Present box (wrapped gift with ribbon)
2. **1:12** - Window (cartoon house window)
3. **1:16** - Cracker (saltine cracker)
4. **1:20** - Dice (red die showing 6)

**Voiceover Script:**
> "Square! Four sides, all the same! S-Q-U-A-R-E! Square!"

**On-Screen Text:** "S-Q-U-A-R-E" with highlighting

**Audio:**
- "Square!" sound effect

**Assets Needed:**
- [ ] Red square graphic
- [ ] Present box photo
- [ ] Window illustration
- [ ] Cracker photo
- [ ] Dice photo

---

### [1:30-2:00] TRIANGLE

**Visual:**
- Blue triangle appears with slide-in animation
- Text overlay: "TRIANGLE" (blue, pointed font)
- Triangle has a friendly face

**Voiceover Script:**
> "Look at this TRIANGLE! It has three sides and three corners! One, two, three!"

**Visual Transitions (each for 3 seconds):**
1. **1:38** - Pizza slice (pepperoni pizza)
2. **1:42** - Mountain (cartoon mountain with snow)
3. **1:46** - Tent (camping tent)
4. **1:50** - Party hat (colorful birthday hat)

**Voiceover Script:**
> "Triangle! One, two, three sides! T-R-I-A-N-G-L-E! Triangle!"

**On-Screen Text:** "T-R-I-A-N-G-L-E"

**Audio:**
- "Triangle!" sound effect

**Assets Needed:**
- [ ] Blue triangle graphic
- [ ] Pizza slice photo
- [ ] Mountain illustration
- [ ] Tent photo
- [ ] Party hat photo

---

### [2:00-2:30] RECTANGLE

**Visual:**
- Green rectangle appears with grow animation
- Text overlay: "RECTANGLE" (green font)
- Rectangle has a friendly face

**Voiceover Script:**
> "This is a RECTANGLE! Like a square but longer! Two long sides and two short sides!"

**Visual Transitions (each for 3 seconds):**
1. **2:08** - Door (wooden door with handle)
2. **2:12** - Book (colorful children's book)
3. **2:16** - Phone (smartphone)
4. **2:20** - Chocolate bar (unwrapped chocolate)

**Voiceover Script:**
> "Rectangle! Two long sides, two short sides! R-E-C-T-A-N-G-L-E! Rectangle!"

**On-Screen Text:** "R-E-C-T-A-N-G-L-E"

**Audio:**
- "Rectangle!" sound effect

**Assets Needed:**
- [ ] Green rectangle graphic
- [ ] Door photo
- [ ] Book photo
- [ ] Phone photo
- [ ] Chocolate bar photo

---

### [2:30-3:00] REVIEW GAME - "Find the Shape!"

**Visual:**
- All four shapes appear on screen in a grid:
  ```
  [CIRCLE]    [SQUARE]
  [TRIANGLE]  [RECTANGLE]
  ```
- Benny the Bear appears in corner
- Background: Fun game show style with stars

**Voiceover Script:**
> "Now let's play Find the Shape! Point to the CIRCLE!"

**Visual:**
- Yellow circle bounces/highlighted
- Confetti animation

**Voiceover Script:**
> "Yes! Great job! Now find the SQUARE!"

**Visual:**
- Red square bounces/highlighted

**Voiceover Script:**
> "Excellent! Where's the TRIANGLE?"

**Visual:**
- Blue triangle bounces/highlighted

**Voiceover Script:**
> "Perfect! And the RECTANGLE?"

**Visual:**
- Green rectangle bounces/highlighted

**Voiceover Script:**
> "You're so smart! You know all your shapes!"

**Audio:**
- Applause sound effect
- Cheerful victory music
- "Ding!" for each correct answer

**Assets Needed:**
- [ ] Game screen layout with all shapes
- [ ] Highlight/bounce animation frames
- [ ] Confetti overlay
- [ ] Applause SFX

---

### [3:00-3:30] SHAPE SONG

**Visual:**
- All four shapes dance together in center
- Animal friends join the dance (bear, rabbit, bird, cat)
- Background: Colorful disco lights effect
- Lyrics appear at bottom of screen

**Lyrics:**
```
🎵 Circle, square, triangle, rectangle
   Shapes are everywhere!
   Circle, square, triangle, rectangle
   Shapes are fun to share! 🎵
```

**Animation:**
- Shapes bounce to the beat
- Animals do simple dance moves
- Colorful background changes with music

**Audio:**
- Catchy shape song (create with Udio free or use royalty-free kids music)
- Instrumental: Ukulele, drums, xylophone

**FFmpeg Note:**
```bash
# Loop animation to match song length
ffmpeg -stream_loop -1 -i dancing_shapes_%03d.jpg -i shape_song.mp3 \
       -shortest -c:v libx264 -r 30 -pix_fmt yuv420p shape_song_segment.mp4
```

**Assets Needed:**
- [ ] Dancing shapes animation frames (or simple bounce)
- [ ] Dancing animal characters
- [ ] Shape song audio file
- [ ] Lyrics text overlay

---

### [3:30-3:45] OUTRO

**Visual:**
- Benny the Bear waves goodbye from center screen
- Background: Sunset meadow (warm colors)
- "Thanks for watching!" text appears
- Subscribe button animation (YouTube style)
- Thumbnails of suggested videos appear

**Voiceover Script:**
> "Thanks for learning shapes with me! Don't forget to like and subscribe for more fun! Bye friends!"

**Visual:**
- Benny waves
- Shapes float by in background
- End screen with:
  - Subscribe button
  - 2 suggested video placeholders
  - Channel logo

**Audio:**
- Outro jingle (5 seconds)
- Fade out music

**Assets Needed:**
- [ ] Benny waving goodbye
- [ ] Sunset background
- [ ] End screen template
- [ ] Outro jingle

---

## COMPLETE ASSETS CHECKLIST

### Visual Assets (Images - 1920x1080)

**Characters:**
- [ ] Benny the Bear - standing/waving
- [ ] Benny the Bear - talking pose
- [ ] Benny the Bear - goodbye wave

**Shapes (with faces):**
- [ ] Yellow circle with smiley face
- [ ] Red square with smiley face
- [ ] Blue triangle with smiley face
- [ ] Green rectangle with smiley face

**Backgrounds:**
- [ ] Rainbow gradient (title)
- [ ] Sunny meadow
- [ ] Game show style with stars
- [ ] Disco/dance floor
- [ ] Sunset meadow

**Real Object Photos (white background preferred):**
- [ ] Orange
- [ ] Chocolate chip cookie
- [ ] Beach ball
- [ ] Cartoon sun
- [ ] Gift box/present
- [ ] House window
- [ ] Saltine cracker
- [ ] Red die
- [ ] Pizza slice
- [ ] Mountain
- [ ] Camping tent
- [ ] Party hat
- [ ] Wooden door
- [ ] Children's book
- [ ] Smartphone
- [ ] Chocolate bar

**UI Elements:**
- [ ] Title card template
- [ ] Text overlay templates
- [ ] End screen template
- [ ] Subscribe button graphic

### Audio Assets

**Music:**
- [ ] Intro jingle (5 sec, upbeat xylophone)
- [ ] Background music (4 min, cheerful, kid-friendly)
- [ ] Shape song (30 sec, catchy, instrumental + lyrics)
- [ ] Outro jingle (5 sec)

**Sound Effects:**
- [ ] "Let's learn shapes!" voice
- [ ] Magical chime (character appearance)
- [ ] "Circle!" ding
- [ ] "Square!" ding
- [ ] "Triangle!" ding
- [ ] "Rectangle!" ding
- [ ] Applause/cheering
- [ ] Correct answer "ding"

**Voiceover:**
- [ ] Full script recording (or TTS)

**Sources:**
- Music: YouTube Audio Library, Udio free tier, Suno free tier
- SFX: Freesound.org, YouTube Audio Library
- Voice: Record yourself OR Google TTS free OR ElevenLabs free tier

---

## PRODUCTION STEPS

### Step 1: Generate Image Descriptions with Kimi
Ask Kimi to generate detailed descriptions for each asset:
```
"Generate a detailed image description for: A friendly cartoon bear character 
named Benny, brown fur, big smile, wearing a colorful rainbow scarf, 
standing pose, children's book illustration style, transparent background"
```

### Step 2: Create Visual Assets
- Use Bing Image Creator for illustrations
- Use Pexels/Unsplash for real object photos
- Use Canva free for backgrounds and UI elements

### Step 3: Record/Generate Audio
- Record voiceover OR use TTS
- Download music from YouTube Audio Library
- Find SFX on Freesound

### Step 4: Assemble with FFmpeg
Use the script library commands:
```bash
source ./ffmpeg_library.sh

# Create each segment
create_education_video ./slides/ voiceover.mp3 background_music.mp4 segment1.mp4

# Add titles
add_title_box segment1.mp4 "CIRCLE" segment1_titled.mp4

# Concatenate all segments
create_concat_list ./segments/ list.txt
concat_videos list.txt final_video.mp4

# Export for YouTube
export_youtube_1080p final_video.mp4 "Learn Shapes with Cute Animals.mp4"
```

### Step 5: Create Thumbnail
- Use Canva free
- Template: 1280x720
- Elements: Benny, colorful shapes, bright background
- Text: "Learn Shapes! 🟡🔺"

### Step 6: Upload to YouTube
- Title: "Learn Shapes with Cute Animals! 🟡🔺🟦 | Fun Educational Video for Kids"
- Description: Use Kimi to generate SEO-optimized description
- Tags: kids education, learn shapes, preschool, toddler learning, shapes for kids
- Category: Education
- Audience: Made for kids

---

## ESTIMATED PRODUCTION TIME

| Task | Time |
|------|------|
| Generate image descriptions (Kimi) | 30 min |
| Create visual assets | 2-3 hours |
| Record/generate audio | 1 hour |
| Assemble with FFmpeg | 1 hour |
| Create thumbnail | 30 min |
| Upload & optimize | 30 min |
| **TOTAL** | **5-6 hours** |

---

## NEXT VIDEOS IN SERIES

1. **"Counting 1 to 10 with Cute Animals! 🔢"** (use same characters)
2. **"Learn Colors with Rainbow Friends! 🌈"** (extend the brand)
3. **"ABC Adventure with Benny the Bear! 🔤"** (alphabet series)
4. **"Opposite Words for Kids! 👆👇"** (big/small, hot/cold)

**Strategy:** Reuse Benny character and visual style to build brand recognition!

---

*Script ready for production. Estimated cost: $0 using free tools.*
