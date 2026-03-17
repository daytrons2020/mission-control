#!/bin/bash
# Start Kimi Code Bridge

cd "$(dirname "$0")"

echo "💻 Starting Kimi Code Bridge..."
echo "==============================="

# Check Kimi is installed
if ! command -v kimi &> /dev/null; then
    echo "✗ Kimi Code CLI not found!"
    echo "  Install from: https://github.com/MoonshotAI/kimi-cli"
    exit 1
fi

echo "✓ Kimi Code CLI found"

# Use venv if available
if [ -f "venv/bin/python3" ]; then
    PYTHON="venv/bin/python3"
else
    PYTHON="python3"
fi

echo ""
echo "Capabilities:"
echo "  • Full file editing"
echo "  • Shell command execution"
echo "  • Multi-step coding tasks"
echo ""
echo "Port: 11436 | Press Ctrl+C to stop"
echo ""

$PYTHON kimi_code_bridge.py
