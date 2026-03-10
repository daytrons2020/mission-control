# 🚀 Mission Control GUI Launcher

Quick access to your Mission Control dashboard with a polished, non-terminal interface.

## 📦 What's Included

| File | Description |
|------|-------------|
| `mission-control-gui` | Main interactive GUI (terminal-based but pretty) |
| `Mission Control.app` | Native macOS app bundle - double-click to run! |
| `Mission Control GUI.app` | Alternative app with native macOS dialogs |
| `setup-mission-control-shortcut.sh` | One-command setup installer |

## 🚀 Quick Start

### Option 1: Run the Setup Script (Recommended)
```bash
cd /Users/daytrons/.openclaw/workspace/scripts
./setup-mission-control-shortcut.sh
```

This will guide you through installing:
- `mc` terminal command
- Applications folder shortcut
- Desktop shortcut

### Option 2: Direct Launch
```bash
# Interactive menu (prettified terminal UI)
./mission-control-gui

# Open dashboard directly
./mission-control-gui open

# Check status
./mission-control-gui status
```

### Option 3: Double-Click Launch
Simply double-click either:
- `Mission Control.app`
- `Mission Control GUI.app`

Then add it to your Dock for one-click access!

## 🎨 Features

### Visual Improvements Over Terminal
- ✨ Beautiful ASCII art logo
- 🎨 Color-coded output (purple/cyan/green/yellow themes)
- 📦 Box-drawing UI elements (rounded borders)
- 🔔 Native macOS notifications
- 💬 Dialog boxes for user interaction

### Available Commands
| Command | Description |
|---------|-------------|
| `open` / `start` / `launch` | Open dashboard in browser |
| `status` | Quick system health check |
| `logs` | View recent log entries |
| `health` / `report` | Full health score report |
| `help` | Show help message |

## 🖥️ Browser Detection

The launcher automatically detects and uses your preferred browser in this order:
1. Google Chrome (with app mode support)
2. Arc Browser
3. Safari
4. System default

## 📝 Examples

```bash
# Launch interactive menu
./mission-control-gui

# Direct dashboard launch
./mission-control-gui open

# Quick health status
./mission-control-gui status

# Full health report
./mission-control-gui health
```

## 🔧 After Setup

Once you've run the setup script, you can simply:
- Type `mc` from any terminal
- Click the Mission Control app in your Dock
- Double-click the Desktop shortcut

---

**Enjoy your polished Mission Control experience!** 🎉
