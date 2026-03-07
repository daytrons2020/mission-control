---
name: discord-cron
description: Send automated messages to Discord channels on a schedule. Adapted from Telegram to work with Discord webhooks and bot API.
homepage: https://discord.com/developers/docs
metadata:
  {
    "openclaw":
      {
        "emoji": "💬",
        "requires": { "env": ["DISCORD_WEBHOOK_URL"] },
      },
  }
---

# Discord Cron Message Skill

Send automated messages to Discord channels using webhooks or bot API.

## Quick Start

### 1. Configure Webhook

Create a Discord webhook:
- Server Settings → Integrations → Webhooks → New Webhook
- Copy the webhook URL

Set environment variable:
```bash
export DISCORD_WEBHOOK_URL="https://discord.com/api/webhooks/..."
```

### 2. Send Message

Use the `message` tool with Discord channel:
```javascript
message({
  channel: "discord",
  to: "#admin",
  content: "Hello from Mission Control!"
})
```

### 3. Rich Embed

```javascript
message({
  channel: "discord",
  to: "#admin",
  components: {
    embeds: [{
      title: "📊 Daily Report",
      description: "System status",
      color: 0x8b5cf6,
      fields: [
        { name: "Status", value: "✅ Online", inline: true }
      ]
    }]
  }
})
```

## Cron Integration

Use in cron jobs:
```json
{
  "payload": {
    "kind": "agentTurn",
    "message": "Post daily brief to #morning-brief",
    "model": "ollama/llama3.2"
  },
  "delivery": {
    "mode": "announce",
    "channel": "discord",
    "to": "#morning-brief"
  }
}
```

## Templates

See `cron-message.md` for message templates:
- Morning Brief
- Health Check
- Cost Report
- Trading Alerts

## Files

- `SKILL.md` - This file
- `CONFIGURATION.md` - Setup guide
- `cron-message.md` - Message templates
- `scripts/discord_sender.py` - Python sender script