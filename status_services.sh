#!/bin/bash
# Check status of all Mission Control services

echo "📊 Mission Control Services Status"
echo "==================================="
echo ""

# MLX Server
echo "1. MLX Server (Port 18888)"
if curl -s http://127.0.0.1:18888/v1/models > /dev/null 2>&1; then
    echo "   ✅ Running"
else
    echo "   ❌ Not running"
fi

# Smart Router
echo ""
echo "2. Smart Router (Port 11435)"
if curl -s http://127.0.0.1:11435/health > /dev/null 2>&1; then
    echo "   ✅ Running"
else
    echo "   ❌ Not running"
fi

# Kimi Code Bridge
echo ""
echo "3. Kimi Code Bridge (Port 11436)"
if curl -s http://127.0.0.1:11436/health > /dev/null 2>&1; then
    echo "   ✅ Running"
else
    echo "   ❌ Not running"
fi

# Discord Bridge
echo ""
echo "4. Discord Bridge (Port 11437)"
if pgrep -f "mission_control_discord_bridge" > /dev/null; then
    echo "   ✅ Running"
else
    echo "   ❌ Not running"
fi

# Agent Orchestrator
echo ""
echo "5. Agent Orchestrator"
if pgrep -f "agent-orchestrator.js" > /dev/null; then
    PID=$(pgrep -f "agent-orchestrator.js" | head -1)
    echo "   ✅ Running (PID: $PID)"
else
    echo "   ❌ Not running"
fi

# Discord Bot
echo ""
echo "6. Discord Bot (Node.js)"
if pgrep -f "discord-bot.*bot.js" > /dev/null; then
    echo "   ✅ Running"
else
    echo "   ❌ Not running (optional)"
fi

echo ""
echo "==================================="

# Show recent activity
if [ -f logs/orchestrator.log ]; then
    echo ""
    echo "📋 Recent Agent Activity:"
    tail -5 logs/orchestrator.log 2>/dev/null | grep -E "(Started|Completed|Failed)" | tail -3
fi
