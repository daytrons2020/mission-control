# HEARTBEAT.md - Automated Checks (No Confirmation Required)
# Last updated: 2026-03-04

## Check Schedule (Auto-Run)

### Every 30 Minutes During Market Hours (6:30 AM - 1:00 PM PT)
- Trading monitor check
- Market status verification

### Every 2 Hours
- Discord channel health check
- Gateway status verification
- Cron job status check

### Daily at 6:00 AM PT
- Morning brief generation
- System health check
- Git sync check

### Daily at 8:00 PM PT
- Daily digest preparation
- Project status update

---

## Commands to Run

### Trading Check
openclaw cron runs --limit 5

### Gateway Status
openclaw gateway status

### Discord Health
openclaw discord channels

### Git Status
cd /Users/daytrons/.openclaw/workspace && git status --short

### System Health
df -h / | tail -1 | awk '{print "Disk: "$5" used"}'
ps aux | grep -c openclaw
