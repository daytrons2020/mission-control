# Cron Message Templates for Discord

## Daily Brief Template

### Morning Brief (6 AM)
```json
{
  "embeds": [{
    "title": "🌅 Morning Brief",
    "description": "Your daily Mission Control update",
    "color": 65535,
    "fields": [
      {
        "name": "🌤️ Weather",
        "value": "{{weather}}",
        "inline": true
      },
      {
        "name": "📈 Markets",
        "value": "SPY: {{spy_price}}\nQQQ: {{qqq_price}}",
        "inline": true
      },
      {
        "name": "📋 Tasks Today",
        "value": "{{task_count}} tasks scheduled",
        "inline": false
      }
    ],
    "timestamp": "{{current_time}}",
    "footer": {
      "text": "Mission Control // NANO v2.0"
    }
  }]
}
```

### Evening Digest (8 PM)
```json
{
  "embeds": [{
    "title": "🌙 Daily Digest",
    "description": "Summary of today's activity",
    "color": 10181046,
    "fields": [
      {
        "name": "✅ Completed",
        "value": "{{completed_tasks}} tasks",
        "inline": true
      },
      {
        "name": "⏳ In Progress",
        "value": "{{active_tasks}} tasks",
        "inline": true
      },
      {
        "name": "💰 Token Usage",
        "value": "{{token_usage}} tokens (${{cost}})",
        "inline": true
      }
    ],
    "timestamp": "{{current_time}}"
  }]
}
```

## System Health Template

```json
{
  "embeds": [{
    "title": "💓 Health Check",
    "description": "{{status_emoji}} {{status_message}}",
    "color": {{status_color}},
    "fields": [
      {
        "name": "🖥️ System",
        "value": "CPU: {{cpu}}%\nMemory: {{memory}}%",
        "inline": true
      },
      {
        "name": "💾 Storage",
        "value": "Disk: {{disk_usage}}%",
        "inline": true
      },
      {
        "name": "🤖 Agents",
        "value": "{{active_agents}} active",
        "inline": true
      }
    ],
    "timestamp": "{{current_time}}"
  }]
}
```

## Trading Alert Template

```json
{
  "content": "@here Trading Alert",
  "embeds": [{
    "title": "📊 {{stock_ticker}} Alert",
    "description": "{{alert_message}}",
    "color": {{alert_color}},
    "fields": [
      {
        "name": "💵 Price",
        "value": "${{price}} ({{change}}%)",
        "inline": true
      },
      {
        "name": "📊 Volume",
        "value": "{{volume}}",
        "inline": true
      },
      {
        "name": "🎯 Setup",
        "value": "{{setup_type}}",
        "inline": true
      }
    ],
    "timestamp": "{{current_time}}"
  }]
}
```

## Cost Report Template

```json
{
  "embeds": [{
    "title": "💰 Hourly Cost Report",
    "description": "Token usage for the past hour",
    "color": 3447003,
    "fields": [
      {
        "name": "🤖 Model",
        "value": "{{model_name}}",
        "inline": true
      },
      {
        "name": "🔢 Tokens",
        "value": "{{token_count}}",
        "inline": true
      },
      {
        "name": "💵 Cost",
        "value": "${{cost}}",
        "inline": true
      }
    ],
    "timestamp": "{{current_time}}"
  }]
}
```

## Color Codes

| Status | Color | Hex |
|--------|-------|-----|
| Success | Green | 3066993 |
| Warning | Yellow | 16776960 |
| Error | Red | 15158332 |
| Info | Blue | 3447003 |
| Neutral | Gray | 9807270 |

## Variables

All templates support these variables:
- `{{current_time}}` - ISO timestamp
- `{{date}}` - Current date
- `{{time}}` - Current time
- Custom variables defined in your cron job