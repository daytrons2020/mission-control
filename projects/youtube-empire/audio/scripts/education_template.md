# Kids Education Script Template

## Video Metadata
- **Topic:** [TOPIC NAME]
- **Target Age:** 6-10 years
- **Duration:** 3-4 minutes
- **Voice:** en-US-EmmaNeural (or Ava/Andrew)
- **Channel:** Kids Education

---

## Opening Hook (15-20 seconds)
```
Hey there, young [scientists/explorers/artists]! [PAUSE] 
Welcome back to our amazing world of discovery! 
Today, we're going to discover something AMAZING about [TOPIC]. 
Are you ready? Let's go!
```

---

## Section 1: Introduction (30-45 seconds)
**Purpose:** Hook interest and preview content

```
So, what exactly is [TOPIC]? [PAUSE] 
[Simple definition in kid-friendly terms].

[PAUSE]

And here's why it's so cool: [EXCITED] [interesting fact]!
[PAUSE]

Before we dive in, here's a question for you: [engaging question]? 
[PAUSE 2s] Keep that in mind as we explore!
```

---

## Section 2: Core Concepts (2-3 minutes)
**Purpose:** Teach 3-4 key points

### Point 1 (30-45 seconds)
```
Let's start with the first amazing thing about [TOPIC]. [SLOW]
[Explain concept simply].

[PAUSE]

Think of it like this: [analogy kids understand].
[PAUSE]

Did you know? [Fun fact related to point 1]!
```

### Point 2 (30-45 seconds)
```
Now, let's look at [second concept]. [PAUSE]
[Explanation with visual cue for video].

[PAUSE]

Here's a cool way to remember this: [memory aid/mnemonic].
```

### Point 3 (30-45 seconds)
```
Our third amazing fact is about [third concept]. [EXCITED]
[Explanation with enthusiasm].

[PAUSE]

Can you guess [interactive question]? [PAUSE 2s]
The answer is [answer]!
```

---

## Section 3: Real-World Connection (1-2 minutes)
**Purpose:** Make it relatable

```
So how does [TOPIC] affect YOU? [PAUSE]

Well, [real-world example from child's life].
[PAUSE]

And here's something cool you can try at home: [simple activity].
[PAUSE]

Ask your [parent/teacher/friend] about [related question]!
```

---

## Section 4: Summary (30 seconds)
**Purpose:** Reinforce learning

```
Let's remember what we learned today: [SLOW]

Number one: [Key point 1].
Number two: [Key point 2].
Number three: [Key point 3].

[PAUSE]

You now know more about [TOPIC] than most grown-ups!
```

---

## Closing (15-20 seconds)
```
Thanks for learning with me today, young [scientists]! [WARM]

If you loved discovering [TOPIC], hit that like button 
and subscribe for more amazing adventures! 

What topic should we explore next? Let me know in the comments!

See you next time, bye!
```

---

## TTS Optimization Checklist

- [ ] Add `[PAUSE]` after questions
- [ ] Add `[PAUSE 2s]` for thinking moments
- [ ] Use `[SLOW]` for new vocabulary
- [ ] Use `[EXCITED]` for fun facts
- [ ] Use `[WARM]` for closing
- [ ] Include phonetic spellings: "word (FON-et-ik)"
- [ ] Keep sentences under 15 words when possible
- [ ] Use contractions (you're, it's, don't) for natural flow

---

## Word Count Target
- Opening: 25-35 words
- Section 1: 60-80 words
- Section 2: 150-200 words
- Section 3: 80-120 words
- Section 4: 40-60 words
- Closing: 30-40 words
- **Total: 385-535 words (~3-4 minutes)**

---

## Production Commands

```bash
# Generate audio
cd /workspace/projects/youtube-empire/audio
edge-tts --voice en-US-EmmaNeural --file your_script.txt --write-media output_raw.mp3

# Process audio
./process_audio.sh output_raw.mp3 education output_final.mp3
```
