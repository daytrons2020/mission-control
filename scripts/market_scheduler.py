#!/usr/bin/env python3
"""
Unified Market Scheduler - Single process for all market alerts and reports.
Deduplicates alerts, caches data, manages all schedules.
"""
import json
import time
import subprocess
import os
from datetime import datetime, timedelta
from dataclasses import dataclass, asdict
from typing import List, Dict, Optional
import threading
# Scheduler - using simple timing instead of schedule library to avoid dependency

# Config
CONFIG = {
    "tickers": ["AAPL", "MSFT", "GOOGL", "AMZN", "NVDA", "META", "TSLA", "SPY", "QQQ"],
    "thresholds": {
        "market_watch": 3.0,   # ±3% for #market-watch
        "smart_alerts": 5.0,   # ±5% for #smart-alerts
    },
    "channels": {
        "market_watch": "#market-watch",
        "smart_alerts": "#smart-alerts", 
        "token_tracker": "#token-tracker",
        "twitter_trends": "#twitter-trends",
    },
    "schedules": {
        "price_check_fast": 5,      # minutes
        "price_check_slow": 15,     # minutes
        "cost_report": 60,          # minutes
        "trends_update": 240,       # minutes (4 hours)
    }
}

# State file for persistence
STATE_FILE = "/Users/daytrons/.openclaw/workspace/data/scheduler_state.json"
CACHE_FILE = "/Users/daytrons/.openclaw/workspace/data/price_cache.json"

def ensure_dirs():
    os.makedirs(os.path.dirname(STATE_FILE), exist_ok=True)

@dataclass
class AlertState:
    ticker: str
    threshold: float
    direction: str  # 'up' or 'down'
    first_seen: str
    last_alerted: Optional[str] = None
    alert_count: int = 0

class MarketScheduler:
    def __init__(self):
        ensure_dirs()
        self.state = self.load_state()
        self.price_cache = self.load_cache()
        self.alert_history: Dict[str, AlertState] = {}
        
    def load_state(self) -> dict:
        if os.path.exists(STATE_FILE):
            with open(STATE_FILE) as f:
                return json.load(f)
        return {"alerts": {}, "last_runs": {}}
    
    def save_state(self):
        with open(STATE_FILE, 'w') as f:
            json.dump(self.state, f, indent=2)
    
    def load_cache(self) -> dict:
        if os.path.exists(CACHE_FILE):
            with open(CACHE_FILE) as f:
                return json.load(f)
        return {"prices": {}, "timestamp": None}
    
    def save_cache(self):
        with open(CACHE_FILE, 'w') as f:
            json.dump(self.price_cache, f, indent=2)
    
    def fetch_prices(self) -> List[dict]:
        """Fetch fresh prices from Yahoo Finance."""
        try:
            result = subprocess.run(
                ["python3", "/Users/daytrons/.openclaw/workspace/scripts/stock_fetcher.py"] + CONFIG["tickers"],
                capture_output=True, text=True, timeout=15
            )
            prices = json.loads(result.stdout)
            self.price_cache = {
                "prices": {p["ticker"]: p for p in prices if "error" not in p},
                "timestamp": datetime.now().isoformat()
            }
            self.save_cache()
            return prices
        except Exception as e:
            print(f"[ERROR] Fetch prices failed: {e}")
            # Return cached data if available
            cached = self.price_cache.get("prices", {})
            return list(cached.values())
    
    def should_alert(self, ticker: str, change_pct: float, threshold: float) -> bool:
        """Check if we should alert (deduplication logic)."""
        direction = "up" if change_pct > 0 else "down"
        key = f"{ticker}_{threshold}_{direction}"
        now = datetime.now()
        
        if key not in self.alert_history:
            # New alert
            self.alert_history[key] = AlertState(
                ticker=ticker,
                threshold=threshold,
                direction=direction,
                first_seen=now.isoformat()
            )
            self.alert_history[key].last_alerted = now.isoformat()
            self.alert_history[key].alert_count = 1
            return True
        
        alert = self.alert_history[key]
        last_alerted = datetime.fromisoformat(alert.last_alerted) if alert.last_alerted else now
        
        # Re-alert if: 1) Never alerted, 2) 2+ hours passed, 3) Direction changed
        hours_since = (now - last_alerted).total_seconds() / 3600
        
        if hours_since >= 2:
            alert.last_alerted = now.isoformat()
            alert.alert_count += 1
            return True
        
        return False
    
    def format_price_alert(self, stock: dict) -> str:
        direction = "🟢" if stock["change_pct"] > 0 else "🔴"
        return f"{direction} **{stock['ticker']}**: ${stock['price']:.2f} ({stock['change_pct']:+.2f}%)"
    
    def check_alerts(self, threshold_key: str):
        """Check for price movements above threshold."""
        threshold = CONFIG["thresholds"][threshold_key]
        channel = CONFIG["channels"][threshold_key]
        
        prices = self.fetch_prices()
        alerts = []
        
        for stock in prices:
            if "error" in stock:
                continue
            change_pct = abs(stock["change_pct"])
            if change_pct >= threshold:
                if self.should_alert(stock["ticker"], stock["change_pct"], threshold):
                    alerts.append(self.format_price_alert(stock))
        
        if alerts:
            msg = f"📊 **Stock Alert** (±{threshold}% threshold)\n\n"
            msg += "\n".join(alerts)
            msg += f"\n\n_{datetime.now().strftime('%H:%M')} | {channel}_"
            print(msg)
            print(f"\n<!-- POST_TO:{channel} -->")
        else:
            print(f"[{datetime.now().strftime('%H:%M')}] No {threshold_key} alerts (threshold: ±{threshold}%)")
    
    def cost_report(self):
        """Generate hourly cost report."""
        try:
            result = subprocess.run(
                ["python3", "/Users/daytrons/.agents/skills/openclaw-cost-tracker/scripts/cost_tracker.py",
                 "--days", "1", "--format", "json"],
                capture_output=True, text=True, timeout=15
            )
            data = json.loads(result.stdout)
            
            grand = data.get('grandTotal', {})
            
            msg = "💰 **Hourly Cost Report**\n\n"
            msg += f"**Today:** ${grand.get('totalCost', 0):.2f} | "
            msg += f"{grand.get('totalTokens', 0):,} tokens | "
            msg += f"{grand.get('totalRequests', 0)} requests\n"
            
            if data.get('models'):
                msg += "\n**By Model:**\n"
                for m in data['models'][:3]:
                    msg += f"• {m['model']}: {m['totalTokens']:,} tokens\n"
            
            channel = CONFIG["channels"]["token_tracker"]
            print(msg)
            print(f"\n<!-- POST_TO:{channel} -->")
        except Exception as e:
            print(f"[ERROR] Cost report failed: {e}")
    
    def trends_update(self):
        """Generate market trends update."""
        try:
            prices = self.fetch_prices()
            
            # Get news
            result = subprocess.run(
                ["python3", "/Users/daytrons/.openclaw/workspace/scripts/news_fetcher.py"],
                capture_output=True, text=True, timeout=15
            )
            news = json.loads(result.stdout)
            
            msg = "📈 **Market Trends Update**\n\n"
            
            # Top movers
            movers = [s for s in prices if abs(s.get('change_pct', 0)) >= 2]
            if movers:
                msg += "**Top Movers:**\n"
                for s in sorted(movers, key=lambda x: abs(x['change_pct']), reverse=True)[:3]:
                    direction = "🟢" if s['change_pct'] > 0 else "🔴"
                    msg += f"{direction} {s['ticker']}: {s['change_pct']:+.2f}%\n"
                msg += "\n"
            
            # News
            headlines = news.get('news', [])[:3]
            if headlines:
                msg += "**Headlines:**\n"
                for h in headlines:
                    title = h.get('title', '')[:55] + "..." if len(h.get('title', '')) > 55 else h.get('title', '')
                    msg += f"• {title}\n"
            
            channel = CONFIG["channels"]["twitter_trends"]
            print(msg)
            print(f"\n<!-- POST_TO:{channel} -->")
        except Exception as e:
            print(f"[ERROR] Trends update failed: {e}")
    
    def run(self):
        """Run the scheduler loop."""
        print(f"[{datetime.now()}] Market Scheduler starting...")
        
        # Track last run times
        last_run = {
            "market_watch": 0,
            "smart_alerts": 0,
            "cost_report": 0,
            "trends_update": 0,
        }
        
        print(f"Scheduled: Price checks every {CONFIG['schedules']['price_check_fast']}min")
        print(f"Scheduled: Smart alerts every {CONFIG['schedules']['price_check_slow']}min")
        print(f"Scheduled: Cost report every {CONFIG['schedules']['cost_report']}min")
        print(f"Scheduled: Trends every {CONFIG['schedules']['trends_update']}min")
        
        # Run immediately once
        self.check_alerts("market_watch")
        last_run["market_watch"] = time.time()
        
        while True:
            now = time.time()
            
            # Check each job
            if now - last_run["market_watch"] >= CONFIG["schedules"]["price_check_fast"] * 60:
                self.check_alerts("market_watch")
                last_run["market_watch"] = now
            
            if now - last_run["smart_alerts"] >= CONFIG["schedules"]["price_check_slow"] * 60:
                self.check_alerts("smart_alerts")
                last_run["smart_alerts"] = now
            
            if now - last_run["cost_report"] >= CONFIG["schedules"]["cost_report"] * 60:
                self.cost_report()
                last_run["cost_report"] = now
            
            if now - last_run["trends_update"] >= CONFIG["schedules"]["trends_update"] * 60:
                self.trends_update()
                last_run["trends_update"] = now
            
            time.sleep(60)

def main():
    scheduler = MarketScheduler()
    scheduler.run()

if __name__ == "__main__":
    main()
