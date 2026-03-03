# Lofi/Ambient Script Template

## Track Metadata
- **Mood:** [Relax/Study/Sleep/Focus]
- **Duration:** 10-30 minutes (music primary)
- **Voice:** en-US-JennyNeural (minimal usage)
- **Channel:** Lofi/Ambient
- **Voice Duration:** Max 30 seconds per 10 minutes

---

## Voice Usage Guidelines

### When to Use Voice:
- Track introduction (10-15 seconds)
- Natural transition points (5-10 seconds)
- Track outro (optional, 5-10 seconds)

### When to Skip Voice:
- Pure ambient tracks
- Sleep/meditation content
- Study focus tracks

---

## Template 1: Intro Only

```
[AMBIENT] [REVERB] [FADE]

Welcome to [MOOD]... [PAUSE 3s]
A space to [relax/study/dream/focus]... [PAUSE 2s]

Let the music carry you away...

[FADE to -30dB under music]
```

**Duration:** 10-15 seconds
**Volume:** 30% of music volume after fade

---

## Template 2: Intro + Transition

### Intro (10 seconds)
```
[AMBIENT] [REVERB] [FADE]

Welcome to a peaceful moment... [PAUSE 2s]
Just for you.

[FADE under music]
```

### Transition at 5-minute mark (5 seconds)
```
[AMBIENT] [FADE]

Breathe... [PAUSE 2s] 
Let go...
```

### Outro (10 seconds)
```
[AMBIENT] [FADE]

Thank you for listening... [PAUSE 2s]
Carry this peace with you.
```

---

## Template 3: Guided Relaxation (Optional)

```
[AMBIENT] [REVERB] [FADE]

Find a comfortable position... [PAUSE 3s]
Close your eyes... [PAUSE 2s]

Take a deep breath in... [PAUSE 3s]
And slowly breathe out... [PAUSE 3s]

Let the sounds wash over you... [PAUSE 2s]
[FADE to background]

[Music continues for 10-20 minutes]

[Voice returns at end - optional]
[AMBIENT] [FADE]

When you're ready... [PAUSE 2s]
Gently open your eyes... [PAUSE]

Carry this calm with you... [FADE]
```

---

## TTS Markers Explained

| Marker | Meaning | Production |
|--------|---------|------------|
| `[AMBIENT]` | Blend into background | Heavy compression |
| `[REVERB]` | Spatial effect | 3-4 second decay |
| `[FADE]` | Gradual volume reduction | -3dB over 2 seconds |
| `[PAUSE 3s]` | Long silence | For breathing room |

---

## Production Settings

### Voice Processing Chain
1. **High Pass:** 200 Hz (remove rumble)
2. **Low Pass:** 6 kHz (muffled effect)
3. **Reverb:** 4-second decay, 50% wet
4. **Volume:** 30% of music level
5. **Loudness:** -20 LUFS (quieter than standard)

### Ducking Settings
- Duck amount: -12 dB under music
- Attack: 0.5s
- Release: 2s
- Threshold: -40 dB

---

## Production Commands

```bash
# Generate audio
cd /workspace/projects/youtube-empire/audio
edge-tts --voice en-US-JennyNeural --file lofi_script.txt --write-media lofi_raw.mp3

# Process audio (heavy reverb, low-pass filter)
./process_audio.sh lofi_raw.mp3 lofi lofi_final.mp3

# Mix with music (example using ffmpeg)
ffmpeg -i music_track.mp3 -i lofi_final.mp3 -filter_complex "\
[0:a]volume=1.0[a0]; \
[1:a]volume=0.3[a1]; \
[a0][a1]amix=inputs=2:duration=first" \
-output mixed_track.mp3
```

---

## Recommended Music Characteristics

| Mood | BPM | Key | Instruments |
|------|-----|-----|-------------|
| Study | 70-85 | Major/Minor | Piano, vinyl crackle |
| Sleep | 60-70 | Minor | Pads, soft piano |
| Relax | 75-90 | Major | Guitar, light drums |
| Focus | 80-100 | Ambient | Synths, no percussion |

---

## Voice Script Word Count

- **Intro only:** 10-20 words
- **Intro + Outro:** 20-30 words
- **With transition:** 30-40 words
- **Guided relaxation:** 50-80 words

**Keep it minimal. The music is the star.**
