#!/bin/bash
# Setup Cloudflare Tunnel for FREE public URL with HTTPS

echo "🚀 Setting up BINARY Cloudflare Tunnel..."

# Install cloudflared
if ! command -v cloudflared &> /dev/null; then
    echo "Installing cloudflared..."
    wget -q https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64 -O /usr/local/bin/cloudflared
    chmod +x /usr/local/bin/cloudflared
fi

# Kill existing tunnels
pkill cloudflared 2>/dev/null
sleep 1

# Start tunnel to frontend
echo "Starting tunnel to http://localhost:8080..."
nohup cloudflared tunnel --url http://localhost:8080 > /tmp/cloudflare.log 2>&1 &
echo $! > /tmp/cloudflare.pid

sleep 5

# Extract the public URL
URL=$(grep -o 'https://[a-z0-9-]*\.trycloudflare\.com' /tmp/cloudflare.log | head -1)

if [ -n "$URL" ]; then
    echo ""
    echo "✅ SUCCESS! Your BINARY trading dashboard is now live:"
    echo ""
    echo "   🌐 $URL"
    echo ""
    echo "   🔌 WebSocket: wss://$(echo $URL | sed 's/https:\/\///')"
    echo ""
    echo "⚠️  This URL is temporary and will change on restart."
    echo "   For a permanent URL, set up a custom domain."
    echo ""
    echo "📋 To stop the tunnel:"
    echo "   kill $(cat /tmp/cloudflare.pid)"
else
    echo "❌ Failed to create tunnel. Check logs:"
    echo "   cat /tmp/cloudflare.log"
fi
