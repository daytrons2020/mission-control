---
name: ollama-health
description: Health check and monitoring for Ollama local LLM service. Check service status, model availability, diagnose timeouts, and recommend fallbacks. Use when Ollama cron jobs fail, local models are unresponsive, or troubleshooting AI service connectivity.
---

# Ollama Health Check

Monitor and diagnose Ollama local LLM service health.

## Features

- **Service Status**: Check if Ollama daemon is running
- **Model Availability**: Verify specific models are loaded
- **Timeout Diagnosis**: Identify common timeout causes
- **Fallback Recommendations**: Suggest alternative models

## Quick Start

### Check Ollama Status

```bash
python3 skills/ollama-health/scripts/ollama-health.py status
```

### Test Specific Model

```bash
python3 skills/ollama-health/scripts/ollama-health.py test --model qwen3:8b
```

### Diagnose Timeout Issues

```bash
python3 skills/ollama-health/scripts/ollama-health.py diagnose
```

## Common Issues

### Timeout Errors

**Symptoms:** Cron jobs fail with Ollama timeout errors

**Causes:**
1. Ollama service not running
2. Model not downloaded/available
3. Insufficient system resources (RAM/CPU)
4. First-time model load (cold start)

**Solutions:**
1. Start Ollama: `ollama serve` or `brew services start ollama`
2. Pull model: `ollama pull qwen3:8b`
3. Check resources: `htop` or Activity Monitor
4. Pre-load model: `ollama run qwen3:8b` then exit

### Fallback Strategy

When Ollama is unavailable, use these alternatives:

| Use Case | Fallback Model | Cost |
|----------|---------------|------|
| General tasks | moonshot/kimi-k2.5 | $0.50/1M input |
| Quick responses | openrouter/auto | ~$0.30/1M input |
| Code generation | Keep Ollama cached | Free |

## Integration

### Cron Job Health Checks

Add to cron jobs that use Ollama:

```bash
# Pre-flight check
if ! python3 skills/ollama-health/scripts/ollama-health.py check --quiet; then
  echo "Ollama unavailable, using fallback"
  MODEL="moonshot/kimi-k2.5"
fi
```

### Automated Monitoring

Run health checks every 6 hours:

```bash
openclaw cron add --name "Ollama Health Check" \
  --schedule "0 */6 * * *" \
  --command "python3 skills/ollama-health/scripts/ollama-health.py status --notify"
```

## Commands

```bash
# Full status report
python3 skills/ollama-health/scripts/ollama-health.py status

# Quick check (exit code only)
python3 skills/ollama-health/scripts/ollama-health.py check --quiet

# Test model response time
python3 skills/ollama-health/scripts/ollama-health.py test --model qwen3:8b --timeout 30

# Diagnose issues
python3 skills/ollama-health/scripts/ollama-health.py diagnose

# List available models
python3 skills/ollama-health/scripts/ollama-health.py list-models
```

## Data Storage

Health check logs stored in: `~/.openclaw/ollama-health/logs.json`
