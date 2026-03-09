---
name: trading-pattern-detector
description: Detect 8 GEX/VEX trading patterns for the BINARY trading system - RUG PULL, SLINGSHOT, GATEKEEPER, WHIPSAW, BEACHBALL, RAINBOW ROAD, TREND, and FLOOR BOUNCE. Use when analyzing Gamma Exposure (GEX) and Vanna Exposure (VEX) data to identify high-probability trade setups, determine entry/stop/target levels, and calculate pattern confidence scores.
---

# Trading Pattern Detector

Detects 8 proprietary trading patterns from GEX/VEX exposure data for the BINARY trading system.

## Patterns Detected

| Pattern | Description | Signal |
|---------|-------------|--------|
| **RUG PULL** | +GEX (yellow) above -GEX (purple), no floor support | Bearish - Short setup |
| **SLINGSHOT** | Inverse rug setup - floor below, ceiling above | Bullish - Long setup |
| **GATEKEEPER** | Large +GEX wall between price and king node | Neutral - Fade the gatekeeper |
| **WHIPSAW** | Range-bound with two high-value nodes | Neutral - Sell the range |
| **BEACHBALL** | Deep -GEX reversal zone | Bullish - Bounce play |
| **RAINBOW ROAD** | Multiple prominent nodes, wide spread | AVOID - No trade |
| **TREND** | King node far from spot with directional skew | Directional - Follow trend |
| **FLOOR BOUNCE** | Price approaching major -GEX support | Bullish - Support bounce |

## Pattern Detection Workflow

1. **Input GEX/VEX Data**: Provide GEX nodes (strike, value) and current price
2. **Run Detection**: Execute `scripts/detect_patterns.py` with JSON input
3. **Get Results**: Pattern type, confidence score (0-1), entry/stop/target levels
4. **Trade Decision**: Use confidence > 0.6 for high-probability setups

## Usage

### Command Line

```bash
# With JSON file
python scripts/detect_patterns.py --input gex_data.json

# With stdin
cat gex_data.json | python scripts/detect_patterns.py

# Direct JSON string
python scripts/detect_patterns.py --input '{"price": 6128, "gex_nodes": [...]}'
```

### Input Format

```json
{
  "symbol": "SPX",
  "price": 6128.40,
  "gex_nodes": [
    {"strike": 6100, "value": 1500000},
    {"strike": 6125, "value": -800000},
    {"strike": 6150, "value": 1200000}
  ],
  "vex_nodes": [
    {"strike": 6100, "value": 300000},
    {"strike": 6150, "value": -200000}
  ]
}
```

### Output Format

```json
{
  "pattern": "RUG_PULL",
  "confidence": 0.85,
  "direction": "bearish",
  "entry": 6150.0,
  "stop": 6165.0,
  "target": 6100.0,
  "risk_reward": 3.33,
  "king_strike": 6150.0,
  "floor": 6100.0,
  "ceiling": 6150.0,
  "timestamp": "2026-03-08T21:53:00"
}
```

## Python API

```python
from scripts.detect_patterns import PatternDetector, GEXNode, VEXNode

# Create nodes
gex_nodes = [
    GEXNode(strike=6100, value=1500000),
    GEXNode(strike=6125, value=-800000),
]

vex_nodes = [
    VEXNode(strike=6100, value=300000),
]

# Detect pattern
result = PatternDetector.analyze(gex_nodes, vex_nodes, price=6128.40)
print(result.pattern)      # PatternType.RUG_PULL
print(result.confidence)   # 0.85
```

## Pattern Logic Reference

See `references/pattern_logic.md` for detailed detection algorithms and threshold explanations.

## When to Use This Skill

- Analyzing real-time GEX/VEX data from SpotGamma or similar providers
- Building automated trading signals based on gamma exposure
- Backtesting pattern performance on historical data
- Creating alerts for specific pattern formations
- Integrating with the BINARY trading engine

## Confidence Thresholds

| Confidence | Action |
|------------|--------|
| > 0.80 | High conviction - Full position |
| 0.60 - 0.80 | Medium conviction - Half position |
| 0.40 - 0.60 | Low conviction - Quarter position or wait |
| < 0.40 | No trade - Pattern unclear |

## Integration with BINARY Trading System

This skill mirrors the pattern detection logic in `projects/trading-system/backend/trading_engine.py`. Use it for:
- Standalone pattern analysis without running the full trading engine
- Batch processing historical data
- Custom trading bots and alerts
- Research and backtesting
