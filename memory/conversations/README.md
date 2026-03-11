# Shared Memory System

## Purpose
Enable conversation continuity across all Discord channels and DMs. When you talk to me in any channel, I have context from everywhere.

## How It Works

### 1. Conversation Logging
Every message I receive gets logged to:
- `memory/conversations/YYYY-MM-DD.md` — Daily conversation log
- `memory/conversations/by-channel/[channel-id].md` — Per-channel logs
- `memory/conversations/summary.md` — Running summary

### 2. Context Retrieval
Before responding, I:
1. Check if this is a follow-up question
2. Load recent conversation context (last 10 messages)
3. Load relevant historical context
4. Reference previous decisions/plans

### 3. Cross-Channel Awareness
When you say "change the Mission Control plan" in any channel, I know:
- What plan you're referring to
- What was discussed before
- What decisions were made
- What needs updating

## Implementation

### Auto-Save Conversations
```typescript
// On every message
saveToMemory({
  channel: message.channelId,
  timestamp: new Date(),
  user: message.author,
  content: message.content,
  myResponse: myReply,
  topic: detectedTopic
});
```

### Context Loading
```typescript
// Before responding
const context = await loadContext({
  user: message.authorId,
  recentMessages: 10,
  relevantTopics: extractTopics(message.content),
  timeWindow: '24h'
});
```

## Usage

**You (in any channel):** "Update the plan we discussed"

**Me:** Checks shared memory, finds the plan from DMs, updates it

**You:** "What did we decide about the 2nd Brain?"

**Me:** Checks all channels, summarizes the decision

## Files

- `memory/conversations/summary.md` — Key decisions, active plans
- `memory/conversations/by-channel/*.md` — Channel-specific logs
- `memory/conversations/topics/*.md` — Topic-based aggregation

---

This makes me truly omnichannel — one continuous conversation everywhere.
