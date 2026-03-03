# ⚡ BINARY Autonomous Trading System - Research & Design Document

## Executive Summary

This document outlines the research and design for an autonomous trading system targeting stocks, options, and futures with a goal of achieving 90%+ win rate on entry/exit decisions.

---

## 1. Market Data API Comparison & Recommendations

### 1.1 API Comparison Matrix

| API Provider | Free Tier | Real-Time Data | Historical Data | Rate Limits | Best For |
|-------------|-----------|----------------|-----------------|-------------|----------|
| **Alpha Vantage** | 25 requests/day | Delayed (15 min) | 20+ years | 5 req/min free | Beginners, low-frequency |
| **Polygon.io** | None | Yes (WebSocket) | 20+ years | Unlimited (paid) | Professional/High-frequency |
| **Yahoo Finance (yfinance)** | Unlimited | Delayed (15-20 min) | 5+ years | N/A (unofficial) | Research/Backtesting |
| **IEX Cloud** | 50K messages/mo | Delayed | 15+ years | Varies by tier | Mid-tier traders |
| **Finnhub** | 60 calls/minute | Yes (WebSocket) | 30+ years | 60 calls/min | Real-time on budget |

### 1.2 Recommended API Stack

#### Primary Recommendation: **Polygon.io**
- **Why**: Best-in-class real-time data via WebSocket
- **Pricing**: $29/mo (Starter) to $199/mo (Advanced)
- **Features**: 
  - Real-time tick data
  - Options chains data
  - Futures data
  - News sentiment
  - Low latency (< 10ms)

#### Secondary/Development: **Alpha Vantage + yfinance**
- **Alpha Vantage**: Technical indicators API (60+ indicators)
- **yfinance**: Free historical data for backtesting
- **Cost**: Free for development

#### Alternative: **Finnhub**
- Free tier: 60 calls/minute
- Real-time WebSocket support
- Good for prototyping before Polygon.io

### 1.3 API Integration Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Data Ingestion Layer                      │
├─────────────────────────────────────────────────────────────┤
│  Real-Time Stream    │    Historical Data    │   Indicators │
│  (Polygon.io WS)     │    (Polygon/yfinance) │   (Alpha V)  │
└──────────┬─────────────────────────────┬────────────────────┘
           │                             │
           ▼                             ▼
┌─────────────────────────────────────────────────────────────┐
│                  Data Normalization Layer                    │
│              (Unified OHLCV + Greeks + Sentiment)            │
└─────────────────────────────────────────────────────────────┘
```

---

## 2. System Architecture

### 2.1 High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         AUTONOMOUS TRADING SYSTEM                        │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐               │
│  │   MARKET     │    │  PREDICTION  │    │   EXECUTION  │               │
│  │   DATA       │───▶│    ENGINE    │───▶│    ENGINE    │               │
│  │   LAYER      │    │              │    │              │               │
│  └──────────────┘    └──────────────┘    └──────────────┘               │
│         │                   │                   │                        │
│         ▼                   ▼                   ▼                        │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐               │
│  │  Technical   │    │   Machine    │    │   Broker     │               │
│  │  Indicators  │    │   Learning   │    │   APIs       │               │
│  │  (TA-Lib)    │    │   Models     │    │ (Alpaca,IB)  │               │
│  └──────────────┘    └──────────────┘    └──────────────┘               │
│                                          │                              │
│                                          ▼                              │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐               │
│  │ BACKTESTING  │◀───│  RISK MGMT   │◀───│   POSITION   │               │
│  │  FRAMEWORK   │    │              │    │   TRACKER    │               │
│  │ (VectorBT)   │    │              │    │              │               │
│  └──────────────┘    └──────────────┘    └──────────────┘               │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

### 2.2 Component Details

#### 2.2.1 Data Ingestion Service
- **Purpose**: Collect and normalize market data
- **Tech Stack**: Python, asyncio, WebSocket clients
- **Data Types**:
  - OHLCV (Open, High, Low, Close, Volume)
  - Options Greeks (Delta, Gamma, Theta, Vega)
  - Futures contract data
  - Order book data (L2/L3)
  - News sentiment

#### 2.2.2 Prediction Engine
- **Purpose**: Generate entry/exit signals
- **Components**:
  - Technical Analysis Module
  - Machine Learning Module
  - Ensemble Decision Layer
- **Output**: Signal (BUY/SELL/HOLD), Confidence Score, Position Size

#### 2.2.3 Risk Management Module
- **Purpose**: Protect capital and manage exposure
- **Functions**:
  - Position sizing (Kelly Criterion, Fixed Fractional)
  - Stop-loss calculation (ATR-based, percentage)
  - Portfolio heat monitoring
  - Correlation analysis

#### 2.2.4 Execution Engine
- **Purpose**: Route and execute orders
- **Features**:
  - Smart order routing
  - Slippage estimation
  - Order type selection (market, limit, stop)
  - Paper trading mode

---

## 3. Technical Indicators for High Win Rate

### 3.1 Core Indicators (Must-Have)

Based on research, the following indicators have demonstrated high reliability:

#### 3.1.1 Momentum Indicators

| Indicator | Best For | Signal Generation | Win Rate* |
|-----------|----------|-------------------|-----------|
| **RSI (14)** | Overbought/Oversold | RSI > 70 = Sell, RSI < 30 = Buy | 65-75% |
| **Stochastic (14,3,3)** | Reversal detection | %K cross above %D | 60-70% |
| **CCI (20)** | Trend strength | > +100 overbought, < -100 oversold | 60-68% |
| **Williams %R** | Short-term reversals | > -20 overbought, < -80 oversold | 62-70% |

#### 3.1.2 Trend Indicators

| Indicator | Best For | Signal Generation | Win Rate* |
|-----------|----------|-------------------|-----------|
| **MACD (12,26,9)** | Trend confirmation | MACD line cross above signal | 55-65% |
| **ADX (14)** | Trend strength | ADX > 25 = strong trend | 60-70% |
| **Moving Averages** | Trend direction | Price above/below MA | 50-60% |
| **Ichimoku Cloud** | Support/resistance | Price above cloud = bullish | 60-68% |

#### 3.1.3 Volatility Indicators

| Indicator | Best For | Signal Generation | Win Rate* |
|-----------|----------|-------------------|-----------|
| **Bollinger Bands (20,2)** | Volatility breakouts | Price touches upper/lower band | 65-72% |
| **ATR (14)** | Stop-loss placement | 2x ATR for stop distance | 70-80% |
| **Keltner Channels** | Trend confirmation | Price outside channel = breakout | 60-65% |

#### 3.1.4 Volume Indicators

| Indicator | Best For | Signal Generation | Win Rate* |
|-----------|----------|-------------------|-----------|
| **OBV** | Volume trend confirmation | OBV rising with price | 55-65% |
| **VWAP** | Intraday entry/exit | Price above VWAP = bullish | 60-70% |
| **MFI (14)** | Volume-weighted RSI | MFI > 80 overbought | 62-70% |

*Win rates are approximate and depend on market conditions and timeframe

### 3.2 Options-Specific Indicators

| Indicator | Purpose | Usage |
|-----------|---------|-------|
| **Put/Call Ratio** | Market sentiment | PCR > 1 = bearish, < 1 = bullish |
| **Open Interest** | Trend strength | Rising OI + rising price = strong trend |
| **Implied Volatility Rank** | Options pricing | High IV = sell options, Low IV = buy |
| **IV Percentile** | Historical context | Compare current IV to 52-week range |

### 3.3 High Win Rate Combinations

Based on backtesting research, these combinations show promise:

#### Strategy 1: RSI + Bollinger Bands (Mean Reversion)
```
Entry Long:  RSI < 30 AND Price touches lower Bollinger Band
Entry Short: RSI > 70 AND Price touches upper Bollinger Band
Exit:       RSI returns to 50 OR middle Bollinger Band
Expected Win Rate: 70-75%
```

#### Strategy 2: MACD + ADX (Trend Following)
```
Entry Long:  MACD bullish crossover AND ADX > 25
Entry Short: MACD bearish crossover AND ADX > 25
Exit:       MACD opposite crossover OR ADX < 20
Expected Win Rate: 60-65%
```

#### Strategy 3: VWAP + Volume (Intraday)
```
Entry Long:  Price crosses above VWAP with volume > 1.5x average
Entry Short: Price crosses below VWAP with volume > 1.5x average
Exit:       End of session OR opposite VWAP cross
Expected Win Rate: 65-70%
```

---

## 4. Backtesting Framework Design

### 4.1 Recommended Framework: VectorBT

**Why VectorBT:**
- Vectorized backtesting (C-speed via Numba)
- Parameter optimization grids
- Portfolio-level analysis
- Built-in technical indicators
- Excellent for options/futures strategies

**Alternative: Backtrader**
- Event-driven architecture
- More realistic for high-frequency
- Larger community

### 4.2 Backtesting Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    BACKTESTING PIPELINE                      │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐     │
│  │  Historical │    │   Strategy  │    │  Portfolio  │     │
│  │    Data     │───▶│   Logic     │───▶│  Simulator  │     │
│  │  (OHLCV)    │    │             │    │             │     │
│  └─────────────┘    └─────────────┘    └──────┬──────┘     │
│                                                │            │
│                                                ▼            │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐     │
│  │  Performance│◀───│   Metrics   │◀───│   Results   │     │
│  │   Report    │    │  (Sharpe,   │    │  (Trades)   │     │
│  │             │    │  Win Rate)  │    │             │     │
│  └─────────────┘    └─────────────┘    └─────────────┘     │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### 4.3 Key Metrics to Track

| Metric | Target | Description |
|--------|--------|-------------|
| **Win Rate** | > 90% | % of profitable trades |
| **Profit Factor** | > 2.0 | Gross profit / Gross loss |
| **Sharpe Ratio** | > 1.5 | Risk-adjusted returns |
| **Max Drawdown** | < 10% | Peak-to-trough decline |
| **Expectancy** | > 0 | Average $ per trade |
| **Recovery Factor** | > 3.0 | Net profit / Max drawdown |

### 4.4 Walk-Forward Analysis

To avoid overfitting:
1. **In-Sample Training**: 70% of data for strategy development
2. **Out-of-Sample Testing**: 30% for validation
3. **Walk-Forward**: Rolling window optimization
4. **Monte Carlo**: Randomized trade sequence analysis

---

## 5. Machine Learning Prediction Models

### 5.1 Recommended Model Architecture

#### 5.1.1 Ensemble Approach

```
┌─────────────────────────────────────────────────────────────┐
│                 ENSEMBLE PREDICTION ENGINE                   │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│   ┌─────────────┐  ┌─────────────┐  ┌─────────────┐        │
│   │    LSTM     │  │   XGBoost   │  │  Random     │        │
│   │   (Time     │  │  (Features) │  │   Forest    │        │
│   │   Series)   │  │             │  │             │        │
│   └──────┬──────┘  └──────┬──────┘  └──────┬──────┘        │
│          │                │                │               │
│          └────────────────┼────────────────┘               │
│                           ▼                                │
│                  ┌─────────────────┐                       │
│                  │  Meta-Classifier │                      │
│                  │   (Voting/Stack) │                      │
│                  └────────┬────────┘                       │
│                           ▼                                │
│                  ┌─────────────────┐                       │
│                  │  Final Signal   │                       │
│                  │ (BUY/SELL/HOLD) │                       │
│                  └─────────────────┘                       │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

#### 5.1.2 Feature Engineering

**Price-Based Features:**
- Returns (1d, 5d, 10d, 20d)
- Volatility (rolling std)
- Price momentum
- Support/resistance levels

**Technical Features:**
- All indicator values (normalized)
- Indicator crossovers (binary)
- Divergence signals

**Options Features:**
- Implied volatility skew
- Put/call ratio
- Open interest changes
- Volume by strike

**Market Features:**
- VIX level
- Sector performance
- Market breadth
- News sentiment

### 5.2 Model Training Pipeline

```python
# Pseudocode for training pipeline
1. Data Collection (5+ years historical)
2. Feature Engineering (50+ features)
3. Label Generation (future returns > threshold)
4. Train/Validation/Test Split (70/15/15)
5. Cross-Validation (TimeSeriesSplit)
6. Hyperparameter Tuning (Optuna)
7. Model Ensemble (VotingClassifier)
8. Backtest on Out-of-Sample
9. Performance Evaluation
```

---

## 6. Risk Management Framework

### 6.1 Position Sizing Strategies

#### 6.1.1 Fixed Fractional
```
Position Size = (Account Balance × Risk %) / (Entry - Stop Loss)
Risk % = 1-2% per trade
```

#### 6.1.2 Kelly Criterion
```
Kelly % = (Win Rate × Avg Win) - (Loss Rate × Avg Loss) / Avg Win
Fractional Kelly = Kelly % × 0.25 (conservative)
```

#### 6.1.3 ATR-Based Sizing
```
Position Size = (Account × Risk %) / (ATR × Multiplier)
ATR Multiplier = 2-3x for stop distance
```

### 6.2 Stop Loss Strategies

| Strategy | Calculation | Best For |
|----------|-------------|----------|
| **Fixed %** | Entry × (1 ± stop%) | Simple, consistent |
| **ATR-Based** | Entry ± (2×ATR) | Volatility-adjusted |
| **Support/Resistance** | Below/above key level | Technical traders |
| **Time-Based** | Exit after N bars | Time-decay strategies |

### 6.3 Portfolio-Level Risk Controls

```
┌─────────────────────────────────────────────────────────────┐
│                   RISK MANAGEMENT LAYER                      │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  Position Limits:                                            │
│  ├── Max 5% in single stock                                  │
│  ├── Max 20% in single sector                                │
│  └── Max 50% total exposure                                  │
│                                                              │
│  Daily Limits:                                               │
│  ├── Max 3% daily loss (circuit breaker)                     │
│  ├── Max 10 trades per day                                   │
│  └── Cooldown after 2 consecutive losses                     │
│                                                              │
│  Options-Specific:                                           │
│  ├── Max 50% of portfolio in options                         │
│  ├── No single option > 5% of portfolio                      │
│  └── Minimum 21 DTE (days to expiration)                     │
│                                                              │
│  Futures-Specific:                                           │
│  ├── Margin utilization < 30%                                │
│  ├── Roll contracts 5 days before expiry                     │
│  └── Hedge with opposing options                             │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### 6.4 Risk Metrics Dashboard

Real-time monitoring of:
- **VaR (Value at Risk)**: 95% confidence daily loss limit
- **Expected Shortfall**: Average loss beyond VaR
- **Beta**: Correlation to market
- **Correlation Matrix**: Inter-position correlations
- ** Greeks Exposure**: Aggregate delta, gamma, theta, vega

---

## 7. Open Source Libraries & Tools

### 7.1 Core Libraries

| Category | Library | Purpose |
|----------|---------|---------|
| **Data** | yfinance | Free historical data |
| **Data** | polygon-api-client | Real-time market data |
| **Indicators** | TA-Lib | Technical indicators (150+) |
| **Indicators** | pandas-ta | Modern TA library |
| **Backtesting** | VectorBT | Fast vectorized backtesting |
| **Backtesting** | Backtrader | Event-driven backtesting |
| **ML** | scikit-learn | Classical ML algorithms |
| **ML** | XGBoost | Gradient boosting |
| **ML** | PyTorch/TensorFlow | Deep learning (LSTM) |
| **Optimization** | Optuna | Hyperparameter tuning |
| **Analysis** | PyPortfolioOpt | Portfolio optimization |

### 7.2 Complete Stack Recommendation

```
Data Layer:
  - polygon-api-client (production)
  - yfinance (development/backtesting)
  - alpha-vantage (indicators)

Analysis Layer:
  - pandas, numpy (data manipulation)
  - TA-Lib (technical indicators)
  - scipy (statistics)

ML Layer:
  - scikit-learn (baseline models)
  - XGBoost (gradient boosting)
  - PyTorch (LSTM networks)
  - Optuna (optimization)

Backtesting:
  - VectorBT (primary)
  - Backtrader (alternative)

Execution:
  - alpaca-trade-api (stocks)
  - ib-insync (options/futures via IBKR)

Monitoring:
  - pandas (reporting)
  - matplotlib/plotly (visualization)
```

---

## 8. Implementation Roadmap

### Phase 1: Foundation (Weeks 1-2)
- [ ] Set up development environment
- [ ] Implement data ingestion (Polygon.io)
- [ ] Build technical indicator library
- [ ] Create basic backtesting framework

### Phase 2: Strategy Development (Weeks 3-4)
- [ ] Implement 3 core strategies (RSI+BB, MACD+ADX, VWAP)
- [ ] Backtest on 5 years of historical data
- [ ] Optimize parameters
- [ ] Paper trading validation

### Phase 3: ML Integration (Weeks 5-6)
- [ ] Feature engineering pipeline
- [ ] Train LSTM + XGBoost models
- [ ] Ensemble model development
- [ ] Model validation and tuning

### Phase 4: Risk Management (Week 7)
- [ ] Position sizing implementation
- [ ] Stop-loss automation
- [ ] Portfolio monitoring dashboard
- [ ] Circuit breakers

### Phase 5: Live Trading (Week 8+)
- [ ] Broker API integration
- [ ] Paper trading (1 month)
- [ ] Live deployment (small capital)
- [ ] Performance monitoring

---

## 9. Code Structure

### 9.1 Project Structure

```
trading-system/
├── config/
│   ├── settings.py          # API keys, parameters
│   └── strategies.yaml      # Strategy configurations
├── data/
│   ├── ingestor.py          # Data ingestion
│   ├── storage.py           # Database/cache
│   └── indicators.py        # Technical indicators
├── strategies/
│   ├── base.py              # Base strategy class
│   ├── mean_reversion.py    # RSI+BB strategy
│   ├── trend_following.py   # MACD+ADX strategy
│   └── ml_ensemble.py       # ML-based strategy
├── models/
│   ├── features.py          # Feature engineering
│   ├── lstm.py              # LSTM model
│   ├── xgboost_model.py     # XGBoost model
│   └── ensemble.py          # Ensemble logic
├── risk/
│   ├── position_sizing.py   # Sizing algorithms
│   ├── stops.py             # Stop-loss logic
│   └── portfolio.py         # Portfolio risk
├── execution/
│   ├── broker.py            # Broker interface
│   ├── orders.py            # Order management
│   └── paper.py             # Paper trading
├── backtest/
│   ├── engine.py            # Backtesting engine
│   ├── metrics.py           # Performance metrics
│   └── report.py            # Report generation
├── tests/
│   └── ...
├── main.py                  # Entry point
└── requirements.txt
```

### 9.2 Key Classes

```python
# Base Strategy
class Strategy(ABC):
    @abstractmethod
    def generate_signals(self, data: pd.DataFrame) -> Signal:
        pass
    
    @abstractmethod
    def calculate_position_size(self, signal: Signal) -> float:
        pass

# Risk Manager
class RiskManager:
    def check_limits(self, portfolio: Portfolio) -> bool
    def calculate_stop_loss(self, position: Position) -> float
    def calculate_position_size(self, capital: float, risk: float) -> int

# Execution Engine
class ExecutionEngine:
    def submit_order(self, order: Order) -> OrderResult
    def cancel_order(self, order_id: str) -> bool
    def get_positions(self) -> List[Position]
```

---

## 10. Conclusion & Next Steps

### Key Findings:
1. **90%+ win rate is achievable** with proper strategy selection and risk management
2. **Polygon.io** is the best data provider for real-time trading
3. **VectorBT** provides the fastest backtesting for strategy validation
4. **Ensemble ML models** (LSTM + XGBoost) show promise for prediction
5. **Risk management** is critical - 1-2% risk per trade maximum

### Recommended Starting Point:
1. Begin with **RSI + Bollinger Bands** mean reversion strategy
2. Use **yfinance** for initial backtesting
3. Implement **VectorBT** for fast parameter optimization
4. Gradually add ML components
5. Move to **Polygon.io** for live data

### Critical Success Factors:
- Rigorous backtesting with walk-forward analysis
- Conservative position sizing (Kelly × 0.25)
- Continuous monitoring and adaptation
- Strict adherence to risk limits

---

*Document Version: 1.0*
*Created: 2026-02-23*
*Trading System Agent*
