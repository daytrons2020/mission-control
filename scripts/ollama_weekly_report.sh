#!/bin/bash
# Ollama Weekly Report - runs Sundays at 6 AM PT
SCRIPT_DIR=$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)
python3 "$SCRIPT_DIR/ollama_weekly_report.py"
