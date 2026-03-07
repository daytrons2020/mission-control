# Discord Cron Message Configuration

## Setup

### Option 1: Webhook (Recommended)
1. Go to your Discord server
2. Server Settings → Integrations → Webhooks
3. Click "New Webhook"
4. Choose channel and copy URL
5. Set environment variable:
   ```bash
   export DISCORD_WEBHOOK_URL="https://discord.com/api/webhooks/..."
   ```

### Option 2: Bot Token
1. Go to https://discord.com/developers/applications
2. Create New Application → Bot
3. Copy bot token
4. Invite bot to your server
5. Set environment variable:
   ```bash
   export DISCORD_BOT_TOKEN="your-bot-token"
   export DISCORD_CHANNEL_ID="your-channel-id"
   ```

## Message Templates

### Simple Text
```json
{
  "content": "Hello from Mission Control!"
}
```

### Rich Embed
```json
{
  "embeds": [{
    "title": "📊 Daily Report",
    "description": "System status for today",
    "color": 13959423,
    "fields": [
      {
        "name": "🟢 Status",
        "value": "All systems operational",
        "inline": true
      },
      {
        "name": "⏱️ Uptime",
        "value": "99.9%",
        "inline": true
      }
    ],
    "timestamp": "2026-03-06T12:00:00.000Z",
    "footer": {
      "text": "Mission Control // NANO"
    }
  }]
}
```

### With Mentions
```json
{
  "content": "<@USER_ID> Daily report is ready!",
  "embeds": [...]
}
```

## Cron Schedule Examples

### Every Hour
```
0 * * * *
```

### Daily at 6 AM
```
0 6 * * *
```

### Every Monday at 9 AM
```
0 9 * * 1
```

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `DISCORD_WEBHOOK_URL` | Yes* | Webhook URL for posting |
| `DISCORD_BOT_TOKEN` | Yes* | Bot token (alternative) |
| `DISCORD_CHANNEL_ID` | Yes* | Channel ID (if using bot) |
| `DISCORD_USERNAME` | No | Custom username |
| `DISCORD_AVATAR_URL` | No | Custom avatar URL |

*Use either webhook OR bot token, not both

## Testing

Test your configuration:
```bash
curl -X POST $DISCORD_WEBHOOK_URL \
  -H "Content-Type: application/json" \
  -d '{"content": "Test message from Mission Control"}'
```