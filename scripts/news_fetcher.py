#!/usr/bin/env python3
"""
Fetch stock market news from RSS feeds and web sources.
No API key required. Returns JSON with headlines and summaries.
"""
import json
import urllib.request
import xml.etree.ElementTree as ET
import re

def fetch_yahoo_news():
    """Fetch news from Yahoo Finance RSS."""
    try:
        url = "https://finance.yahoo.com/news/rssindex"
        headers = {"User-Agent": "Mozilla/5.0"}
        req = urllib.request.Request(url, headers=headers)
        
        with urllib.request.urlopen(req, timeout=10) as response:
            content = response.read().decode()
            
        root = ET.fromstring(content)
        items = []
        
        for item in root.findall(".//item")[:10]:
            title = item.find("title")
            link = item.find("link")
            if title is not None and link is not None:
                items.append({
                    "title": title.text,
                    "url": link.text,
                    "source": "Yahoo Finance"
                })
        return items
    except Exception as e:
        return [{"error": str(e)}]

def fetch_marketwatch_headlines():
    """Fetch headlines from MarketWatch."""
    try:
        url = "https://www.marketwatch.com/rss/topstories"
        headers = {"User-Agent": "Mozilla/5.0"}
        req = urllib.request.Request(url, headers=headers)
        
        with urllib.request.urlopen(req, timeout=10) as response:
            content = response.read().decode()
            
        root = ET.fromstring(content)
        items = []
        
        for item in root.findall(".//item")[:5]:
            title = item.find("title")
            link = item.find("link")
            if title is not None and link is not None:
                items.append({
                    "title": title.text,
                    "url": link.text,
                    "source": "MarketWatch"
                })
        return items
    except Exception as e:
        return []

def main():
    results = {
        "timestamp": "2026-02-24",
        "news": []
    }
    
    yahoo = fetch_yahoo_news()
    mw = fetch_marketwatch_headlines()
    
    # Combine and dedupe
    seen = set()
    for item in yahoo + mw:
        if "title" in item:
            key = item["title"][:50]
            if key not in seen:
                seen.add(key)
                results["news"].append(item)
    
    print(json.dumps(results, indent=2))

if __name__ == "__main__":
    main()
