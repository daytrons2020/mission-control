"""
Backtester for the Trend Following Strategy.
Tests strategy performance on historical BTC data.
"""

import os
import json
import logging
from datetime import datetime, timedelta
from typing import List, Dict, Any
from dataclasses import dataclass

import pandas as pd
import numpy as np
from binance.client import Client

from config import config
from strategies.trend_follower import TrendFollowingStrategy, SignalType

# Setup logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


@dataclass
class BacktestTrade:
    """Represents a backtest trade."""
    entry_time: datetime
    exit_time: datetime
    side: str
    entry_price: float
    exit_price: float
    size: float
    pnl: float
    pnl_percent: float
    exit_reason: str
    max_drawdown: float = 0.0


class Backtester:
    """
    Backtester for the Trend Following Strategy.
    
    Features:
    - Fetches 1 year of historical BTC data
    - Simulates trades with realistic execution
    - Calculates comprehensive performance metrics
    - Generates equity curve and trade statistics
    """
    
    def __init__(self):
        self.client: Client = None
        self.strategy: TrendFollowingStrategy = None
        self.trades: List[BacktestTrade] = []
        self.equity_curve: List[Dict] = []
        
        # Backtest parameters
        self.initial_balance = 10000.0
        self.balance = self.initial_balance
        self.peak_balance = self.initial_balance
        self.max_drawdown = 0.0
        
        # Data storage
        os.makedirs('data/historical', exist_ok=True)
        
        self._initialize_client()
        self._initialize_strategy()
    
    def _initialize_client(self):
        """Initialize Binance client for historical data."""
        try:
            # Use testnet credentials or empty for public data
            self.client = Client(
                api_key=config.binance.api_key or '',
                api_secret=config.binance.secret_key or '',
                testnet=True
            )
            logger.info("Binance client initialized for historical data")
        except Exception as e:
            logger.error(f"Failed to initialize client: {e}")
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
    
    def fetch_historical_data(
        self,
        symbol: str = 'BTCUSDT',
        timeframe: str = '1h',
        days: int = 365
    ) -> pd.DataFrame:
        """
        Fetch historical klines data from Binance.
        
        Args:
            symbol: Trading pair symbol
            timeframe: Candlestick interval
            days: Number of days of historical data
        
        Returns:
            DataFrame with OHLCV data
        """
        logger.info(f"Fetching {days} days of historical data for {symbol} ({timeframe})")
        
        # Calculate start time
        end_time = datetime.now()
        start_time = end_time - timedelta(days=days)
        
        all_klines = []
        current_start = start_time
        
        # Binance limits to 1000 klines per request
        # For 1h timeframe, 1000 candles = ~41 days
        while current_start < end_time:
            try:
                klines = self.client.get_historical_klines(
                    symbol=symbol,
                    interval=timeframe,
                    start_str=current_start.strftime('%Y-%m-%d %H:%M:%S'),
                    end_str=end_time.strftime('%Y-%m-%d %H:%M:%S'),
                    limit=1000
                )
                
                if not klines:
                    break
                
                all_klines.extend(klines)
                
                # Update start time for next batch
                last_timestamp = klines[-1][0]
                current_start = datetime.fromtimestamp(last_timestamp / 1000) + timedelta(hours=1)
                
                logger.info(f"Fetched {len(klines)} candles, total: {len(all_klines)}")
                
            except Exception as e:
                logger.error(f"Error fetching historical data: {e}")
                break
        
        if not all_klines:
            logger.error("No historical data fetched")
            return pd.DataFrame()
        
        # Convert to DataFrame
        df = pd.DataFrame(all_klines, columns=[
            'timestamp', 'open', 'high', 'low', 'close', 'volume',
            'close_time', 'quote_volume', 'trades', 'taker_buy_base',
            'taker_buy_quote', 'ignore'
        ])
        
        # Convert types
        df['timestamp'] = pd.to_datetime(df['timestamp'], unit='ms')
        df.set_index('timestamp', inplace=True)
        
        for col in ['open', 'high', 'low', 'close', 'volume']:
            df[col] = pd.to_numeric(df[col], errors='coerce')
        
        # Remove duplicates
        df = df[~df.index.duplicated(keep='first')]
        
        logger.info(f"Total historical candles: {len(df)}")
        logger.info(f"Date range: {df.index[0]} to {df.index[-1]}")
        
        return df
    
    def run_backtest(self, df: pd.DataFrame) -> Dict[str, Any]:
        """
        Run backtest on historical data.
        
        Args:
            df: DataFrame with OHLCV data
        
        Returns:
            Dictionary with backtest results
        """
        logger.info("Starting backtest...")
        
        self.trades = []
        self.equity_curve = []
        self.balance = self.initial_balance
        self.peak_balance = self.initial_balance
        self.max_drawdown = 0.0
        
        position = None
        position_entry_price = 0
        position_size = 0
        position_side = None
        position_stop_loss = 0
        position_take_profit = 0
        position_entry_time = None
        
        # Minimum bars needed for indicators
        min_bars = max(config.strategy.ema_slow, config.strategy.rsi_period, config.strategy.atr_period) + 10
        
        for i in range(min_bars, len(df)):
            current_data = df.iloc[:i+1]
            current_bar = df.iloc[i]
            current_time = df.index[i]
            
            # Update equity curve
            current_equity = self.balance
            if position:
                if position_side == 'LONG':
                    unrealized_pnl = (current_bar['close'] - position_entry_price) * position_size
                else:
                    unrealized_pnl = (position_entry_price - current_bar['close']) * position_size
                current_equity += unrealized_pnl
            
            # Update peak and drawdown
            if current_equity > self.peak_balance:
                self.peak_balance = current_equity
            
            current_drawdown = (self.peak_balance - current_equity) / self.peak_balance
            if current_drawdown > self.max_drawdown:
                self.max_drawdown = current_drawdown
            
            self.equity_curve.append({
                'timestamp': current_time,
                'equity': current_equity,
                'drawdown': current_drawdown
            })
            
            # Check position exit
            if position:
                exit_price = None
                exit_reason = None
                
                if position_side == 'LONG':
                    # Check stop loss
                    if current_bar['low'] <= position_stop_loss:
                        exit_price = position_stop_loss
                        exit_reason = 'Stop Loss'
                    # Check take profit
                    elif current_bar['high'] >= position_take_profit:
                        exit_price = position_take_profit
                        exit_reason = 'Take Profit'
                
                else:  # SHORT
                    # Check stop loss
                    if current_bar['high'] >= position_stop_loss:
                        exit_price = position_stop_loss
                        exit_reason = 'Stop Loss'
                    # Check take profit
                    elif current_bar['low'] <= position_take_profit:
                        exit_price = position_take_profit
                        exit_reason = 'Take Profit'
                
                if exit_price:
                    # Calculate PnL
                    if position_side == 'LONG':
                        pnl = (exit_price - position_entry_price) * position_size
                    else:
                        pnl = (position_entry_price - exit_price) * position_size
                    
                    pnl_percent = (pnl / (position_entry_price * position_size)) * 100
                    self.balance += pnl
                    
                    trade = BacktestTrade(
                        entry_time=position_entry_time,
                        exit_time=current_time,
                        side=position_side,
                        entry_price=position_entry_price,
                        exit_price=exit_price,
                        size=position_size,
                        pnl=pnl,
                        pnl_percent=pnl_percent,
                        exit_reason=exit_reason
                    )
                    self.trades.append(trade)
                    
                    logger.debug(f"Trade closed: {position_side} @ {exit_price:.2f}, "
                                f"PnL: {pnl:.2f}, Reason: {exit_reason}")
                    
                    position = None
            
            # Check for new entry signal
            if not position:
                signal = self.strategy.generate_signal(current_data, self.balance, None)
                
                if signal.type in [SignalType.BUY, SignalType.SELL]:
                    position_side = 'LONG' if signal.type == SignalType.BUY else 'SHORT'
                    position_entry_price = signal.price
                    position_size = signal.position_size
                    position_stop_loss = signal.stop_loss
                    position_take_profit = signal.take_profit
                    position_entry_time = current_time
                    position = True
                    
                    logger.debug(f"Trade opened: {position_side} @ {position_entry_price:.2f}, "
                                f"Size: {position_size:.6f}")
        
        # Close any open position at the end
        if position:
            final_price = df['close'].iloc[-1]
            if position_side == 'LONG':
                pnl = (final_price - position_entry_price) * position_size
            else:
                pnl = (position_entry_price - final_price) * position_size
            
            pnl_percent = (pnl / (position_entry_price * position_size)) * 100
            self.balance += pnl
            
            trade = BacktestTrade(
                entry_time=position_entry_time,
                exit_time=df.index[-1],
                side=position_side,
                entry_price=position_entry_price,
                exit_price=final_price,
                size=position_size,
                pnl=pnl,
                pnl_percent=pnl_percent,
                exit_reason='End of Backtest'
            )
            self.trades.append(trade)
        
        logger.info(f"Backtest completed. Total trades: {len(self.trades)}")
        
        return self._calculate_metrics()
    
    def _calculate_metrics(self) -> Dict[str, Any]:
        """Calculate comprehensive performance metrics."""
        if not self.trades:
            return {
                'total_trades': 0,
                'win_rate': 0,
                'profit_factor': 0,
                'sharpe_ratio': 0,
                'max_drawdown': 0,
                'total_return': 0
            }
        
        winning_trades = [t for t in self.trades if t.pnl > 0]
        losing_trades = [t for t in self.trades if t.pnl <= 0]
        
        total_profit = sum(t.pnl for t in winning_trades)
        total_loss = abs(sum(t.pnl for t in losing_trades))
        
        gross_profit = total_profit
        gross_loss = total_loss
        
        # Calculate metrics
        metrics = {
            'total_trades': len(self.trades),
            'winning_trades': len(winning_trades),
            'losing_trades': len(losing_trades),
            'win_rate': len(winning_trades) / len(self.trades) * 100,
            'gross_profit': gross_profit,
            'gross_loss': gross_loss,
            'profit_factor': gross_profit / gross_loss if gross_loss > 0 else float('inf'),
            'total_pnl': self.balance - self.initial_balance,
            'total_return_percent': ((self.balance - self.initial_balance) / self.initial_balance) * 100,
            'initial_balance': self.initial_balance,
            'final_balance': self.balance,
            'max_drawdown_percent': self.max_drawdown * 100,
            'avg_trade_pnl': np.mean([t.pnl for t in self.trades]),
            'avg_win': np.mean([t.pnl for t in winning_trades]) if winning_trades else 0,
            'avg_loss': np.mean([t.pnl for t in losing_trades]) if losing_trades else 0,
            'largest_win': max([t.pnl for t in winning_trades]) if winning_trades else 0,
            'largest_loss': min([t.pnl for t in losing_trades]) if losing_trades else 0,
        }
        
        # Calculate Sharpe Ratio (simplified, assuming risk-free rate = 0)
        if len(self.equity_curve) > 1:
            returns = []
            for i in range(1, len(self.equity_curve)):
                ret = (self.equity_curve[i]['equity'] - self.equity_curve[i-1]['equity']) / self.equity_curve[i-1]['equity']
                returns.append(ret)
            
            if returns and np.std(returns) > 0:
                metrics['sharpe_ratio'] = np.mean(returns) / np.std(returns) * np.sqrt(365 * 24)  # Annualized
            else:
                metrics['sharpe_ratio'] = 0
        
        return metrics
    
    def save_results(self, metrics: Dict[str, Any], filename: str = None):
        """Save backtest results to file."""
        if filename is None:
            filename = f"data/historical/backtest_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
        
        results = {
            'timestamp': datetime.now().isoformat(),
            'config': config.to_dict(),
            'metrics': metrics,
            'trades': [
                {
                    'entry_time': t.entry_time.isoformat(),
                    'exit_time': t.exit_time.isoformat(),
                    'side': t.side,
                    'entry_price': t.entry_price,
                    'exit_price': t.exit_price,
                    'size': t.size,
                    'pnl': t.pnl,
                    'pnl_percent': t.pnl_percent,
                    'exit_reason': t.exit_reason
                }
                for t in self.trades
            ],
            'equity_curve': self.equity_curve
        }
        
        with open(filename, 'w') as f:
            json.dump(results, f, indent=2, default=str)
        
        logger.info(f"Results saved to {filename}")
    
    def print_report(self, metrics: Dict[str, Any]):
        """Print formatted backtest report."""
        print("\n" + "=" * 60)
        print("BACKTEST REPORT")
        print("=" * 60)
        print(f"Strategy: Trend Following (EMA + RSI)")
        print(f"Symbol: {config.trading.symbol}")
        print(f"Timeframe: {config.trading.timeframe}")
        print(f"Risk per Trade: {config.trading.risk_per_trade * 100:.1f}%")
        print(f"Risk-Reward Ratio: {config.strategy.risk_reward_ratio:.1f}:1")
        print("-" * 60)
        print("PERFORMANCE METRICS")
        print("-" * 60)
        print(f"Total Trades:     {metrics['total_trades']}")
        print(f"Winning Trades:   {metrics['winning_trades']} ({metrics['win_rate']:.1f}%)")
        print(f"Losing Trades:    {metrics['losing_trades']} ({100 - metrics['win_rate']:.1f}%)")
        print(f"Profit Factor:    {metrics['profit_factor']:.2f}")
        print(f"Sharpe Ratio:     {metrics['sharpe_ratio']:.2f}")
        print(f"Max Drawdown:     {metrics['max_drawdown_percent']:.2f}%")
        print("-" * 60)
        print("P&L METRICS")
        print("-" * 60)
        print(f"Initial Balance:  ${metrics['initial_balance']:,.2f}")
        print(f"Final Balance:    ${metrics['final_balance']:,.2f}")
        print(f"Total P&L:        ${metrics['total_pnl']:,.2f} ({metrics['total_return_percent']:+.2f}%)")
        print(f"Gross Profit:     ${metrics['gross_profit']:,.2f}")
        print(f"Gross Loss:       ${metrics['gross_loss']:,.2f}")
        print(f"Average Trade:    ${metrics['avg_trade_pnl']:,.2f}")
        print(f"Average Win:      ${metrics['avg_win']:,.2f}")
        print(f"Average Loss:     ${metrics['avg_loss']:,.2f}")
        print(f"Largest Win:      ${metrics['largest_win']:,.2f}")
        print(f"Largest Loss:     ${metrics['largest_loss']:,.2f}")
        print("=" * 60)


def main():
    """Main entry point."""
    backtester = Backtester()
    
    # Fetch historical data (1 year)
    df = backtester.fetch_historical_data(
        symbol=config.trading.symbol,
        timeframe=config.trading.timeframe,
        days=365
    )
    
    if df.empty:
        logger.error("Failed to fetch historical data")
        return
    
    # Run backtest
    metrics = backtester.run_backtest(df)
    
    # Print report
    backtester.print_report(metrics)
    
    # Save results
    backtester.save_results(metrics)
    
    logger.info("Backtest completed successfully")


if __name__ == '__main__':
    main()
