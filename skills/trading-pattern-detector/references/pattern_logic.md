# Pattern Detection Logic Reference

Detailed explanation of each BINARY pattern detection algorithm.

## Thresholds

```python
SIGNIFICANT_GEX = 500000    # Minimum GEX to be considered significant
HIGH_GEX = 1000000          # High-value GEX threshold
MAX_CONFIDENCE = 0.95       # Cap confidence at 95%
```

---

## 1. RUG PULL (Bearish)

**Visual**: Yellow (+GEX) above Purple (-GEX), no floor below

**Logic**:
1. Find all +GEX nodes above current price (yellow ceiling candidates)
2. Select the nearest +GEX ceiling
3. Look for -GEX (purple) between price and ceiling
4. Check for weak/absent floor support below price
5. If purple exists between price and yellow ceiling → RUG PULL

**Confidence Calculation**:
```
confidence = min(|ceiling_GEX|, |purple_GEX|) / 1,000,000
capped at 0.95
```

**Trade Setup**:
- Entry: At the ceiling strike
- Target: Nearest floor below or 20 points down
- Stop: 15 points above ceiling

---

## 2. SLINGSHOT (Bullish)

**Visual**: Inverse rug - floor below, ceiling above, price near floor

**Logic**:
1. Find strong -GEX floors below current price
2. Verify price is within 15 points of nearest floor
3. Find +GEX ceiling above
4. Both floor and ceiling must be significant (> 500K)

**Confidence Calculation**:
```
confidence = min(|floor_GEX|, |ceiling_GEX|) / 1,000,000
capped at 0.85 (slightly lower than rug pull)
```

**Trade Setup**:
- Entry: At floor strike
- Target: Ceiling strike
- Stop: 10 points below floor

---

## 3. GATEKEEPER (Neutral)

**Visual**: Large +GEX wall between price and king node

**Logic**:
1. Identify king node (highest abs GEX)
2. Find second-highest GEX node between price and king
3. Gatekeeper must be > 50% of king's value
4. Must be positioned between current price and king

**Confidence Calculation**:
```
confidence = gatekeeper_GEX / king_GEX
capped at 0.85
```

**Trade Setup**:
- Entry: At gatekeeper strike
- Target: King node strike
- Stop: 10 points past gatekeeper (away from king)

**Strategy**: Fade the gatekeeper - price tends to reverse at gatekeeper

---

## 4. WHIPSAW (Neutral)

**Visual**: Two high-value nodes forming a range, few nodes in between

**Logic**:
1. Find top 2 highest abs GEX nodes
2. Both must be significant (> 500K)
3. Range between them: 10-50 points
4. Fewer than 3 significant nodes in the middle

**Confidence**: Fixed at 0.60 (range-bound = lower conviction)

**Trade Setup**:
- Entry: Middle of range
- Target: Nearest range boundary
- Stop: Far range boundary

**Strategy**: Sell premium (iron condors, strangles) or fade extremes

---

## 5. BEACHBALL (Bullish)

**Visual**: Very deep -GEX node (> 1.5M), price approaching

**Logic**:
1. Find -GEX nodes with value < -1,500,000
2. Must be at or below current price
3. Price within 20 points of deep floor

**Confidence Calculation**:
```
confidence = |floor_GEX| / 2,000,000
capped at 0.75
```

**Trade Setup**:
- Entry: At deep floor strike
- Target: 30 points up (strong bounce)
- Stop: 15 points below floor

---

## 6. FLOOR BOUNCE (Bullish)

**Visual**: Price approaching major -GEX support

**Logic**:
1. Find -GEX floors below current price (> 500K)
2. Price within 10 points of nearest floor
3. Distance-based confidence decay

**Confidence Calculation**:
```
base_confidence = floor_GEX / 2,000,000
distance_factor = 1 - (distance / 20)
confidence = base_confidence * distance_factor
capped at 0.80
```

**Trade Setup**:
- Entry: At floor strike
- Target: 20 points up
- Stop: 10 points below floor

---

## 7. TREND (Directional)

**Visual**: King node far from spot (> 1%), clear GEX skew

**Logic**:
1. King node > 1% away from current price
2. Calculate GEX sum above and below price
3. Clear skew: |above_sum - below_sum| > 1,000,000

**Confidence**: Fixed at 0.70

**Trade Setup**:
- Entry: Current price
- Target: King node strike
- Stop: 30% of distance to king (trailing)

**Direction**: Bullish if king above price, Bearish if king below

---

## 8. RAINBOW ROAD (AVOID)

**Visual**: 4+ significant nodes spread across > 80 points

**Logic**:
1. Count significant nodes (> 500K)
2. If 4+ nodes, calculate spread (max - min strike)
3. Spread > 80 points = RAINBOW ROAD

**Confidence**: Fixed at 0.95 (high confidence to AVOID)

**Strategy**: No trade. Too much noise, unclear price action.

---

## Detection Priority

Patterns are checked in this order (highest priority first):

1. **RAINBOW_ROAD** - Avoid signal takes precedence
2. **RUG_PULL** / **SLINGSHOT** - High conviction directional
3. **GATEKEEPER** / **WHIPSAW** - Neutral setups
4. **BEACHBALL** / **FLOOR_BOUNCE** - Bounce plays
5. **TREND** - Directional follow-through

The pattern with highest confidence wins.

---

## Confidence Interpretation

| Confidence | Interpretation | Position Size |
|------------|----------------|---------------|
| > 0.80 | High conviction | Full position |
| 0.60 - 0.80 | Medium conviction | Half position |
| 0.40 - 0.60 | Low conviction | Quarter position or wait |
| < 0.40 | No clear pattern | No trade |

---

## Risk/Reward Calculation

```
risk = |entry - stop|
reward = |target - entry|
risk_reward = reward / risk
```

Minimum acceptable R/R: 2:1
Ideal R/R: 3:1 or higher
