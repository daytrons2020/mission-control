#!/bin/bash
# Start Cost-Conscious Smart Router
# ALL tasks go to MLX first. Only escalate to paid APIs on failure.

cd "$(dirname "$0")"

echo "🧠 Cost-Conscious Smart Router"
echo "=============================="

# Check MLX is running
if curl -s http://127.0.0.1:18888/v1/models > /dev/null 2>&1; then
    echo "✓ MLX 14B server is running"
else
    echo "✗ MLX server not detected! Start it first:"
    echo "  ./start-mlx-server.sh"
    exit 1
fi

# Check API keys (for escalation only)
if [ -n "$MINIMAX_API_KEY" ]; then
    echo "✓ MiniMax API key available (escalation)"
else
    echo "⚠ MiniMax API key not set - no escalation available"
fi

if [ -n "$KIMI_API_KEY" ]; then
    echo "✓ Kimi API key available (final escalation)"
else
    echo "⚠ Kimi API key not set - final escalation unavailable"
fi

# Use venv if available
if [ -f "venv/bin/python3" ]; then
    PYTHON="venv/bin/python3"
else
    PYTHON="python3"
fi

echo ""
echo "Strategy: Cost-Optimized Escalation"
echo "  • Every task starts with MLX 14B (FREE)"
echo "  • Escalates ONLY if MLX cannot complete"
echo "  • Typical cost savings: 70-90% vs always-cloud"
echo ""
echo "Starting router on port 11435..."
echo "Press Ctrl+C to stop"
echo ""

$PYTHON smart_router_cost_conscious.py
