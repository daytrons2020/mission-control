#!/bin/bash

# Start Autonomous Agent System
# This script launches the agent orchestrator and real-time dashboard updater

echo "🚀 Starting Autonomous Agent System..."
echo "========================================"

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if MLX is running
echo -e "${BLUE}Checking MLX Server...${NC}"
if curl -s http://127.0.0.1:18888/v1/models > /dev/null 2>&1; then
    echo -e "${GREEN}✓ MLX Server is running${NC}"
else
    echo -e "${YELLOW}⚠ MLX Server not detected on port 18888${NC}"
    echo "  The system will run in simulation mode"
fi

# Check if OpenClaw is running
echo -e "${BLUE}Checking OpenClaw Gateway...${NC}"
if curl -s http://127.0.0.1:18789/v1/status > /dev/null 2>&1; then
    echo -e "${GREEN}✓ OpenClaw Gateway is running${NC}"
else
    echo -e "${YELLOW}⚠ OpenClaw Gateway not detected on port 18789${NC}"
fi

echo ""
echo -e "${BLUE}Starting services...${NC}"

# Start real-time dashboard updater
echo "  → Starting Dashboard Real-Time Updater..."
nohup node dashboard-realtime.js > logs/dashboard-realtime.log 2>&1 &
DASHBOARD_PID=$!
echo "    PID: $DASHBOARD_PID"

# Wait a moment
sleep 2

# Show today's work plan
echo ""
echo -e "${BLUE}Generating today's work plan...${NC}"
node agent-orchestrator.js plan

# Ask user if they want to run tasks
echo ""
echo -e "${YELLOW}Ready to start autonomous execution?${NC}"
echo "  1. Run one cycle now"
echo "  2. Start continuous mode (runs daily)"
echo "  3. Just keep dashboard updated (no task execution)"
echo ""
read -p "Select option (1-3): " choice

case $choice in
  1)
    echo ""
    echo -e "${GREEN}Running one daily cycle...${NC}"
    node agent-orchestrator.js run
    ;;
  2)
    echo ""
    echo -e "${GREEN}Starting continuous mode...${NC}"
    echo "  The system will run daily at 9:00 AM"
    echo "  Press Ctrl+C to stop"
    echo ""
    node agent-orchestrator.js continuous
    ;;
  3)
    echo ""
    echo -e "${GREEN}Dashboard updater running${NC}"
    echo "  Real-time data available at: http://localhost:3001/api/dashboard"
    echo "  Press Ctrl+C to stop"
    ;;
  *)
    echo "Invalid option"
    exit 1
    ;;
esac

# Cleanup on exit
trap "echo ''; echo 'Stopping services...'; kill $DASHBOARD_PID 2>/dev/null; exit" INT

# Keep script running
wait
