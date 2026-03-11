# cron-health

Monitor and diagnose cron job health across your system.

## What It Does

- Lists all cron jobs from user crontabs, system crontabs, and anacron
- Identifies jobs in error state by analyzing system logs
- Validates cron schedules and detects misconfigurations
- Suggests fixes for common issues
- Can be run manually or scheduled as a cron job itself

## Installation

No dependencies required - uses only Python standard library.

## Usage

### Run Health Check

```bash
# Basic check
python3 ~/.openclaw/workspace/skills/cron-health/scripts/cron-health.py

# Verbose output with full details
python3 ~/.openclaw/workspace/skills/cron-health/scripts/cron-health.py --verbose

# JSON output for automation
python3 ~/.openclaw/workspace/skills/cron-health/scripts/cron-health.py --json

# Skip log analysis (faster)
python3 ~/.openclaw/workspace/skills/cron-health/scripts/cron-health.py --no-logs

# Save report to file
python3 ~/.openclaw/workspace/skills/cron-health/scripts/cron-health.py --output report.json
```

### Schedule as Cron Job

Add to your crontab to run daily health checks:

```bash
# Daily health check at 9 AM
0 9 * * * /usr/bin/python3 ~/.openclaw/workspace/skills/cron-health/scripts/cron-health.py --json --output ~/cron-health-report.json

# Weekly report with email notification (requires mail setup)
0 8 * * 1 /usr/bin/python3 ~/.openclaw/workspace/skills/cron-health/scripts/cron-health.py --verbose 2>&1 | mail -s "Weekly Cron Health Report" admin@example.com
```

## What It Checks

### Job Collection
- User crontabs (`crontab -l`)
- System crontab (`/etc/crontab`)
- Cron.d directory (`/etc/cron.d/*`)
- Anacron jobs (`/etc/anacrontab`)

### Error Detection
- Empty or missing commands
- Non-existent script paths
- Invalid cron schedules
- Execution errors from system logs
- Percent signs in commands (common escaping issue)

### Suggestions
- Use absolute paths for interpreters
- Add output redirection
- Set MAILTO for error notifications
- Avoid overly frequent schedules (every minute)
- Detect duplicate jobs

## Exit Codes

- `0` - All jobs healthy
- `1` - One or more errors detected

## Output Format (JSON)

```json
{
  "timestamp": "2026-03-10T20:00:00",
  "total_jobs": 5,
  "active_jobs": 4,
  "inactive_jobs": 1,
  "jobs_with_errors": 1,
  "jobs": [...],
  "errors": [...],
  "suggestions": [...]
}
```

## Error Types

| Type | Severity | Description |
|------|----------|-------------|
| `empty_command` | high | Job has no command specified |
| `missing_script` | high | Referenced script does not exist |
| `invalid_schedule` | medium | Cron schedule syntax is invalid |
| `execution_error` | high | Job failed during execution |
| `percent_in_command` | low | Command contains % (may need escaping) |

## Platform Support

- Linux (systemd and sysvinit)
- macOS (uses unified logging)
- BSD systems

## Requirements

- Python 3.6+
- Read access to cron files
- Read access to system logs (may require sudo for full analysis)
