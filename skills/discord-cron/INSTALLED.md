# Discord Cron Skill - Installed

## Location
`/Users/daytrons/.openclaw/workspace/skills/discord-cron/`

## Status: ✅ Active

This skill is now integrated into Mission Control.

## Usage

### From Cron Jobs
```json
{
  "delivery": {
    "mode": "announce",
    "channel": "discord",
    "to": "#channel-name"
  }
}
```

### From Scripts
```python
import sys
sys.path.insert(0, '/Users/daytrons/.openclaw/workspace/skills/discord-cron')
from discord_sender import send_discord_message

send_discord_message("Hello", channel="admin")
```

### Direct Message Tool
```javascript
message({
  channel: "discord",
  to: "#admin",
  content: "Hello from Mission Control!"
})
```

## Files
- `SKILL.md` - Documentation
- `CONFIGURATION.md` - Setup guide
- `cron-message.md` - Message templates
- `scripts/discord_sender.py` - Python interface

## Channels Configured
- #admin
- #token-tracker
- #morning-brief
- #daily-digest
- #trading-system