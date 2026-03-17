#!/bin/bash
# Start Three-Tier Smart Router

cd "$(dirname "$0")"

echo "🧠 Starting Three-Tier Smart Router..."
echo "======================================"

# Check MLX is running
if curl -s http://127.0.0.1:18888/v1/models > /dev/null 2>&1; then
    echo "✓ MLX 14B server is running"
else
    echo "✗ MLX server not detected! Start it first:"
    echo "  ./start-mlx-server.sh"
    exit 1
fi

# Use venv if available
if [ -f "venv/bin/python3" ]; then
    PYTHON="venv/bin/python3"
else
    PYTHON="python3"
fi

echo ""
echo "Routing Strategy:"
echo "  • Simple tasks  → MLX 14B (local, fast, free)"
echo "  • Medium tasks  → MiniMax (cloud, balanced)"  
echo "  • Complex tasks → Kimi K2.5 (cloud, powerful)"
echo ""
echo "Fallback chain: MLX → MiniMax → Kimi → MLX"
echo ""
echo "Starting router on port 11435..."
echo "Press Ctrl+C to stop"
echo ""

$PYTHON smart_router_three_tier.py
