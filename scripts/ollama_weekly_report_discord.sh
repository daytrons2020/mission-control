#!/bin/bash
# Weekly Report with Discord notification
SCRIPT_DIR=$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)
LOG_FILE="/Users/daytrons/.openclaw/workspace/logs/weekly_report.log"

echo "[$(date '+%Y-%m-%d %H:%M')] Generating Weekly Report..." >> "$LOG_FILE"

REPORT_JSON=$(python3 "$SCRIPT_DIR/ollama_weekly_report.py" 2>&1)
echo "$REPORT_JSON" >> "$LOG_FILE"

echo "$REPORT_JSON" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d['report'])"

if [ -n "$DISCORD_WEBHOOK_URL" ]; then
    echo "$REPORT_JSON" | python3 -c "
import sys, json, os
sys.path.insert(0, '$SCRIPT_DIR')
from discord_notifier import format_weekly_report, send_to_discord
data = json.load(sys.stdin)
content = format_weekly_report(data)
send_to_discord(content, username='📈 Weekly Report')
" >> "$LOG_FILE" 2>&1
fi

echo "[$(date '+%Y-%m-%d %H:%M')] Weekly Report complete." >> "$LOG_FILE"
