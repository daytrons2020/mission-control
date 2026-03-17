#!/bin/bash
# Stop all Mission Control services

echo "🛑 Stopping Mission Control Services..."
echo "======================================="

# Stop Agent Orchestrator
echo "1. Stopping Agent Orchestrator..."
pkill -f "agent-orchestrator.js.*continuous" 2>/dev/null && echo "   ✅ Stopped" || echo "   Not running"

# Stop Discord Bridge
echo "2. Stopping Discord Bridge..."
pkill -f "mission_control_discord_bridge" 2>/dev/null && echo "   ✅ Stopped" || echo "   Not running"

# Stop Kimi Code Bridge
echo "3. Stopping Kimi Code Bridge..."
pkill -f "kimi_code_bridge" 2>/dev/null && echo "   ✅ Stopped" || echo "   Not running"

# Stop Smart Router
echo "4. Stopping Smart Router..."
pkill -f "smart_router" 2>/dev/null && echo "   ✅ Stopped" || echo "   Not running"

echo ""
echo "======================================="
echo "✅ All services stopped"
