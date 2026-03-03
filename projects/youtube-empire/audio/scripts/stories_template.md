# Kids Stories Script Template

## Story Metadata
- **Title:** [STORY TITLE]
- **Target Age:** 3-8 years
- **Duration:** 5-8 minutes
- **Voice:** en-US-JennyNeural (or Michelle/Steffan)
- **Channel:** Kids Stories
- **Theme:** [Bedtime/Adventure/Friendship/etc.]

---

## Opening (20-30 seconds)
```
[WARM] Once upon a time... [PAUSE 2s] 
in a [place] far, far away, there lived a [character description].

[PAUSE]

This [character] was [positive trait], but they had one little problem...
[PAUSE 2s]

Let me tell you their story.
```

---

## Part 1: The Setup (1-2 minutes)
**Purpose:** Introduce character and world

```
[Character name] lived in [describe setting with sensory details].
Every day, they would [daily routine].

[PAUSE]

[Character] loved [something they love], but there was one thing 
that made them [emotion]... [PAUSE] [The problem/challenge].

[PAUSE]

You see, [explain problem in simple terms].
[PAUSE 2s]

One [day/evening/morning], something changed...
```

---

## Part 2: The Journey (3-4 minutes)
**Purpose:** Adventure and character growth

### Meeting a Helper (1 minute)
```
[Character] met [new character], who was [description].

"[Dialogue - Character 1]" said [name].

"[Dialogue - Character 2]" replied [name].

[PAUSE]

Together, they decided to [action].
```

### The Challenge (1-2 minutes)
```
But [obstacle] stood in their way. [PAUSE]

[Describe challenge with gentle tension].

[PAUSE 2s]

[Character] felt [emotion], but then remembered [lesson/wise words].

[PAUSE]

"[Encouraging self-talk]" they said.

[PAUSE]

With [courage/help/cleverness], they [overcame obstacle].
```

### Growing Friendship (1 minute)
```
[PAUSE 2s]

As they traveled, [character] and [friend] discovered 
that [friendship lesson].

[PAUSE]

[Moments of joy/connection].
```

---

## Part 3: The Resolution (1-2 minutes)
**Purpose:** Solve problem and celebrate

```
Finally, they reached [destination]. [PAUSE]

[Describe achieving goal].

[PAUSE 2s]

[Character] realized that [lesson/moral].

[PAUSE]

And from that day on, [positive change].

[PAUSE 2s]

They lived [happily/joyfully/peacefully] ever after.
```

---

## Closing (20-30 seconds)
```
[WARM] And so, [character] learned that [simple moral].

[PAUSE 2s]

The end. [PAUSE] 

Sleep tight, little ones. [WHISPER] Sweet dreams.

[PAUSE 3s]

[Soft music fade in]
```

---

## Character Voice Guide

Since Edge TTS has limited voice options, use these post-processing techniques:

| Character | Speed | Pitch | Effect |
|-----------|-------|-------|--------|
| Narrator | 100% | 0% | Base voice |
| Child Character | +5% | +5% | Slightly higher, faster |
| Wise Character | -5% | -5% | Slower, deeper |
| Animal | +10% | +10% | Playful, cute |
| Whisper | 100% | 0% | -30% volume |

Apply in Audacity using Change Tempo and Change Pitch effects.

---

## TTS Optimization Checklist

- [ ] Use `[WARM]` for opening and closing
- [ ] Use `[PAUSE 2s]` for scene transitions
- [ ] Use `[WHISPER]` for intimate moments
- [ ] Use `[SIGH]` for emotional beats (add in post)
- [ ] Keep dialogue short (1-2 sentences per character)
- [ ] Add sensory descriptions for video cues
- [ ] Include [music cues] for producer

---

## Word Count Target
- Opening: 30-40 words
- Part 1: 150-200 words
- Part 2: 300-400 words
- Part 3: 100-150 words
- Closing: 20-30 words
- **Total: 600-820 words (~5-7 minutes)**

---

## Production Commands

```bash
# Generate audio
cd /workspace/projects/youtube-empire/audio
edge-tts --voice en-US-JennyNeural --file story_script.txt --write-media story_raw.mp3

# Process audio (adds warmth and reverb)
./process_audio.sh story_raw.mp3 stories story_final.mp3
```

---

## Music Cues

| Moment | Music Type | Duration |
|--------|------------|----------|
| Opening | Gentle piano | Fade in 5s |
| Journey | Soft strings | Under narration |
| Challenge | Slight tension | Brief, gentle |
| Resolution | Uplifting | Build up |
| Closing | Lullaby | Fade out 10s |
