#!/bin/bash
# Mission Control CLI - Run from anywhere

MC_DIR="$HOME/.openclaw/workspace/mission-control-repo"

# Check if we're in the right directory
if [ ! -f "$MC_DIR/agent-orchestrator.js" ]; then
    echo "❌ Mission Control not found at $MC_DIR"
    echo "   Please check the installation path"
    exit 1
fi

cd "$MC_DIR"

case "$1" in
    goals)
        node agent-orchestrator.js goals
        ;;
    plan)
        node agent-orchestrator.js plan
        ;;
    run)
        node agent-orchestrator.js run
        ;;
    status)
        node agent-orchestrator.js status
        ;;
    start)
        ./start-autonomous-agents.sh
        ;;
    dashboard)
        open https://mission-control-o52l.vercel.app/dashboard.html
        ;;
    serve)
        echo "🚀 Starting dashboard real-time server..."
        node dashboard-realtime.js
        ;;
    help|--help|-h)
        echo "🎯 Mission Control CLI"
        echo ""
        echo "Usage: mc <command>"
        echo ""
        echo "Commands:"
        echo "  goals      - Show your 5 goals from build plan"
        echo "  plan       - Generate today's work plan"
        echo "  run        - Run one autonomous cycle"
        echo "  status     - Show current system status"
        echo "  start      - Start full autonomous system"
        echo "  dashboard  - Open dashboard in browser"
        echo "  serve      - Start real-time data server"
        echo "  help       - Show this help"
        echo ""
        echo "Examples:"
        echo "  mc goals"
        echo "  mc plan"
        echo "  mc start"
        ;;
    *)
        echo "🎯 Mission Control"
        echo ""
        echo "Quick commands:"
        echo "  mc goals     - View your goals"
        echo "  mc plan      - See today's plan"
        echo "  mc start     - Start autonomous agents"
        echo "  mc dashboard - Open dashboard"
        echo ""
        echo "Run 'mc help' for all commands"
        ;;
esac
