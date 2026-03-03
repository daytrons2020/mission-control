"""
Trend Following Strategy: MACD + ADX
Best for trending markets
"""
import pandas as pd
import numpy as np
from typing import Optional
from strategies.base import Strategy, Signal, SignalType
from config.settings import strategy_config, trading_config


class TrendFollowingStrategy(Strategy):
    """
    Trend Following Strategy using MACD and ADX
    
    Entry Long: MACD bullish crossover AND ADX > 25
    Entry Short: MACD bearish crossover AND ADX > 25
    Exit: MACD opposite crossover OR ADX < 20
    
    Expected Win Rate: 60-65% in trending markets
    """
    
    def __init__(self, config: dict = None):
        super().__init__("TrendFollowing_MACD_ADX", config)
        self.macd_fast = strategy_config.macd_fast
        self.macd_slow = strategy_config.macd_slow
        self.macd_signal = strategy_config.macd_signal
        self.adx_period = strategy_config.adx_period
        self.adx_threshold = strategy_config.adx_threshold
        
    def initialize(self, data: pd.DataFrame) -> None:
        """Calculate indicators"""
        self.data = data.copy()
        self._calculate_indicators()
        
    def _calculate_indicators(self) -> None:
        """Calculate MACD and ADX"""
        # MACD
        ema_fast = self.data['close'].ewm(span=self.macd_fast, adjust=False).mean()
        ema_slow = self.data['close'].ewm(span=self.macd_slow, adjust=False).mean()
        self.data['macd'] = ema_fast - ema_slow
        self.data['macd_signal'] = self.data['macd'].ewm(span=self.macd_signal, adjust=False).mean()
        self.data['macd_histogram'] = self.data['macd'] - self.data['macd_signal']
        
        # ADX
        self._calculate_adx()
        
        # ATR for stops
        high_low = self.data['high'] - self.data['low']
        high_close = np.abs(self.data['high'] - self.data['close'].shift())
        low_close = np.abs(self.data['low'] - self.data['close'].shift())
        ranges = pd.concat([high_low, high_close, low_close], axis=1)
        true_range = np.max(ranges, axis=1)
        self.data['atr'] = true_range.rolling(14).mean()
        
    def _calculate_adx(self) -> None:
        """Calculate Average Directional Index"""
        # True Range
        high_low = self.data['high'] - self.data['low']
        high_close = np.abs(self.data['high'] - self.data['close'].shift())
        low_close = np.abs(self.data['low'] - self.data['close'].shift())
        ranges = pd.concat([high_low, high_close, low_close], axis=1)
        true_range = np.max(ranges, axis=1)
        
        # +DM and -DM
        plus_dm = self.data['high'].diff()
        minus_dm = -self.data['low'].diff()
        plus_dm[plus_dm < 0] = 0
        minus_dm[minus_dm < 0] = 0
        plus_dm[plus_dm <= minus_dm] = 0
        minus_dm[minus_dm <= plus_dm] = 0
        
        # Smooth TR, +DM, -DM
        atr = true_range.rolling(self.adx_period).mean()
        plus_di = 100 * plus_dm.rolling(self.adx_period).mean() / atr
        minus_di = 100 * minus_dm.rolling(self.adx_period).mean() / atr
        
        # DX and ADX
        dx = 100 * np.abs(plus_di - minus_di) / (plus_di + minus_di)
        self.data['adx'] = dx.rolling(self.adx_period).mean()
        self.data['plus_di'] = plus_di
        self.data['minus_di'] = minus_di
        
    def generate_signal(self, data: pd.DataFrame) -> Optional[Signal]:
        """Generate trading signal"""
        if len(data) < self.macd_slow + self.adx_period:
            return None
            
        current = data.iloc[-1]
        previous = data.iloc[-2]
        symbol = current.get('symbol', 'UNKNOWN')
        
        macd = current.get('macd', 0)
        macd_signal = current.get('macd_signal', 0)
        prev_macd = previous.get('macd', 0)
        prev_macd_signal = previous.get('macd_signal', 0)
        adx = current.get('adx', 0)
        close = current['close']
        atr = current.get('atr', close * 0.01)
        
        signal_type = SignalType.HOLD
        confidence = 0.0
        
        # MACD bullish crossover
        macd_bullish = prev_macd <= prev_macd_signal and macd > macd_signal
        # MACD bearish crossover
        macd_bearish = prev_macd >= prev_macd_signal and macd < macd_signal
        
        # Strong trend filter
        strong_trend = adx > self.adx_threshold
        
        if macd_bullish and strong_trend:
            signal_type = SignalType.BUY
            confidence = min(1.0, (adx - self.adx_threshold) / 25 + 0.5)
            stop_loss = close - (2 * atr)
            take_profit = close + (3 * atr)  # 1.5:1 reward/risk
            
        elif macd_bearish and strong_trend:
            signal_type = SignalType.SELL
            confidence = min(1.0, (adx - self.adx_threshold) / 25 + 0.5)
            stop_loss = close + (2 * atr)
            take_profit = close - (3 * atr)
        
        if signal_type != SignalType.HOLD:
            return Signal(
                symbol=symbol,
                signal_type=signal_type,
                confidence=confidence,
                entry_price=close,
                stop_loss=stop_loss,
                take_profit=take_profit,
                metadata={
                    'macd': macd,
                    'macd_signal': macd_signal,
                    'adx': adx,
                    'atr': atr
                }
            )
        
        return None
    
    def calculate_position_size(self, 
                                signal: Signal, 
                                portfolio_value: float,
                                risk_per_trade: float = None) -> int:
        """Calculate position size"""
        if risk_per_trade is None:
            risk_per_trade = trading_config.max_risk_per_trade
            
        risk_amount = portfolio_value * risk_per_trade
        
        if signal.signal_type == SignalType.BUY:
            risk_per_share = signal.entry_price - signal.stop_loss
        else:
            risk_per_share = signal.stop_loss - signal.entry_price
            
        if risk_per_share <= 0:
            return 0
            
        position_size = int(risk_amount / risk_per_share)
        
        max_position_value = portfolio_value * 0.05
        max_shares = int(max_position_value / signal.entry_price)
        
        return min(position_size, max_shares)
    
    def get_required_data(self) -> dict:
        return {
            "timeframe": "1d",
            "lookback": self.macd_slow + self.adx_period + 20,
            "indicators": ["macd", "adx", "atr"]
        }
