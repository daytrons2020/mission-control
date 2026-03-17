# Mission Control Discord Integration

## Setup Steps

### 1. Create #mission-control Channel
- In your Discord server, create a channel named `mission-control`
- Set permissions so the bot can read/write messages
- (Optional) Set as announcement channel for notifications

### 2. Get Channel ID
```bash
# Enable Developer Mode in Discord (Settings > Advanced)
# Right-click #mission-control > Copy Channel ID
# Add to config below
```

### 3. Configure Discord Bot
Edit `discord-bot/config.json`:
```json
{
  "token": "YOUR_BOT_TOKEN",
  "clientId": "YOUR_CLIENT_ID",
  "guildId": "YOUR_GUILD_ID",
  "missionControlChannel": "CHANNEL_ID_HERE",
  "github": {...},
  "openclaw": {
    "gatewayUrl": "http://127.0.0.1:18789",
    "enabled": true
  }
}
```

### 4. Deploy Commands
```bash
cd discord-bot
node deploy-commands.js
```

### 5. Start Bot
```bash
node bot.js
```

## Available Commands in #mission-control

| Command | Description |
|---------|-------------|
| `/status` | Show system health, active jobs, agents |
| `/spawn <agent> <task>` | Spawn an agent for a task |
| `/tasks` | List all active and pending tasks |
| `/costs` | Show token usage and costs |
| `/project <name>` | Show details about a project |

## Automatic Updates

The bot will automatically post to #mission-control when:
- ✅ An agent starts a job
- ✅ A job completes
- ❌ A job fails
- ⏰ Periodic status updates (every 30 min)
- 🔔 Critical alerts

## Webhook Integration

For real-time updates from agent-orchestrator:
```bash
# The bridge listens on port 11437
curl -X POST http://localhost:11437/notify/job-start \
  -d '{"job_name": "Build API", "agent": "backend-developer", "eta": "10 min"}'
```
