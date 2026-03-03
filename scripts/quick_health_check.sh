#!/bin/bash
# Quick Health Check Script
# Runs every 6 hours via cron

LOG_FILE="/Users/daytrons/.openclaw/workspace/.openclaw/health-check.log"
TIMESTAMP=$(date '+%Y-%m-%d %H:%M:%S')

echo "[$TIMESTAMP] Health Check Starting" >> "$LOG_FILE"

# Check Gateway
if openclaw gateway status | grep -q "running"; then
    echo "[$TIMESTAMP] ✅ Gateway running" >> "$LOG_FILE"
else
    echo "[$TIMESTAMP] ❌ Gateway down, restarting..." >> "$LOG_FILE"
    openclaw gateway restart
    echo "[$TIMESTAMP] 🔧 Gateway restarted" >> "$LOG_FILE"
fi

# Check Cron Jobs
ERROR_COUNT=$(openclaw cron list 2>/dev/null | grep -c "error" || echo "0")
if [ "$ERROR_COUNT" -gt 0 ]; then
    echo "[$TIMESTAMP] ⚠️ $ERROR_COUNT cron jobs with errors" >> "$LOG_FILE"
    # Log which jobs are failing
    openclaw cron list 2>/dev/null | grep "error" >> "$LOG_FILE"
else
    echo "[$TIMESTAMP] ✅ All cron jobs healthy" >> "$LOG_FILE"
fi

# Check Disk Space
DISK_USAGE=$(df -h / | awk 'NR==2 {print $5}' | sed 's/%//')
if [ "$DISK_USAGE" -gt 85 ]; then
    echo "[$TIMESTAMP] ❌ Disk space critical: ${DISK_USAGE}%" >> "$LOG_FILE"
elif [ "$DISK_USAGE" -gt 70 ]; then
    echo "[$TIMESTAMP] ⚠️ Disk space warning: ${DISK_USAGE}%" >> "$LOG_FILE"
else
    echo "[$TIMESTAMP] ✅ Disk space OK: ${DISK_USAGE}%" >> "$LOG_FILE"
fi

# Check Git Status
if [ -n "$(git -C /Users/daytrons/.openclaw/workspace status --short 2>/dev/null)" ]; then
    echo "[$TIMESTAMP] ⚠️ Uncommitted changes detected" >> "$LOG_FILE"
    cd /Users/daytrons/.openclaw/workspace && git add -A && git commit -m "auto: Health check commit $(date '+%Y-%m-%d %H:%M')"
    echo "[$TIMESTAMP] 🔧 Auto-committed changes" >> "$LOG_FILE"
else
    echo "[$TIMESTAMP] ✅ Git clean" >> "$LOG_FILE"
fi

# Check iMessage
if openclaw status 2>/dev/null | grep -i "imessage" | grep -q "on\|ok"; then
    echo "[$TIMESTAMP] ✅ iMessage OK" >> "$LOG_FILE"
else
    echo "[$TIMESTAMP] ❌ iMessage issue detected" >> "$LOG_FILE"
    openclaw config set channels.imessage.enabled true
    openclaw gateway restart
    echo "[$TIMESTAMP] 🔧 iMessage re-enabled" >> "$LOG_FILE"
fi

# Summary
echo "[$TIMESTAMP] Health Check Complete" >> "$LOG_FILE"
echo "---" >> "$LOG_FILE"

# Output summary for Discord
cat "$LOG_FILE" | tail -15
