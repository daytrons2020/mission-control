# YouTube Empire - Voice & Narration Guide

## Executive Summary

This guide provides complete voice production standards for three YouTube channels. **Edge TTS (Microsoft Azure)** is our primary TTS solution - free, high-quality, and professional-grade.

---

## 1. Voice Style Guide by Channel

### 1.1 Kids Education Channel
**Target Audience:** Ages 4-10, parents, educators

**Voice Characteristics:**
- **Tone:** Friendly, energetic, encouraging
- **Pace:** Moderate-slow (140-160 WPM)
- **Pitch:** Slightly higher, warm
- **Energy:** High enthusiasm without being overwhelming
- **Clarity:** Crystal clear pronunciation, distinct pauses

**Recommended Edge TTS Voices:**
| Voice | Gender | Best For |
|-------|--------|----------|
| `en-US-EmmaNeural` | Female | Primary narrator - cheerful, clear |
| `en-US-AvaNeural` | Female | Alternative - expressive, caring |
| `en-US-AndrewNeural` | Male | Male topics - warm, confident |
| `en-US-BrianNeural` | Male | Casual topics - approachable |

**Script Markers:**
- `[PAUSE]` - 1-second pause for emphasis
- `[SLOW]` - Slow down for important concepts
- `[EXCITED]` - Increase energy level
- `[WARM]` - Softer, nurturing tone

**Example Opening:**
```
Hey there, young explorers! [PAUSE] Welcome back to our amazing world of discovery! 
Today, we're going on a journey to learn about... [EXCITED] DINOSAURS! 
Are you ready? Let's dive in!
```

---

### 1.2 Kids Stories Channel
**Target Audience:** Ages 3-8, bedtime listening

**Voice Characteristics:**
- **Tone:** Warm, storyteller, soothing
- **Pace:** Slow and measured (120-140 WPM)
- **Pitch:** Soft, gentle
- **Energy:** Calm, expressive during dialogue
- **Emotion:** Rich emotional range for characters

**Recommended Edge TTS Voices:**
| Voice | Gender | Best For |
|-------|--------|----------|
| `en-US-JennyNeural` | Female | Primary storyteller - friendly, comforting |
| `en-US-MichelleNeural` | Female | Gentle stories - pleasant, warm |
| `en-US-SteffanNeural` | Male | Male storyteller - rational, calm |

**Character Voice Differentiation:**
Since Edge TTS has limited voice cloning, use these techniques:
- **Narrator:** Base voice, steady pace
- **Character 1:** Slightly faster + higher pitch (post-processing)
- **Character 2:** Slightly slower + lower pitch (post-processing)
- **Whispered text:** Reduce volume 30% in post

**Script Markers:**
- `[WHISPER]` - Soft, intimate delivery
- `[SIGH]` - Emotional moment
- `[GIGGLE]` - Light laughter in voice
- `[PAUSE 2s]` - Longer pause for effect

**Example Opening:**
```
Once upon a time, [PAUSE] in a land far, far away... [WARM] there lived a little 
fox who was feeling a bit lonely. [PAUSE 2s] But little did she know, 
an adventure was about to begin...
```

---

### 1.3 Lofi/Ambient Channel
**Target Audience:** Ages 16-35, study/focus/relaxation

**Voice Characteristics:**
- **Tone:** Minimal, ambient, optional
- **Pace:** Very slow when used (100-120 WPM)
- **Usage:** Sparingly - 10-20% of content has voice
- **Style:** ASMR-like, whispered or soft-spoken

**Recommended Edge TTS Voices:**
| Voice | Gender | Best For |
|-------|--------|----------|
| `en-US-JennyNeural` | Female | Soft intros - reduce volume 50% |
| `en-US-SteffanNeural` | Male | Calm male voice - reduce volume 50% |
| `en-GB-SoniaNeural` | Female | British accent for variety |

**Usage Guidelines:**
- Maximum 30 seconds of voice per 10-minute track
- Place voice at beginning or natural transitions
- Heavy reverb and EQ (low-pass filter) recommended
- Consider NO voice for pure ambient tracks

**Script Markers:**
- `[AMBIENT]` - Blend into background
- `[FADE]` - Gradual volume reduction
- `[REVERB]` - Add spatial effect

**Example Opening:**
```
[AMBIENT] Welcome to a peaceful moment... [FADE] just for you. 
[PAUSE 3s] [REVERB] Let the music carry you away...
```

---

## 2. Script Templates Optimized for TTS

### 2.1 Kids Education Template

```markdown
# [TOPIC] - Learning Adventure

## Opening Hook (15-20 seconds)
"Hey [young explorers/scientists/artists]! Welcome back to [CHANNEL NAME]! 
Today, we're going to discover something AMAZING about [TOPIC]. 
Are you ready? Let's go!"

## Main Content Structure

### Section 1: Introduction (30-45 seconds)
- What is [TOPIC]?
- Why is it interesting?
- Hook question

### Section 2: Core Concepts (2-3 minutes)
- Break into 3-4 key points
- Each point: 30-45 seconds
- Use analogies kids understand
- Include "Did you know?" facts

### Section 3: Fun Examples (1-2 minutes)
- Real-world connections
- Interactive questions
- "Can you think of...?"

### Section 4: Summary (30 seconds)
- Recap 3 main points
- Call to action

## Closing (15-20 seconds)
"Thanks for learning with me today! If you loved this video, 
hit that like button and subscribe for more adventures! 
See you next time, bye!"

## TTS Optimization Notes
- [PAUSE] after questions
- [SLOW] for new vocabulary
- [EXCITED] for fun facts
- Spell out complex words phonetically: "photosynthesis (foe-toe-SIN-theh-sis)"
```

### 2.2 Kids Stories Template

```markdown
# [STORY TITLE] - Bedtime Story

## Opening (20-30 seconds)
"[WARM] Once upon a time... [PAUSE 2s] in a [place] far, far away, 
there lived a [character]. [PAUSE] This [character] was [description], 
but they had one little problem..."

## Story Structure

### Part 1: Setup (1-2 minutes)
- Introduce main character
- Describe their world
- Present the problem/challenge

### Part 2: Journey (3-4 minutes)
- Character meets others
- Challenges encountered
- Lessons learned
- Use dialogue markers: "[Character 1]"

### Part 3: Resolution (1-2 minutes)
- Problem solved
- Character growth
- Happy ending

## Closing (20-30 seconds)
"[WARM] And so, [character] learned that [moral]. [PAUSE 2s] 
The end. [PAUSE] Sleep tight, little ones. Sweet dreams."

## Character Voice Guide
| Character | Voice Modification | Description |
|-----------|-------------------|-------------|
| Narrator | Base voice | Steady, warm |
| Character 1 | +5% speed, +5% pitch | Energetic |
| Character 2 | -5% speed, -5% pitch | Calm, wise |
| Animal | +10% pitch | Cute, playful |

## TTS Optimization Notes
- [WHISPER] for secret moments
- [SIGH] for emotional beats
- [PAUSE 2s] for scene transitions
```

### 2.3 Lofi/Ambient Template

```markdown
# [MOOD] - Lofi Track

## Optional Voice Elements

### Intro (10-15 seconds)
"[AMBIENT] [REVERB] [FADE] Welcome to [MOOD]... [PAUSE 3s] 
A space to [relax/study/dream]..."

### Transition (5-10 seconds)
"[AMBIENT] [FADE] Let go... [PAUSE 2s] Breathe..."

### Outro (5-10 seconds)
"[AMBIENT] [FADE] Thank you for listening... [PAUSE 2s]"

## Production Notes
- Voice should be 20-30% of music volume
- Apply reverb: 3-4 second decay
- Low-pass filter: 4-6kHz cutoff
- Compress heavily for consistent level
```

---

## 3. Pronunciation Guides

### 3.1 Medical Terms (Kids Education - Body/Health)

| Term | Phonetic Spelling | Notes |
|------|-------------------|-------|
| Esophagus | ee-SOFF-uh-gus | Break into syllables |
| Diaphragm | DYE-uh-fram | Emphasize first syllable |
| Trachea | TRAY-kee-uh | Common mispronunciation |
| Alveoli | al-VEE-oh-lye | Plural of alveolus |
| Capillary | KAP-ih-lair-ee | Three syllables |
| Neuron | NOOR-on | Not "nyoo-ron" |
| Synapse | SIN-aps | Short first syllable |
| Artery | AR-ter-ee | Not "art-ry" |
| Vein | VAYN | Simple, clear |
| Platelet | PLAYT-let | Blood component |
| Hemoglobin | hee-muh-GLOH-bin | Break clearly |
| Antibody | AN-tih-bod-ee | Immune system |
| Bacteria | bak-TEER-ee-uh | Plural: bacteria |
| Virus | VYE-rus | Not "vee-rus" |
| Vaccine | vak-SEEN | Not "vax-een" |

### 3.2 Scientific Terms

| Term | Phonetic Spelling | Notes |
|------|-------------------|-------|
| Photosynthesis | foe-toh-SIN-theh-sis | Plant process |
| Chlorophyll | KLOR-uh-fill | Green pigment |
| Mitochondria | my-toh-KON-dree-uh | Cell powerhouses |
| Nucleus | NOO-klee-us | Cell center |
| Chromosome | KROH-muh-sohm | DNA structure |
| Ecosystem | EE-koh-sis-tem | Environment |
| Photosphere | FOH-toh-sfeer | Sun's surface |
| Atmosphere | AT-moh-sfeer | Air layer |
| Constellation | kon-steh-LAY-shun | Star pattern |
| Galaxy | GAL-uk-see | Star system |
| Meteor | MEE-tee-or | Space rock |
| Dinosaur | DYE-nuh-sor | Prehistoric |
| Paleontologist | pay-lee-on-TOL-uh-jist | Dinosaur scientist |
| Archaeopteryx | ar-kee-OP-ter-iks | First bird |
| Tyrannosaurus | tie-RAN-oh-SOR-us | T-Rex |

### 3.3 Space Terms

| Term | Phonetic Spelling | Notes |
|------|-------------------|-------|
| Astronaut | AS-truh-not | Space traveler |
| Telescope | TEL-uh-skope | Seeing tool |
| Satellite | SAT-ul-ite | Orbiting object |
| Orbit | OR-bit | Circular path |
| Gravity | GRAV-ih-tee | Pulling force |
| Nebula | NEB-yoo-luh | Cloud in space |
| Supernova | soo-per-NOH-vuh | Exploding star |
| Black Hole | BLAK HOHL | Gravity monster |
| Telescope | TEL-uh-skope | Star viewer |
| Observatory | ub-ZUR-vuh-tor-ee | Stargazing place |

### 3.4 Script Phonetic Format

Use this format in scripts:
```
Today we're learning about mitochondria (my-toh-KON-dree-uh), 
the powerhouse of the cell!
```

---

## 4. Audio Processing Workflow (Audacity)

### 4.1 Recording/Generation Setup

**Edge TTS Command Template:**
```bash
# Kids Education - Emma voice
edge-tts --voice en-US-EmmaNeural --text "Your script here" --write-media output.mp3

# Kids Stories - Jenny voice  
edge-tts --voice en-US-JennyNeural --text "Your story here" --write-media story.mp3

# Lofi - Jenny with low volume base
edge-tts --voice en-US-JennyNeural --text "Welcome..." --write-media lofi_intro.mp3
```

### 4.2 Audacity Processing Chain

**Step 1: Import & Clean**
1. Import TTS audio (File > Import > Audio)
2. Remove long silences (Effect > Truncate Silence)
   - Threshold: -40 dB
   - Action: Truncate
   - Truncate to: 0.5 seconds

**Step 2: Volume & Dynamics**
1. Normalize (Effect > Normalize)
   - Peak amplitude: -3.0 dB
   - Remove DC offset: Yes
2. Compressor (Effect > Compressor)
   - Threshold: -18 dB
   - Noise Floor: -40 dB
   - Ratio: 3:1
   - Attack Time: 0.2s
   - Release Time: 1.0s

**Step 3: EQ by Channel Type**

**Kids Education:**
- High Pass: 80 Hz (remove rumble)
- Boost: 2-4 kHz +3 dB (clarity)
- Light compression for consistency

**Kids Stories:**
- High Pass: 60 Hz
- Boost: 200-400 Hz +2 dB (warmth)
- Cut: 8 kHz -2 dB (softer)

**Lofi/Ambient:**
- Low Pass: 6 kHz (muffled effect)
- High Pass: 200 Hz
- Heavy reverb (see below)

**Step 4: Reverb (Stories & Lofi only)**
- Effect > Reverb
  - Room Size: 70-80 (stories), 90+ (lofi)
  - Damping: 50%
  - Wetness: 20-30% (stories), 40-50% (lofi)

**Step 5: Final Polish**
1. Limiter (Effect > Limiter)
   - Type: Soft Limit
   - Input Gain: 0 dB
   - Limit to: -3 dB
2. Export (File > Export > Export as MP3)
   - Bit Rate: 192 kbps (YouTube standard)
   - Quality: Standard

### 4.3 Batch Processing Script

Create `process_audio.sh`:
```bash
#!/bin/bash
# Process TTS audio for YouTube

INPUT=$1
CHANNEL=$2  # education, stories, lofi
OUTPUT="processed_${INPUT}"

if [ "$CHANNEL" == "education" ]; then
    # Apply education EQ chain
    ffmpeg -i "$INPUT" -af "highpass=f=80, equalizer=f=3000:t=q:w=1:g=3, compressor=threshold=-18dB:ratio=3:attack=200:release=1000, loudnorm=I=-16:TP=-3:LRA=11" "$OUTPUT"
elif [ "$CHANNEL" == "stories" ]; then
    # Apply stories chain with reverb
    ffmpeg -i "$INPUT" -af "highpass=f=60, equalizer=f=300:t=q:w=2:g=2, equalizer=f=8000:t=q:w=1:g=-2, aecho=0.8:0.9:60:0.3, compressor=threshold=-20dB:ratio=2:attack=300:release=1000, loudnorm=I=-16:TP=-3:LRA=11" "$OUTPUT"
elif [ "$CHANNEL" == "lofi" ]; then
    # Apply lofi chain
    ffmpeg -i "$INPUT" -af "highpass=f=200, lowpass=f=6000, aecho=0.6:0.8:100:0.5, volume=0.3, loudnorm=I=-20:TP=-6:LRA=15" "$OUTPUT"
fi

echo "Processed: $OUTPUT"
```

---

## 5. Background Music Integration

### 5.1 Music Sources (Free/Creative Commons)

| Source | License | Best For |
|--------|---------|----------|
| YouTube Audio Library | Free | All channels |
| Free Music Archive | CC-BY | Education |
| Incompetech | CC-BY | Stories |
| Pixabay Music | Free | All channels |
| Mixkit | Free | Lofi |
| Uppbeat | Free tier | Education |

### 5.2 Volume Guidelines

**Kids Education:**
- Voice: -16 LUFS (primary)
- Music: -25 to -28 LUFS (background)
- Music ducking: -6 dB when speaking

**Kids Stories:**
- Voice: -16 LUFS (primary)
- Music: -30 to -35 LUFS (very subtle)
- Fade in/out: 3-5 seconds

**Lofi/Ambient:**
- Music: -14 LUFS (primary)
- Voice: -25 LUFS (if present, very subtle)
- Voice ducking: -12 dB under music

### 5.3 Ducking Setup (Audacity)

1. Import voice track (Track 1)
2. Import music track (Track 2)
3. Select music track
4. Effect > Auto Duck
   - Duck amount: -6 dB (education) / -12 dB (lofi)
   - Outer fade: 0.5s
   - Inner fade: 0.2s
   - Threshold: -30 dB

### 5.4 Recommended Music Genres

**Kids Education:**
- Upbeat acoustic
- Light electronic
- Playful orchestral
- BPM: 100-130

**Kids Stories:**
- Soft piano
- Gentle strings
- Ambient pads
- BPM: 60-80

**Lofi/Ambient:**
- Lofi hip hop
- Ambient drone
- Nature sounds
- BPM: 70-90

---

## 6. Cost Analysis: Free vs Paid TTS

### 6.1 Edge TTS (FREE) - RECOMMENDED

**Pros:**
- ✓ 100% FREE - no API key required
- ✓ No rate limits (or very high limits)
- ✓ Same neural voice quality as Azure paid tier
- ✓ 100+ voices, multiple languages
- ✓ SSML support for advanced control
- ✓ Commercial use allowed

**Cons:**
- ✗ Requires internet connection
- ✗ No voice cloning/custom voices
- ✗ Limited emotional range per voice
- ✗ Microsoft could change terms

**Best For:**
- All three channels in this project
- High-volume content production
- Budget-conscious creators

**Quality Rating:** 8.5/10 (Professional grade)

### 6.2 ElevenLabs (Free Tier + Paid)

**Free Tier:**
- 10,000 characters/month (~10 minutes)
- Limited voice selection
- No commercial use

**Paid Plans:**
- Starter: $5/month - 30,000 chars
- Creator: $22/month - 100,000 chars
- Pro: $99/month - 500,000 chars

**Pros:**
- ✓ Best-in-class voice quality
- ✓ Voice cloning capability
- ✓ Rich emotional control
- ✓ Multiple languages with accent control

**Cons:**
- ✗ Expensive for high volume
- ✗ Free tier insufficient
- ✗ Costs scale with usage

**Best For:**
- Premium channels requiring unique voices
- Voice cloning projects
- Low-volume, high-quality needs

**Quality Rating:** 9.5/10 (Industry leading)

### 6.3 Coqui TTS (Open Source)

**Pros:**
- ✓ Completely free and open source
- ✓ Runs locally (no internet)
- ✓ Voice cloning available
- ✓ Privacy-friendly

**Cons:**
- ✗ Setup complexity
- ✗ Lower quality than Edge/ElevenLabs
- ✗ Requires GPU for best results
- ✗ Limited voice selection

**Quality Rating:** 6/10 (Adequate for basic needs)

### 6.4 System Voices (espeak, macOS say)

**Pros:**
- ✓ Built-in, no installation
- ✓ Completely free
- ✓ Works offline

**Cons:**
- ✗ Robotic, low quality
- ✗ Limited voices
- ✗ Not suitable for professional content

**Quality Rating:** 3/10 (Not recommended for YouTube)

### 6.5 Recommendation Summary

| Channel | Recommended | Voice | Monthly Cost |
|---------|-------------|-------|--------------|
| Kids Education | **Edge TTS** | Emma/Jenny | FREE |
| Kids Stories | **Edge TTS** | Jenny/Michelle | FREE |
| Lofi/Ambient | **Edge TTS** | Jenny (minimal) | FREE |
| **TOTAL** | | | **$0/month** |

**Upgrade Path:**
- Start with Edge TTS for all channels
- If channel grows significantly, consider ElevenLabs for:
  - Unique branded voice (Kids Education)
  - Character voices (Kids Stories)
- Budget $22-50/month if upgrading

---

## 7. First Narrated Script (Ready to Produce)

### 7.1 Kids Education: "The Amazing Human Heart"

**Target:** Ages 6-10
**Duration:** ~3 minutes
**Voice:** en-US-EmmaNeural

---

**SCRIPT:**

```
Hey there, young scientists! [PAUSE] Welcome back to our amazing world of discovery!

Today, we're going on a journey inside your own body to meet one of the hardest 
working organs ever... [EXCITED] your HEART!

[PAUSE]

Did you know that your heart is about the same size as your fist? [PAUSE] 
Go ahead, make a fist right now! [PAUSE] That's about how big your heart is!

[PAUSE 1s]

Your heart is a super strong muscle that works like a pump. [SLOW] 
Its job is to push blood all around your body. [PAUSE] And guess what? 
It does this about 100,000 times every single day! [EXCITED] 
That's like pumping enough blood to fill 2,000 milk jugs!

[PAUSE 1s]

Now, let's follow the blood on its amazing journey. [PAUSE]

First, blood that needs oxygen goes into your heart through tubes called 
veins (VAYNS). [PAUSE] Then, your heart squeezes and pushes this blood 
to your lungs to pick up fresh oxygen. [PAUSE] 

The blood comes back to your heart, all bright red and full of oxygen, 
and WHOOSH! [EXCITED] Your heart pumps it out through tubes called 
arteries (AR-ter-ees) to every part of your body!

[PAUSE 1s]

Here's a cool fact: [EXCITED] Your heart beats faster when you exercise 
because your muscles need more oxygen! [PAUSE] And when you sleep, 
it slows down to rest too.

[PAUSE]

So how can you keep your heart healthy and strong? [PAUSE]

Number one: Eat colorful fruits and vegetables! [PAUSE]
Number two: Run and play every day! [PAUSE]
Number three: Get lots of sleep! [PAUSE]

Your heart works hard for you, so take good care of it!

[PAUSE 1s]

Let's remember what we learned today: [SLOW]
- Your heart is a muscle that pumps blood
- It beats about 100,000 times a day
- It sends oxygen to every part of your body
- You can keep it healthy with good food and exercise!

[PAUSE]

Thanks for learning with me today, young scientists! [WARM] 
If you loved discovering how your heart works, hit that like button 
and subscribe for more amazing adventures! 

See you next time, bye!
```

---

### 7.2 Production Commands

```bash
# Generate audio
cd /workspace/projects/youtube-empire/audio

# Create script file
cat > heart_script.txt << 'EOF'
Hey there, young scientists! Welcome back to our amazing world of discovery! Today, we're going on a journey inside your own body to meet one of the hardest working organs ever... your HEART! Did you know that your heart is about the same size as your fist? Go ahead, make a fist right now! That's about how big your heart is! Your heart is a super strong muscle that works like a pump. Its job is to push blood all around your body. And guess what? It does this about 100,000 times every single day! That's like pumping enough blood to fill 2,000 milk jugs! Now, let's follow the blood on its amazing journey. First, blood that needs oxygen goes into your heart through tubes called veins. Then, your heart squeezes and pushes this blood to your lungs to pick up fresh oxygen. The blood comes back to your heart, all bright red and full of oxygen, and WHOOSH! Your heart pumps it out through tubes called arteries to every part of your body! Here's a cool fact: Your heart beats faster when you exercise because your muscles need more oxygen! And when you sleep, it slows down to rest too. So how can you keep your heart healthy and strong? Number one: Eat colorful fruits and vegetables! Number two: Run and play every day! Number three: Get lots of sleep! Your heart works hard for you, so take good care of it! Let's remember what we learned today: Your heart is a muscle that pumps blood. It beats about 100,000 times a day. It sends oxygen to every part of your body. You can keep it healthy with good food and exercise! Thanks for learning with me today, young scientists! If you loved discovering how your heart works, hit that like button and subscribe for more amazing adventures! See you next time, bye!
EOF

# Generate with Emma voice
edge-tts --voice en-US-EmmaNeural --file heart_script.txt --write-media heart_raw.mp3

# Process with education EQ chain
ffmpeg -i heart_raw.mp3 -af "highpass=f=80, equalizer=f=3000:t=q:w=1:g=3, compressor=threshold=-18dB:ratio=3:attack=200:release=1000, loudnorm=I=-16:TP=-3:LRA=11" heart_final.mp3

echo "Audio ready: heart_final.mp3"
```

---

## 8. Quick Reference Card

### Voice Selection Matrix

| Channel | Primary | Secondary | Use Case |
|---------|---------|-----------|----------|
| Education | Emma | Ava, Andrew | Cheerful, clear |
| Stories | Jenny | Michelle, Steffan | Warm, gentle |
| Lofi | Jenny (soft) | Sonia | Minimal, ambient |

### Edge TTS Quick Commands

```bash
# List all voices
edge-tts --list-voices

# List US English voices
edge-tts --list-voices | grep "^en-US"

# Generate audio
edge-tts --voice en-US-EmmaNeural --text "Hello world" --write-media output.mp3

# From file
edge-tts --voice en-US-JennyNeural --file script.txt --write-media story.mp3
```

### Audio Standards

| Spec | Education | Stories | Lofi |
|------|-----------|---------|------|
| Loudness | -16 LUFS | -16 LUFS | -14 LUFS |
| Peak | -3 dB | -3 dB | -3 dB |
| Sample Rate | 48 kHz | 48 kHz | 48 kHz |
| Bitrate | 192 kbps | 192 kbps | 192 kbps |

---

## 9. File Structure

```
/workspace/projects/youtube-empire/audio/
├── README.md                    # This guide
├── scripts/                     # Script templates
│   ├── education_template.md
│   ├── stories_template.md
│   └── lofi_template.md
├── pronunciation/               # Pronunciation guides
│   ├── medical_terms.md
│   ├── scientific_terms.md
│   └── space_terms.md
├── production/                  # Production files
│   ├── process_audio.sh         # Batch processing script
│   └── audacity_chains/         # Audacity macro files
├── samples/                     # Sample audio files
│   ├── education_heart.mp3
│   ├── stories_sample.mp3
│   └── lofi_sample.mp3
└── raw/                         # Raw TTS output
    └── .gitkeep
```

---

## 10. Next Steps

1. **Test Edge TTS** - Run sample commands
2. **Record Sample Scripts** - Use provided templates
3. **Set Up Audacity** - Install and configure processing chains
4. **Source Background Music** - Download from free libraries
5. **Create First Video** - Combine audio with visuals
6. **Iterate** - Adjust based on feedback

---

*Last Updated: 2026-02-23*
*Primary TTS: Microsoft Edge TTS (Free)*
*Processing: Audacity (Free)*
*Target: Professional YouTube Quality*
