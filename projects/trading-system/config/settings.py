"""
Trading System Configuration
API keys and sensitive settings should be loaded from environment variables
"""
import os
from dataclasses import dataclass
from typing import Dict, List


@dataclass
class APIConfig:
    """API Configuration"""
    polygon_api_key: str = os.getenv("POLYGON_API_KEY", "")
    alpha_vantage_key: str = os.getenv("ALPHA_VANTAGE_KEY", "")
    alpaca_api_key: str = os.getenv("ALPACA_API_KEY", "")
    alpaca_secret_key: str = os.getenv("ALPACA_SECRET_KEY", "")
    ibkr_host: str = os.getenv("IBKR_HOST", "127.0.0.1")
    ibkr_port: int = int(os.getenv("IBKR_PORT", "7497"))


@dataclass
class TradingConfig:
    """Trading Parameters"""
    # Account settings
    initial_capital: float = 100000.0
    max_risk_per_trade: float = 0.02  # 2% max risk
    max_positions: int = 10
    
    # Position sizing
    position_sizing_method: str = "kelly_fractional"  # fixed, kelly, atr_based
    kelly_fraction: float = 0.25
    
    # Risk management
    stop_loss_method: str = "atr"  # fixed, atr, support_resistance
    atr_multiplier: float = 2.0
    
    # Daily limits
    max_daily_loss: float = 0.03  # 3% daily circuit breaker
    max_daily_trades: int = 10
    
    # Options specific
    min_dte: int = 21  # Minimum days to expiration
    max_options_allocation: float = 0.50  # 50% max in options


@dataclass
class StrategyConfig:
    """Strategy Parameters"""
    # RSI + Bollinger Bands (Mean Reversion)
    rsi_period: int = 14
    rsi_overbought: int = 70
    rsi_oversold: int = 30
    bb_period: int = 20
    bb_std: float = 2.0
    
    # MACD + ADX (Trend Following)
    macd_fast: int = 12
    macd_slow: int = 26
    macd_signal: int = 9
    adx_period: int = 14
    adx_threshold: float = 25.0
    
    # VWAP (Intraday)
    vwap_deviation: float = 0.001  # 0.1%
    volume_threshold: float = 1.5  # 1.5x average volume


@dataclass
class MLConfig:
    """Machine Learning Configuration"""
    # LSTM parameters
    lstm_units: List[int] = None
    lstm_dropout: float = 0.2
    lstm_epochs: int = 100
    lstm_batch_size: int = 32
    sequence_length: int = 60
    
    # XGBoost parameters
    xgb_max_depth: int = 6
    xgb_learning_rate: float = 0.1
    xgb_n_estimators: int = 100
    
    # Training
    train_split: float = 0.7
    val_split: float = 0.15
    test_split: float = 0.15
    
    def __post_init__(self):
        if self.lstm_units is None:
            self.lstm_units = [128, 64, 32]


# Global configuration instances
api_config = APIConfig()
trading_config = TradingConfig()
strategy_config = StrategyConfig()
ml_config = MLConfig()
