#!/bin/bash
# warm_ollama.sh - Pre-load models to prevent cold-start delays

echo "Warming up Ollama models..."

# Quick ping to wake up service
curl -s --max-time 2 http://localhost:11434/api/tags >/dev/null 2>&1

# Pre-load each model with a tiny request
for MODEL in "qwen3:8b" "llama3.2:latest"; do
    echo "  - Warming $MODEL..."
    curl -s --max-time 5 http://localhost:11434/api/generate -d "{
        \"model\": \"$MODEL\",
        \"prompt\": \"hi\",
        \"stream\": false,
        \"options\": {\"num_predict\": 1}
    }" >/dev/null 2>&1 &
done

wait
echo "Warm-up complete"
