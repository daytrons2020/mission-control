#!/usr/bin/env python3
"""
Simple stock price fetcher using Yahoo Finance (unofficial endpoint).
No API key required. Returns JSON with current price and daily change.
"""
import sys
import json
import urllib.request
import urllib.error

def fetch_stock_price(ticker):
    """Fetch stock price from Yahoo Finance."""
    try:
        # Yahoo Finance quote endpoint
        url = f"https://query1.finance.yahoo.com/v8/finance/chart/{ticker}?interval=1d&range=2d"
        headers = {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.0"
        }
        
        req = urllib.request.Request(url, headers=headers)
        with urllib.request.urlopen(req, timeout=10) as response:
            data = json.loads(response.read().decode())
            
        result = data.get("chart", {}).get("result", [{}])[0]
        meta = result.get("meta", {})
        timestamps = result.get("timestamp", [])
        closes = result.get("indicators", {}).get("quote", [{}])[0].get("close", [])
        
        if not closes or len(closes) < 1:
            return None
            
        current_price = closes[-1]
        prev_close = meta.get("previousClose", closes[0] if len(closes) > 1 else current_price)
        change = current_price - prev_close
        change_pct = (change / prev_close) * 100 if prev_close else 0
        
        return {
            "ticker": ticker,
            "price": round(current_price, 2),
            "change": round(change, 2),
            "change_pct": round(change_pct, 2),
            "prev_close": round(prev_close, 2)
        }
    except Exception as e:
        return {"ticker": ticker, "error": str(e)}

def main():
    tickers = sys.argv[1:] if len(sys.argv) > 1 else ["AAPL", "MSFT", "GOOGL", "AMZN", "NVDA", "META", "TSLA", "SPY", "QQQ"]
    
    results = []
    for ticker in tickers:
        result = fetch_stock_price(ticker)
        if result:
            results.append(result)
    
    print(json.dumps(results, indent=2))

if __name__ == "__main__":
    main()
