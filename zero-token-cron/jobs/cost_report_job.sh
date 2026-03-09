#!/bin/bash
# cost_report_job.sh - Standalone cost report that posts to Discord
# Runs via launchd, zero OpenClaw tokens

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PARENT_DIR="$(dirname "$SCRIPT_DIR")"

# Source the common scripts
OLLAMA_WRAPPER="$PARENT_DIR/scripts/ollama_wrapper.sh"
WARM_OLLAMA="$PARENT_DIR/scripts/warm_ollama.sh"
DISCORD_POST="$PARENT_DIR/zero-token-cron/discord_post.sh"
SCHEDULER_RUNNER="$PARENT_DIR/scripts/scheduler_runner.py"

# Quick Ollama warm-up (background, non-blocking)
if [ -f "$WARM_OLLAMA" ]; then
    "$WARM_OLLAMA" >/dev/null 2>&1 &
fi

# Run cost tracker script if available
COST_OUTPUT=""
if [ -f "$SCHEDULER_RUNNER" ]; then
    COST_OUTPUT=$(python3 "$SCHEDULER_RUNNER" --task cost 2>&1 | head -20)
fi

# Check if cost tracker is configured or has data
if [ -z "$COST_OUTPUT" ] || echo "$COST_OUTPUT" | grep -qi "not configured\|error\|no data"; then
    # No cost data available - skip posting
    exit 0
fi

# Cost data available - format it
FALLBACK="💰 Hourly Cost Report

$COST_OUTPUT

(Ollama formatting unavailable)"

PROMPT="Format this cost data as a brief Discord message with emoji, keep it under 500 chars: $COST_OUTPUT"

# Call Ollama with fallback
if [ -f "$OLLAMA_WRAPPER" ]; then
    RESULT=$("$OLLAMA_WRAPPER" "qwen3:8b" "$PROMPT" "$FALLBACK" 10)
else
    RESULT="$FALLBACK"
fi

# Don't post if result indicates no data
if echo "$RESULT" | grep -qi "not configured\|no data\|error"; then
    exit 0
fi

# Post to Discord
if [ -f "$DISCORD_POST" ]; then
    "$DISCORD_POST" "token-tracker" "$RESULT"
else
    echo "Error: discord_post.sh not found" >&2
    echo "$RESULT"
fi
