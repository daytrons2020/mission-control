# Discord Slash Commands — Setup Guide

## Commands to Register

### 1. /status
Shows Mission Control system status
```json
{
  "name": "status",
  "description": "Show Mission Control system status",
  "type": 1
}
```

### 2. /project
Get details about a specific project
```json
{
  "name": "project",
  "description": "Get details about a specific project",
  "type": 1,
  "options": [{
    "name": "name",
    "description": "Project name",
    "type": 3,
    "required": true,
    "choices": [
      {"name": "Respiratory Education", "value": "respiratory-education"},
      {"name": "RT Scheduling", "value": "rt-scheduling"},
      {"name": "Trading System", "value": "trading-system"},
      {"name": "Respiratory Tools", "value": "respiratory-tools"},
      {"name": "Reselling Business", "value": "reselling-business"},
      {"name": "YouTube Empire", "value": "youtube-empire"},
      {"name": "Kids App", "value": "kids-app"}
    ]
  }]
}
```

### 3. /costs
Shows today's token usage
```json
{
  "name": "costs",
  "description": "Show today's token usage and costs",
  "type": 1
}
```

### 4. /tasks
List active tasks
```json
{
  "name": "tasks",
  "description": "List active tasks and their status",
  "type": 1,
  "options": [{
    "name": "filter",
    "description": "Filter tasks by status",
    "type": 3,
    "required": false,
    "choices": [
      {"name": "All", "value": "all"},
      {"name": "In Progress", "value": "in-progress"},
      {"name": "Blocked", "value": "blocked"},
      {"name": "Done", "value": "done"}
    ]
  }]
}
```

### 5. /skill
Show skill information
```json
{
  "name": "skill",
  "description": "Show information about an installed skill",
  "type": 1,
  "options": [{
    "name": "name",
    "description": "Skill name",
    "type": 3,
    "required": true,
    "choices": [
      {"name": "Elite PowerPoint", "value": "elite-powerpoint"},
      {"name": "Research", "value": "research"},
      {"name": "Backtesting", "value": "backtesting"},
      {"name": "Data Analysis", "value": "data-analysis"},
      {"name": "Video Edit", "value": "video-edit"}
    ]
  }]
}
```

### 6. /sync
Force sync Mission Control
```json
{
  "name": "sync",
  "description": "Force sync Mission Control with local workspace",
  "type": 1
}
```

### 7. /health
Show system health score
```json
{
  "name": "health",
  "description": "Show system health score and metrics",
  "type": 1
}
```

## Registration Steps

1. Get bot token from Discord Developer Portal
2. Use curl or Python script to POST to Discord API
3. Commands appear immediately in server

## API Endpoint
```
POST https://discord.com/api/v10/applications/{APPLICATION_ID}/guilds/{GUILD_ID}/commands
```

## Headers
```
Authorization: Bot {BOT_TOKEN}
Content-Type: application/json
```

## Implementation
See: `scripts/discord_slash_commands.py`
