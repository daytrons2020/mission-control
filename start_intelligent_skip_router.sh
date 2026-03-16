#!/bin/bash
# Start Intelligent Skip Router
# Skips MiniMax for tasks where MLX indicates capability limitations

cd "$(dirname "$0")"

echo "🧠 Intelligent Skip Router"
echo "=========================="

# Check MLX
if curl -s http://127.0.0.1:18888/v1/models > /dev/null 2>&1; then
    echo "✓ MLX 14B running"
else
    echo "✗ Start MLX first: ./start-mlx-server.sh"
    exit 1
fi

# API key status
[ -n "$MINIMAX_API_KEY" ] && echo "✓ MiniMax ready" || echo "⚠ MiniMax unavailable"
[ -n "$KIMI_API_KEY" ] && echo "✓ Kimi ready" || echo "⚠ Kimi unavailable"

# Python
[ -f "venv/bin/python3" ] && PYTHON="venv/bin/python3" || PYTHON="python3"

echo ""
echo "Smart Escalation Strategy:"
echo "  ┌─────────────────────────────────────────┐"
echo "  │  SIMPLE Tasks:                          │"
echo "  │    MLX → MiniMax → Kimi (if needed)     │"
echo "  │                                         │"
echo "  │  COMPLEX/RESEARCH Tasks:                │"
echo "  │    MLX → Kimi (skips MiniMax)           │"
echo "  │                                         │"
echo "  │  When MLX says 'I cannot':              │"
echo "  │    → Skip straight to Kimi              │"
echo "  └─────────────────────────────────────────┘"
echo ""
echo "Port: 11435 | Press Ctrl+C to stop"
echo ""

$PYTHON smart_router_intelligent_skip.py
