#!/bin/bash
# Start Smart Router + Kimi Code Bridge

cd "$(dirname "$0")"

echo "🚀 Starting Complete Router System"
echo "=================================="

# Check MLX
if ! curl -s http://127.0.0.1:18888/v1/models > /dev/null 2>&1; then
    echo "✗ MLX not running! Start it first:"
    echo "  ./start-mlx-server.sh"
    exit 1
fi
echo "✓ MLX 14B running"

# Check Kimi
if ! command -v kimi &> /dev/null; then
    echo "✗ Kimi Code CLI not found"
    exit 1
fi
echo "✓ Kimi Code CLI found"

# Use venv
[ -f "venv/bin/python3" ] && PYTHON="venv/bin/python3" || PYTHON="python3"

# Install aiohttp if needed
$PYTHON -c "import aiohttp" 2>/dev/null || $PYTHON -m pip install aiohttp -q

echo ""
echo "Starting services..."

# Start Smart Router
echo "  • Smart Router (port 11435)..."
nohup $PYTHON smart_router_intelligent_skip.py > logs/router.log 2>&1 &
ROUTER_PID=$!
echo "    PID: $ROUTER_PID"

# Wait for router
for i in {1..10}; do
    if curl -s http://127.0.0.1:11435/health > /dev/null 2>&1; then
        echo "    ✓ Ready"
        break
    fi
    sleep 1
done

# Start Kimi Code Bridge
echo "  • Kimi Code Bridge (port 11436)..."
nohup $PYTHON kimi_code_bridge.py > logs/kimi_code.log 2>&1 &
BRIDGE_PID=$!
echo "    PID: $BRIDGE_PID"

# Wait for bridge
for i in {1..10}; do
    if curl -s http://127.0.0.1:11436/health > /dev/null 2>&1; then
        echo "    ✓ Ready"
        break
    fi
    sleep 1
done

echo ""
echo "✅ All systems operational!"
echo ""
echo "Routing Chain:"
echo "  1. MLX 14B (free, local)"
echo "  2. MiniMax (if MLX fails - simple tasks)"
echo "  3. Kimi K2.5 (if MiniMax fails)"
echo "  4. Kimi Code (if all fail - file editing agent)"
echo ""
echo "Ports:"
echo "  • Smart Router: http://127.0.0.1:11435"
echo "  • Kimi Code:    http://127.0.0.1:11436"
echo ""
echo "Use in OpenClaw:"
echo "  /model Intelligent     # Smart routing"
echo "  /model KimiCode        # Direct Kimi Code"
echo ""
echo "Press Ctrl+C to stop all"

# Cleanup on exit
trap "echo ''; echo 'Stopping...'; kill $ROUTER_PID $BRIDGE_PID 2>/dev/null; exit" INT

wait
