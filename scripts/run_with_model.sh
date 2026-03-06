#!/usr/bin/env bash
# Model router for banked token tasks
# Usage: run_with_model.sh <model> <task>

MODEL=$1
TASK=$2
SCRIPT_DIR=$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)

case $MODEL in
  kimi)
    # Route to Kimi (moonshot/kimi-k2.5)
    echo "[$(date)] Running $TASK with Kimi..."
    # Call the appropriate task script with Kimi model flag
    ;;
  minimax)
    # Route to Minimax (minimax/MiniMax-M2.5)
    echo "[$(date)] Running $TASK with Minimax..."
    ;;
  *)
    echo "Unknown model: $MODEL"
    exit 1
    ;;
esac

# Task dispatch
case $TASK in
  morning_brief)
    # Generate morning brief
    ;;
  daily_digest)
    # Generate daily digest
    ;;
  stock_setup)
    # A+ stock setup analysis
    ;;
  weekly_report)
    # Weekly report
    ;;
  twitter_research)
    # Twitter research
    ;;
  *)
    echo "Unknown task: $TASK"
    exit 1
    ;;
esac

echo "Task $TASK complete."
