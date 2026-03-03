#!/bin/bash
# Quick test of real data provider

cd /root/.openclaw/workspace/projects/trading-system/backend

echo "🧪 Testing BINARY Real-Time Data Provider..."
echo ""

python3 << 'EOF'
import asyncio
import sys
sys.path.insert(0, '.')

from data_provider import YahooFinanceProvider

async def test():
    print("Fetching real prices from Yahoo Finance...")
    print("")
    
    async with YahooFinanceProvider() as provider:
        # Test individual symbols
        for symbol in ["SPX", "SPY", "QQQ"]:
            price = await provider.get_price(symbol)
            if price:
                print(f"✅ {symbol}: {price:,.2f}")
            else:
                print(f"❌ {symbol}: Failed to fetch")
        
        print("")
        print("Fetching all prices at once...")
        prices = await provider.get_all_prices()
        for symbol, price in prices.items():
            print(f"  {symbol}: {price:,.2f}")

asyncio.run(test())
EOF

echo ""
echo "✅ Test complete!"
