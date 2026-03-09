#!/bin/bash
# debug_ollama.sh - Test Ollama connectivity step by step

echo "=== Ollama Debug ==="
echo ""

echo "1. Testing API connectivity..."
HEALTH=$(curl -s --max-time 3 http://localhost:11434/api/tags 2>&1)
echo "Raw response:"
echo "$HEALTH" | head -3
echo ""

echo "2. Checking for models..."
echo "$HEALTH" | grep -o '"name":"[^"]*"' | head -5
echo ""

echo "3. Testing generate endpoint..."
RESULT=$(curl -s --max-time 10 http://localhost:11434/api/generate -d '{
  "model": "qwen3:8b",
  "prompt": "Say hello in 3 words",
  "stream": false
}' 2>&1)
echo "Raw generate response:"
echo "$RESULT" | head -5
echo ""

echo "4. Checking jq..."
which jq 2>&1 || echo "jq not found"
echo ""

echo "5. Parsing with jq..."
echo "$RESULT" | jq -r '.response // empty' 2>&1 || echo "jq parse failed"
echo ""

echo "=== Debug Complete ==="
