#!/bin/bash
# verify_jobs.sh - Test all reliable job scripts

echo "=========================================="
echo "VERIFYING RELIABLE JOB SCRIPTS"
echo "=========================================="
echo ""

cd /Users/daytrons/.openclaw/workspace/scripts

# Test 1: Ollama wrapper
echo "TEST 1: Ollama Wrapper"
echo "----------------------"
START=$(date +%s)
RESULT=$(bash ollama_wrapper.sh "qwen3:8b" "Say 'Ollama is working' in 5 words or less" "FALLBACK: Ollama not responding" 10)
END=$(date +%s)
DURATION=$((END - START))
echo "Duration: ${DURATION}s"
echo "Result: $RESULT"
if [ "$DURATION" -lt 15 ]; then
    echo "✅ PASS: Completed in <15s"
else
    echo "❌ FAIL: Too slow"
fi
echo ""

# Test 2: Health check
echo "TEST 2: Health Check Script"
echo "---------------------------"
START=$(date +%s)
RESULT=$(bash health_check.sh 2>&1)
END=$(date +%s)
DURATION=$((END - START))
echo "Duration: ${DURATION}s"
echo "Result:"
echo "$RESULT"
if [ "$DURATION" -lt 15 ]; then
    echo "✅ PASS: Completed in <15s"
else
    echo "❌ FAIL: Too slow"
fi
echo ""

# Test 3: Cost report
echo "TEST 3: Cost Report Script"
echo "--------------------------"
START=$(date +%s)
RESULT=$(bash cost_report.sh 2>&1)
END=$(date +%s)
DURATION=$((END - START))
echo "Duration: ${DURATION}s"
echo "Result:"
echo "$RESULT"
if [ "$DURATION" -lt 15 ]; then
    echo "✅ PASS: Completed in <15s"
else
    echo "❌ FAIL: Too slow"
fi
echo ""

# Test 4: World news
echo "TEST 4: World News Script"
echo "-------------------------"
START=$(date +%s)
RESULT=$(bash world_news.sh 2>&1)
END=$(date +%s)
DURATION=$((END - START))
echo "Duration: ${DURATION}s"
echo "Result:"
echo "$RESULT"
if [ "$DURATION" -lt 20 ]; then
    echo "✅ PASS: Completed in <20s"
else
    echo "❌ FAIL: Too slow"
fi
echo ""

echo "=========================================="
echo "VERIFICATION COMPLETE"
echo "=========================================="
