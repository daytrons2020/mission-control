# HEARTBEAT.md - Proactive Agent Checks (No Confirmation Required)
# Last updated: 2026-03-06
# Agent Mode: PROACTIVE v3

## Proactive Agent Behaviors

### Self-Monitoring
- Check my own performance metrics
- Identify slow responses
- Detect repeated errors
- Optimize token usage

### Anticipatory Actions
- Pre-load context for likely questions
- Prepare summaries before asked
- Warm up frequently used tools
- Cache common responses

### Continuous Learning
- Track conversation patterns
- Learn user preferences
- Adapt communication style
- Improve efficiency

## Check Schedule (Auto-Run)

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

### Mission Control Auto-Posts (12 per day)
- 6:00 AM PT - Morning brief + system health
- 8:00 AM PT - Project pulse (what changed)
- 10:00 AM PT - Mission Control sync
- 12:00 PM PT - Health check
- 2:00 PM PT - Mission Control sync
- 4:00 PM PT - Health check
- 6:00 PM PT - Mission Control sync
- 8:00 PM PT - Daily digest
- Plus: Hourly cost reports (already active)
- Plus: Real-time trading alerts during market hours

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
