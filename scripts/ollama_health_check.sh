#!/usr/bin/env bash
# Ollama-based gateway health check
# Zero token cost

SCRIPT_DIR=$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)

echo "[$(date '+%H:%M:%S')] Checking gateway status..."

# Use pure system check first
if command -v openclaw &> /dev/null; then
    openclaw gateway status 2>&1 | head -5
else
    # Fallback: check if process running
    pgrep -f "openclaw" > /dev/null && echo "Gateway: RUNNING" || echo "Gateway: STOPPED"
fi

echo "Health check complete."
