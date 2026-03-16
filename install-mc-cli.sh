#!/bin/bash
# Install Mission Control CLI

echo "🎯 Installing Mission Control CLI..."

MC_DIR="$HOME/.openclaw/workspace/mission-control-repo"

# Make mc executable
chmod +x "$MC_DIR/mc"
chmod +x "$MC_DIR/start-autonomous-agents.sh"
chmod +x "$MC_DIR/agent-orchestrator.js"
chmod +x "$MC_DIR/dashboard-realtime.js"

# Detect shell and add alias
SHELL_NAME=$(basename "$SHELL")

if [ "$SHELL_NAME" = "zsh" ]; then
    CONFIG_FILE="$HOME/.zshrc"
    ALIAS_LINE="alias mc='$MC_DIR/mc'"
elif [ "$SHELL_NAME" = "bash" ]; then
    CONFIG_FILE="$HOME/.bashrc"
    ALIAS_LINE="alias mc='$MC_DIR/mc'"
else
    CONFIG_FILE="$HOME/.profile"
    ALIAS_LINE="alias mc='$MC_DIR/mc'"
fi

# Check if alias already exists
if grep -q "alias mc=" "$CONFIG_FILE" 2>/dev/null; then
    echo "✓ Alias already exists in $CONFIG_FILE"
else
    echo "" >> "$CONFIG_FILE"
    echo "# Mission Control CLI" >> "$CONFIG_FILE"
    echo "$ALIAS_LINE" >> "$CONFIG_FILE"
    echo "✓ Added alias to $CONFIG_FILE"
fi

# Also add to PATH via symlink
if [ -d "/usr/local/bin" ] && [ -w "/usr/local/bin" ]; then
    ln -sf "$MC_DIR/mc" /usr/local/bin/mc
    echo "✓ Created symlink in /usr/local/bin"
else
    # Add to PATH in config
    if ! grep -q "$MC_DIR" "$CONFIG_FILE" 2>/dev/null; then
        echo "export PATH=\"$MC_DIR:\$PATH\"" >> "$CONFIG_FILE"
        echo "✓ Added to PATH"
    fi
fi

echo ""
echo "🎉 Installation complete!"
echo ""
echo "Reload your shell or run:"
echo "  source $CONFIG_FILE"
echo ""
echo "Then use:"
echo "  mc goals     - View your goals"
echo "  mc plan      - See today's plan"
echo "  mc start     - Start autonomous system"
echo "  mc help      - Show all commands"
