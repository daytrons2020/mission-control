#!/bin/bash
# Start all Mission Control services

cd "$(dirname "$0")"

echo "🚀 Starting Mission Control Services..."
echo "========================================"

# Load environment
export DISCORD_WEBHOOK_URL="${DISCORD_WEBHOOK_URL:-https://discord.com/api/webhooks/1483303416351686759/9-5sX9f3-r81T8TDANUOQmhq0ZUbPtm8VclK_Lcd7jSlIH42aU5L6fhDHe53AMrpc-a5-}"

# Create logs directory
mkdir -p logs

# Function to check if process is running
is_running() {
    pgrep -f "$1" > /dev/null 2>&1
}

# 1. Check MLX Server
echo ""
echo "1. MLX Server (Port 18888)..."
if curl -s http://127.0.0.1:18888/v1/models > /dev/null 2>&1; then
    echo "   ✅ Already running"
else
    echo "   ⚠️  MLX not running! Start with: ./start-mlx-server.sh"
fi

# 2. Start Smart Router
echo ""
echo "2. Smart Router (Port 11435)..."
if is_running "smart_router"; then
    echo "   ✅ Already running"
else
    source venv/bin/activate
    nohup python3 smart_router_fixed.py > logs/router.log 2>&1 &
    echo "   ✅ Started (PID: $!)"
fi

# 3. Start Kimi Code Bridge
echo ""
echo "3. Kimi Code Bridge (Port 11436)..."
if is_running "kimi_code_bridge"; then
    echo "   ✅ Already running"
else
    source venv/bin/activate
    nohup python3 kimi_code_bridge.py > logs/kimi_code.log 2>&1 &
    echo "   ✅ Started (PID: $!)"
fi

# 4. Start Discord Bridge
echo ""
echo "4. Discord Bridge (Port 11437)..."
if is_running "mission_control_discord_bridge"; then
    echo "   ✅ Already running"
else
    source venv/bin/activate
    nohup python3 mission_control_discord_bridge.py > logs/discord-bridge.log 2>&1 &
    echo "   ✅ Started (PID: $!)"
fi

# 5. Start Agent Orchestrator
echo ""
echo "5. Agent Orchestrator..."
if is_running "agent-orchestrator.js.*continuous"; then
    echo "   ✅ Already running in continuous mode"
else
    echo "   🚀 Starting in continuous mode..."
    nohup node agent-orchestrator.js continuous > logs/orchestrator.log 2>&1 &
    echo "   ✅ Started (PID: $!)"
    sleep 2
fi

# 6. Check Agent Orchestrator
echo ""
echo "6. Checking Agent Orchestrator status..."
if pgrep -f "agent-orchestrator.js" > /dev/null; then
    echo "   ✅ Agent Orchestrator is running"
    echo "   📊 Status: node agent-orchestrator.js status"
else
    echo "   ❌ Failed to start"
fi

echo ""
echo "========================================"
echo "✅ All services started!"
echo ""
echo "Discord Integration:"
echo "  - Real-time job updates → #mission-control"
echo "  - Job start notifications"
echo "  - Job complete notifications"
echo "  - Job failure notifications"
echo ""
echo "Commands:"
echo "  ./stop_all_services.sh    - Stop all services"
echo "  ./status_services.sh      - Check status"
echo ""
echo "Logs: tail -f logs/*.log"
