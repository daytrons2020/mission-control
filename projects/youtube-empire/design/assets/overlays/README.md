# Video Overlay Templates

## Lower Thirds

### Specifications
- **Size:** 1920 x 1080 pixels
- **Format:** PNG with transparency
- **Safe Zone:** Bottom 200 pixels

---

## 1. Kids Education - Lower Third

### Design
```
+----------------------------------------------------------+
|                                                          |
|                                                          |
|                                                          |
|   +----------------------------------------------+       |
|   | [Icon]  Topic Title                    [Num] |       |
|   |        Subtitle / Episode Info               |       |
|   +----------------------------------------------+       |
+----------------------------------------------------------+
```

### Elements
- **Shape:** Rounded rectangle
- **Color:** Gradient #FFD93D to #4ECDC4
- **Icon:** Small character or topic icon (left)
- **Title:** Fredoka One, white
- **Subtitle:** Nunito, white
- **Episode:** Badge on right

### Animation Style
- Bouncy entrance
- Slight wiggle on appear
- Playful, energetic

### Canva Creation
1. Size: 1920 x 1080
2. Add rounded rectangle: 800 x 150px
3. Position: Bottom center
4. Add text layers
5. Download PNG (transparent background)

---

## 2. Lofi Music - Lower Third

### Design
```
+----------------------------------------------------------+
|                                                          |
|                                                          |
|                                                          |
|   +--------------------------------------------------+   |
|   |  [Vinyl icon]  Track Name - Artist               |   |
|   |                Album / Playlist                  |   |
|   +--------------------------------------------------+   |
+----------------------------------------------------------+
```

### Elements
- **Shape:** Thin line or minimal bar
- **Color:** #D4A5A5 with transparency
- **Icon:** Small vinyl or music note
- **Font:** Josefin Sans
- **Style:** Minimal, unobtrusive

### Animation Style
- Fade in smoothly
- Slide from left
- Subtle, doesn't distract

---

## 3. Ambient Sleep - Lower Third

### Design
```
+----------------------------------------------------------+
|                                                          |
|                                                          |
|                                                          |
|        Sleep Sounds - Forest Night                     |
|        8 Hours • No Ads • Deep Sleep                   |
+----------------------------------------------------------+
```

### Elements
- **Shape:** None or very subtle glow
- **Color:** #A8A4CE at 30% opacity
- **Text:** Minimal, small
- **Font:** Cormorant Garamond Light

### Animation Style
- Very slow fade
- Barely noticeable
- Non-intrusive

---

## 4. Kids Stories - Lower Third

### Design
```
+----------------------------------------------------------+
|                                                          |
|                                                          |
|                                                          |
|   +----------------------------------------------+       |
|   |  Chapter 3: The Adventure Begins               |       |
|   |  [Decorative book icon]                        |       |
|   +----------------------------------------------+       |
+----------------------------------------------------------+
```

### Elements
- **Shape:** Storybook banner style
- **Color:** #FDF6E3 with #5D4E37 border
- **Decorative:** Book corners, page edges
- **Font:** Amatic SC for title, Poppins for info

### Animation Style
- Page turn effect
- Gentle slide
- Storybook feel

---

# End Screen Templates

## YouTube End Screen Specifications
- **Size:** 1920 x 1080
- **Elements:** Must match YouTube's clickable areas
- **Format:** JPG or PNG

## YouTube End Screen Elements (Fixed Positions)

```
+----------------------------------------------------------+
|                                                          |
|   +------------------+      +------------------+        |
|   |                  |      |                  |        |
|   |   VIDEO 1        |      |   VIDEO 2        |        |
|   |   (510x288)      |      |   (510x288)      |        |
|   |                  |      |                  |        |
|   +------------------+      +------------------+        |
|                                                          |
|                    [SUBSCRIBE]                           |
|                    (circle area)                         |
|                                                          |
+----------------------------------------------------------+
```

---

## 1. Kids Education - End Screen

### Design Elements
- **Background:** Bright gradient matching channel
- **Video Boxes:** Rounded corners, colorful borders
- **Subscribe:** Large, bouncy button design
- **Text:** "Watch More!" and "Subscribe for Fun!"

### Canva Template
1. Size: 1920 x 1080
2. Add two 510x288 rectangles for videos
3. Mark subscribe circle area (center bottom)
4. Add playful decorations
5. Export as template

---

## 2. Lofi Music - End Screen

### Design Elements
- **Background:** Matching lo-fi aesthetic
- **Video Boxes:** Minimal, clean borders
- **Subscribe:** Vinyl record or simple circle
- **Text:** "More Mixes" and "Stay Lo-Fi"

---

## 3. Ambient Sleep - End Screen

### Design Elements
- **Background:** Dark, starry
- **Video Boxes:** Subtle, barely visible borders
- **Subscribe:** Moon or star icon
- **Text:** Minimal or none

---

## 4. Kids Stories - End Screen

### Design Elements
- **Background:** Storybook page texture
- **Video Boxes:** Book frame style
- **Subscribe:** Magic wand or book icon
- **Text:** "More Stories" and "Join the Adventure"

---

# Creating Overlays in Inkscape (Free)

## Lower Third Steps

1. **Open Inkscape**
2. **Set Canvas:** 1920 x 1080
3. **Create Shape:**
   - Rectangle tool
   - Rounded corners
   - Size: 800 x 120px
4. **Add Color:**
   - Fill: Channel primary color
   - Opacity: 90%
5. **Add Text:**
   - Text tool
   - Position on shape
6. **Export:**
   - File → Export PNG
   - Select area: Full page
   - Transparent background

## End Screen Steps

1. **Set Canvas:** 1920 x 1080
2. **Add Guidelines:**
   - Video 1: Position at YouTube spec
   - Video 2: Position at YouTube spec
   - Subscribe: Center bottom
3. **Create Template:**
   - Add placeholder boxes
   - Style with channel colors
4. **Export:**
   - Save as template
   - Use for all videos

---

# File Organization

```
overlays/
├── lower-thirds/
│   ├── kids-edu-lower-third.png
│   ├── lofi-lower-third.png
│   ├── sleep-lower-third.png
│   └── stories-lower-third.png
├── end-screens/
│   ├── kids-edu-end-screen.jpg
│   ├── lofi-end-screen.jpg
│   ├── sleep-end-screen.jpg
│   └── stories-end-screen.jpg
└── subscribe-buttons/
    ├── kids-edu-subscribe.png
    ├── lofi-subscribe.png
    ├── sleep-subscribe.png
    └── stories-subscribe.png
```

---

# Usage in Video Editors

## OBS Studio (Free)
1. Add Source → Image
2. Select overlay PNG
3. Position at bottom
4. Set blend mode if needed

## DaVinci Resolve (Free)
1. Import overlay to timeline
2. Place on video track above
3. Adjust position
4. Add fade in/out

## Shortcut (Free)
1. Open video
2. Filters → Overlay
3. Add image overlay
4. Position and size
