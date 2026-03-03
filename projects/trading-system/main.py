"""
Main entry point for the trading system
"""
import asyncio
import argparse
from datetime import datetime, timedelta
from typing import List

from config.settings import api_config, trading_config
from data.ingestor import DataIngestor, YFinanceProvider
from strategies.mean_reversion import MeanReversionStrategy
from strategies.trend_following import TrendFollowingStrategy
from risk.manager import RiskManager, Portfolio, Position
from backtest.engine import BacktestEngine


class TradingSystem:
    """
    Main trading system orchestrator
    """
    
    def __init__(self):
        self.data_ingestor = DataIngestor()
        self.risk_manager = RiskManager()
        self.backtest_engine = BacktestEngine(trading_config.initial_capital)
        self.strategies = []
        self.portfolio = Portfolio(
            cash=trading_config.initial_capital,
            positions={},
            total_value=trading_config.initial_capital,
            daily_pnl=0.0,
            daily_trades=0
        )
        
        # Register data providers
        self.data_ingestor.add_provider("yfinance", YFinanceProvider())
        
    def add_strategy(self, strategy):
        """Add a trading strategy"""
        self.strategies.append(strategy)
        
    async def run_backtest(self, 
                          symbols: List[str],
                          lookback_days: int = 252):
        """
        Run backtest on historical data
        """
        print(f"Starting backtest for {len(symbols)} symbols...")
        print(f"Initial Capital: ${trading_config.initial_capital:,.2f}")
        print("-" * 50)
        
        for symbol in symbols:
            print(f"\nBacktesting {symbol}...")
            
            # Get historical data
            try:
                df = await self.data_ingestor.get_data(
                    symbol=symbol,
                    provider="yfinance",
                    lookback_days=lookback_days
                )
                
                if len(df) < 100:
                    print(f"  Insufficient data for {symbol}")
                    continue
                    
                # Run each strategy
                for strategy in self.strategies:
                    print(f"  Strategy: {strategy.name}")
                    
                    # Initialize strategy
                    strategy.initialize(df)
                    
                    # Generate signals
                    signals = []
                    for i in range(100, len(df)):
                        window = df.iloc[:i]
                        signal = strategy.generate_signal(window)
                        if signal:
                            signals.append({
                                'timestamp': window.index[-1],
                                'signal': signal
                            })
                    
                    print(f"    Signals generated: {len(signals)}")
                    
                    # TODO: Run VectorBT backtest with signals
                    
            except Exception as e:
                print(f"  Error backtesting {symbol}: {e}")
                
    async def run_live(self, symbols: List[str]):
        """
        Run live trading (paper or real)
        """
        print("Starting live trading...")
        print(f"Symbols: {symbols}")
        
        # Main trading loop
        while True:
            try:
                # Check circuit breakers
                if not self.risk_manager.check_circuit_breakers(self.portfolio):
                    print("Circuit breaker triggered - trading halted")
                    break
                    
                for symbol in symbols:
                    # Get latest data
                    df = await self.data_ingestor.get_data(
                        symbol=symbol,
                        provider="yfinance",
                        lookback_days=100
                    )
                    
                    # Generate signals from each strategy
                    for strategy in self.strategies:
                        signal = strategy.on_data(df)
                        
                        if signal:
                            print(f"Signal: {signal.signal_type.name} {symbol} "
                                  f"(Confidence: {signal.confidence:.2f})")
                            
                            # Risk check
                            if self.risk_manager.check_position_limits(
                                symbol, 
                                signal.position_size or 0,
                                self.portfolio
                            ):
                                # TODO: Execute order
                                pass
                            else:
                                print(f"  Position limit exceeded - skipping")
                                
                # Wait for next iteration
                await asyncio.sleep(60)  # 1 minute
                
            except Exception as e:
                print(f"Error in trading loop: {e}")
                await asyncio.sleep(60)
                
    def print_risk_report(self):
        """Print current risk report"""
        report = self.risk_manager.get_risk_report(self.portfolio)
        print("\n" + "=" * 50)
        print("RISK REPORT")
        print("=" * 50)
        for key, value in report.items():
            if isinstance(value, float):
                print(f"{key:20}: {value:.4f}")
            else:
                print(f"{key:20}: {value}")
        print("=" * 50)


def main():
    parser = argparse.ArgumentParser(description="Autonomous Trading System")
    parser.add_argument(
        "mode",
        choices=["backtest", "live", "paper"],
        help="Trading mode"
    )
    parser.add_argument(
        "--symbols",
        nargs="+",
        default=["AAPL", "MSFT", "GOOGL", "AMZN"],
        help="Symbols to trade"
    )
    parser.add_argument(
        "--lookback",
        type=int,
        default=252,
        help="Lookback period for backtest (days)"
    )
    
    args = parser.parse_args()
    
    # Initialize trading system
    system = TradingSystem()
    
    # Add strategies
    system.add_strategy(MeanReversionStrategy())
    system.add_strategy(TrendFollowingStrategy())
    
    # Run
    if args.mode == "backtest":
        asyncio.run(system.run_backtest(args.symbols, args.lookback))
    elif args.mode in ["live", "paper"]:
        asyncio.run(system.run_live(args.symbols))
        
    # Print final risk report
    system.print_risk_report()


if __name__ == "__main__":
    main()
