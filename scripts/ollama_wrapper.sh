#!/bin/bash
# ollama_wrapper_v2.sh - More robust Ollama caller with model fallback

MODEL="${1:-qwen3:8b}"
PROMPT="$2"
FALLBACK_TEXT="$3"
TIMEOUT_SECS="${4:-10}"

# Available models to try (in order)
MODELS=("qwen3:8b" "llama3.2:latest" "gemma3:4b")

# Step 1: Fast pre-check (2s timeout)
HEALTH_CHECK=$(curl -s --max-time 2 http://localhost:11434/api/tags 2>/dev/null)
if [ -z "$HEALTH_CHECK" ]; then
    echo "$FALLBACK_TEXT"
    exit 0
fi

# Step 2: Try each model until one works
for TRY_MODEL in "${MODELS[@]}"; do
    # Check if model exists
    if echo "$HEALTH_CHECK" | grep -q "\"name\":\"$TRY_MODEL\""; then
        
        # Try generation with this model
        RESPONSE=$(curl -s --max-time "$TIMEOUT_SECS" http://localhost:11434/api/generate -d "{
          \"model\": \"$TRY_MODEL\",
          \"prompt\": \"$PROMPT\",
          \"stream\": false,
          \"options\": {
            \"temperature\": 0.1,
            \"num_predict\": 100
          }
        }" 2>/dev/null)
        
        # Extract response using multiple methods (jq or grep)
        if command -v jq >/dev/null 2>&1; then
            PARSED=$(echo "$RESPONSE" | jq -r '.response // empty' 2>/dev/null)
        else
            # Fallback parsing without jq
            PARSED=$(echo "$RESPONSE" | grep -o '"response":"[^"]*"' | sed 's/"response":"//;s/"$//' | head -1)
        fi
        
        if [ -n "$PARSED" ] && [ "$PARSED" != "null" ]; then
            echo "$PARSED"
            exit 0
        fi
    fi
done

# All models failed - use fallback
echo "$FALLBACK_TEXT"
exit 0
