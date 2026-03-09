#!/bin/bash
# cost_report.sh - Reliable cost report with Ollama fallback

cd /Users/daytrons/.openclaw/workspace

# Quick Ollama warm-up (background, non-blocking)
./scripts/warm_ollama.sh >/dev/null 2>&1 &

# Run cost tracker script
COST_OUTPUT=$(python3 scripts/scheduler_runner.py --task cost 2>&1 | head -20)

# Check if cost tracker is configured
if echo "$COST_OUTPUT" | grep -q "not configured"; then
    # No cost data available
    FALLBACK="💰 Hourly Cost Report

Status: Cost tracker not configured
Recent API Activity: Minimal
Note: Install cost tracker skill for detailed reports"
    
    PROMPT="Format this as brief Discord message: Cost tracker not configured. Only minimal API calls detected. Keep it short."
    
    RESULT=$(./scripts/ollama_wrapper.sh "qwen3:8b" "$PROMPT" "$FALLBACK" 10)
    
    # Only post if there's something meaningful
    if echo "$RESULT" | grep -qi "not configured"; then
        echo "$RESULT"
    else
        echo "NO_REPLY"
    fi
    exit 0
fi

# Cost data available - format it
FALLBACK="💰 Hourly Cost Report

$COST_OUTPUT

(Ollama formatting unavailable)"

PROMPT="Format this cost data as a brief Discord message with emoji: $COST_OUTPUT"

RESULT=$(./scripts/ollama_wrapper.sh "qwen3:8b" "$PROMPT" "$FALLBACK" 10)
echo "$RESULT"
