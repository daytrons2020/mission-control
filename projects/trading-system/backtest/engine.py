"""
Backtesting Engine using VectorBT
"""
import pandas as pd
import numpy as np
from typing import Dict, List, Callable, Optional
from dataclasses import dataclass
from datetime import datetime


@dataclass
class BacktestResult:
    """Backtest results container"""
    total_return: float
    sharpe_ratio: float
    max_drawdown: float
    win_rate: float
    profit_factor: float
    num_trades: int
    avg_trade_return: float
    equity_curve: pd.Series
    trades: pd.DataFrame
    
    def summary(self) -> str:
        """Generate summary report"""
        return f"""
Backtest Results
================
Total Return:      {self.total_return:.2%}
Sharpe Ratio:      {self.sharpe_ratio:.2f}
Max Drawdown:      {self.max_drawdown:.2%}
Win Rate:          {self.win_rate:.2%}
Profit Factor:     {self.profit_factor:.2f}
Number of Trades:  {self.num_trades}
Avg Trade Return:  {self.avg_trade_return:.2%}
"""


class BacktestEngine:
    """
    VectorBT-based backtesting engine
    """
    
    def __init__(self, initial_capital: float = 100000):
        self.initial_capital = initial_capital
        
    def run_vectorized(self,
                       data: pd.DataFrame,
                       entry_signals: pd.Series,
                       exit_signals: pd.Series,
                       stop_loss: Optional[float] = None,
                       take_profit: Optional[float] = None) -> BacktestResult:
        """
        Run vectorized backtest
        
        Args:
            data: DataFrame with OHLCV data
            entry_signals: Boolean series for entry points
            exit_signals: Boolean series for exit points
            stop_loss: Stop loss percentage (e.g., 0.02 for 2%)
            take_profit: Take profit percentage (e.g., 0.04 for 4%)
        """
        try:
            import vectorbt as vbt
        except ImportError:
            raise ImportError("vectorbt not installed. Run: pip install vectorbt")
        
        # Create portfolio
        portfolio = vbt.Portfolio.from_signals(
            close=data['close'],
            entries=entry_signals,
            exits=exit_signals,
            init_cash=self.initial_capital,
            fees=0.001,  # 0.1% commission
            slippage=0.001,  # 0.1% slippage
            stop_loss=stop_loss,
            take_profit=take_profit
        )
        
        # Calculate metrics
        total_return = portfolio.total_return()
        sharpe_ratio = portfolio.sharpe_ratio()
        max_drawdown = portfolio.max_drawdown()
        
        # Trade statistics
        trades = portfolio.trades
        win_rate = trades.win_rate() if len(trades) > 0 else 0
        profit_factor = trades.profit_factor() if len(trades) > 0 else 0
        
        return BacktestResult(
            total_return=total_return,
            sharpe_ratio=sharpe_ratio,
            max_drawdown=max_drawdown,
            win_rate=win_rate,
            profit_factor=profit_factor,
            num_trades=len(trades),
            avg_trade_return=trades.returns.mean() if len(trades) > 0 else 0,
            equity_curve=portfolio.value(),
            trades=trades.records_readable if len(trades) > 0 else pd.DataFrame()
        )
    
    def optimize_parameters(self,
                           data: pd.DataFrame,
                           strategy_class,
                           param_grid: Dict[str, List]) -> Dict:
        """
        Optimize strategy parameters using grid search
        """
        results = []
        
        # Generate all parameter combinations
        from itertools import product
        keys = param_grid.keys()
        values = param_grid.values()
        
        for combination in product(*values):
            params = dict(zip(keys, combination))
            
            # Run backtest with these parameters
            strategy = strategy_class(config=params)
            # ... backtest logic ...
            
            results.append({
                'params': params,
                # 'metrics': metrics
            })
        
        return results
    
    def walk_forward_analysis(self,
                              data: pd.DataFrame,
                              strategy_class,
                              train_size: int = 252,
                              test_size: int = 63) -> List[BacktestResult]:
        """
        Perform walk-forward analysis
        
        Args:
            data: Full historical dataset
            strategy_class: Strategy class to test
            train_size: Number of periods for training (in-sample)
            test_size: Number of periods for testing (out-of-sample)
        """
        results = []
        
        for i in range(0, len(data) - train_size - test_size, test_size):
            # Split data
            train_data = data.iloc[i:i + train_size]
            test_data = data.iloc[i + train_size:i + train_size + test_size]
            
            # Train on in-sample
            strategy = strategy_class()
            strategy.initialize(train_data)
            
            # Test on out-of-sample
            # ... generate signals on test_data ...
            # ... run backtest ...
            
            # results.append(result)
            
        return results
    
    def monte_carlo_simulation(self,
                               trades: pd.DataFrame,
                               n_simulations: int = 1000) -> Dict:
        """
        Run Monte Carlo simulation on trade results
        """
        if len(trades) == 0:
            return {}
            
        returns = trades['return'].values
        final_equities = []
        
        for _ in range(n_simulations):
            # Shuffle returns
            shuffled_returns = np.random.permutation(returns)
            
            # Calculate equity curve
            equity = self.initial_capital
            for ret in shuffled_returns:
                equity *= (1 + ret)
            final_equities.append(equity)
        
        final_equities = np.array(final_equities)
        
        return {
            'mean_final_equity': final_equities.mean(),
            'median_final_equity': np.median(final_equities),
            'std_final_equity': final_equities.std(),
            'percentile_5': np.percentile(final_equities, 5),
            'percentile_95': np.percentile(final_equities, 95),
            'probability_profit': (final_equities > self.initial_capital).mean()
        }
