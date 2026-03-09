#!/bin/bash
# health_check.sh - Reliable health monitor with Ollama fallback
# Always completes in <15 seconds, zero tokens on Ollama failure

cd /Users/daytrons/.openclaw/workspace

# Quick Ollama warm-up (background, non-blocking)
./scripts/warm_ollama.sh >/dev/null 2>&1 &

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
RESULT=$(./scripts/ollama_wrapper.sh "qwen3:8b" "$PROMPT" "$FALLBACK" 10)

# Output for Discord
echo "$RESULT"
