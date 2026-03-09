# Ollama Timeout Issue - March 7, 2026

## Problem
- Ollama cron jobs timing out (60s limit)
- `ai-news-feed`: 2 consecutive errors
- Cannot restart Ollama without approval (exec policy)
- Affects: Morning Brief, AI News, World News, Keep-warm pings

## Root Cause
- Ollama service not running or unresponsive on localhost:11434
- Keep-warm job (every 5 min) failing silently
- No health check before dependent jobs run

## Solutions to Consider

### 1. **Health Check + Auto-Recovery Job**
Add a lightweight cron that:
- Checks if Ollama responds (fast ping, 5s timeout)
- If down: sends alert to #admin with restart instructions
- If up: updates a status file other jobs can check

### 2. **Failover to Cloud LLM**
Update Ollama-dependent jobs to:
- Try Ollama first (10s timeout)
- If fail: fallback to moonshot/kimi-k2.5
- Higher cost but reliable

### 3. **Remove Ollama Dependency**
Switch all jobs to use:
- `moonshot/kimi-k2.5` (current default)
- `openrouter/auto` (cheapest option)
- Eliminates local infra dependency

### 4. **Systemd/Launchd Monitoring**
- Configure Ollama to auto-restart on crash
- Add proper service management
- Requires host-level config

## Recommended: Hybrid Approach
1. Keep Ollama for zero-cost operations
2. Add health check job (every 10 min)
3. Add fallback logic to dependent jobs
4. Alert #admin when Ollama is down >30 min

## Status
- Dayton aware of issue
- Needs decision on approach
- Exec approval policy blocks auto-restart
