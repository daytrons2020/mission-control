#!/bin/bash
# Setup Mission Control shortcuts
# Run this to install the GUI launcher

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[38;5;141m'
CYAN='\033[38;5;51m'
NC='\033[0m'
BOLD='\033[1m'

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
WORKSPACE_DIR="$(dirname "$SCRIPT_DIR")"

echo ""
echo -e "${PURPLE}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${PURPLE}║${NC}     🚀 Mission Control Shortcut Setup                      ${PURPLE}║${NC}"
echo -e "${PURPLE}╚════════════════════════════════════════════════════════════╝${NC}"
echo ""

# Make scripts executable
echo -e "${BLUE}📦 Setting up permissions...${NC}"
chmod +x "$SCRIPT_DIR/mission-control-gui"
chmod +x "$SCRIPT_DIR/Mission Control.app/Contents/MacOS/Mission Control" 2>/dev/null || true
chmod +x "$SCRIPT_DIR/Mission Control GUI.app/Contents/MacOS/launcher" 2>/dev/null || true

# Option 1: Create symlink for terminal access
echo ""
echo -e "${BLUE}🔧 Installation Options:${NC}"
echo ""
echo -e "${CYAN}1. Terminal Command (mc)${NC}"
echo "   This creates a 'mc' command you can run from anywhere"
echo ""
read -p "Install 'mc' command? (y/N): " install_mc

if [[ "$install_mc" =~ ^[Yy]$ ]]; then
    # Add to shell profile
    SHELL_RC=""
    if [ -f "$HOME/.zshrc" ]; then
        SHELL_RC="$HOME/.zshrc"
    elif [ -f "$HOME/.bashrc" ]; then
        SHELL_RC="$HOME/.bashrc"
    elif [ -f "$HOME/.bash_profile" ]; then
        SHELL_RC="$HOME/.bash_profile"
    fi
    
    if [ -n "$SHELL_RC" ]; then
        # Check if already added
        if ! grep -q "mission-control-gui" "$SHELL_RC" 2>/dev/null; then
            echo "" >> "$SHELL_RC"
            echo "# Mission Control shortcut" >> "$SHELL_RC"
            echo "alias mc='$SCRIPT_DIR/mission-control-gui'" >> "$SHELL_RC"
            echo -e "${GREEN}✅ Added 'mc' alias to $SHELL_RC${NC}"
            echo -e "${YELLOW}⚠️  Run 'source $SHELL_RC' to use it now${NC}"
        else
            echo -e "${YELLOW}⚠️  'mc' alias already exists in $SHELL_RC${NC}"
        fi
    else
        echo -e "${YELLOW}⚠️  Could not find shell config file${NC}"
    fi
fi

# Option 2: Create Applications symlink
echo ""
echo -e "${CYAN}2. Applications Folder${NC}"
echo "   Creates a shortcut in Applications for Dock access"
echo ""
read -p "Add to Applications folder? (y/N): " install_app

if [[ "$install_app" =~ ^[Yy]$ ]]; then
    APP_NAME="Mission Control.app"
    APP_SOURCE="$SCRIPT_DIR/Mission Control GUI.app"
    APP_DEST="/Applications/Mission Control.app"
    
    # Remove old version if exists
    if [ -L "$APP_DEST" ] || [ -e "$APP_DEST" ]; then
        rm -rf "$APP_DEST"
    fi
    
    # Create symlink
    ln -sf "$APP_SOURCE" "$APP_DEST"
    echo -e "${GREEN}✅ Created shortcut: $APP_DEST${NC}"
    echo -e "${CYAN}ℹ️  You can now add Mission Control to your Dock!${NC}"
fi

# Option 3: Desktop shortcut
echo ""
echo -e "${CYAN}3. Desktop Shortcut${NC}"
echo "   Creates a clickable shortcut on your Desktop"
echo ""
read -p "Create Desktop shortcut? (y/N): " install_desktop

if [[ "$install_desktop" =~ ^[Yy]$ ]]; then
    DESKTOP_LINK="$HOME/Desktop/Mission Control"
    
    # Create a small AppleScript app on desktop
    cat > "$DESKTOP_LINK.command" << 'EOF'
#!/bin/bash
cd "/Users/daytrons/.openclaw/workspace/scripts"
./mission-control-gui
EOF
    chmod +x "$DESKTOP_LINK.command"
    
    # Try to set a nice icon (requires AppleScript)
    osascript <<'APPLESCRIPT' 2>/dev/null || true
    set desktopPath to (path to desktop) as string
    set theFile to desktopPath & "Mission Control.command"
    tell application "Finder"
        try
            set theIcon to (path to application "Script Editor") as string
            set file type of file theFile to "APPL"
        end try
    end tell
APPLESCRIPT
    
    echo -e "${GREEN}✅ Created Desktop shortcut: $DESKTOP_LINK.command${NC}"
fi

# Summary
echo ""
echo -e "${PURPLE}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${PURPLE}║${NC}                  ${BOLD}Setup Complete!${NC}                         ${PURPLE}║${NC}"
echo -e "${PURPLE}╚════════════════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "${GREEN}🚀 Quick Access Methods:${NC}"
echo ""
echo -e "   ${CYAN}Terminal:${NC}"
echo "     mc              - Launch interactive GUI"
echo "     mc open         - Open dashboard directly"
echo "     mc status       - Quick health check"
echo ""
echo -e "   ${CYAN}GUI Launcher:${NC}"
echo "     Open 'Mission Control.app' from Applications"
echo "     or run: open '$SCRIPT_DIR/Mission Control GUI.app'"
echo ""
echo -e "   ${CYAN}Direct Scripts:${NC}"
echo "     $SCRIPT_DIR/mission-control-gui"
echo "     $SCRIPT_DIR/Mission Control.app/Contents/MacOS/Mission Control"
echo ""
echo -e "${YELLOW}💡 Pro Tip:${NC} Drag Mission Control.app from Applications to your Dock!"
echo ""
