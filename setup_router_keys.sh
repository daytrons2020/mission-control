#!/bin/bash
# Setup API keys for Three-Tier Router

echo "Setting up API keys for Smart Router..."
echo "========================================"
echo ""
echo "Your API keys are stored in OpenClaw."
echo "Please paste them below to add to your shell profile."
echo ""

# Check if already set
if [ -n "$KIMI_API_KEY" ]; then
    echo "✓ KIMI_API_KEY already set"
else
    read -sp "Enter Kimi (Moonshot) API Key: " KIMI_KEY
    echo ""
    if [ -n "$KIMI_KEY" ]; then
        echo "export KIMI_API_KEY='$KIMI_KEY'" >> ~/.zshrc
        echo "✓ Added KIMI_API_KEY to ~/.zshrc"
    fi
fi

if [ -n "$MINIMAX_API_KEY" ]; then
    echo "✓ MINIMAX_API_KEY already set"
else
    read -sp "Enter MiniMax API Key: " MINIMAX_KEY
    echo ""
    if [ -n "$MINIMAX_KEY" ]; then
        echo "export MINIMAX_API_KEY='$MINIMAX_KEY'" >> ~/.zshrc
        echo "✓ Added MINIMAX_API_KEY to ~/.zshrc"
    fi
fi

echo ""
echo "Reload your shell or run: source ~/.zshrc"
echo "Then start the router: ./start_three_tier_router.sh"
