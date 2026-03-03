"""
Risk Management Module
Position sizing, stop losses, and portfolio risk controls
"""
import numpy as np
import pandas as pd
from typing import List, Dict, Optional
from dataclasses import dataclass
from config.settings import trading_config


@dataclass
class Position:
    """Represents a trading position"""
    symbol: str
    quantity: int
    entry_price: float
    entry_time: pd.Timestamp
    stop_loss: float
    take_profit: float
    position_type: str  # 'long' or 'short'
    unrealized_pnl: float = 0.0
    

@dataclass
class Portfolio:
    """Portfolio state"""
    cash: float
    positions: Dict[str, Position]
    total_value: float
    daily_pnl: float
    daily_trades: int
    
    def get_exposure(self) -> float:
        """Calculate total market exposure"""
        position_value = sum(
            abs(pos.quantity * pos.entry_price) 
            for pos in self.positions.values()
        )
        return position_value / self.total_value if self.total_value > 0 else 0


class RiskManager:
    """
    Central risk management system
    Implements position sizing, stop losses, and portfolio-level controls
    """
    
    def __init__(self, config=None):
        self.config = config or trading_config
        self.daily_loss = 0.0
        self.daily_trades = 0
        self.last_reset = pd.Timestamp.now()
        
    def reset_daily_limits(self):
        """Reset daily tracking"""
        current_time = pd.Timestamp.now()
        if current_time.date() != self.last_reset.date():
            self.daily_loss = 0.0
            self.daily_trades = 0
            self.last_reset = current_time
            
    def check_circuit_breakers(self, portfolio: Portfolio) -> bool:
        """
        Check if trading should be halted
        Returns True if trading is allowed, False if halted
        """
        self.reset_daily_limits()
        
        # Daily loss limit
        if self.daily_loss <= -portfolio.total_value * self.config.max_daily_loss:
            return False
            
        # Daily trade limit
        if self.daily_trades >= self.config.max_daily_trades:
            return False
            
        return True
    
    def calculate_position_size_kelly(self,
                                       win_rate: float,
                                       avg_win: float,
                                       avg_loss: float,
                                       portfolio_value: float) -> float:
        """
        Calculate position size using Kelly Criterion
        Uses fractional Kelly for safety
        """
        if avg_loss == 0:
            return 0
            
        # Kelly formula: (W × R - (1 - W)) / R
        # W = win rate, R = win/loss ratio
        win_loss_ratio = avg_win / avg_loss
        kelly_pct = (win_rate * win_loss_ratio - (1 - win_rate)) / win_loss_ratio
        
        # Use fractional Kelly for safety
        fractional_kelly = kelly_pct * self.config.kelly_fraction
        
        # Cap at max risk per trade
        max_risk = portfolio_value * self.config.max_risk_per_trade
        
        return min(fractional_kelly * portfolio_value, max_risk)
    
    def calculate_position_size_fixed_fractional(self,
                                                  entry_price: float,
                                                  stop_loss: float,
                                                  portfolio_value: float) -> int:
        """
        Calculate position size using fixed fractional method
        Risk fixed % of portfolio per trade
        """
        risk_amount = portfolio_value * self.config.max_risk_per_trade
        
        risk_per_unit = abs(entry_price - stop_loss)
        if risk_per_unit == 0:
            return 0
            
        position_size = int(risk_amount / risk_per_unit)
        
        # Cap at max position size
        max_position_value = portfolio_value * 0.05
        max_units = int(max_position_value / entry_price)
        
        return min(position_size, max_units)
    
    def calculate_stop_loss_atr(self,
                                 entry_price: float,
                                 atr: float,
                                 position_type: str = 'long',
                                 multiplier: float = 2.0) -> float:
        """
        Calculate stop loss based on ATR
        """
        stop_distance = atr * multiplier
        
        if position_type == 'long':
            return entry_price - stop_distance
        else:
            return entry_price + stop_distance
    
    def calculate_stop_loss_percentage(self,
                                        entry_price: float,
                                        percentage: float = 0.02,
                                        position_type: str = 'long') -> float:
        """
        Calculate stop loss based on fixed percentage
        """
        stop_distance = entry_price * percentage
        
        if position_type == 'long':
            return entry_price - stop_distance
        else:
            return entry_price + stop_distance
    
    def check_position_limits(self,
                              symbol: str,
                              proposed_quantity: int,
                              portfolio: Portfolio) -> bool:
        """
        Check if proposed position respects limits
        """
        # Single position limit (5% of portfolio)
        max_single_position = portfolio.total_value * 0.05
        
        # Get current position value if exists
        current_position_value = 0
        if symbol in portfolio.positions:
            pos = portfolio.positions[symbol]
            current_position_value = abs(pos.quantity * pos.entry_price)
        
        # Calculate new position value
        # (This is simplified - would need current price in real implementation)
        new_position_value = current_position_value  # + proposed_value
        
        if new_position_value > max_single_position:
            return False
            
        # Total exposure limit (50% of portfolio)
        if portfolio.get_exposure() > 0.50:
            return False
            
        return True
    
    def calculate_portfolio_heat(self, portfolio: Portfolio) -> float:
        """
        Calculate total portfolio heat (aggregate risk)
        """
        total_risk = 0
        
        for symbol, position in portfolio.positions.items():
            risk_per_share = abs(position.entry_price - position.stop_loss)
            position_risk = risk_per_share * abs(position.quantity)
            total_risk += position_risk
            
        return total_risk / portfolio.total_value if portfolio.total_value > 0 else 0
    
    def get_risk_report(self, portfolio: Portfolio) -> Dict:
        """
        Generate comprehensive risk report
        """
        return {
            'portfolio_value': portfolio.total_value,
            'cash': portfolio.cash,
            'exposure': portfolio.get_exposure(),
            'portfolio_heat': self.calculate_portfolio_heat(portfolio),
            'daily_loss': self.daily_loss,
            'daily_trades': self.daily_trades,
            'circuit_breaker_active': not self.check_circuit_breakers(portfolio),
            'num_positions': len(portfolio.positions)
        }
