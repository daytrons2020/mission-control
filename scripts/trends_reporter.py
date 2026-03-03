#!/usr/bin/env python3
"""
Market trends reporter - outputs Discord-formatted news + prices summary.
"""
import json
import subprocess

def fetch_news():
    result = subprocess.run(
        ["python3", "/Users/daytrons/.openclaw/workspace/scripts/news_fetcher.py"],
        capture_output=True, text=True, timeout=15
    )
    return json.loads(result.stdout)

def fetch_prices():
    result = subprocess.run(
        ["python3", "/Users/daytrons/.openclaw/workspace/scripts/stock_fetcher.py"],
        capture_output=True, text=True, timeout=15
    )
    return json.loads(result.stdout)

def main():
    news = fetch_news()
    prices = fetch_prices()
    
    print("📈 **Market Trends Update**\n")
    
    # Top movers
    movers = [s for s in prices if abs(s.get('change_pct', 0)) >= 2]
    if movers:
        print("**Top Movers:**")
        for s in sorted(movers, key=lambda x: abs(x['change_pct']), reverse=True)[:3]:
            direction = "🟢" if s['change_pct'] > 0 else "🔴"
            print(f"{direction} {s['ticker']}: {s['change_pct']:+.2f}%")
        print()
    
    # News headlines
    headlines = news.get('news', [])[:3]
    if headlines:
        print("**Headlines:**")
        for h in headlines:
            title = h.get('title', '')[:60] + "..." if len(h.get('title', '')) > 60 else h.get('title', '')
            print(f"• {title}")
    
    print(f"\n_#twitter-trends_")

if __name__ == "__main__":
    main()
