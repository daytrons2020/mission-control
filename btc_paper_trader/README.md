# Bitcoin Paper Trading Bot

A production-ready Bitcoin paper trading bot with Binance Testnet integration, featuring a trend-following strategy with 2:1 risk-reward ratio.

## Features

- ✅ **Real-time Data**: WebSocket price feed from Binance Testnet
- ✅ **Trend Following Strategy**: EMA crossover + RSI confirmation
- ✅ **Risk Management**: ATR-based stop-loss and take-profit
- ✅ **Position Sizing**: 1% risk per trade
- ✅ **Paper Trading**: No real money at risk
- ✅ **Backtesting**: Test on 1 year of historical data
- ✅ **Performance Dashboard**: Track all key metrics
- ✅ **Production-Ready**: Error handling, logging, and clear structure

## Quick Start

### 1. Install Dependencies

```bash
pip install -r requirements.txt
```

### 2. Set Up Binance Testnet

Follow the [SETUP_GUIDE.md](SETUP_GUIDE.md) to:
- Create a Binance Testnet account
- Generate API keys
- Get test funds

### 3. Configure Environment

```bash
cp .env.example .env
# Edit .env with your API keys
```

### 4. Verify Connection

```bash
python test_connection.py
```

### 5. Run Backtest

```bash
python backtester.py
```

### 6. Start Paper Trading

```bash
python bot.py
```

### 7. Launch Dashboard (Optional)

```bash
python dashboard.py
```

## Project Structure

```
btc_paper_trader/
├── bot.py                 # Main trading bot
├── backtester.py          # Strategy backtester
├── dashboard.py           # Performance dashboard
├── test_connection.py     # API connection test
├── config.py              # Configuration settings
├── requirements.txt       # Python dependencies
├── .env.example          # Environment variables template
├── SETUP_GUIDE.md        # Binance Testnet setup instructions
├── README.md             # This file
├── logs/                 # Log files
│   └── bot.log
├── data/                 # Historical data and trades
│   ├── historical/
│   └── trades/
└── strategies/           # Trading strategies
    └── trend_follower.py
```

## Trading Strategy

### Entry Logic

1. **EMA Crossover**: Fast EMA (9) crosses above Slow EMA (21) for longs
2. **RSI Confirmation**: RSI below 70 (not overbought) for longs
3. **Trend Filter**: Only trade in the direction of the trend

### Exit Logic

- **Stop Loss**: 1.5x ATR from entry price
- **Take Profit**: 3.0x ATR from entry price (2:1 R:R ratio)
- **Trailing Stop**: Optional ATR-based trailing stop

### Position Sizing

- Risk 1% of account balance per trade
- Position size calculated based on stop-loss distance
- Formula: `Position Size = (Account Balance × Risk%) / (Entry - Stop Loss)`

## Configuration

Edit `.env` to customize:

```bash
# Trading Parameters
TRADING_SYMBOL=BTCUSDT
TIMEFRAME=1h
RISK_PER_TRADE=0.01

# Strategy Parameters
EMA_FAST=9
EMA_SLOW=21
RSI_PERIOD=14
RSI_OVERBOUGHT=70
RSI_OVERSOLD=30
ATR_PERIOD=14
ATR_MULTIPLIER_SL=1.5
ATR_MULTIPLIER_TP=3.0

# Risk Management
MAX_OPEN_POSITIONS=1
MAX_DAILY_LOSS=0.05
```

## Performance Metrics

The dashboard tracks:

- **Win Rate**: Percentage of winning trades
- **Profit Factor**: Gross profit / Gross loss
- **Sharpe Ratio**: Risk-adjusted returns
- **Max Drawdown**: Largest peak-to-trough decline
- **Average R:R**: Average risk-reward ratio achieved
- **Equity Curve**: Account balance over time

## Logging

All activity is logged to `logs/bot.log`:

```
2024-01-15 10:30:45 - INFO - Bot started
2024-01-15 10:30:46 - INFO - Connected to Binance Testnet
2024-01-15 10:35:12 - INFO - SIGNAL: BUY BTCUSDT @ 43250.00
2024-01-15 10:35:13 - INFO - ORDER: BUY 0.0231 BTC @ 43250.00
2024-01-15 14:22:33 - INFO - ORDER: TAKE PROFIT 0.0231 BTC @ 44100.00 (+2.0%)
```

## Safety Features

- ✅ Paper trading only (Testnet)
- ✅ Maximum daily loss limit
- ✅ Position size limits
- ✅ API error handling and retry logic
- ✅ Graceful shutdown on interrupt
- ✅ Connection health monitoring

## Troubleshooting

### Common Issues

**ModuleNotFoundError**: Run `pip install -r requirements.txt`

**API Key Error**: Check your `.env` file and Testnet credentials

**No Data**: Verify your Testnet account has test funds

**Connection Timeout**: Check internet connection and Binance Testnet status

See [SETUP_GUIDE.md](SETUP_GUIDE.md) for detailed troubleshooting.

## Development

### Running Tests

```bash
python -m pytest tests/
```

### Adding New Strategies

1. Create a new file in `strategies/`
2. Inherit from `BaseStrategy` class
3. Implement `generate_signal()` method
4. Update `config.py` to use new strategy

### Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## Disclaimer

⚠️ **IMPORTANT**: This bot is for educational and testing purposes only. 

- Past performance does not guarantee future results
- Trading cryptocurrencies carries significant risk
- Never trade with money you cannot afford to lose
- Always test thoroughly on Testnet before considering live trading

## License

MIT License - See LICENSE file for details

## Support

For issues and questions:
1. Check the logs in `logs/bot.log`
2. Review the documentation
3. Open an issue on GitHub

## Acknowledgments

- [python-binance](https://github.com/sammchardy/python-binance) - Binance API wrapper
- [Binance Testnet](https://testnet.binance.vision/) - Test trading environment
- [TA-Lib](https://mrjbq7.github.io/ta-lib/) - Technical analysis library
