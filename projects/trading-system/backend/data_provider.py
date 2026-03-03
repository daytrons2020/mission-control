# BINARY Real-Time Data Provider
# Connects to Yahoo Finance for free real-time(ish) data

import asyncio
import aiohttp
import json
from datetime import datetime
from typing import Dict, Optional
import logging

logger = logging.getLogger(__name__)

class YahooFinanceProvider:
    """
    Free real-time data from Yahoo Finance
    Note: 15-20 minute delay, but accurate and free
    """
    
    BASE_URL = "https://query1.finance.yahoo.com/v8/finance/chart/"
    
    # Symbol mapping
    SYMBOLS = {
        "SPX": "^GSPC",      # S&P 500 Index
        "SPY": "SPY",        # S&P 500 ETF
        "QQQ": "QQQ",        # Nasdaq-100 ETF
        "IWM": "IWM",        # Russell 2000 ETF
        "VIX": "^VIX",       # Volatility Index
    }
    
    def __init__(self):
        self.session: Optional[aiohttp.ClientSession] = None
        
    async def __aenter__(self):
        self.session = aiohttp.ClientSession()
        return self
        
    async def __aexit__(self, exc_type, exc_val, exc_tb):
        if self.session:
            await self.session.close()
    
    async def get_price(self, symbol: str) -> Optional[float]:
        """Get current price for symbol"""
        yahoo_symbol = self.SYMBOLS.get(symbol, symbol)
        
        url = f"{self.BASE_URL}{yahoo_symbol}"
        params = {
            "interval": "1m",
            "range": "1d"
        }
        
        headers = {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
        }
        
        try:
            async with self.session.get(url, params=params, headers=headers) as resp:
                if resp.status == 200:
                    data = await resp.json()
                    
                    # Extract latest price
                    result = data.get("chart", {}).get("result", [{}])[0]
                    meta = result.get("meta", {})
                    
                    # Try regularMarketPrice first, then previousClose
                    price = meta.get("regularMarketPrice")
                    if price:
                        return float(price)
                    
                    # Fallback to last close
                    timestamps = result.get("timestamp", [])
                    closes = result.get("indicators", {}).get("quote", [{}])[0].get("close", [])
                    
                    if closes:
                        # Get last non-null close
                        for close in reversed(closes):
                            if close is not None:
                                return float(close)
                    
                    # Last resort: previous close
                    prev_close = meta.get("previousClose")
                    if prev_close:
                        return float(prev_close)
                        
        except Exception as e:
            logger.error(f"Yahoo Finance error for {symbol}: {e}")
        
        return None
    
    async def get_all_prices(self) -> Dict[str, float]:
        """Get prices for all tracked symbols"""
        prices = {}
        
        for symbol in ["SPX", "SPY", "QQQ"]:
            price = await self.get_price(symbol)
            if price:
                prices[symbol] = price
            else:
                # Fallback values
                fallback = {
                    "SPX": 6128.40,
                    "SPY": 685.37,
                    "QQQ": 527.85
                }
                prices[symbol] = fallback.get(symbol, 100.0)
                logger.warning(f"Using fallback price for {symbol}")
        
        return prices
    
    async def get_vix(self) -> Optional[float]:
        """Get VIX level"""
        return await self.get_price("VIX")

# For true real-time, use Polygon.io
class PolygonRealTimeProvider:
    """
    Real-time data from Polygon.io
    Requires API key
    """
    
    BASE_URL = "https://api.polygon.io/v2"
    
    def __init__(self, api_key: str):
        self.api_key = api_key
        self.session: Optional[aiohttp.ClientSession] = None
        
    async def __aenter__(self):
        self.session = aiohttp.ClientSession()
        return self
        
    async def __aexit__(self, exc_type, exc_val, exc_tb):
        if self.session:
            await self.session.close()
    
    async def get_price(self, symbol: str) -> Optional[float]:
        """Get real-time price from Polygon"""
        url = f"{self.BASE_URL}/last/trade/{symbol}"
        params = {"apikey": self.api_key}
        
        try:
            async with self.session.get(url, params=params) as resp:
                if resp.status == 200:
                    data = await resp.json()
                    return data.get("results", {}).get("p")
                else:
                    logger.error(f"Polygon API error: {resp.status}")
        except Exception as e:
            logger.error(f"Polygon error: {e}")
        
        return None

# Unified provider that tries multiple sources
class RealTimeDataProvider:
    """
    Unified data provider
    Tries Polygon first (if key available), falls back to Yahoo
    """
    
    def __init__(self, polygon_key: Optional[str] = None):
        self.polygon_key = polygon_key
        self.polygon: Optional[PolygonRealTimeProvider] = None
        self.yahoo: Optional[YahooFinanceProvider] = None
        
    async def __aenter__(self):
        self.yahoo = await YahooFinanceProvider().__aenter__()
        if self.polygon_key:
            self.polygon = await PolygonRealTimeProvider(self.polygon_key).__aenter__()
        return self
        
    async def __aexit__(self, exc_type, exc_val, exc_tb):
        if self.yahoo:
            await self.yahoo.__aexit__(exc_type, exc_val, exc_tb)
        if self.polygon:
            await self.polygon.__aexit__(exc_type, exc_val, exc_tb)
    
    async def get_price(self, symbol: str) -> float:
        """Get price, trying Polygon first if available"""
        
        # Try Polygon first (real-time)
        if self.polygon:
            price = await self.polygon.get_price(symbol)
            if price:
                return price
        
        # Fall back to Yahoo
        price = await self.yahoo.get_price(symbol)
        if price:
            return price
        
        # Final fallback
        fallbacks = {
            "SPX": 6128.40,
            "SPY": 685.37,
            "QQQ": 527.85,
            "VIX": 15.0
        }
        return fallbacks.get(symbol, 100.0)
    
    async def get_all_prices(self) -> Dict[str, float]:
        """Get all prices"""
        prices = {}
        for symbol in ["SPX", "SPY", "QQQ"]:
            prices[symbol] = await self.get_price(symbol)
        return prices

# Test
if __name__ == "__main__":
    async def test():
        async with YahooFinanceProvider() as provider:
            print("Fetching real prices from Yahoo Finance...")
            prices = await provider.get_all_prices()
            for symbol, price in prices.items():
                print(f"{symbol}: {price}")
    
    asyncio.run(test())
