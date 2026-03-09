#!/bin/bash
# world_news.sh - Reliable world news with Ollama fallback + caching

cd /Users/daytrons/.openclaw/workspace

CACHE_FILE="/tmp/world_news_cache.json"
CACHE_MAX_AGE=3600  # 1 hour

# Check cache first
if [ -f "$CACHE_FILE" ]; then
    CACHE_AGE=$(($(date +%s) - $(stat -f%m "$CACHE_FILE" 2>/dev/null || stat -c%Y "$CACHE_FILE" 2>/dev/null || echo 0)))
    if [ "$CACHE_AGE" -lt "$CACHE_MAX_AGE" ]; then
        # Use cached formatted result
        cat "$CACHE_FILE"
        exit 0
    fi
fi

# No cache or expired - fetch new data
# Note: This is a placeholder - actual web search would need different tooling
# For now, create a basic fallback

FALLBACK="🌍 World News Roundup

(Ollama formatting temporarily unavailable)

Search completed. Check news sources directly for updates."

PROMPT="Create a World News Roundup. Format:
🌍 World News Roundup - $(date '+%A, %B %d, %Y')

**Geopolitics:**
- [item]
- [item]

**Markets:**
- [item]
- [item]

**Key Takeaway:** [one sentence]

Keep it concise, trading-focused."

RESULT=$(./scripts/ollama_wrapper.sh "qwen3:8b" "$PROMPT" "$FALLBACK" 15)

# Cache the result
echo "$RESULT" > "$CACHE_FILE"

echo "$RESULT"
