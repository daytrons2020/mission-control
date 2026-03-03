#!/bin/bash

echo "🔧 PolyGun Clone Bot Setup"
echo "=========================="
echo ""

# Check if .env exists
if [ -f .env ]; then
    echo "⚠️  .env already exists. Skipping..."
else
    echo "📝 Creating .env file..."
    
    # Generate encryption key
    ENCRYPTION_KEY=$(openssl rand -hex 32)
    
    cat > .env << EOF
# Telegram Bot Token (get from @BotFather)
TELEGRAM_BOT_TOKEN=your_bot_token_here

# Polygon RPC (use Alchemy, Infura, or public)
POLYGON_RPC_URL=https://polygon-rpc.com

# Polymarket API
POLYMARKET_API_URL=https://api.polymarket.com
POLYMARKET_GRAPH_URL=https://api.thegraph.com/subgraphs/name/polymarket/matic-markets

# Encryption key for wallet storage
ENCRYPTION_KEY=$ENCRYPTION_KEY

# Bot Configuration
DEFAULT_SLIPPAGE=2
MAX_DAILY_TRADES=50
MAX_DAILY_LOSS=50
MIN_POSITION_SIZE=1
MAX_POSITION_SIZE=100

# Sniper Mode
SNIPER_ENABLED=false
SNIPER_MAX_PRICE=0.1
SNIPER_TIME_WINDOW=30

# Logging
LOG_LEVEL=info
EOF

    echo "✅ .env created with generated encryption key"
fi

echo ""
echo "📋 Next steps:"
echo "1. Get a Telegram bot token from @BotFather"
echo "2. Edit .env and add your TELEGRAM_BOT_TOKEN"
echo "3. Run: npm start"
echo ""
