# Discord Cron Message Skill

## Overview
This skill sends automated messages to Discord channels on a schedule. It's adapted from the Telegram version to work with Discord webhooks and bot API.

## Quick Start

### 1. Configure Webhook
```javascript
const config = {
  webhookUrl: process.env.DISCORD_WEBHOOK_URL,
  username: "Mission Control",
  avatarUrl: "https://your-avatar.png"
};
```

### 2. Send Simple Message
```javascript
await sendDiscordMessage({
  content: "Hello from Mission Control!"
});
```

### 3. Send Rich Embed
```javascript
await sendDiscordEmbed({
  title: "Daily Report",
  description: "System status update",
  color: 0x8b5cf6,
  fields: [
    { name: "Status", value: "✅ Online", inline: true },
    { name: "Uptime", value: "99.9%", inline: true }
  ]
});
```

### 4. Schedule Message
```javascript
// Every day at 6 AM
cron.schedule('0 6 * * *', async () => {
  await sendDiscordEmbed({
    title: "🌅 Morning Brief",
    description: "Daily status update"
  });
});
```

## API Reference

### sendDiscordMessage(options)
Send a simple text message.

**Parameters:**
- `content` (string) - Message text
- `username` (string, optional) - Override webhook username
- `avatarUrl` (string, optional) - Override webhook avatar

**Example:**
```javascript
await sendDiscordMessage({
  content: "System check complete!",
  username: "Health Monitor"
});
```

### sendDiscordEmbed(options)
Send a rich embed message.

**Parameters:**
- `title` (string) - Embed title
- `description` (string) - Embed description
- `color` (number) - Color code (decimal)
- `fields` (array) - Field objects with name/value/inline
- `timestamp` (string, optional) - ISO timestamp
- `footer` (object, optional) - Footer text and icon

**Example:**
```javascript
await sendDiscordEmbed({
  title: "📊 System Status",
  description: "All systems operational",
  color: 3066993, // Green
  fields: [
    { name: "CPU", value: "45%", inline: true },
    { name: "Memory", value: "60%", inline: true }
  ],
  timestamp: new Date().toISOString(),
  footer: { text: "Mission Control" }
});
```

## Discord vs Telegram

| Feature | Telegram | Discord |
|---------|----------|---------|
| Text Formatting | Markdown | Markdown |
| Rich Media | Limited | Embeds |
| Max Message Length | 4096 chars | 2000 chars |
| Rate Limits | 30 msgs/sec | 5 msgs/sec |
| Webhooks | Yes | Yes |
| Bot API | Yes | Yes |

## Migration from Telegram

### Message Formatting
```javascript
// Telegram
bot.sendMessage(chatId, "*Bold* _italic_ `code`");

// Discord
sendDiscordMessage({ content: "**Bold** *italic* `code`" });
```

### Rich Messages
```javascript
// Telegram (limited)
bot.sendMessage(chatId, "Title\n\nDescription", {
  parse_mode: 'Markdown'
});

// Discord (rich embeds)
sendDiscordEmbed({
  title: "Title",
  description: "Description",
  color: 0x8b5cf6,
  fields: [...]
});
```

## Files

- `README.md` - This documentation
- `CONFIGURATION.md` - Setup and configuration guide
- `cron-message.md` - Message templates
- `_meta.json` - Skill metadata

## Support

For issues or questions, check:
- Discord Developer Docs: https://discord.com/developers/docs
- Discord Webhooks Guide: https://support.discord.com/hc/en-us/articles/228383668

## License
MIT