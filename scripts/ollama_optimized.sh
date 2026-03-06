#!/bin/bash
# Optimized Ollama Cron Runner
# Routes tasks to Ollama with market-hours awareness

TASK="$1"
MODEL="${2:-llama3.2}"
HOUR=$(date +%H)
DOW=$(date +%u)  # 1-5 = Mon-Fri, 6-7 = Weekend

# Check if market hours (6am-1pm PT, Mon-Fri)
is_market_hours() {
    if [ "$DOW" -le 5 ] && [ "$HOUR" -ge 6 ] && [ "$HOUR" -lt 13 ]; then
        return 0
    fi
    return 1
}

# Check if extended hours (6am-8pm)
is_extended_hours() {
    if [ "$HOUR" -ge 6 ] && [ "$HOUR" -lt 20 ]; then
        return 0
    fi
    return 1
}

# Task-specific prompts with context
case "$TASK" in
    "cost-report")
        PROMPT="Generate a brief cost report. Check for unusual spending patterns. Current time: $(date '+%Y-%m-%d %H:%M')."
        ;;
    "market-trends")
        if is_market_hours; then
            PROMPT="Analyze market trends for SPY, QQQ, BTC. Market is OPEN. Provide key movements and levels. Time: $(date '+%H:%M')."
        else
            PROMPT="Market is CLOSED. Review after-hours activity and pre-market indicators."
        fi
        ;;
    "system-check")
        PROMPT="Run system health check. Report disk, memory, CPU. Flag any issues. Time: $(date '+%H:%M')."
        ;;
    "morning-brief")
        PROMPT="Generate morning brief: overnight news, futures, key events today. Market opens at 6:30am PT."
        ;;
    "midday-brief")
        PROMPT="Midday market update: current levels, notable moves, afternoon outlook."
        ;;
    "daily-digest")
        PROMPT="Daily digest: completed tasks, pending items, tomorrow's priorities."
        ;;
    "smart-alerts")
        if is_extended_hours; then
            PROMPT="Check for alerts: price thresholds, anomalies, urgent items. Extended hours active."
        else
            PROMPT="After-hours check: minimal monitoring, critical alerts only."
        fi
        ;;
    "market-watch")
        if is_market_hours; then
            PROMPT="Market watch: scan for >3% moves, unusual volume, breaking news."
        else
            exit 0  # Skip if market closed
        fi
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
