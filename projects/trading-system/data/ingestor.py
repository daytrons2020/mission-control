"""
Data Ingestion Module
Handles market data from multiple sources
"""
import pandas as pd
import numpy as np
from typing import Optional, List, Dict, Callable
from abc import ABC, abstractmethod
import asyncio
from datetime import datetime, timedelta


class DataProvider(ABC):
    """Abstract base class for data providers"""
    
    @abstractmethod
    async def get_historical_data(self, 
                                   symbol: str, 
                                   start: datetime, 
                                   end: datetime,
                                   timeframe: str = "1d") -> pd.DataFrame:
        pass
    
    @abstractmethod
    async def subscribe_realtime(self, 
                                  symbols: List[str], 
                                  callback: Callable):
        pass


class PolygonDataProvider(DataProvider):
    """Polygon.io data provider"""
    
    def __init__(self, api_key: str):
        self.api_key = api_key
        self.base_url = "https://api.polygon.io"
        
    async def get_historical_data(self,
                                   symbol: str,
                                   start: datetime,
                                   end: datetime,
                                   timeframe: str = "1d") -> pd.DataFrame:
        """
        Fetch historical data from Polygon.io
        """
        # Implementation would use polygon-api-client
        # from polygon import RESTClient
        # client = RESTClient(self.api_key)
        # aggs = client.get_aggs(symbol, 1, "day", start, end)
        
        # Placeholder implementation
        raise NotImplementedError("Polygon integration requires API key and polygon-api-client")
    
    async def subscribe_realtime(self,
                                  symbols: List[str],
                                  callback: Callable):
        """Subscribe to real-time WebSocket stream"""
        # WebSocket implementation
        pass


class YFinanceProvider(DataProvider):
    """Yahoo Finance data provider (free)"""
    
    def __init__(self):
        self.name = "yfinance"
        
    async def get_historical_data(self,
                                   symbol: str,
                                   start: datetime,
                                   end: datetime,
                                   timeframe: str = "1d") -> pd.DataFrame:
        """
        Fetch historical data from Yahoo Finance
        """
        try:
            import yfinance as yf
            
            ticker = yf.Ticker(symbol)
            df = ticker.history(start=start, end=end, interval=timeframe)
            
            # Standardize column names
            df.columns = [col.lower().replace(' ', '_') for col in df.columns]
            df['symbol'] = symbol
            
            return df
            
        except ImportError:
            raise ImportError("yfinance not installed. Run: pip install yfinance")
    
    async def subscribe_realtime(self,
                                  symbols: List[str],
                                  callback: Callable):
        """Yahoo Finance doesn't support real-time WebSocket"""
        raise NotImplementedError("Yahoo Finance doesn't support real-time streaming")


class DataIngestor:
    """
    Central data ingestion system
    Supports multiple providers and caching
    """
    
    def __init__(self):
        self.providers: Dict[str, DataProvider] = {}
        self.cache: Dict[str, pd.DataFrame] = {}
        self.cache_ttl = 300  # 5 minutes
        
    def add_provider(self, name: str, provider: DataProvider):
        """Register a data provider"""
        self.providers[name] = provider
        
    async def get_data(self,
                       symbol: str,
                       provider: str = "yfinance",
                       lookback_days: int = 252,
                       timeframe: str = "1d") -> pd.DataFrame:
        """
        Get historical data from specified provider
        """
        if provider not in self.providers:
            raise ValueError(f"Provider {provider} not registered")
            
        end = datetime.now()
        start = end - timedelta(days=lookback_days)
        
        provider_instance = self.providers[provider]
        df = await provider_instance.get_historical_data(symbol, start, end, timeframe)
        
        return df
    
    def calculate_indicators(self, 
                             df: pd.DataFrame,
                             indicators: List[str]) -> pd.DataFrame:
        """
        Calculate technical indicators on dataframe
        """
        df = df.copy()
        
        if 'sma_20' in indicators:
            df['sma_20'] = df['close'].rolling(window=20).mean()
            
        if 'sma_50' in indicators:
            df['sma_50'] = df['close'].rolling(window=50).mean()
            
        if 'rsi' in indicators:
            delta = df['close'].diff()
            gain = (delta.where(delta > 0, 0)).rolling(window=14).mean()
            loss = (-delta.where(delta < 0, 0)).rolling(window=14).mean()
            rs = gain / loss
            df['rsi'] = 100 - (100 / (1 + rs))
            
        if 'atr' in indicators:
            high_low = df['high'] - df['low']
            high_close = np.abs(df['high'] - df['close'].shift())
            low_close = np.abs(df['low'] - df['close'].shift())
            ranges = pd.concat([high_low, high_close, low_close], axis=1)
            true_range = np.max(ranges, axis=1)
            df['atr'] = true_range.rolling(14).mean()
            
        if 'macd' in indicators:
            ema_12 = df['close'].ewm(span=12, adjust=False).mean()
            ema_26 = df['close'].ewm(span=26, adjust=False).mean()
            df['macd'] = ema_12 - ema_26
            df['macd_signal'] = df['macd'].ewm(span=9, adjust=False).mean()
            
        if 'bollinger_bands' in indicators:
            df['sma'] = df['close'].rolling(window=20).mean()
            df['std'] = df['close'].rolling(window=20).std()
            df['upper_band'] = df['sma'] + (df['std'] * 2)
            df['lower_band'] = df['sma'] - (df['std'] * 2)
            
        return df
