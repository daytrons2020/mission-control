"""
Configuration module for Bitcoin Paper Trading Bot.
Loads settings from environment variables and provides defaults.
"""

import os
from dataclasses import dataclass, field
from typing import Optional
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()


@dataclass
class BinanceConfig:
    """Binance API configuration."""
    testnet: bool = True
    base_url: str = 'https://testnet.binance.vision'
    ws_url: str = 'wss://testnet.binance.vision/ws'
    
    def __post_init__(self):
        self._api_key = os.getenv('BINANCE_TESTNET_API_KEY', '')
        self._secret_key = os.getenv('BINANCE_TESTNET_SECRET_KEY', '')
    
    @property
    def api_key(self) -> str:
        return self._api_key
    
    @property
    def secret_key(self) -> str:
        return self._secret_key
    
    @property
    def is_configured(self) -> bool:
        """Check if API credentials are configured."""
        return bool(self.api_key and self.secret_key)


@dataclass
class TradingConfig:
    """Trading parameters configuration."""
    symbol: str = field(default_factory=lambda: os.getenv('TRADING_SYMBOL', 'BTCUSDT'))
    timeframe: str = field(default_factory=lambda: os.getenv('TIMEFRAME', '1h'))
    risk_per_trade: float = field(default_factory=lambda: float(os.getenv('RISK_PER_TRADE', '0.01')))
    max_open_positions: int = field(default_factory=lambda: int(os.getenv('MAX_OPEN_POSITIONS', '1')))
    max_daily_loss: float = field(default_factory=lambda: float(os.getenv('MAX_DAILY_LOSS', '0.05')))
    max_position_size: float = field(default_factory=lambda: float(os.getenv('MAX_POSITION_SIZE', '0.1')))
    paper_trading: bool = field(default_factory=lambda: os.getenv('PAPER_TRADING', 'true').lower() == 'true')
    initial_balance: float = field(default_factory=lambda: float(os.getenv('INITIAL_BALANCE', '10000')))


@dataclass
class StrategyConfig:
    """Strategy parameters configuration."""
    # EMA Parameters
    ema_fast: int = field(default_factory=lambda: int(os.getenv('EMA_FAST', '9')))
    ema_slow: int = field(default_factory=lambda: int(os.getenv('EMA_SLOW', '21')))
    
    # RSI Parameters
    rsi_period: int = field(default_factory=lambda: int(os.getenv('RSI_PERIOD', '14')))
    rsi_overbought: float = field(default_factory=lambda: float(os.getenv('RSI_OVERBOUGHT', '70')))
    rsi_oversold: float = field(default_factory=lambda: float(os.getenv('RSI_OVERSOLD', '30')))
    
    # ATR Parameters
    atr_period: int = field(default_factory=lambda: int(os.getenv('ATR_PERIOD', '14')))
    atr_multiplier_sl: float = field(default_factory=lambda: float(os.getenv('ATR_MULTIPLIER_SL', '1.5')))
    atr_multiplier_tp: float = field(default_factory=lambda: float(os.getenv('ATR_MULTIPLIER_TP', '3.0')))
    
    @property
    def risk_reward_ratio(self) -> float:
        """Calculate the risk-reward ratio."""
        return self.atr_multiplier_tp / self.atr_multiplier_sl


@dataclass
class TimeConfig:
    """Trading hours configuration."""
    start_hour: int = field(default_factory=lambda: int(os.getenv('TRADING_START_HOUR', '0')))
    end_hour: int = field(default_factory=lambda: int(os.getenv('TRADING_END_HOUR', '23')))


@dataclass
class LoggingConfig:
    """Logging configuration."""
    level: str = field(default_factory=lambda: os.getenv('LOG_LEVEL', 'INFO'))
    log_to_file: bool = field(default_factory=lambda: os.getenv('LOG_TO_FILE', 'true').lower() == 'true')
    log_file: str = 'logs/bot.log'
    max_bytes: int = 10 * 1024 * 1024  # 10MB
    backup_count: int = 5


@dataclass
class DatabaseConfig:
    """Database configuration."""
    url: str = field(default_factory=lambda: os.getenv('DATABASE_URL', 'sqlite:///data/trades.db'))


@dataclass
class DashboardConfig:
    """Dashboard configuration."""
    host: str = field(default_factory=lambda: os.getenv('DASHBOARD_HOST', '127.0.0.1'))
    port: int = field(default_factory=lambda: int(os.getenv('DASHBOARD_PORT', '5000')))


class Config:
    """Main configuration class that aggregates all config sections."""
    
    def __init__(self):
        self.binance = BinanceConfig()
        self.trading = TradingConfig()
        self.strategy = StrategyConfig()
        self.time = TimeConfig()
        self.logging = LoggingConfig()
        self.database = DatabaseConfig()
        self.dashboard = DashboardConfig()
    
    def validate(self) -> list:
        """Validate configuration and return list of errors."""
        errors = []
        
        if not self.binance.is_configured:
            errors.append("Binance API credentials not configured. Please set BINANCE_TESTNET_API_KEY and BINANCE_TESTNET_SECRET_KEY in .env file.")
        
        if self.strategy.ema_fast >= self.strategy.ema_slow:
            errors.append("EMA fast period must be less than EMA slow period.")
        
        if not (0 < self.trading.risk_per_trade <= 0.1):
            errors.append("Risk per trade should be between 0 and 0.1 (0% to 10%).")
        
        if self.strategy.rsi_overbought <= self.strategy.rsi_oversold:
            errors.append("RSI overbought level must be greater than oversold level.")
        
        return errors
    
    def to_dict(self) -> dict:
        """Convert configuration to dictionary."""
        return {
            'binance': {
                'testnet': self.binance.testnet,
                'base_url': self.binance.base_url,
                'is_configured': self.binance.is_configured
            },
            'trading': {
                'symbol': self.trading.symbol,
                'timeframe': self.trading.timeframe,
                'risk_per_trade': self.trading.risk_per_trade,
                'max_open_positions': self.trading.max_open_positions,
                'paper_trading': self.trading.paper_trading,
                'initial_balance': self.trading.initial_balance
            },
            'strategy': {
                'ema_fast': self.strategy.ema_fast,
                'ema_slow': self.strategy.ema_slow,
                'rsi_period': self.strategy.rsi_period,
                'rsi_overbought': self.strategy.rsi_overbought,
                'rsi_oversold': self.strategy.rsi_oversold,
                'atr_period': self.strategy.atr_period,
                'atr_multiplier_sl': self.strategy.atr_multiplier_sl,
                'atr_multiplier_tp': self.strategy.atr_multiplier_tp,
                'risk_reward_ratio': self.strategy.risk_reward_ratio
            }
        }


# Global config instance
config = Config()
