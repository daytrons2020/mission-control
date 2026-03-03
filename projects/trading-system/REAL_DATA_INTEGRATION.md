# BINARY Real-Time Data Integration

## Overview

This module connects BINARY to real market data sources for accurate SPX, SPY, QQQ prices and options data.

---

## 📊 Recommended Data Sources

### 1. Polygon.io (Best Overall)
- **Real-time prices**: Stocks, ETFs, Indices
- **Options data**: Full options chains
- **WebSocket**: True real-time streaming
- **Cost**: Free tier (5 API calls/min), $49/mo for real-time
- **Sign up**: https://polygon.io

### 2. Yahoo Finance (Free)
- **Real-time**: 15-20 min delayed
- **Free**: Unlimited calls
- **Good for**: Development, backtesting
- **Limitation**: Not true real-time

### 3. Alpaca Markets (Free)
- **Real-time**: Free for stocks
- **WebSocket**: Streaming quotes
- **API**: REST + WebSocket
- **Sign up**: https://alpaca.markets

### 4. Tradier (Options Focus)
- **Options data**: Real-time Greeks
- **Cost**: Free tier available
- **Good for**: GEX/VEX calculations
- **Sign up**: https://tradier.com

---

## 🔌 Implementation: Polygon.io Integration

### Step 1: Get API Key
```bash
# Sign up at polygon.io
# Copy your API key from dashboard
export POLYGON_API_KEY="your_key_here"
```

### Step 2: Install Dependencies
```bash
pip install polygon-api-client
```

### Step 3: Real-Time Price Feed

```python
# real_time_data.py
from polygon import RESTClient, WebSocketClient
from polygon.websocket.models import WebSocketMessage
import os

class PolygonRealTimeData:
    def __init__(self, api_key: str):
        self.api_key = api_key
        self.rest_client = RESTClient(api_key)
        self.ws_client = None
        
    def get_current_price(self, symbol: str) -> float:
        """Get real-time price quote"""
        try:
            # Get last trade
            trade = self.rest_client.get_last_trade(symbol)
            return trade.price
        except Exception as e:
            print(f"Error fetching {symbol}: {e}")
            return None
    
    def get_options_chain(self, underlying: str, expiration: str):
        """Get options chain for GEX calculation"""
        try:
            options = self.rest_client.list_options_contracts(
                underlying_asset=underlying,
                expiration_date=expiration
            )
            return list(options)
        except Exception as e:
            print(f"Error fetching options: {e}")
            return []
    
    def start_websocket(self, symbols: list, callback):
        """Start WebSocket for real-time quotes"""
        self.ws_client = WebSocketClient(
            api_key=self.api_key,
            subscriptions=[f"T.{s}" for s in symbols]  # Trades
        )
        
        def handle_msg(msg: WebSocketMessage):
            callback(msg)
            
        self.ws_client.run(handle_msg)

# Usage
if __name__ == "__main__":
    api_key = os.getenv("POLYGON_API_KEY")
    data = PolygonRealTimeData(api_key)
    
    # Get current prices
    spx = data.get_current_price("SPX")
    spy = data.get_current_price("SPY")
    qqq = data.get_current_price("QQQ")
    
    print(f"SPX: {spx}")
    print(f"SPY: {spy}")
    print(f"QQQ: {qqq}")
```

---

## 📈 Calculating GEX from Real Options Data

```python
import numpy as np
from scipy.stats import norm

def calculate_gamma(S, K, T, r, sigma):
    """Calculate option gamma"""
    d1 = (np.log(S / K) + (r + 0.5 * sigma ** 2) * T) / (sigma * np.sqrt(T))
    gamma = norm.pdf(d1) / (S * sigma * np.sqrt(T))
    return gamma

def calculate_gex(options_data, spot_price, risk_free_rate=0.05):
    """
    Calculate GEX from options chain
    
    GEX = Gamma × OpenInterest × ContractMultiplier × Sign
    
    Sign: +1 for calls, -1 for puts
    """
    gex_by_strike = {}
    
    for option in options_data:
        strike = option.strike
        oi = option.open_interest
        gamma = calculate_gamma(
            S=spot_price,
            K=strike,
            T=option.days_to_expiry / 365,
            r=risk_free_rate,
            sigma=option.implied_volatility
        )
        
        # Sign: calls positive, puts negative
        sign = 1 if option.type == 'call' else -1
        
        # GEX contribution
        gex = gamma * oi * 100 * sign  # 100 = contract multiplier
        
        if strike not in gex_by_strike:
            gex_by_strike[strike] = 0
        gex_by_strike[strike] += gex
    
    return gex_by_strike
```

---

## 🔧 Updated BINARY Backend

```python
# trading_engine_real_data.py
import os
from polygon import RESTClient

class RealDataProvider:
    """Real market data provider using Polygon.io"""
    
    def __init__(self):
        self.api_key = os.getenv("POLYGON_API_KEY")
        self.client = RESTClient(self.api_key) if self.api_key else None
        
    async def fetch_real_prices(self):
        """Fetch real-time prices for SPX, SPY, QQQ"""
        if not self.client:
            # Fallback to Yahoo Finance
            return await self._fetch_yahoo()
        
        prices = {}
        for symbol in ["SPX", "SPY", "QQQ"]:
            try:
                # Get last trade
                trade = self.client.get_last_trade(symbol)
                prices[symbol] = trade.price
            except Exception as e:
                print(f"Polygon error for {symbol}: {e}")
                # Fallback
                prices[symbol] = await self._fetch_yahoo_single(symbol)
        
        return prices
    
    async def _fetch_yahoo(self):
        """Fallback to Yahoo Finance"""
        import yfinance as yf
        
        prices = {}
        for symbol in ["^SPX", "SPY", "QQQ"]:
            try:
                ticker = yf.Ticker(symbol)
                data = ticker.history(period="1d", interval="1m")
                if not data.empty:
                    prices[symbol.replace("^", "")] = data["Close"].iloc[-1]
            except Exception as e:
                print(f"Yahoo error: {e}")
        
        return prices

# Integrate with existing engine
async def update_with_real_data():
    provider = RealDataProvider()
    prices = await provider.fetch_real_prices()
    
    # Update ticker data with real prices
    for symbol, price in prices.items():
        print(f"{symbol}: {price}")
```

---

## 🚀 Quick Setup

### Option 1: Free Yahoo Finance (15-min delay)
```bash
pip install yfinance
# No API key needed
```

### Option 2: Polygon.io Real-Time
```bash
# 1. Sign up at polygon.io
# 2. Get API key
export POLYGON_API_KEY="your_key_here"
pip install polygon-api-client
```

### Option 3: Alpaca (Free Real-Time)
```bash
# 1. Sign up at alpaca.markets
# 2. Get API key
export ALPACA_API_KEY="your_key"
export ALPACA_SECRET_KEY="your_secret"
pip install alpaca-trade-api
```

---

## 📊 Data Accuracy Comparison

| Source | Delay | Cost | Best For |
|--------|-------|------|----------|
| Yahoo Finance | 15-20 min | Free | Development |
| Polygon.io | Real-time | $49/mo | Production |
| Alpaca | Real-time | Free | Stocks only |
| Tradier | Real-time | Free tier | Options |

---

## 🎯 Recommendation

**For immediate accurate data:**
1. Use **Yahoo Finance** (free, 15-min delay)
2. Good enough for pattern analysis

**For production trading:**
1. Subscribe to **Polygon.io** ($49/mo)
2. Real-time + options data
3. Calculate real GEX/VEX

**Hybrid approach:**
- Use Yahoo for now (free)
- Upgrade to Polygon when ready to trade live

---

## 🔗 Updated BINARY Dashboard

The dashboard will now show:
- ✅ Real market prices (not mock)
- ✅ Accurate GEX/VEX levels
- ✅ Real pattern detection
- ✅ Live Trinity alignment

Want me to implement the Yahoo Finance integration right now (free, immediate)?
