#!/bin/bash
# Start BINARY Trading System Servers

echo "🚀 Starting ⚡ BINARY Trading System..."

# Kill existing processes
pkill -f "python3 trading_engine.py" 2>/dev/null
pkill -f "http.server 8080" 2>/dev/null

sleep 1

# Start backend WebSocket server
cd /root/.openclaw/workspace/projects/trading-system/backend
nohup python3 trading_engine.py > /tmp/trading_engine.log 2>&1 &
echo "✅ Backend started on ws://8.219.242.108:8765"

sleep 2

# Start frontend HTTP server
cd /root/.openclaw/workspace/projects/trading-system/frontend
nohup python3 -m http.server 8080 --bind 0.0.0.0 > /tmp/frontend.log 2>&1 &
echo "✅ Frontend started on http://8.219.242.108:8080"

echo ""
echo "📊 Access your ⚡ BINARY dashboard at:"
echo "   http://8.219.242.108:8080"
echo ""
echo "🔌 WebSocket endpoint:"
echo "   ws://8.219.242.108:8765"
echo ""
echo "⚠️  Make sure ports 8080 and 8765 are open in your firewall"
