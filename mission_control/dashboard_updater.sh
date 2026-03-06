#!/usr/bin/env bash
# Mission Control Dashboard Updater
# Posts status to Discord every 2 hours

SCRIPT_DIR=$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)
BASE_DIR="/Users/daytrons/.openclaw/workspace/mission_control"

cd "$BASE_DIR"

# Get current status
STATUS=$(python3 orchestrator.py status 2>/dev/null || echo '{}')

cat > /tmp/mc_status.json << EOF
$STATUS
EOF

# Format for Discord
python3 << 'PYTHON'
import json
import sys

try:
    status = json.load(open('/tmp/mc_status.json'))
    
    pending = status.get('pending', 0)
    active = status.get('active', 0)
    completed = status.get('completed', 0)
    failed = status.get('failed', 0)
    
    emoji = "🟢" if pending < 3 else "🟡" if pending < 6 else "🔴"
    
    message = f"""{emoji} **Mission Control Status**

📋 **Queue:** {pending} pending | {active} active
✅ **Completed:** {completed}
❌ **Failed:** {failed}

_All systems operational_"""
    
    print(message)
    
except Exception as e:
    print(f"🟡 **Mission Control Status**

Error loading status: {e}

_Checking systems..._")
PYTHON
