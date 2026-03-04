#!/bin/bash
# Alternative deployment using Cloudflare Pages (no auth required for static sites)
# Or local tunnel for immediate access

set -e

DEPLOY_DIR="/tmp/binary-dashboard-deploy"
FRONTEND_DIR="/Users/daytrons/.openclaw/workspace/projects/trading-system/frontend"

echo "🚀 Setting up BINARY Dashboard for immediate access..."
echo ""

# Option 1: Try Cloudflare Quick Tunnels (no account needed)
echo "📡 Option 1: Cloudflare Quick Tunnel (temporary, 24h)"
echo "   Installing cloudflared..."

# Check if cloudflared exists
if ! command -v cloudflared &> /dev/null; then
    if [[ "$OSTYPE" == "darwin"* ]]; then
        # macOS
        brew install cloudflared 2>/dev/null || {
            echo "   Downloading cloudflared..."
            curl -L --output /tmp/cloudflared.tgz https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-darwin-amd64.tgz
            tar -xzf /tmp/cloudflared.tgz -C /tmp
            chmod +x /tmp/cloudflared
        }
        CLOUDFLARED="/tmp/cloudflared"
    else
        CLOUDFLARED="cloudflared"
    fi
else
    CLOUDFLARED="cloudflared"
fi

echo ""
echo "🌐 Starting tunnel to your dashboard..."
echo "   This will create a public URL you can access on mobile"
echo ""
cd "$DEPLOY_DIR"

# Start a simple HTTP server in background
python3 -m http.server 8765 &
SERVER_PID=$!

# Give server time to start
sleep 2

# Start Cloudflare tunnel
echo "🔗 Creating secure tunnel..."
$CLOUDFLARED tunnel --url http://localhost:8765 2>&1 | tee /tmp/cloudflare-url.txt &
TUNNEL_PID=$!

# Wait for URL to appear
sleep 5

# Extract URL
URL=$(grep -o 'https://[a-z0-9-]*\.trycloudflare\.com' /tmp/cloudflare-url.txt | head -1)

if [ -n "$URL" ]; then
    echo ""
    echo "✅ BINARY Dashboard is LIVE!"
    echo ""
    echo "📱 Mobile URL:"
    echo "   $URL"
    echo ""
    echo "⚠️  This URL is temporary (valid ~24 hours)"
    echo ""
    echo "📊 Dashboards available:"
    echo "   $URL/           - BINARY Main (Trinity + Heatseeker)"
    echo "   $URL/gex-dashboard.html - GEX Analysis"
    echo ""
    echo "Press Ctrl+C to stop the tunnel"
    
    # Save URL for reference
    echo "$URL" > /tmp/binary-dashboard-url.txt
    
    # Wait for interrupt
    wait $TUNNEL_PID
else
    echo "❌ Tunnel failed to start"
    kill $SERVER_PID 2>/dev/null || true
    exit 1
fi

# Cleanup on exit
trap "kill $SERVER_PID $TUNNEL_PID 2>/dev/null || true" EXIT