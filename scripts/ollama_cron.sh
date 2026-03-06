#!/bin/bash
# Ollama Cron Job Runner
# Routes different tasks to appropriate Ollama models

TASK="$1"
MODEL="${2:-llama3.2}"

# Task-specific prompts
case "$TASK" in
    "cost-report")
        PROMPT="Generate a brief cost report summary. Check if any costs are unusually high and flag them."
        ;;
    "market-trends")
        PROMPT="Analyze recent market trends for SPY, QQQ, and BTC. Provide a brief summary of key movements."
        ;;
    "system-check")
        PROMPT="Perform a system health check. Report disk usage, memory, and any critical issues found."
        ;;
    "maintenance")
        PROMPT="Run daily maintenance check. List any pending updates, cleanups, or issues to address."
        ;;
    "smart-alerts")
        PROMPT="Check for any alerts or anomalies that need attention. Prioritize by urgency."
        ;;
    "morning-brief")
        PROMPT="Generate a morning brief: summarize overnight market news, key events, and priorities for today."
        ;;
    "market-watch")
        PROMPT="Monitor market for significant moves (>3%). Report any stocks or assets hitting thresholds."
        ;;
    "daily-digest")
        PROMPT="Create a daily digest of completed tasks, pending items, and key metrics."
        ;;
    "weekly-report")
        PROMPT="Generate weekly summary: accomplishments, blockers, metrics, and goals for next week."
        ;;
    *)
        PROMPT="$TASK"
        ;;
esac

# Run Ollama
curl -s http://localhost:11434/api/generate -d "{
  \"model\": \"$MODEL\",
  \"prompt\": \"$PROMPT\",
  \"stream\": false
}" | jq -r '.response' 2>/dev/null
