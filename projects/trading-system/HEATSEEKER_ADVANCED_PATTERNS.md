# Heatseeker Advanced Patterns & Trading Rules — ⚡ BINARY System

## Overview

This document captures advanced trading patterns, entry/exit rules, and the complete Heatseeker methodology from the provided educational materials.

---

## 📋 The Ten Commandments of Heatseeker Trading

1. **Protect existing capital at all costs**
2. **Only trade reversals at floors or ceilings** — not in the middle
3. **Only trade asymmetric risk/reward setups** (3:1 minimum)
4. **Always consider where price was delivered from**
5. **Always be aware of the broader market** (SPX/SPY/QQQ confluence)
6. **Put technical analysis before Heatseeker**
7. **Seek confluence between Heatseeker and Price Action**
8. **Thou shalt not oversize**
9. **Go long on red candles, short on green candles** (counter-trend entries)
10. **Thou shalt not let a green trade go red**

---

## 🎯 Core Entry/Exit Framework

### The "No Chase" Rule

| What We Do | What We DON'T Do |
|------------|------------------|
| Fade edges at first touch | Chase fresh range breaks |
| Enter on pullback to flipped stack | Enter on initial push |
| Wait for failed retest + VIX curl | Pre-empt without confirmation |
| Trade from known levels | Trade "maybe it wakes up" setups |

### Entry Types

| Setup | Entry Trigger | Invalidation | Exit Target |
|-------|---------------|--------------|-------------|
| **Floor Bounce** | Wick into +GEX + VIX curl down | New lows with VIX rising | Next ceiling/+GEX shelf |
| **Ceiling Rejection** | Wick into -GEX + VIX curl up | Acceptance above with VIX falling | Next floor/-GEX pit |
| **Stack Flip Long** | Pullback into flipped -GEX→+GEX | Re-acceptance below | Next resistance |
| **Stack Flip Short** | Pullback into flipped +GEX→-GEX | Acceptance above | Next support |
| **Panic Extension** | Capitulation wick + VIX stall | VIX makes new highs | Mid-curve node or +GEX shelf |

---

## 🔥 Key Patterns

### 1. RUG SETUP (High-Probability Short)

**Description:** Yellow node (+GEX) stacked above purple node (-GEX) with no clear floor below.

**Why It Works:**
- Negative gamma ceiling accelerates rejection of positive gamma ceiling
- Negative gamma floors below accelerate the move down
- "Gasoline on fire" effect

**Entry Points:**
- Rejection of upper node
- Double top liquidity hunt
- Bearish golden pocket retracement

**Example:** SPX 6750 rejection → target 670, 669, 667

### 2. The Gatekeeper

**Description:** High-value node sits between price and further high-value nodes, preventing continuation.

**Action:**
- Mark gatekeeper strikes on chart
- Scale out as price approaches
- Play reversal IF gatekeeper value far exceeds nodes beyond it

**Example:** SPX 6600 gatekeeping price from downside nodes

### 3. The Whipsaw

**Description:** Price trades in wide range between two high-value nodes with few prominent nodes in between.

**Action:**
- **Fade the edges** — highest R/R
- **Avoid middle** — worst R/R, theta decay kills 0DTE
- Wait for breakout confirmation with vol expansion

### 4. Trend Pattern

**Description:** Price fixates on king node far away with small counter-directional skew. As it trades toward king node, selects next node above as new target.

**Action:**
- Enter on pullbacks (don't chase)
- Asymmetrical R/R only
- Stair-step pattern = trend day

### 5. Rainbow Road (AVOID)

**Description:** Multiple prominent nodes spread across 80-100+ point range; resembles rainbow.

**Action:** **DO NOT TRADE.** Wait for higher probability setup.

---

## ⚡ 0DTE SPX Sniping Masterclass

### Timing Rules

| Time Window | Action |
|-------------|--------|
| **9:30-10:00 AM** | AVOID — institutional rebalancing, high volatility, traps |
| **10:00-11:30 AM** | PRIME — direction clearer, volatility decreased |
| **11:30 AM-2:00 PM** | CAUTION — lunch hour chop, slow |
| **2:00-3:30 PM** | GOOD — afternoon drift, charm effects |
| **3:30-4:00 PM** | CAUTION — Robinhood Power Hour liquidations |

### 0DTE Specific Rules

1. **Gamma dominates** — minimal theta impact
2. **Delta changes rapidly** — small price moves = big option value changes
3. **Volatility crush is deadly** — avoid chasing in high IV
4. **First 30 minutes = trap zone** — wait for equilibrium

### 0DTE Setup Checklist

- [ ] SPX, SPY, QQQ GEX alignment confirmed
- [ ] VEX positioning supports direction
- [ ] Key node identified (floor/ceiling)
- [ ] VIX direction confirms (curl down for long, up for short)
- [ ] Entry at node test with wick/absorption
- [ ] 3:1 R/R minimum
- [ ] Invalidation level clear (beyond node)

---

## 🎓 Greeks Bible — Advanced Concepts

### Primary Greeks Reference

| Greek | Measures | Key Insight |
|-------|----------|-------------|
| **Delta (Δ)** | $ change per $1 move | Steering wheel position |
| **Gamma (Γ)** | Change of Δ per $1 | Shock absorber; max ATM |
| **Vega (ν)** | Change per 1pt IV | Market's breathing |
| **Theta (Θ)** | Time decay | Parking meter cost |
| **Vanna** | Δ change for IV change | Vol-spot coupler; tailwind |
| **Charm** | Δ change with time | Invisible afternoon drift |

### GEX/VEX Alignment Matrix

| Setup | Dealer Flow | Market Behavior | Trade Bias |
|-------|-------------|-----------------|------------|
| **+GEX +VEX Below** | Buy dips + buy on vol drop | Tight range, upward drift | Fade dips, buy pullbacks |
| **+GEX +VEX Above** | Sell rips + sell on vol rise | Ceiling thickens | Fade breakouts |
| **-GEX -VEX Below** | Sell dips + sell on vol drop | Sharp breakdowns | Momentum short |
| **-GEX -VEX Above** | Buy rips + buy on vol rise | Violent squeezes | Follow breakout |
| **+VEX Below Only** | Buy as vol drops | Strong base in calm | Buy dips in calm; cut if VIX ↑ |
| **-VEX Below Only** | Sell in calm | Fragile floor | Short rallies; scalp panic bounces |

### Cross-Expiry Dynamics

| Expiry | Dominant Greek | Effect |
|--------|---------------|--------|
| **0-2 DTE** | Gamma | Mechanical hedging, fast reversion/breakouts |
| **7-30 DTE** | Vanna | Volatility regime steering |
| **45-90+ DTE** | Vega | Vol regime gravity |

> **Key Insight:** Front-end GEX can be overwhelmed by back-end Vanna during vol spikes.

---

## 🏦 Dealer vs Gambler Dynamics

### The Life Cycle of a Strike

| Phase | Status | Deltas | Dealer Hedge | Market Impact |
|-------|--------|--------|--------------|---------------|
| **1. Far OTM** | Speculative | Δ ≈ 0 | Almost nothing | Price ignores |
| **2. ATM** | Max sensitivity | Δ ≈ 0.5 | Rapid adjustment | Volatility explodes |
| **3. Deep ITM** | Saturated | Δ → ±1 | Fully sized | Flow stops; reversal |

### Why Reversals Happen at Major Nodes

1. **Dealer Hedge Exhaustion** — No incremental hedge needed
2. **Gambler Profit-Taking** — Dealers buy back stock
3. **Charm/Theta Effects** — Decaying OTM options lose delta
4. **Vanna Support** — IV falling = dealers buy to re-hedge

### The Balloon Underwater Analogy

- **-GEX** pushes balloon deeper (dealers selling)
- **Deeper = more pressure**
- **Maximum compression (ITM saturation)** = pressure releases
- **Explosive reversal upward**

---

## 📊 Topping/Bottoming Patterns

### Bearish Topping Pattern

**Signs:**
- VEX looking "toppy" (lack of upside accumulation)
- Strong gatekeeper node with minimal upside beyond
- Price delivered from higher level recently
- Stair-step pattern to downside

**Example:** SPY 685 gatekeeper, 690 delivered days ago, no accumulation at 690

### Trading the Bias

- Play node rejections knowing dealers are bearish
- Maps can shuffle — stay fluid
- **Invalidation:** Higher accumulation at higher strikes, dissipation at lower strikes

---

## 💰 Position Sizing Framework

| Conviction Level | Size | Description |
|------------------|------|-------------|
| **Speculative** | ¼–⅓ size | Dormant far node, early misalignment |
| **Aligned Flows** | Standard size | +GEX+VEX under spot, VIX ↓ |
| **Stacked Confluence** | Medium size | Flip + vol confirmation, pullback entry |
| **King Node + Trinity** | Aggressive size | All 3 indices aligned, vol regime match |

---

## 🎯 Practical Implementation Code

```python
# Entry Signal Generator
def generate_entry_signal(market_data):
    """
    Generate entry signals based on Heatseeker methodology
    """
    signals = []
    
    # Check Trinity alignment
    trinity_score = check_trinity_alignment(
        market_data['SPX'],
        market_data['SPY'], 
        market_data['QQQ']
    )
    
    # Skip if no confluence
    if abs(trinity_score) < 0.5:
        return signals  # No trade
    
    for ticker in ['SPX', 'SPY', 'QQQ']:
        data = market_data[ticker]
        
        # Check for RUG setup (short opportunity)
        if detect_rug_setup(data):
            signals.append({
                'ticker': ticker,
                'direction': 'SHORT',
                'setup': 'RUG_SETUP',
                'entry': data['nearest_resistance'],
                'target': data['next_support'],
                'stop': data['resistance'] + 5,
                'confidence': 0.85 if trinity_score < -0.5 else 0.70
            })
        
        # Check for floor bounce (long opportunity)
        if detect_floor_bounce(data):
            vix_curl = check_vix_curl(market_data['VIX'])
            if vix_curl == 'DOWN':
                signals.append({
                    'ticker': ticker,
                    'direction': 'LONG',
                    'setup': 'FLOOR_BOUNCE',
                    'entry': data['nearest_support'],
                    'target': data['next_resistance'],
                    'stop': data['support'] - 5,
                    'confidence': 0.80 if trinity_score > 0.5 else 0.65
                })
        
        # Check for gatekeeper rejection
        if detect_gatekeeper(data):
            signals.append({
                'ticker': ticker,
                'direction': 'SHORT' if data['price'] < data['gatekeeper'] else 'LONG',
                'setup': 'GATEKEEPER_REJECTION',
                'entry': data['gatekeeper'],
                'target': data['next_major_node'],
                'stop': data['gatekeeper'] + (10 if data['price'] < data['gatekeeper'] else -10),
                'confidence': 0.75
            })
    
    return signals

# Pattern Detection Functions
def detect_rug_setup(data):
    """
    Yellow node (+GEX) stacked above purple node (-GEX)
    with no clear floor below
    """
    nodes = data['gex_nodes']
    
    # Find +GEX node above -GEX node
    for i, node in enumerate(nodes[:-1]):
        if node['value'] > 0 and nodes[i+1]['value'] < 0:
            # Check if node above is "yellow" (positive)
            # and node below is "purple" (negative)
            if node['abs_value'] > 1000000 and nodes[i+1]['abs_value'] > 1000000:
                # Check for lack of floor below
                floors_below = [n for n in nodes[i+2:] if n['value'] > 0]
                if len(floors_below) == 0 or floors_below[0]['strike'] < node['strike'] - 50:
                    return True
    return False

def detect_floor_bounce(data):
    """
    Price approaching +GEX node with VIX curling down
    """
    price = data['price']
    nodes = data['gex_nodes']
    
    # Find nearest +GEX floor below price
    floors = [n for n in nodes if n['value'] > 0 and n['strike'] < price]
    if not floors:
        return False
    
    nearest_floor = max(floors, key=lambda x: x['strike'])
    distance = price - nearest_floor['strike']
    
    # Within 10 points of floor
    return distance <= 10 and nearest_floor['abs_value'] > 500000

def detect_gatekeeper(data):
    """
    High-value node between price and further high-value nodes
    """
    nodes = data['gex_nodes']
    price = data['price']
    
    # Sort by absolute value
    sorted_nodes = sorted(nodes, key=lambda x: x['abs_value'], reverse=True)
    
    if len(sorted_nodes) < 2:
        return False
    
    king_node = sorted_nodes[0]
    gatekeeper = sorted_nodes[1]
    
    # Gatekeeper is between price and king node
    if price < gatekeeper['strike'] < king_node['strike']:
        return gatekeeper['abs_value'] > king_node['abs_value'] * 0.5
    
    return False

def check_trinity_alignment(spx, spy, qqq):
    """
    Check if SPX, SPY, QQQ are aligned
    Returns: -1.0 to 1.0 (bearish to bullish)
    """
    signals = []
    
    for data in [spx, spy, qqq]:
        # Determine directional bias from GEX/VEX
        gex_below = sum(n['value'] for n in data['gex_nodes'] if n['strike'] < data['price'])
        gex_above = sum(n['value'] for n in data['gex_nodes'] if n['strike'] > data['price'])
        
        if gex_below > gex_above:
            signals.append(1)  # Bullish
        elif gex_below < gex_above:
            signals.append(-1)  # Bearish
        else:
            signals.append(0)  # Neutral
    
    # Calculate confluence score
    bullish_count = sum(1 for s in signals if s > 0)
    bearish_count = sum(1 for s in signals if s < 0)
    
    if bullish_count == 3: return 1.0
    if bearish_count == 3: return -1.0
    if bullish_count == 2: return 0.5
    if bearish_count == 2: return -0.5
    return 0.0

def check_vix_curl(vix_data):
    """
    Check if VIX is curling up or down
    """
    recent = vix_data['close'][-5:]
    if len(recent) < 5:
        return 'FLAT'
    
    # Check for curl down (high to lower)
    if recent[0] > recent[2] > recent[-1]:
        return 'DOWN'
    
    # Check for curl up (low to higher)
    if recent[0] < recent[2] < recent[-1]:
        return 'UP'
    
    return 'FLAT'

# Risk Management
def calculate_position_size(account_balance, risk_pct, setup_confidence, distance_to_stop):
    """
    Calculate position size based on confidence and risk
    """
    base_risk = account_balance * risk_pct
    
    # Adjust for confidence
    if setup_confidence >= 0.85:
        size_multiplier = 1.0
    elif setup_confidence >= 0.75:
        size_multiplier = 0.75
    elif setup_confidence >= 0.65:
        size_multiplier = 0.5
    else:
        size_multiplier = 0.25
    
    # Calculate contracts
    risk_per_contract = distance_to_stop * 100  # SPX = $100 per point
    max_contracts = (base_risk * size_multiplier) / risk_per_contract
    
    return int(max_contracts)

def check_exit_conditions(position, market_data):
    """
    Check if position should be exited
    """
    current_price = market_data['price']
    
    # Hard stop hit
    if position['direction'] == 'LONG' and current_price <= position['stop']:
        return 'STOP_LOSS'
    if position['direction'] == 'SHORT' and current_price >= position['stop']:
        return 'STOP_LOSS'
    
    # Target hit
    if position['direction'] == 'LONG' and current_price >= position['target']:
        return 'TARGET_HIT'
    if position['direction'] == 'SHORT' and current_price <= position['target']:
        return 'TARGET_HIT'
    
    # Green trade going red (Commandment #10)
    if position.get('entry_price'):
        pnl = current_price - position['entry_price']
        if position['direction'] == 'SHORT':
            pnl = -pnl
        
        # If was green, now red
        if position.get('max_profit', 0) > 0 and pnl < 0:
            return 'GREEN_TO_RED'
    
    # Map reshuffle (nodes significantly changed)
    if detect_map_reshuffle(position['entry_nodes'], market_data['gex_nodes']):
        return 'MAP_RESHUFFLE'
    
    return None
```

---

## 📈 Summary: Key Takeaways

### What Creates Edge

1. **Dealer hedge exhaustion** at major nodes
2. **Trinity alignment** (SPX/SPY/QQQ agreement)
3. **GEX/VEX confluence** (gamma + vanna agreement)
4. **First touch** of fresh nodes (highest probability)
5. **VIX curl confirmation** (vol regime alignment)

### What Destroys Edge

1. **Chasing breakouts** (entering late)
2. **Trading midpoints** (poor R/R)
3. **Ignoring VIX** (vol regime mismatch)
4. **Oversizing** (poor risk management)
5. **Map reshuffles** (trading outdated data)

### The Mental Model

> **GEX = brakes. VEX = slope. VIX = weather.**
> 
> Trade where the brakes release on a downhill slope with good weather.

---

*Document Version: 1.0*
*Created: 2026-02-23*
*Source: Heatseeker Advanced Training Materials*
