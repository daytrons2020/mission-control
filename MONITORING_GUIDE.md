# How to Monitor & Communicate with Autonomous Agents

## 🔍 How to Know Agents Are Working

### 1. Discord Notifications (Automatic)
Check your **#mission-control** channel. You should see:
- 🚀 **Job Started** - When an agent begins work
- ✅ **Job Completed** - When work finishes
- ❌ **Job Failed** - If something went wrong
- 📊 **Status Updates** - Every 30 minutes

### 2. Check Logs (Real-time)
```bash
# Watch agents work in real-time
tail -f ~/.openclaw/workspace/mission-control-repo/logs/orchestrator.log

# See last 20 entries
tail -20 ~/.openclaw/workspace/mission-control-repo/logs/orchestrator.log
```

### 3. Check Dashboard
Open your browser to:
```
file:///Users/daytrons/.openclaw/workspace/mission-control-repo/dashboard.html
```

Or visit the web interface if deployed.

### 4. Check Services Status
```bash
~/.openclaw/workspace/mission-control-repo/status_services.sh
```

## 💬 How to Communicate on Discord

### Discord Bot Commands (Type `/` in Discord)

| Command | What It Does | Example |
|---------|--------------|---------|
| `/status` | Show system health, active jobs | `/status` |
| `/jobs` | List all running jobs | `/jobs` |
| `/agents` | List available agents | `/agents` |
| `/spawn` | Start a new agent on a task | `/spawn backend-developer "Build API"` |
| `/tasks` | View all tasks | `/tasks` |
| `/costs` | Show token usage | `/costs` |

### Direct Webhook Commands

You can also type plain text in #mission-control:
```
status      - Get quick system status
jobs        - List active jobs
agents      - Show available agents
spawn ai-engineer "Research GPT-5"  - Spawn specific agent
```

## 🎯 Signs Agents Are Working

### ✅ Good Signs:
1. **Discord notifications** appearing in #mission-control
2. **Log file growing** (check with `ls -lh logs/orchestrator.log`)
3. **Processes running** (`status_services.sh` shows all green)
4. **Files being created** in workspace directories

### ⚠️ Warning Signs:
1. **No notifications for hours** - Agents may be idle
2. **Log file not growing** - Orchestrator may have stopped
3. **All jobs failing** - Check MLX server status
4. **Discord bot offline** - Bot needs restart

## 🛠️ Common Actions

### Start the Discord Bot (for commands)
```bash
cd ~/.openclaw/workspace/mission-control-repo/discord-bot
npm install  # If not done
node bot.js
```

### Manually Trigger a Job
```bash
# Spawn an agent via command line
cd ~/.openclaw/workspace/mission-control-repo
node agent-orchestrator.js spawn backend-developer "Build login API"
```

### Check What Agents Are Doing Right Now
```bash
# See running processes
ps aux | grep -E "(agent|orchestrator)" | grep -v grep

# See recent log activity
tail -50 logs/orchestrator.log | grep -E "(Starting|Completed|Failed)"
```

### Restart Everything
```bash
~/.openclaw/workspace/mission-control-repo/stop_all_services.sh
~/.openclaw/workspace/mission-control-repo/start_all_services.sh
```

## 📱 Expected Activity Pattern

### Normal Operation:
1. **Morning (8AM)**: Daily motivation + RSS news
2. **Throughout day**: Agents spawn for tasks every 1-3 hours
3. **Each job**: Discord notification when start + complete
4. **Evening**: Status summary

### If Nothing Is Happening:
1. Check if orchestrator is running: `pgrep -f agent-orchestrator`
2. Check logs: `tail logs/orchestrator.log`
3. Check MLX: `curl http://127.0.0.1:18888/v1/models`
4. Restart if needed: `./start_all_services.sh`

## 🔧 Troubleshooting

### No Discord Notifications?
1. Check webhook URL is valid: `echo $DISCORD_WEBHOOK_URL`
2. Test webhook: See test script in discord-bot/
3. Check Discord bridge: `curl http://127.0.0.1:11437/health`

### Discord Bot Not Responding?
1. Check if bot is running: `pgrep -f "discord-bot"`
2. Check bot logs: `tail discord-bot/bot.log`
3. Re-deploy commands: `node deploy-commands.js`

### Agents Not Spawning?
1. Check MLX server: `curl http://127.0.0.1:18888/v1/models`
2. Check orchestrator: `tail logs/orchestrator.log`
3. Check goals file exists: `ls MISSION_CONTROL_BUILD_PLAN.md`

## 📊 Quick Health Check Script

Run this to see system status:
```bash
#!/bin/bash
echo "=== MISSION CONTROL HEALTH CHECK ==="
echo ""
echo "1. Discord Webhook:"
curl -s $DISCORD_WEBHOOK_URL -X POST -d '{"content":"test"}' -w "%{http_code}\n" 2>&1 | tail -1
echo ""
echo "2. Services:"
~/.openclaw/workspace/mission-control-repo/status_services.sh
echo ""
echo "3. Recent Activity:"
tail -5 ~/.openclaw/workspace/mission-control-repo/logs/orchestrator.log 2>/dev/null | grep -E "(Started|Completed)" || echo "No recent activity"
```

Save this as `health_check.sh` and run it anytime!
