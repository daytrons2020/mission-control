#!/bin/bash
# AI News Feed Generator for #ai-news Discord channel
# Runs via cron - 2x daily (8 AM and 6 PM PT)

set -e

WORKSPACE="/Users/daytrons/.openclaw/workspace"
FEED_DIR="$WORKSPACE/ai-news-feed"
OLLAMA_MODEL="${OLLAMA_MODEL:-llama3.2}"
DISCORD_CHANNEL="1479689511620575422"

# Ensure directories exist
mkdir -p "$FEED_DIR/sources"
mkdir -p "$FEED_DIR/summaries"

# Source URLs for AI news
SOURCES=(
    "OpenClaw GitHub|https://github.com/openclaw/openclaw/releases.atom"
    "Hugging Face Blog|https://huggingface.co/blog/feed.xml"
    "Simon Willison|https://simonwillison.net/atom/everything/"
    "ArXiv AI|http://export.arxiv.org/rss/cs.AI"
    "ArXiv ML|http://export.arxiv.org/rss/cs.LG"
    "OpenAI Blog|https://openai.com/blog/rss.xml"
    "Anthropic News|https://www.anthropic.com/news/rss.xml"
    "Google AI Blog|https://ai.googleblog.com/feeds/posts/default"
)

echo "=== AI News Feed Run - $(date) ==="

# Function to fetch and parse RSS
fetch_rss() {
    local name="$1"
    local url="$2"
    local output_file="$FEED_DIR/sources/$(echo "$name" | tr ' ' '_').json"
    
    echo "Fetching: $name"
    
    # Use curl to fetch RSS, then simple parsing
    curl -sL --max-time 15 "$url" 2>/dev/null | \
        grep -oP '(?<=<title>)[^<]+' | \
        head -10 > "$output_file.titles" || true
    
    curl -sL --max-time 15 "$url" 2>/dev/null | \
        grep -oP '(?<=<link>)[^<]+' | \
        head -10 > "$output_file.links" || true
    
    # Combine into simple format
    paste -d '|' "$output_file.titles" "$output_file.links" 2>/dev/null | \
        head -5 > "$output_file" || true
    
    rm -f "$output_file.titles" "$output_file.links"
}

# Fetch all sources
for source in "${SOURCES[@]}"; do
    IFS='|' read -r name url <<< "$source"
    fetch_rss "$name" "$url" &
done
wait

# Aggregate all articles
echo "Aggregating articles..."
cat "$FEED_DIR/sources"/*.json 2>/dev/null | sort -u | head -15 > "$FEED_DIR/today_articles.txt"

# Check if we have any articles
if [ ! -s "$FEED_DIR/today_articles.txt" ]; then
    echo "No articles found today"
    exit 0
fi

# Prepare content for Ollama
ARTICLES=$(cat "$FEED_DIR/today_articles.txt")

# Create prompt for Ollama
PROMPT="You are an AI news curator. Summarize these AI-related articles into a concise Discord post.
Format as:
🤖 **AI News Roundup** - $(date '+%b %d, %Y')

**Research & Papers:**
- [Title](URL) - One line summary

**Tools & Releases:**
- [Title](URL) - One line summary

**Industry News:**
- [Title](URL) - One line summary

Keep it under 2000 characters. Focus on OpenClaw, LLMs, and major AI updates.

Articles to summarize:
$ARTICLES"

# Generate summary with Ollama (if available)
if command -v ollama &> /dev/null; then
    echo "Generating summary with Ollama ($OLLAMA_MODEL)..."
    SUMMARY=$(echo "$PROMPT" | ollama run "$OLLAMA_MODEL" 2>/dev/null || echo "")
    
    if [ -n "$SUMMARY" ]; then
        echo "$SUMMARY" > "$FEED_DIR/summaries/$(date +%Y%m%d_%H%M).txt"
        
        # Post to Discord via webhook or bot
        # Using OpenClaw's message tool would be ideal here
        echo "Summary generated:"
        echo "$SUMMARY"
    else
        echo "Ollama failed to generate summary, using raw articles"
        cat "$FEED_DIR/today_articles.txt"
    fi
else
    echo "Ollama not available, posting raw feed"
    cat "$FEED_DIR/today_articles.txt"
fi

echo "=== Done ==="
