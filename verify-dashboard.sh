#!/bin/bash
# Dashboard Verification Script

echo "╔════════════════════════════════════════════════════════════╗"
echo "║           MISSION CONTROL VERIFICATION                     ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo

URL="https://mission-control-o52l.vercel.app/dashboard.html"
DATA_URL="https://mission-control-o52l.vercel.app/dashboard-data.json"

echo "📡 Checking Dashboard HTML..."
echo "   URL: $URL"
echo

# Fetch and check HTML
HTML=$(curl -s "$URL?_=$(date +%s)")

# Check for key elements
echo "✅ Checking HTML structure:"
echo "   - Title: $(echo "$HTML" | grep -o "Mission Control" | head -1)"
echo "   - HTML tags: $(echo "$HTML" | grep -c '</html>') closing tag(s)"
echo "   - Content tabs: $(echo "$HTML" | grep -c 'class="content"') sections"
echo "   - Nav buttons: $(echo "$HTML" | grep -c 'data-tab=') buttons"

echo
echo "📊 Checking Dashboard Data..."
echo "   URL: $DATA_URL"
echo

# Fetch and validate JSON
DATA=$(curl -s "$DATA_URL?_=$(date +%s)")
echo "$DATA" | python3 -c "
import sys, json
try:
    d = json.load(sys.stdin)
    print('✅ JSON is valid')
    print(f'   - Agents: {len(d.get(\"agents\", []))}')
    print(f'   - Goals: {len(d.get(\"goals\", []))}')
    print(f'   - Has routing: {\"routing\" in d}')
    print(f'   - Has costs: {\"costs\" in d}')
    print(f'   - Has communication: {\"communication\" in d}')
except Exception as e:
    print(f'❌ JSON Error: {e}')
"

echo
echo "🎨 Checking UI Components:"
echo "$HTML" | grep -o "Overview\|Smart Routing\|Agents\|Goals\|Tasks\|Costs\|Memory\|Office" | sort -u | while read feature; do
    echo "   ✓ $feature tab"
done

echo
echo "════════════════════════════════════════════════════════════"
echo "Dashboard verification complete!"
echo "════════════════════════════════════════════════════════════"
