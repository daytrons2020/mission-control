#!/bin/bash
# Test Smart Router with different task types

echo "🧪 Testing Smart Router + Kimi Code Integration"
echo "================================================"
echo ""

# Check services
echo "1. Checking services..."
curl -s http://127.0.0.1:11435/health > /dev/null && echo "   ✓ Smart Router (11435)" || echo "   ✗ Smart Router"
curl -s http://127.0.0.1:11436/health > /dev/null && echo "   ✓ Kimi Code Bridge (11436)" || echo "   ✗ Kimi Code Bridge"
curl -s http://127.0.0.1:18888/v1/models > /dev/null && echo "   ✓ MLX Server (18888)" || echo "   ✗ MLX Server"
echo ""

# Test 1: Simple task (should use MLX)
echo "2. Test: Simple greeting (expect MLX)..."
RESPONSE=$(curl -s http://127.0.0.1:11435/v1/chat/completions \
  -H "Content-Type: application/json" \
  -d '{
    "model": "intelligent-agent",
    "messages": [{"role": "user", "content": "Say hello in 3 words"}]
  }' 2>&1)

if echo "$RESPONSE" | grep -q "choices"; then
    MODEL=$(echo "$RESPONSE" | python3 -c "import json,sys; d=json.load(sys.stdin); print(d.get('_routing',{}).get('used','unknown'))" 2>/dev/null)
    CONTENT=$(echo "$RESPONSE" | python3 -c "import json,sys; d=json.load(sys.stdin); print(d['choices'][0]['message']['content'][:50])" 2>/dev/null)
    echo "   ✓ Response from: $MODEL"
    echo "   Content: $CONTENT..."
else
    echo "   ✗ Failed: $(echo "$RESPONSE" | head -c 100)"
fi
echo ""

# Test 2: Coding task (might escalate)
echo "3. Test: Create a Python hello world (may use MLX or escalate)..."
RESPONSE=$(curl -s http://127.0.0.1:11435/v1/chat/completions \
  -H "Content-Type: application/json" \
  -d '{
    "model": "intelligent-agent",
    "messages": [{"role": "user", "content": "Create a Python script that prints hello world"}]
  }' 2>&1)

if echo "$RESPONSE" | grep -q "choices"; then
    MODEL=$(echo "$RESPONSE" | python3 -c "import json,sys; d=json.load(sys.stdin); print(d.get('_routing',{}).get('used','unknown'))" 2>/dev/null)
    echo "   ✓ Response from: $MODEL"
    echo "   Routing: $(echo "$RESPONSE" | python3 -c "import json,sys; d=json.load(sys.stdin); r=d.get('_routing',{}); print(f'category={r.get(\"category\",\"?\")}, cost={r.get(\"cost\",\"?\")}')" 2>/dev/null)"
else
    echo "   ✗ Failed: $(echo "$RESPONSE" | head -c 100)"
fi
echo ""

# Test 3: Direct Kimi Code
echo "4. Test: Direct Kimi Code (file editing)..."
RESPONSE=$(curl -s http://127.0.0.1:11436/v1/chat/completions \
  -H "Content-Type: application/json" \
  -d '{
    "model": "kimi-code",
    "messages": [{"role": "user", "content": "Create a simple hello.py file"}]
  }' 2>&1)

if echo "$RESPONSE" | grep -q "choices"; then
    CONTENT=$(echo "$RESPONSE" | python3 -c "import json,sys; d=json.load(sys.stdin); print(d['choices'][0]['message']['content'][:80])" 2>/dev/null)
    FILES=$(echo "$RESPONSE" | python3 -c "import json,sys; d=json.load(sys.stdin); print(d.get('_kimi_code_info',{}).get('files_modified',[]))" 2>/dev/null)
    echo "   ✓ Kimi Code responded"
    echo "   Content: $CONTENT..."
    echo "   Files: $FILES"
else
    echo "   ✗ Failed: $(echo "$RESPONSE" | head -c 100)"
fi
echo ""

# Test 4: Complex task that might skip MiniMax
echo "5. Test: Architecture design (may skip MiniMax)..."
RESPONSE=$(curl -s http://127.0.0.1:11435/v1/chat/completions \
  -H "Content-Type: application/json" \
  -d '{
    "model": "intelligent-agent",
    "messages": [{"role": "user", "content": "Design a microservices architecture for an e-commerce platform"}]
  }' 2>&1)

if echo "$RESPONSE" | grep -q "choices"; then
    MODEL=$(echo "$RESPONSE" | python3 -c "import json,sys; d=json.load(sys.stdin); print(d.get('_routing',{}).get('used','unknown'))" 2>/dev/null)
    SKIPPED=$(echo "$RESPONSE" | python3 -c "import json,sys; d=json.load(sys.stdin); print(d.get('_routing',{}).get('skipped','none'))" 2>/dev/null)
    echo "   ✓ Response from: $MODEL"
    [ "$SKIPPED" != "None" ] && echo "   Skipped: $SKIPPED"
else
    echo "   Note: All models may have failed (expected without API keys)"
    echo "   Response: $(echo "$RESPONSE" | python3 -c "import json,sys; d=json.load(sys.stdin); print(d.get('message','no message'))" 2>/dev/null)"
fi
echo ""

echo "✅ Tests complete!"
echo ""
echo "View router logs: tail -f ~/.openclaw/workspace/mission-control-repo/logs/router.log"
