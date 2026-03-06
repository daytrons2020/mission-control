#!/usr/bin/env bash
# Ollama-based Morning Brief - runs daily at 6 AM PT
# Zero token cost

SCRIPT_DIR=$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)
LOG_FILE="/Users/daytrons/.openclaw/workspace/logs/morning_brief.log"

echo "[$(date '+%Y-%m-%d %H:%M')] Generating Morning Brief with Ollama..." >> "$LOG_FILE"

# Generate brief
BRIEF=$(python3 "$SCRIPT_DIR/ollama_morning_brief.py" 2>&1)

# Log and output
echo "$BRIEF" >> "$LOG_FILE"
echo "$BRIEF"

# Optionally post to Discord (if configured)
# curl -X POST ... (webhook)

echo "[$(date '+%Y-%m-%d %H:%M')] Morning Brief complete." >> "$LOG_FILE"
