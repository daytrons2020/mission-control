#!/bin/bash
# Start Live Mission Control Dashboard

echo "╔════════════════════════════════════════════════════════════╗"
echo "║         MISSION CONTROL - LIVE MODE                        ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""

# Kill any existing data collectors
pkill -f "live-data-collector.js" 2>/dev/null

# Initial data collection
echo "📊 Collecting initial data..."
node live-data-collector.js

# Start continuous data collection (every 30 seconds)
echo "🔄 Starting live data updates (every 30s)..."
while true; do
    sleep 30
    node live-data-collector.js >/dev/null 2>&1 &
done &

echo ""
echo "✅ Live dashboard running!"
echo "   Data updates: Every 30 seconds"
echo "   Dashboard: https://mission-control-o52l.vercel.app/dashboard.html"
echo ""
echo "Press Ctrl+C to stop"
wait
