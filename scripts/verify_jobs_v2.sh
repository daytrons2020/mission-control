#!/bin/bash
# verify_jobs_v2.sh - Full test after Ollama fix

cd /Users/daytrons/.openclaw/workspace/scripts

echo "=========================================="
echo "FULL VERIFICATION TEST"
echo "=========================================="
echo ""

# Warm up Ollama first
echo "Step 1: Warming up Ollama..."
bash warm_ollama.sh
sleep 3
echo ""

echo "Step 2: Testing Health Check..."
START=$(date +%s)
RESULT=$(bash health_check.sh 2>&1)
END=$(date +%s)
DURATION=$((END - START))
echo "Duration: ${DURATION}s"
echo "Output:"
echo "$RESULT"
echo ""

echo "Step 3: Testing Cost Report..."
START=$(date +%s)
RESULT=$(bash cost_report.sh 2>&1)
END=$(date +%s)
DURATION=$((END - START))
echo "Duration: ${DURATION}s"
echo "Output:"
echo "$RESULT"
echo ""

echo "Step 4: Testing World News..."
START=$(date +%s)
RESULT=$(bash world_news.sh 2>&1)
END=$(date +%s)
DURATION=$((END - START))
echo "Duration: ${DURATION}s"
echo "Output:"
echo "$RESULT"
echo ""

echo "=========================================="
echo "VERIFICATION COMPLETE"
echo "=========================================="
