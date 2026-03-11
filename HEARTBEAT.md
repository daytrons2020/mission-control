# HEARTBEAT.md - Proactive Checks

**Reference:** `skills/heartbeat-ops/` for full guidelines

## Quick Reference

**Use heartbeat when:** Batch checks, conversational context, ~30min drift OK
**Use cron when:** Exact timing, isolated task, direct channel output

## Default Prompt

Read this file, follow strictly. Reply `HEARTBEAT_OK` if nothing needs attention.

## Check Rotation

- Emails — urgent unread?
- Calendar — events in 24-48h?
- Cron jobs — failures?
- Weather — relevant?

## Quick Commands

```bash
cron runs --limit 5
gateway status
df -h /
```

## When to Alert

- Important email
- Calendar event <2h
- System issue
- Been >8h since message

## When Quiet

- Late night (23:00-08:00)
- Human busy
- Nothing new
- Checked <30 min ago
