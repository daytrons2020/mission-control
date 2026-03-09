#!/bin/bash
# health_check_job.sh - Standalone health check that posts to Discord
# Runs via launchd, zero OpenClaw tokens

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PARENT_DIR="$(dirname "$SCRIPT_DIR")"

# Source the common scripts
OLLAMA_WRAPPER="$PARENT_DIR/scripts/ollama_wrapper.sh"
WARM_OLLAMA="$PARENT_DIR/scripts/warm_ollama.sh"
DISCORD_POST="$PARENT_DIR/zero-token-cron/discord_post.sh"

# Quick Ollama warm-up (background, non-blocking)
if [ -f "$WARM_OLLAMA" ]; then
    "$WARM_OLLAMA" >/dev/null 2>&1 &
fi

# Gather system data
disk_pct=$(df -h / | tail -1 | awk '{print $5}' | tr -d '%')
mem_free=$(vm_stat | grep "Pages free" | awk '{print $3}' | tr -d '.')
load=$(uptime | awk -F'load averages:' '{print $2}' | awk '{print $1}')

# Determine status
status="✅"
alert=""
if [ "$disk_pct" -gt 80 ]; then
    status="🚨"
    alert="ALERT: Disk usage high!"
elif [ "$disk_pct" -gt 70 ]; then
    status="⚠️"
    alert="Warning: Disk usage elevated"
fi

# Build fallback text (always works)
FALLBACK="${status} Systems healthy — Mac mini operational

Disk: ${disk_pct}% | Load: ${load} | Memory: ${mem_free} free pages
${alert}"

# Build Ollama prompt
PROMPT="System stats: Disk ${disk_pct}%, Memory free pages ${mem_free}, Load ${load}. 
If disk >80% or load >5, create ALERT message with warning emoji. 
Otherwise respond with exactly: ✅ Systems healthy — Mac mini operational

Disk: ${disk_pct}% | Load: ${load} | Memory: ${mem_free} free pages"

# Call Ollama with fallback
if [ -f "$OLLAMA_WRAPPER" ]; then
    RESULT=$("$OLLAMA_WRAPPER" "qwen3:8b" "$PROMPT" "$FALLBACK" 10)
else
    RESULT="$FALLBACK"
fi

# Post to Discord
if [ -f "$DISCORD_POST" ]; then
    "$DISCORD_POST" "admin" "$RESULT"
else
    echo "Error: discord_post.sh not found" >&2
    echo "$RESULT"
fi
