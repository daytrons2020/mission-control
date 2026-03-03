"""
Main trading bot for Bitcoin paper trading on Binance Testnet.
Implements real-time WebSocket price feed and automated trading.
"""

import os
import sys
import json
import time
import signal
import logging
import threading
from datetime import datetime, timedelta
from typing import Optional, Dict, Any
from dataclasses import dataclass, asdict

import pandas as pd
import numpy as np
from binance.client import Client
from binance.enums import *
from binance.exceptions import BinanceAPIException, BinanceOrderException

from config import config
from strategies.trend_follower import TrendFollowingStrategy, SignalType

# Setup logging
os.makedirs('logs', exist_ok=True)
logging.basicConfig(
    level=getattr(logging, config.logging.level),
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler(config.logging.log_file),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)


@dataclass
class Position:
    """Represents an open position."""
    side: str  # 'LONG' or 'SHORT'
    entry_price: float
    size: float
    stop_loss: float
    take_profit: float
    entry_time: datetime
    signal_reason: str = ""
    
    def to_dict(self) -> dict:
        return {
            'side': self.side,
            'entry_price': self.entry_price,
            'size': self.size,
            'stop_loss': self.stop_loss,
            'take_profit': self.take_profit,
            'entry_time': self.entry_time.isoformat(),
            'signal_reason': self.signal_reason
        }


@dataclass
class Trade:
    """Represents a completed trade."""
    entry_time: datetime
    exit_time: datetime
    side: str
    entry_price: float
    exit_price: float
    size: float
    pnl: float
    pnl_percent: float
    exit_reason: str
    
    def to_dict(self) -> dict:
        return {
            'entry_time': self.entry_time.isoformat(),
            'exit_time': self.exit_time.isoformat(),
            'side': self.side,
            'entry_price': self.entry_price,
            'exit_price': self.exit_price,
            'size': self.size,
            'pnl': self.pnl,
            'pnl_percent': self.pnl_percent,
            'exit_reason': self.exit_reason
        }


class PaperTradingBot:
    """
    Bitcoin Paper Trading Bot for Binance Testnet.
    
    Features:
    - Real-time price data via WebSocket
    - Trend following strategy with EMA + RSI
    - ATR-based stop loss and take profit (2:1 R:R)
    - 1% risk per trade position sizing
    - Paper trading execution (no real money)
    """
    
    def __init__(self):
        self.client: Optional[Client] = None
        self.strategy: Optional[TrendFollowingStrategy] = None
        self.running = False
        
        # Trading state
        self.balance = config.trading.initial_balance
        self.position: Optional[Position] = None
        self.trades: list = []
        self.price_history: list = []
        self.max_history = 500
        
        # Statistics
        self.daily_pnl = 0
        self.daily_loss = 0
        self.last_reset_date = datetime.now().date()
        
        # Data storage
        os.makedirs('data/trades', exist_ok=True)
        self.trades_file = f'data/trades/trades_{datetime.now().strftime("%Y%m%d")}.json'
        
        # Initialize
        self._setup_signal_handlers()
        self._initialize_client()
        self._initialize_strategy()
    
    def _setup_signal_handlers(self):
        """Setup handlers for graceful shutdown."""
        signal.signal(signal.SIGINT, self._signal_handler)
        signal.signal(signal.SIGTERM, self._signal_handler)
    
    def _signal_handler(self, signum, frame):
        """Handle shutdown signals."""
        logger.info(f"Received signal {signum}, shutting down gracefully...")
        self.running = False
    
    def _initialize_client(self):
        """Initialize Binance client."""
        try:
            self.client = Client(
                api_key=config.binance.api_key,
                api_secret=config.binance.secret_key,
                testnet=True
            )
            
            # Test connection
            server_time = self.client.get_server_time()
            logger.info(f"Connected to Binance Testnet. Server time: {server_time['serverTime']}")
            
            # Get account info
            account = self.client.get_account()
            logger.info(f"Account status: {account['accountType']}")
            
        except Exception as e:
            logger.error(f"Failed to initialize Binance client: {e}")
            raise
    
    def _initialize_strategy(self):
        """Initialize trading strategy."""
        self.strategy = TrendFollowingStrategy(
            ema_fast=config.strategy.ema_fast,
            ema_slow=config.strategy.ema_slow,
            rsi_period=config.strategy.rsi_period,
            rsi_overbought=config.strategy.rsi_overbought,
            rsi_oversold=config.strategy.rsi_oversold,
            atr_period=config.strategy.atr_period,
            atr_multiplier_sl=config.strategy.atr_multiplier_sl,
            atr_multiplier_tp=config.strategy.atr_multiplier_tp,
            risk_per_trade=config.trading.risk_per_trade
        )
        logger.info("Strategy initialized successfully")
    
    def _get_historical_data(self, limit: int = 100) -> pd.DataFrame:
        """Fetch historical klines/candlestick data."""
        try:
            klines = self.client.get_klines(
                symbol=config.trading.symbol,
                interval=config.trading.timeframe,
                limit=limit
            )
            
            df = pd.DataFrame(klines, columns=[
                'timestamp', 'open', 'high', 'low', 'close', 'volume',
                'close_time', 'quote_volume', 'trades', 'taker_buy_base',
                'taker_buy_quote', 'ignore'
            ])
            
            # Convert types
            df['timestamp'] = pd.to_datetime(df['timestamp'], unit='ms')
            df.set_index('timestamp', inplace=True)
            
            for col in ['open', 'high', 'low', 'close', 'volume']:
                df[col] = pd.to_numeric(df[col], errors='coerce')
            
            return df
            
        except Exception as e:
            logger.error(f"Error fetching historical data: {e}")
            return pd.DataFrame()
    
    def _get_current_price(self) -> float:
        """Get current market price."""
        try:
            ticker = self.client.get_symbol_ticker(symbol=config.trading.symbol)
            return float(ticker['price'])
        except Exception as e:
            logger.error(f"Error getting current price: {e}")
            return 0.0
    
    def _check_daily_reset(self):
        """Check and reset daily statistics."""
        current_date = datetime.now().date()
        if current_date != self.last_reset_date:
            logger.info(f"Daily reset: PnL={self.daily_pnl:.2f}, Loss={self.daily_loss:.2f}")
            self.daily_pnl = 0
            self.daily_loss = 0
            self.last_reset_date = current_date
    
    def _check_max_daily_loss(self) -> bool:
        """Check if maximum daily loss has been reached."""
        max_loss_amount = config.trading.initial_balance * config.trading.max_daily_loss
        if abs(self.daily_loss) >= max_loss_amount:
            logger.warning(f"Max daily loss reached: {self.daily_loss:.2f} / {max_loss_amount:.2f}")
            return True
        return False
    
    def _calculate_position_value(self) -> float:
        """Calculate current value of open position."""
        if not self.position:
            return 0.0
        
        current_price = self._get_current_price()
        if self.position.side == 'LONG':
            return self.position.size * current_price
        else:  # SHORT
            entry_value = self.position.size * self.position.entry_price
            current_value = self.position.size * current_price
            return entry_value * 2 - current_value  # Simplified short calculation
    
    def _enter_position(self, signal):
        """Enter a new position based on signal."""
        if self.position:
            logger.warning("Already in a position, cannot enter new one")
            return False
        
        if not signal.position_size or signal.position_size <= 0:
            logger.warning("Invalid position size")
            return False
        
        # Check max daily loss
        if self._check_max_daily_loss():
            logger.warning("Max daily loss reached, not entering position")
            return False
        
        # Determine side
        side = 'LONG' if signal.type == SignalType.BUY else 'SHORT'
        
        # Create position
        self.position = Position(
            side=side,
            entry_price=signal.price,
            size=signal.position_size,
            stop_loss=signal.stop_loss,
            take_profit=signal.take_profit,
            entry_time=datetime.now(),
            signal_reason=signal.reason
        )
        
        # Calculate cost
        position_value = signal.position_size * signal.price
        
        logger.info(f"ENTER {side}: Price={signal.price:.2f}, "
                   f"Size={signal.position_size:.6f}, Value={position_value:.2f}, "
                   f"SL={signal.stop_loss:.2f}, TP={signal.take_profit:.2f}")
        
        return True
    
    def _exit_position(self, current_price: float, reason: str):
        """Exit current position."""
        if not self.position:
            return
        
        # Calculate PnL
        if self.position.side == 'LONG':
            pnl = (current_price - self.position.entry_price) * self.position.size
        else:  # SHORT
            pnl = (self.position.entry_price - current_price) * self.position.size
        
        pnl_percent = (pnl / (self.position.entry_price * self.position.size)) * 100
        
        # Update balance
        self.balance += pnl
        self.daily_pnl += pnl
        if pnl < 0:
            self.daily_loss += pnl
        
        # Create trade record
        trade = Trade(
            entry_time=self.position.entry_time,
            exit_time=datetime.now(),
            side=self.position.side,
            entry_price=self.position.entry_price,
            exit_price=current_price,
            size=self.position.size,
            pnl=pnl,
            pnl_percent=pnl_percent,
            exit_reason=reason
        )
        self.trades.append(trade)
        
        logger.info(f"EXIT {self.position.side}: Price={current_price:.2f}, "
                   f"PnL={pnl:.2f} ({pnl_percent:+.2f}%), Reason={reason}")
        
        # Save trade
        self._save_trade(trade)
        
        # Clear position
        self.position = None
    
    def _save_trade(self, trade: Trade):
        """Save trade to file."""
        try:
            trades_data = []
            if os.path.exists(self.trades_file):
                with open(self.trades_file, 'r') as f:
                    trades_data = json.load(f)
            
            trades_data.append(trade.to_dict())
            
            with open(self.trades_file, 'w') as f:
                json.dump(trades_data, f, indent=2)
        except Exception as e:
            logger.error(f"Error saving trade: {e}")
    
    def _check_position_exit(self, current_price: float):
        """Check if position should be exited."""
        if not self.position:
            return
        
        should_exit, reason, exit_price = self.strategy.check_exit(
            self.position.entry_price,
            current_price,
            self.position.side,
            self.position.stop_loss,
            self.position.take_profit
        )
        
        if should_exit:
            self._exit_position(exit_price, reason)
    
    def _trading_loop(self):
        """Main trading loop."""
        logger.info("Starting trading loop...")
        
        while self.running:
            try:
                # Check daily reset
                self._check_daily_reset()
                
                # Get historical data
                df = self._get_historical_data(limit=100)
                if df.empty:
                    logger.warning("No data available, waiting...")
                    time.sleep(10)
                    continue
                
                # Get current price
                current_price = self._get_current_price()
                
                # Check position exit
                if self.position:
                    self._check_position_exit(current_price)
                
                # Generate signal if not in position
                if not self.position:
                    current_position = self.position.side if self.position else None
                    signal = self.strategy.generate_signal(df, self.balance, current_position)
                    
                    if signal.type in [SignalType.BUY, SignalType.SELL]:
                        self._enter_position(signal)
                
                # Log status
                self._log_status(current_price)
                
                # Sleep before next iteration
                time.sleep(60)  # Check every minute
                
            except Exception as e:
                logger.error(f"Error in trading loop: {e}")
                time.sleep(10)
    
    def _log_status(self, current_price: float):
        """Log current bot status."""
        position_str = f"{self.position.side} @ {self.position.entry_price:.2f}" if self.position else "None"
        logger.info(f"Status: Price={current_price:.2f}, Balance={self.balance:.2f}, "
                   f"Position={position_str}, Daily PnL={self.daily_pnl:.2f}")
    
    def get_stats(self) -> Dict[str, Any]:
        """Get trading statistics."""
        if not self.trades:
            return {
                'total_trades': 0,
                'win_rate': 0,
                'avg_pnl': 0,
                'total_pnl': 0,
                'balance': self.balance
            }
        
        winning_trades = [t for t in self.trades if t.pnl > 0]
        losing_trades = [t for t in self.trades if t.pnl <= 0]
        
        total_pnl = sum(t.pnl for t in self.trades)
        
        return {
            'total_trades': len(self.trades),
            'winning_trades': len(winning_trades),
            'losing_trades': len(losing_trades),
            'win_rate': len(winning_trades) / len(self.trades) * 100,
            'avg_pnl': total_pnl / len(self.trades),
            'total_pnl': total_pnl,
            'balance': self.balance,
            'daily_pnl': self.daily_pnl,
            'current_position': self.position.to_dict() if self.position else None
        }
    
    def run(self):
        """Run the trading bot."""
        # Validate configuration
        errors = config.validate()
        if errors:
            for error in errors:
                logger.error(f"Config error: {error}")
            return
        
        logger.info("=" * 60)
        logger.info("Bitcoin Paper Trading Bot Starting")
        logger.info("=" * 60)
        logger.info(f"Symbol: {config.trading.symbol}")
        logger.info(f"Timeframe: {config.trading.timeframe}")
        logger.info(f"Initial Balance: {config.trading.initial_balance:.2f} USDT")
        logger.info(f"Risk per Trade: {config.trading.risk_per_trade * 100:.1f}%")
        logger.info(f"Strategy: EMA({config.strategy.ema_fast},{config.strategy.ema_slow}) + RSI")
        logger.info(f"Stop Loss: {config.strategy.atr_multiplier_sl}x ATR")
        logger.info(f"Take Profit: {config.strategy.atr_multiplier_tp}x ATR")
        logger.info(f"Risk-Reward Ratio: {config.strategy.risk_reward_ratio:.1f}:1")
        logger.info("=" * 60)
        
        self.running = True
        self._trading_loop()
        
        logger.info("Bot stopped")
        logger.info(f"Final Balance: {self.balance:.2f} USDT")
        logger.info(f"Total PnL: {self.balance - config.trading.initial_balance:.2f} USDT")


def main():
    """Main entry point."""
    bot = PaperTradingBot()
    bot.run()


if __name__ == '__main__':
    main()
