#!/usr/bin/env python3
"""
Stock alert checker - outputs Discord-formatted message if threshold hit.
Usage: python3 stock_alert.py --threshold 3 --channel "#market-watch"
"""
import json
import subprocess
import sys
import argparse

def fetch_prices():
    """Run stock fetcher and return parsed data."""
    result = subprocess.run(
        ["python3", "/Users/daytrons/.openclaw/workspace/scripts/stock_fetcher.py"],
        capture_output=True, text=True, timeout=15
    )
    return json.loads(result.stdout)

def format_alert(ticker, data, threshold):
    """Format a Discord alert message."""
    change_pct = data['change_pct']
    direction = "🟢" if change_pct > 0 else "🔴"
    return f"{direction} **{ticker}**: ${data['price']} ({change_pct:+.2f}%)"

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--threshold", type=float, default=3.0, help="Alert threshold %")
    parser.add_argument("--channel", type=str, required=True, help="Discord channel")
    args = parser.parse_args()
    
    prices = fetch_prices()
    alerts = []
    
    for stock in prices:
        if "error" in stock:
            continue
        if abs(stock['change_pct']) >= args.threshold:
            alerts.append(format_alert(stock['ticker'], stock, args.threshold))
    
    if alerts:
        print(f"📊 **Stock Alert** (±{args.threshold}% threshold)\n")
        print("\n".join(alerts))
        print(f"\n_Alerts for {args.channel}_")
    else:
        print(f"_No stocks hit the ±{args.threshold}% threshold. All quiet._")

if __name__ == "__main__":
    main()
