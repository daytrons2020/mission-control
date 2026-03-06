#!/bin/bash
# Ollama Task Runner for OpenClaw Cron Jobs
# Usage: ./ollama_task.sh "prompt text" [model_name]

MODEL="${2:-llama3.2}"
PROMPT="$1"

if [ -z "$PROMPT" ]; then
    echo "Error: No prompt provided"
    echo "Usage: $0 \"Your prompt here\" [model_name]"
    exit 1
fi

# Check if Ollama is running
if ! curl -s http://localhost:11434/api/tags > /dev/null 2>&1; then
    echo "Error: Ollama not running. Start with: ollama serve"
    exit 1
fi

# Call Ollama API
curl -s http://localhost:11434/api/generate -d "{
  \"model\": \"$MODEL\",
  \"prompt\": \"$PROMPT\",
  \"stream\": false
}" | jq -r '.response' 2>/dev/null || echo "Error: Failed to get response from Ollama"
