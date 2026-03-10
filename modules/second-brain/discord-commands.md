# Discord Commands for 2nd Brain

## /brain
Main 2nd Brain command with subcommands.

**Usage:** `/brain [subcommand]`

**Subcommands:**
- `/brain dashboard` — Show quick stats overview
- `/brain search [query]` — Search all memories and documents
- `/brain status` — System health check

## /memory
Manage memories directly from Discord.

**Usage:** `/memory [action]`

**Actions:**
- `/memory add [content]` — Add a new memory
- `/memory list [count]` — List recent memories (default: 5)
- `/memory search [query]` — Search memories
- `/memory today` — Show today's memories
- `/memory tag [tag]` — Filter by tag

**Examples:**
```
/memory add Remember to review trading strategy tomorrow
/memory list 10
/memory search "Mission Control"
/memory today
/memory tag daily
```

## /task
Task management via Discord.

**Usage:** `/task [action]`

**Actions:**
- `/task list` — Show all tasks
- `/task add [description]` — Add new task
- `/task done [id]` — Mark task complete
- `/task cron` — List cron jobs status
- `/task agents` — Show agent tasks

**Examples:**
```
/task list
/task add Fix Discord webhook integration
/task cron
/task agents
```

## /doc
Quick access to documents.

**Usage:** `/doc [name]`

**Names:**
- `/doc agents` — AGENTS.md
- `/doc tools` — TOOLS.md
- `/doc memory` — MEMORY.md
- `/doc mission` — MISSION_CONTROL.md
- `/doc skills` — List all skills

## /insight
Get AI-generated insights.

**Usage:** `/insight [type]`

**Types:**
- `/insight daily` — Daily summary
- `/insight weekly` — Weekly patterns
- `/insight tasks` — Task recommendations
- `/insight costs` — Cost optimization tips

## /ask
Natural language query to 2nd Brain.

**Usage:** `/ask [question]`

**Examples:**
```
/ask What did I work on yesterday?
/ask Show me all tasks about Discord
/ask What's failing right now?
/ask Summarize this week's progress
```

## Implementation Notes

These commands will be implemented as:
1. Discord slash commands via OpenClaw
2. Cron job for automated insights
3. Webhook for real-time updates
