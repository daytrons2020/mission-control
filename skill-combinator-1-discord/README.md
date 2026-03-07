# Skill: Cron Message - Discord Edition

## Overview
Sends automated messages to Discord channels on a schedule.

## Configuration

### Discord Setup
1. Create a Discord webhook in your server:
   - Server Settings → Integrations → Webhooks → New Webhook
   - Copy the webhook URL

2. Configure the skill with your webhook URL

### Environment Variables
```bash
DISCORD_WEBHOOK_URL=https://discord.com/api/webhooks/YOUR_WEBHOOK_ID/YOUR_WEBHOOK_TOKEN
```

## Usage

### Basic Message
```javascript
sendDiscordMessage({
  content: "Hello from Mission Control!",
  channel: "#general"
});
```

### Rich Embed Message
```javascript
sendDiscordEmbed({
  title: "Daily Report",
  description: "System status update",
  color: 0x8b5cf6, // Purple
  fields: [
    { name: "Status", value: "✅ Online", inline: true },
    { name: "Uptime", value: "99.9%", inline: true }
  ],
  timestamp: new Date().toISOString(),
  footer: { text: "Mission Control" }
});
```

### Scheduled Messages
```javascript
// Daily morning brief
cron.schedule('0 6 * * *', () => {
  sendDiscordEmbed({
    title: "🌅 Morning Brief",
    description: "Daily status update",
    color: 0x00f5ff,
    fields: [
      { name: "Weather", value: "Checking...", inline: true },
      { name: "Stocks", value: "Loading...", inline: true }
    ]
  });
});
```

## Discord vs Telegram Differences

| Feature | Telegram | Discord |
|---------|----------|---------|
| API | Bot API | Webhooks / Bot API |
| Formatting | Markdown | Markdown + Embeds |
| Channels | Chat ID | Channel ID/Webhook |
| Auth | Bot Token | Bot Token / Webhook URL |
| Rich Media | Limited | Rich Embeds |

## Migration Guide

### From Telegram Bot
```javascript
// Telegram
bot.sendMessage(chatId, "Hello", { parse_mode: 'Markdown' });

// Discord Equivalent
fetch(webhookUrl, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ content: "Hello" })
});
```

### Message Formatting
```javascript
// Telegram Markdown
**bold** __italic__ `code` [link](url)

// Discord Markdown
**bold** *italic* `code` [link](url)

// Discord Embed (recommended)
{
  title: "Title",
  description: "Description with **bold** text",
  color: 0x8b5cf6
}
```

## Files

- `SKILL.md` - This file
- `CONFIGURATION.md` - Setup guide
- `cron-message.md` - Message templates
- `_meta.json` - Skill metadata

## License
MIT