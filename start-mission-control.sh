#!/bin/bash
# Start Mission Control with Live Data

cd ~/.openclaw/workspace/mission-control-repo

echo "╔════════════════════════════════════════════════════════════╗"
echo "║     MISSION CONTROL SERVER                                 ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""

# Check Tailscale IP
TAILSCALE_IP=$(tailscale ip -4 2>/dev/null)
if [ -n "$TAILSCALE_IP" ]; then
    echo "✓ Tailscale IP: $TAILSCALE_IP"
    echo "  Access from anywhere: http://$TAILSCALE_IP:8080/dashboard.html"
    echo ""
else
    echo "⚠ Tailscale not running. Start with: sudo tailscale up"
    echo "  Local access only: http://localhost:8080/dashboard.html"
    echo ""
fi

# Collect initial data
echo "📊 Collecting real-time data..."
node real-tracker.js

# Start data collector in background (updates every 30 seconds)
echo "🔄 Starting live data updates..."
while true; do
    sleep 30
    node real-tracker.js > /dev/null 2>&1 &
done &
DATA_PID=$!

echo "✓ Live data collector started (PID: $DATA_PID)"
echo ""

# Start web server
echo "🚀 Starting web server on port 8080..."
echo ""
echo "Local:     http://localhost:8080/dashboard.html"
[ -n "$TAILSCALE_IP" ] && echo "Remote:    http://$TAILSCALE_IP:8080/dashboard.html"
echo ""
echo "Press Ctrl+C to stop"
echo ""

python3 -m http.server 8080

# Cleanup on exit
trap "kill $DATA_PID 2>/dev/null; exit" INT
