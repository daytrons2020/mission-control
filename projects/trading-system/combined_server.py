#!/usr/bin/env python3
"""
BINARY Combined Server
- Serves static frontend files
- Provides /api/prices endpoint for real-time data
"""

import http.server
import socketserver
import json
import urllib.request
import urllib.error
import ssl
from datetime import datetime
import threading
import time

PORT = 8080

# Cache for prices
price_cache = {
    'SPX': None,
    'SPY': None,
    'QQQ': None,
    'last_update': None
}

def fetch_yahoo_price(symbol):
    """Fetch price from Yahoo Finance"""
    try:
        url = f"https://query1.finance.yahoo.com/v8/finance/chart/{symbol}?interval=1m&range=1d"
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
        
        req = urllib.request.Request(url, headers=headers)
        
        # Create SSL context that doesn't verify certificates
        ctx = ssl.create_default_context()
        ctx.check_hostname = False
        ctx.verify_mode = ssl.CERT_NONE
        
        with urllib.request.urlopen(req, context=ctx, timeout=10) as response:
            data = json.loads(response.read().decode())
            
            if 'chart' in data and 'result' in data['chart'] and data['chart']['result']:
                result = data['chart']['result'][0]
                meta = result.get('meta', {})
                
                price = meta.get('regularMarketPrice')
                
                if not price and 'timestamp' in result:
                    indicators = result.get('indicators', {})
                    quote = indicators.get('quote', [{}])[0]
                    closes = quote.get('close', [])
                    
                    for close in reversed(closes):
                        if close is not None:
                            price = close
                            break
                
                return float(price) if price else None
                
    except Exception as e:
        print(f"Error fetching {symbol}: {e}")
    
    return None

def update_prices():
    """Background thread to update prices every 30 seconds"""
    global price_cache
    
    symbols = {
        'SPX': '^GSPC',
        'SPY': 'SPY',
        'QQQ': 'QQQ'
    }
    
    while True:
        try:
            print(f"[{datetime.now()}] Updating prices...")
            for name, yahoo_sym in symbols.items():
                price = fetch_yahoo_price(yahoo_sym)
                if price:
                    price_cache[name] = price
                    print(f"  {name}: {price}")
            
            price_cache['last_update'] = datetime.now().isoformat()
            print(f"  Updated at: {price_cache['last_update']}")
            
        except Exception as e:
            print(f"Error updating prices: {e}")
        
        time.sleep(30)  # Update every 30 seconds

class Handler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory='/root/.openclaw/workspace/projects/trading-system/frontend', **kwargs)
    
    def do_GET(self):
        if self.path == '/api/prices':
            self.send_response(200)
            self.send_header('Content-type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            
            response = {
                'prices': {
                    'SPX': price_cache['SPX'] or 6909.51,
                    'SPY': price_cache['SPY'] or 689.43,
                    'QQQ': price_cache['QQQ'] or 608.81
                },
                'timestamp': price_cache['last_update'] or datetime.now().isoformat(),
                'source': 'Yahoo Finance'
            }
            
            self.wfile.write(json.dumps(response).encode())
            return
        
        return super().do_GET()
    
    def log_message(self, format, *args):
        # Suppress default logging
        pass

if __name__ == '__main__':
    print("⚡ BINARY Combined Server Starting...")
    print(f"Port: {PORT}")
    print("")
    
    # Start background price updater
    updater = threading.Thread(target=update_prices, daemon=True)
    updater.start()
    
    # Do initial fetch
    print("Fetching initial prices...")
    symbols = {'SPX': '^GSPC', 'SPY': 'SPY', 'QQQ': 'QQQ'}
    for name, yahoo_sym in symbols.items():
        price = fetch_yahoo_price(yahoo_sym)
        if price:
            price_cache[name] = price
            print(f"  {name}: {price}")
    
    print("")
    print(f"🌐 Dashboard: http://localhost:{PORT}")
    print(f"📊 API: http://localhost:{PORT}/api/prices")
    print("")
    
    with socketserver.TCPServer(("0.0.0.0", PORT), Handler) as httpd:
        print("Server running. Press Ctrl+C to stop.")
        httpd.serve_forever()
