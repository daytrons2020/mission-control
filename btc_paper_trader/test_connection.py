"""
Connection test script for Binance Testnet API.
Verifies API keys and connection before running the bot.
"""

import sys
import logging
from datetime import datetime

from binance.client import Client
from binance.exceptions import BinanceAPIException

from config import config

# Setup logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


def test_connection():
    """Test connection to Binance Testnet."""
    print("=" * 60)
    print("Binance Testnet Connection Test")
    print("=" * 60)
    
    # Validate configuration
    errors = config.validate()
    if errors:
        print("\n❌ Configuration Errors:")
        for error in errors:
            print(f"   - {error}")
        return False
    
    print("\n✅ Configuration validated")
    print(f"   Symbol: {config.trading.symbol}")
    print(f"   Timeframe: {config.trading.timeframe}")
    print(f"   Testnet: {config.binance.testnet}")
    
    # Initialize client
    print("\n🔄 Connecting to Binance Testnet...")
    try:
        client = Client(
            api_key=config.binance.api_key,
            api_secret=config.binance.secret_key,
            testnet=True
        )
        print("✅ Client initialized")
    except Exception as e:
        print(f"❌ Failed to initialize client: {e}")
        return False
    
    # Test server time
    print("\n🔄 Testing server connection...")
    try:
        server_time = client.get_server_time()
        server_datetime = datetime.fromtimestamp(server_time['serverTime'] / 1000)
        local_datetime = datetime.now()
        time_diff = abs((local_datetime - server_datetime).total_seconds())
        
        print(f"✅ Server time: {server_datetime}")
        print(f"   Local time:  {local_datetime}")
        print(f"   Time difference: {time_diff:.2f} seconds")
        
        if time_diff > 60:
            print("⚠️  Warning: Time difference is large, may cause API errors")
            print("   Run: sudo ntpdate -s time.google.com")
    except BinanceAPIException as e:
        print(f"❌ API Error: {e}")
        return False
    except Exception as e:
        print(f"❌ Error: {e}")
        return False
    
    # Test account info
    print("\n🔄 Testing account access...")
    try:
        account = client.get_account()
        print(f"✅ Account type: {account['accountType']}")
        print(f"   Can trade: {account['canTrade']}")
        print(f"   Can withdraw: {account['canWithdraw']}")
        print(f"   Can deposit: {account['canDeposit']}")
    except BinanceAPIException as e:
        print(f"❌ API Error: {e}")
        if e.code == -2015:
            print("   Invalid API key or IP restriction")
        return False
    except Exception as e:
        print(f"❌ Error: {e}")
        return False
    
    # Test balance
    print("\n🔄 Checking account balances...")
    try:
        balances = account['balances']
        non_zero_balances = [
            b for b in balances 
            if float(b['free']) > 0 or float(b['locked']) > 0
        ]
        
        if non_zero_balances:
            print(f"✅ Found {len(non_zero_balances)} non-zero balances:")
            for balance in non_zero_balances[:5]:  # Show first 5
                asset = balance['asset']
                free = float(balance['free'])
                locked = float(balance['locked'])
                total = free + locked
                print(f"   {asset}: {total:.8f} (Free: {free:.8f}, Locked: {locked:.8f})")
        else:
            print("⚠️  No balances found. You may need to request test funds.")
            print("   Visit: https://testnet.binance.vision/")
    except Exception as e:
        print(f"❌ Error checking balances: {e}")
    
    # Test symbol info
    print(f"\n🔄 Checking {config.trading.symbol} info...")
    try:
        symbol_info = client.get_symbol_info(config.trading.symbol)
        if symbol_info:
            print(f"✅ Symbol found: {symbol_info['symbol']}")
            print(f"   Status: {symbol_info['status']}")
            print(f"   Base asset: {symbol_info['baseAsset']}")
            print(f"   Quote asset: {symbol_info['quoteAsset']}")
            
            # Get filters
            price_filter = next(
                (f for f in symbol_info['filters'] if f['filterType'] == 'PRICE_FILTER'),
                None
            )
            lot_size = next(
                (f for f in symbol_info['filters'] if f['filterType'] == 'LOT_SIZE'),
                None
            )
            
            if price_filter:
                print(f"   Min price: {price_filter['minPrice']}")
                print(f"   Tick size: {price_filter['tickSize']}")
            if lot_size:
                print(f"   Min qty: {lot_size['minQty']}")
                print(f"   Step size: {lot_size['stepSize']}")
        else:
            print(f"❌ Symbol {config.trading.symbol} not found")
            return False
    except Exception as e:
        print(f"❌ Error getting symbol info: {e}")
        return False
    
    # Test recent trades
    print(f"\n🔄 Fetching recent {config.trading.symbol} klines...")
    try:
        klines = client.get_klines(
            symbol=config.trading.symbol,
            interval=config.trading.timeframe,
            limit=5
        )
        
        if klines:
            print(f"✅ Fetched {len(klines)} klines")
            print("\n   Recent candles:")
            for kline in klines[-3:]:  # Show last 3
                open_time = datetime.fromtimestamp(kline[0] / 1000)
                open_price = float(kline[1])
                high_price = float(kline[2])
                low_price = float(kline[3])
                close_price = float(kline[4])
                volume = float(kline[5])
                
                print(f"   {open_time}: O={open_price:.2f} H={high_price:.2f} "
                      f"L={low_price:.2f} C={close_price:.2f} V={volume:.4f}")
        else:
            print("❌ No klines returned")
            return False
    except Exception as e:
        print(f"❌ Error fetching klines: {e}")
        return False
    
    # Test current price
    print(f"\n🔄 Getting current price...")
    try:
        ticker = client.get_symbol_ticker(symbol=config.trading.symbol)
        price = float(ticker['price'])
        print(f"✅ Current price: {price:.2f} USDT")
    except Exception as e:
        print(f"❌ Error getting price: {e}")
        return False
    
    # All tests passed
    print("\n" + "=" * 60)
    print("✅ All tests passed! Your API keys are working correctly.")
    print("=" * 60)
    print("\nYou can now run the paper trading bot:")
    print("   python bot.py")
    print("\nOr run the backtester:")
    print("   python backtester.py")
    print("\nOr launch the dashboard:")
    print("   python dashboard.py")
    print("")
    
    return True


def main():
    """Main entry point."""
    success = test_connection()
    sys.exit(0 if success else 1)


if __name__ == '__main__':
    main()
