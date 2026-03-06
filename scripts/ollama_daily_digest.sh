#!/bin/bash
# Ollama Daily Digest - runs at 5 PM PT
SCRIPT_DIR=$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)
python3 "$SCRIPT_DIR/ollama_daily_digest.py"
