# Zero-Token Cron System

A standalone cron system for Dayton's Mac mini that runs health checks and cost reports using Ollama (local, free) and posts to Discord via webhooks — **zero OpenClaw agent invocations**.

## Overview

| Component | Purpose | Schedule |
|-----------|---------|----------|
| Health Check | Monitor disk, memory, load | Every 6 hours |
| Cost Report | Track API usage costs | Hourly at :05 |

All jobs complete in <20 seconds with Ollama fallbacks.

## Architecture

```
┌─────────────────┐     ┌──────────────┐     ┌─────────────────┐
│  launchd        │────▶│  Job Script  │────▶│  Ollama (local) │
│  (scheduler)    │     │  (bash)      │     │  (formatting)   │
└─────────────────┘     └──────────────┘     └─────────────────┘
                               │
                               ▼
                        ┌──────────────┐
                        │  Discord     │
                        │  Webhook     │
                        └──────────────┘
```

## Files

```
zero-token-cron/
├── discord_post.sh              # Discord webhook poster
├── jobs/
│   ├── health_check_job.sh      # Health check job
│   └── cost_report_job.sh       # Cost report job
├── launchd/
│   ├── com.dayton.healthcheck.plist    # Health check plist
│   └── com.dayton.costreport.plist     # Cost report plist
├── logs/                        # Log files (created at runtime)
├── .webhook_config              # Discord webhook URLs (created by setup)
├── setup_zero_token_cron.sh     # Installation script
└── README.md                    # This file
```

## Quick Start

### 1. Run Setup

```bash
cd /Users/daytrons/.openclaw/workspace/zero-token-cron
./setup_zero_token_cron.sh
```

The setup script will:
- Ask for your Discord webhook URLs
- Make scripts executable
- Install launchd plists (optional)
- Send a test message

### 2. Provide Webhook URLs

You'll need webhook URLs for:
- `#admin` channel (for health checks)
- `#token-tracker` channel (for cost reports)

To create a webhook in Discord:
1. Go to Server Settings → Integrations → Webhooks
2. Create webhook for each channel
3. Copy the webhook URLs

### 3. Verify Installation

```bash
# Check if plists are loaded
launchctl list | grep com.dayton

# View logs
tail -f logs/healthcheck.log
tail -f logs/costreport.log

# Test manually
./jobs/health_check_job.sh
./jobs/cost_report_job.sh
```

## Manual Testing

### Test Discord Posting

```bash
# Post to admin channel
./discord_post.sh admin "Test message from zero-token cron"

# Post to token-tracker channel
./discord_post.sh token-tracker "Cost report test"
```

### Test Individual Jobs

```bash
# Health check (posts to #admin)
./jobs/health_check_job.sh

# Cost report (posts to #token-tracker)
./jobs/cost_report_job.sh
```

### Test Ollama Integration

```bash
# Ensure Ollama is running
curl http://localhost:11434/api/tags

# Test the wrapper
../scripts/ollama_wrapper.sh "qwen3:8b" "Say hello" "Fallback text" 10
```

## Schedule Details

| Job | Schedule | Launchd Key |
|-----|----------|-------------|
| Health Check | Every 6 hours (21600s) | `com.dayton.healthcheck` |
| Cost Report | Every hour at :05 | `com.dayton.costreport` |

## Managing Launchd

```bash
# Unload plists
launchctl unload ~/Library/LaunchAgents/com.dayton.healthcheck.plist
launchctl unload ~/Library/LaunchAgents/com.dayton.costreport.plist

# Load plists
launchctl load ~/Library/LaunchAgents/com.dayton.healthcheck.plist
launchctl load ~/Library/LaunchAgents/com.dayton.costreport.plist

# Check status
launchctl list | grep com.dayton

# Run immediately (for testing)
launchctl start com.dayton.healthcheck
launchctl start com.dayton.costreport
```

## Logs

Logs are stored in `logs/`:
- `healthcheck.log` - Health check output
- `healthcheck.error.log` - Health check errors
- `costreport.log` - Cost report output
- `costreport.error.log` - Cost report errors

## Troubleshooting

### Webhook not working

1. Check `.webhook_config` exists and has valid URLs
2. Test manually: `./discord_post.sh admin "test"`
3. Check Discord webhook settings

### Ollama not responding

1. Ensure Ollama is running: `curl http://localhost:11434/api/tags`
2. Check models are available
3. Jobs have fallbacks - they'll still work without Ollama

### Jobs not running

1. Check plists are loaded: `launchctl list | grep com.dayton`
2. Check logs for errors: `tail logs/*.error.log`
3. Try running manually to see output

## Security

- Webhook URLs are stored in `.webhook_config` with 600 permissions
- Config file is sourced, not executed
- No API keys or tokens in scripts

## Requirements

- macOS (for launchd)
- Ollama running locally
- Discord webhook URLs
- curl, bash (standard macOS tools)

## Zero Token Guarantee

This system:
- ✅ Uses Ollama (local, free) for formatting
- ✅ Posts directly to Discord via webhooks
- ✅ Runs via launchd (no agent invocation)
- ✅ Has fallbacks if Ollama fails
- ✅ Completes in <20 seconds

No OpenClaw agent calls. No API costs. Fully autonomous.
