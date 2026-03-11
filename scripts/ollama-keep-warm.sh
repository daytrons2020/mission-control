#!/bin/bash
# Ollama Keep-Warm Script
# Pings Ollama to keep qwen3:8b model loaded in memory
# Runs every 3 minutes via launchd
# Uses num_predict:0 for instant return (just loads model)

curl -s --max-time 5 http://localhost:11434/api/generate -d '{
  "model": "qwen3:8b",
  "prompt": "",
  "stream": false,
  "options": {"num_predict": 0}
}' > /dev/null 2>&1

exit 0
