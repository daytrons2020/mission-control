"""
Trend Following Strategy with EMA Crossover + RSI Confirmation
Implements 2:1 Risk-Reward ratio using ATR-based stops.
"""

import pandas as pd
import numpy as np
from dataclasses import dataclass
from enum import Enum
from typing import Optional, Tuple
import logging

logger = logging.getLogger(__name__)


class SignalType(Enum):
    """Trading signal types."""
    BUY = "BUY"
    SELL = "SELL"
    HOLD = "HOLD"


@dataclass
class Signal:
    """Trading signal data."""
    type: SignalType
    price: float
    timestamp: pd.Timestamp
    stop_loss: Optional[float] = None
    take_profit: Optional[float] = None
    position_size: Optional[float] = None
    atr: Optional[float] = None
    reason: str = ""


class TrendFollowingStrategy:
    """
    Trend Following Strategy using EMA Crossover with RSI confirmation.
    
    Entry Logic:
    - Long: Fast EMA crosses above Slow EMA + RSI not overbought
    - Short: Fast EMA crosses below Slow EMA + RSI not oversold
    
    Exit Logic:
    - Stop Loss: Entry price ± (ATR × ATR_MULTIPLIER_SL)
    - Take Profit: Entry price ± (ATR × ATR_MULTIPLIER_TP)
    - Risk-Reward Ratio: 2:1 (TP distance = 2 × SL distance)
    """
    
    def __init__(
        self,
        ema_fast: int = 9,
        ema_slow: int = 21,
        rsi_period: int = 14,
        rsi_overbought: float = 70,
        rsi_oversold: float = 30,
        atr_period: int = 14,
        atr_multiplier_sl: float = 1.5,
        atr_multiplier_tp: float = 3.0,
        risk_per_trade: float = 0.01
    ):
        self.ema_fast = ema_fast
        self.ema_slow = ema_slow
        self.rsi_period = rsi_period
        self.rsi_overbought = rsi_overbought
        self.rsi_oversold = rsi_oversold
        self.atr_period = atr_period
        self.atr_multiplier_sl = atr_multiplier_sl
        self.atr_multiplier_tp = atr_multiplier_tp
        self.risk_per_trade = risk_per_trade
        
        logger.info(f"Strategy initialized: EMA({ema_fast},{ema_slow}) + RSI({rsi_period})")
        logger.info(f"ATR-based stops: SL={atr_multiplier_sl}x, TP={atr_multiplier_tp}x (R:R={atr_multiplier_tp/atr_multiplier_sl:.1f}:1)")
    
    def calculate_ema(self, data: pd.Series, period: int) -> pd.Series:
        """Calculate Exponential Moving Average."""
        return data.ewm(span=period, adjust=False).mean()
    
    def calculate_rsi(self, data: pd.Series, period: int) -> pd.Series:
        """Calculate Relative Strength Index."""
        delta = data.diff()
        gain = (delta.where(delta > 0, 0)).rolling(window=period).mean()
        loss = (-delta.where(delta < 0, 0)).rolling(window=period).mean()
        rs = gain / loss
        rsi = 100 - (100 / (1 + rs))
        return rsi
    
    def calculate_atr(self, df: pd.DataFrame, period: int) -> pd.Series:
        """Calculate Average True Range."""
        high_low = df['high'] - df['low']
        high_close = np.abs(df['high'] - df['close'].shift())
        low_close = np.abs(df['low'] - df['close'].shift())
        ranges = pd.concat([high_low, high_close, low_close], axis=1)
        true_range = np.max(ranges, axis=1)
        atr = true_range.rolling(window=period).mean()
        return atr
    
    def calculate_indicators(self, df: pd.DataFrame) -> pd.DataFrame:
        """Calculate all technical indicators."""
        df = df.copy()
        
        # EMAs
        df[f'ema_{self.ema_fast}'] = self.calculate_ema(df['close'], self.ema_fast)
        df[f'ema_{self.ema_slow}'] = self.calculate_ema(df['close'], self.ema_slow)
        
        # RSI
        df['rsi'] = self.calculate_rsi(df['close'], self.rsi_period)
        
        # ATR
        df['atr'] = self.calculate_atr(df, self.atr_period)
        
        # EMA Crossover signals
        df['ema_cross'] = 0
        df.loc[df[f'ema_{self.ema_fast}'] > df[f'ema_{self.ema_slow}'], 'ema_cross'] = 1
        df.loc[df[f'ema_{self.ema_fast}'] < df[f'ema_{self.ema_slow}'], 'ema_cross'] = -1
        
        # Crossover detection (previous value different from current)
        df['crossover'] = df['ema_cross'].diff()
        
        return df
    
    def generate_signal(
        self,
        df: pd.DataFrame,
        account_balance: float,
        current_position: Optional[str] = None
    ) -> Signal:
        """
        Generate trading signal based on strategy rules.
        
        Args:
            df: DataFrame with OHLCV data
            account_balance: Current account balance
            current_position: Current position ('LONG', 'SHORT', or None)
        
        Returns:
            Signal object with trade details
        """
        if len(df) < max(self.ema_slow, self.rsi_period, self.atr_period) + 5:
            return Signal(
                type=SignalType.HOLD,
                price=df['close'].iloc[-1] if len(df) > 0 else 0,
                timestamp=df.index[-1] if len(df) > 0 else pd.Timestamp.now(),
                reason="Insufficient data for indicators"
            )
        
        # Calculate indicators
        df = self.calculate_indicators(df)
        
        # Get current values
        current = df.iloc[-1]
        prev = df.iloc[-2] if len(df) > 1 else current
        
        price = current['close']
        atr = current['atr']
        rsi = current['rsi']
        ema_fast_val = current[f'ema_{self.ema_fast}']
        ema_slow_val = current[f'ema_{self.ema_slow}']
        crossover = current['crossover']
        
        # Check if we have valid indicator values
        if pd.isna(atr) or pd.isna(rsi) or pd.isna(ema_fast_val) or pd.isna(ema_slow_val):
            return Signal(
                type=SignalType.HOLD,
                price=price,
                timestamp=df.index[-1],
                reason="Invalid indicator values"
            )
        
        # Calculate stop loss and take profit distances
        sl_distance = atr * self.atr_multiplier_sl
        tp_distance = atr * self.atr_multiplier_tp
        
        # Generate signals
        signal_type = SignalType.HOLD
        reason = "No signal"
        
        # LONG signal: Fast EMA crosses above Slow EMA + RSI confirmation
        if crossover > 0 and rsi < self.rsi_overbought:
            if current_position is None or current_position == 'SHORT':
                signal_type = SignalType.BUY
                stop_loss = price - sl_distance
                take_profit = price + tp_distance
                reason = f"EMA crossover UP, RSI={rsi:.1f} (not overbought)"
        
        # SHORT signal: Fast EMA crosses below Slow EMA + RSI confirmation
        elif crossover < 0 and rsi > self.rsi_oversold:
            if current_position is None or current_position == 'LONG':
                signal_type = SignalType.SELL
                stop_loss = price + sl_distance
                take_profit = price - tp_distance
                reason = f"EMA crossover DOWN, RSI={rsi:.1f} (not oversold)"
        
        # Calculate position size if we have a signal
        position_size = None
        if signal_type in [SignalType.BUY, SignalType.SELL]:
            risk_amount = account_balance * self.risk_per_trade
            position_size = risk_amount / sl_distance if sl_distance > 0 else 0
            
            logger.info(f"Signal: {signal_type.value} @ {price:.2f}, "
                       f"SL: {stop_loss:.2f}, TP: {take_profit:.2f}, "
                       f"Size: {position_size:.6f}, Reason: {reason}")
        
        return Signal(
            type=signal_type,
            price=price,
            timestamp=df.index[-1],
            stop_loss=stop_loss if signal_type != SignalType.HOLD else None,
            take_profit=take_profit if signal_type != SignalType.HOLD else None,
            position_size=position_size,
            atr=atr,
            reason=reason
        )
    
    def check_exit(
        self,
        entry_price: float,
        current_price: float,
        position_type: str,
        stop_loss: float,
        take_profit: float
    ) -> Tuple[bool, str, float]:
        """
        Check if position should be exited.
        
        Returns:
            Tuple of (should_exit, reason, exit_price)
        """
        if position_type == 'LONG':
            if current_price <= stop_loss:
                return True, "Stop Loss", stop_loss
            elif current_price >= take_profit:
                return True, "Take Profit", take_profit
        
        elif position_type == 'SHORT':
            if current_price >= stop_loss:
                return True, "Stop Loss", stop_loss
            elif current_price <= take_profit:
                return True, "Take Profit", take_profit
        
        return False, "", 0.0
    
    def get_strategy_info(self) -> dict:
        """Get strategy information for display."""
        return {
            'name': 'Trend Following (EMA + RSI)',
            'ema_fast': self.ema_fast,
            'ema_slow': self.ema_slow,
            'rsi_period': self.rsi_period,
            'rsi_overbought': self.rsi_overbought,
            'rsi_oversold': self.rsi_oversold,
            'atr_period': self.atr_period,
            'atr_multiplier_sl': self.atr_multiplier_sl,
            'atr_multiplier_tp': self.atr_multiplier_tp,
            'risk_reward_ratio': self.atr_multiplier_tp / self.atr_multiplier_sl,
            'risk_per_trade': self.risk_per_trade
        }
