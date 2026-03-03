# BINARY Price API Server
# Fetches real-time prices from Yahoo Finance and serves to frontend

from flask import Flask, jsonify
from flask_cors import CORS
import requests
import logging
from datetime import datetime

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__)
CORS(app)  # Enable CORS for all domains

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
        url = f"https://query1.finance.yahoo.com/v8/finance/chart/{symbol}"
        params = {
            'interval': '1m',
            'range': '1d'
        }
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
        
        response = requests.get(url, params=params, headers=headers, timeout=10)
        data = response.json()
        
        if 'chart' in data and 'result' in data['chart'] and data['chart']['result']:
            result = data['chart']['result'][0]
            meta = result.get('meta', {})
            
            # Try to get current price
            price = meta.get('regularMarketPrice')
            
            # Fallback to last close in chart data
            if not price and 'timestamp' in result:
                indicators = result.get('indicators', {})
                quote = indicators.get('quote', [{}])[0]
                closes = quote.get('close', [])
                
                for close in reversed(closes):
                    if close is not None:
                        price = close
                        break
            
            if price:
                return float(price)
                
    except Exception as e:
        logger.error(f"Error fetching {symbol}: {e}")
    
    return None

@app.route('/api/prices')
def get_prices():
    """Get current prices for all symbols"""
    global price_cache
    
    # Yahoo Finance symbols
    symbols = {
        'SPX': '^GSPC',
        'SPY': 'SPY',
        'QQQ': 'QQQ'
    }
    
    prices = {}
    
    for name, yahoo_sym in symbols.items():
        price = fetch_yahoo_price(yahoo_sym)
        if price:
            prices[name] = price
            price_cache[name] = price
        elif price_cache[name]:
            prices[name] = price_cache[name]
            logger.warning(f"Using cached price for {name}")
    
    price_cache['last_update'] = datetime.now().isoformat()
    
    return jsonify({
        'prices': prices,
        'timestamp': price_cache['last_update'],
        'source': 'Yahoo Finance'
    })

@app.route('/api/health')
def health():
    """Health check endpoint"""
    return jsonify({'status': 'ok', 'service': 'BINARY Price API'})

if __name__ == '__main__':
    logger.info("Starting BINARY Price API Server...")
    app.run(host='0.0.0.0', port=5000, debug=False)
