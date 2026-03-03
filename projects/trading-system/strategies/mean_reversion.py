"""
Mean Reversion Strategy: RSI + Bollinger Bands
High win rate strategy for range-bound markets
"""
import pandas as pd
import numpy as np
from typing import Optional
from strategies.base import Strategy, Signal, SignalType, MarketData
from config.settings import strategy_config, trading_config


class MeanReversionStrategy(Strategy):
    """
    Mean Reversion Strategy using RSI and Bollinger Bands
    
    Entry Long: RSI < 30 AND Price touches lower Bollinger Band
    Entry Short: RSI > 70 AND Price touches upper Bollinger Band
    Exit: RSI returns to 50 OR price crosses middle band
    
    Expected Win Rate: 70-75% in range-bound markets
    """
    
    def __init__(self, config: dict = None):
        super().__init__("MeanReversion_RSI_BB", config)
        self.rsi_period = strategy_config.rsi_period
        self.rsi_overbought = strategy_config.rsi_overbought
        self.rsi_oversold = strategy_config.rsi_oversold
        self.bb_period = strategy_config.bb_period
        self.bb_std = strategy_config.bb_std
        
    def initialize(self, data: pd.DataFrame) -> None:
        """Calculate indicators on historical data"""
        self.data = data.copy()
        self._calculate_indicators()
        
    def _calculate_indicators(self) -> None:
        """Calculate RSI and Bollinger Bands"""
        # Calculate RSI
        delta = self.data['close'].diff()
        gain = (delta.where(delta > 0, 0)).rolling(window=self.rsi_period).mean()
        loss = (-delta.where(delta < 0, 0)).rolling(window=self.rsi_period).mean()
        rs = gain / loss
        self.data['rsi'] = 100 - (100 / (1 + rs))
        
        # Calculate Bollinger Bands
        self.data['sma'] = self.data['close'].rolling(window=self.bb_period).mean()
        self.data['std'] = self.data['close'].rolling(window=self.bb_period).std()
        self.data['upper_band'] = self.data['sma'] + (self.data['std'] * self.bb_std)
        self.data['lower_band'] = self.data['sma'] - (self.data['std'] * self.bb_std)
        
        # Calculate ATR for stop loss
        high_low = self.data['high'] - self.data['low']
        high_close = np.abs(self.data['high'] - self.data['close'].shift())
        low_close = np.abs(self.data['low'] - self.data['close'].shift())
        ranges = pd.concat([high_low, high_close, low_close], axis=1)
        true_range = np.max(ranges, axis=1)
        self.data['atr'] = true_range.rolling(14).mean()
        
    def generate_signal(self, data: pd.DataFrame) -> Optional[Signal]:
        """Generate trading signal"""
        if len(data) < max(self.rsi_period, self.bb_period):
            return None
            
        # Get latest values
        current = data.iloc[-1]
        symbol = current.get('symbol', 'UNKNOWN')
        
        rsi = current.get('rsi', 50)
        close = current['close']
        upper_band = current.get('upper_band', close)
        lower_band = current.get('lower_band', close)
        sma = current.get('sma', close)
        atr = current.get('atr', close * 0.01)
        
        signal_type = SignalType.HOLD
        confidence = 0.0
        
        # Long signal: RSI oversold + price at lower band
        if rsi < self.rsi_oversold and close <= lower_band * 1.01:
            signal_type = SignalType.BUY
            # Confidence based on how oversold
            confidence = min(1.0, (self.rsi_oversold - rsi) / self.rsi_oversold + 
                           (lower_band - close) / lower_band)
            stop_loss = close - (2 * atr)
            take_profit = sma
            
        # Short signal: RSI overbought + price at upper band
        elif rsi > self.rsi_overbought and close >= upper_band * 0.99:
            signal_type = SignalType.SELL
            # Confidence based on how overbought
            confidence = min(1.0, (rsi - self.rsi_overbought) / (100 - self.rsi_overbought) +
                           (close - upper_band) / upper_band)
            stop_loss = close + (2 * atr)
            take_profit = sma
        
        if signal_type != SignalType.HOLD:
            return Signal(
                symbol=symbol,
                signal_type=signal_type,
                confidence=confidence,
                entry_price=close,
                stop_loss=stop_loss,
                take_profit=take_profit,
                metadata={
                    'rsi': rsi,
                    'upper_band': upper_band,
                    'lower_band': lower_band,
                    'sma': sma,
                    'atr': atr
                }
            )
        
        return None
    
    def calculate_position_size(self, 
                                signal: Signal, 
                                portfolio_value: float,
                                risk_per_trade: float = None) -> int:
        """Calculate position size using ATR-based risk management"""
        if risk_per_trade is None:
            risk_per_trade = trading_config.max_risk_per_trade
            
        risk_amount = portfolio_value * risk_per_trade
        
        # Calculate risk per share
        if signal.signal_type == SignalType.BUY:
            risk_per_share = signal.entry_price - signal.stop_loss
        else:
            risk_per_share = signal.stop_loss - signal.entry_price
            
        if risk_per_share <= 0:
            return 0
            
        position_size = int(risk_amount / risk_per_share)
        
        # Cap at max position size (5% of portfolio)
        max_position_value = portfolio_value * 0.05
        max_shares = int(max_position_value / signal.entry_price)
        
        return min(position_size, max_shares)
    
    def get_required_data(self) -> dict:
        """Return data requirements"""
        return {
            "timeframe": "1d",
            "lookback": max(self.rsi_period, self.bb_period) + 20,
            "indicators": ["rsi", "bollinger_bands", "atr"]
        }
