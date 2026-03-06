#!/bin/bash
# Daily Digest with Discord notification
SCRIPT_DIR=$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)
LOG_FILE="/Users/daytrons/.openclaw/workspace/logs/daily_digest.log"

echo "[$(date '+%Y-%m-%d %H:%M')] Generating Daily Digest..." >> "$LOG_FILE"

DIGEST_JSON=$(python3 "$SCRIPT_DIR/ollama_daily_digest.py" 2>&1)
echo "$DIGEST_JSON" >> "$LOG_FILE"

echo "$DIGEST_JSON" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d['digest'])"

if [ -n "$DISCORD_WEBHOOK_URL" ]; then
    echo "$DIGEST_JSON" | python3 -c "
import sys, json, os
sys.path.insert(0, '$SCRIPT_DIR')
from discord_notifier import format_daily_digest, send_to_discord
data = json.load(sys.stdin)
content = format_daily_digest(data)
send_to_discord(content, username='📊 Daily Digest')
" >> "$LOG_FILE" 2>&1
fi

echo "[$(date '+%Y-%m-%d %H:%M')] Daily Digest complete." >> "$LOG_FILE"
