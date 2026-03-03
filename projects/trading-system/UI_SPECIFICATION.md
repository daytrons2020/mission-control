# Trading System UI Specification
## BINARY Command Center Style Dashboard

---

## 🎨 Design System

### Color Palette

| Element | Color | Hex |
|---------|-------|-----|
| **Background** | Deep Navy | `#0D1117` |
| **Card Background** | Dark Blue | `#161B22` |
| **Border** | Subtle Blue | `#30363D` |
| **Primary Text** | White | `#FFFFFF` |
| **Secondary Text** | Gray | `#8B949E` |
| **Accent Green** | Bullish | `#238636` |
| **Accent Red** | Bearish | `#DA3633` |
| **Accent Yellow** | Warning/Neutral | `#F0883E` |
| **Accent Purple** | VEX/Gamma | `#8957E5` |
| **Accent Cyan** | Info/Active | `#58A6FF` |
| **+GEX (Yellow)** | Positive Gamma | `#F9C513` |
| **-GEX (Purple)** | Negative Gamma | `#8957E5` |

### Typography

| Element | Font | Size | Weight |
|---------|------|------|--------|
| **Header** | Inter | 24px | 700 |
| **Card Title** | Inter | 16px | 600 |
| **Price Large** | Inter | 32px | 700 |
| **Price Small** | Inter | 14px | 400 |
| **Label** | Inter | 12px | 500 |
| **Data** | Inter | 14px | 600 |

---

## 📐 Layout Structure

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  ⚡ BINARY COMMAND CENTER                                    ● Connected   │
├─────────────────────────────────────────────────────────────────────────────┤
│  📊 Morning Report  🎯 0DTE Analysis  🧠 0DTE Coach  📚 Heatseeker Cheatsheet│
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │  🛡️ TRINITY ALIGNED: GATEKEEPER                                    │   │
│  │  All 3 pinned at King strike — fade approaches, sell premium        │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐                      │
│  │     SPX      │  │     SPY      │  │     QQQ      │                      │
│  │   6,128.40   │  │   $685.37    │  │   $527.85    │                      │
│  │              │  │              │  │              │                      │
│  │ KING  6,125  │  │ KING  $685   │  │ KING  $528   │                      │
│  │ GEX   +$1.2B │  │ GEX   +$87M  │  │ GEX   +$42M  │                      │
│  │ FLOOR 6,100  │  │ FLOOR $685   │  │ FLOOR $525   │                      │
│  │ VEX   -$2.1B │  │ VEX   -$147M │  │ VEX   -$89M  │                      │
│  │ CEILING 6,175│  │ CEILING $690 │  │ CEILING $532 │                      │
│  │ RANGE 75 pts │  │ RANGE $5.00  │  │ RANGE $7.00  │                      │
│  │              │  │              │  │              │                      │
│  │ [GATEKEEPER] │  │ [GATEKEEPER] │  │ [GATEKEEPER] │                      │
│  └──────────────┘  └──────────────┘  └──────────────┘                      │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │  TRINITY CONSENSUS BIAS                                            │   │
│  │  STRONG BEAR ←──────●──────→ STRONG BULL                           │   │
│  │           BEARISH   NEUTRAL   BULLISH                              │   │
│  │                    SPY QQQ                                         │   │
│  │  NEUTRAL — slight bearish lean (VEX overhang)                      │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │  KEY LEVELS — ALL TICKERS                                          │   │
│  ├──────────────┬──────────┬──────────┬──────────┬─────────┐            │   │
│  │ LEVEL        │ SPX      │ SPY      │ QQQ      │ AGREE?  │            │   │
│  ├──────────────┼──────────┼──────────┼──────────┼─────────┤            │   │
│  │ 🔴 Ceiling   │ 6,175    │ $690     │ $532     │ 3/3 ✓   │            │   │
│  │ 🔵 Minor Res │ 6,150    │ $688     │ $530     │ —       │            │   │
│  │ 🟠 KING/FLOOR│ 6,125    │ $685     │ $528     │ 3/3 ✓   │            │   │
│  │ 🟢 Break Tgt1│ 6,100    │ $680     │ $525     │ 3/3 ✓   │            │   │
│  │ 🟢 Break Tgt2│ 6,050    │ $675     │ $520     │ 2/3     │            │   │
│  └──────────────┴──────────┴──────────┴──────────┴─────────┘            │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │  THE PLAYS (TRINITY CONSENSUS)                                     │   │
│  ├─────────────────────────────────────────────────────────────────────┤   │
│  │                                                                     │   │
│  │  A. Sell the Range — All 3 Pinned                        55% prob   │   │
│  │  ─────────────────────────────────────────────────────────────    │   │
│  │  Trinity 3/3 aligned on PIN regime. High-confidence premium sell.   │   │
│  │                                                                     │   │
│  │  SPX (INDEX)      SPY (PRIMARY)      QQQ (CONFIRM)                  │   │
│  │  IC @ 6125        IC @ $685          IC @ $528                      │   │
│  │                                                                     │   │
│  │  STRUCTURE: Iron Condor centered on King strikes                    │   │
│  │                                                                     │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │  🤖 GEX AI VERDICT                                                 │   │
│  ├─────────────────────────────────────────────────────────────────────┤   │
│  │                                                                     │   │
│  │  BULLISH ▓▓▓▓▓▓▓▓░░░░ 80%                                         │   │
│  │                                                                     │   │
│  │  The King strike at 95 is acting as a strong magnet, pulling price  │   │
│  │  upwards. GEX and VEX are aligned above the spot price, reinforcing │   │
│  │  the bullish sentiment. The floor at 80 provides strong support.    │   │
│  │                                                                     │   │
│  │  📍 Key Level: 95                                                   │   │
│  │  Entry: 94.5 | Stop: 93 | Day: 96 | Swing: 100                      │   │
│  │                                                                     │   │
│  │  IF 95 holds THEN go long. WATCH 96 as confirmation.                │   │
│  │  EXIT if price breaks below 93.                                     │   │
│  │                                                                     │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 🃏 Pattern Cards Grid

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  PATTERN RECOGNITION CARDS                                                   │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐    │
│  │  💀 RUG PULL │  │  🚀 SLINGSHOT│  │  🛡️ GATEKEEP│  │  ⚡ WHIPSAW  │    │
│  │              │  │              │  │              │  │              │    │
│  │  [YELLOW]    │  │  [PURPLE]    │  │  [YELLOW]    │  │  [YELLOW]    │    │
│  │  [PURPLE]    │  │  [YELLOW]    │  │              │  │  [PURPLE]    │    │
│  │              │  │              │  │              │  │              │    │
│  │  ▼ FLUSH     │  │  ▲ LAUNCH    │  │  🚫 REJECT   │  │  ↕ PING-PONG │    │
│  │              │  │              │  │              │  │              │    │
│  │  Setup: +GEX │  │  Setup: -GEX │  │  Setup: Large│  │  Setup: +GEX │    │
│  │  above -GEX  │  │  above +GEX  │  │  +GEX wall   │  │  ceiling &   │    │
│  │  with no     │  │  — inverse   │  │  between     │  │  -GEX floor  │    │
│  │  floor       │  │  rug setup   │  │  spot & king │  │  within 1.5% │    │
│  │              │  │              │  │              │  │              │    │
│  │  Entry: Short│  │  Entry: Long │  │  Entry: Fade │  │  Entry: Limit│    │
│  │  at ceiling  │  │  at yellow   │  │  at level    │  │  at both     │    │
│  │              │  │              │  │              │  │              │    │
│  │  Win: ~70%   │  │  Win: ~70%   │  │  Win: ~65%   │  │  Win: ~60%   │    │
│  │  when VIX ↑  │  │  when VIX ↓  │  │  1st test    │  │  per bounce  │    │
│  └──────────────┘  └──────────────┘  └──────────────┘  └──────────────┘    │
│                                                                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐    │
│  │  🏀 BEACHBALL│  │  🌈 RAINBOW  │  │  📈 TREND    │  │  🎯 FLOOR    │    │
│  │              │  │  ROAD        │  │              │  │  BOUNCE      │    │
│  │  [PURPLE]    │  │  [RAINBOW]   │  │  [SPOT→KING] │  │  [PURPLE]    │    │
│  │  [DEEPER]    │  │              │  │              │  │              │    │
│  │  [MAX NEG]   │  │              │  │              │  │              │    │
│  │              │  │              │  │              │  │              │    │
│  │  ⬆ SPRING UP │  │  ⚠️ AVOID    │  │  → DRIFT     │  │  ⬆ BOUNCE    │    │
│  │              │  │              │  │              │  │              │    │
│  │  Setup: Deep │  │  Setup: VEX  │  │  Setup: King │  │  Setup: Hit  │    │
│  │  -GEX pit    │  │  exceeds GEX │  │  strike      │  │  major -GEX  │    │
│  │  below king  │  │  by 1.5x     │  │  >1% away    │  │  floor       │    │
│  │              │  │              │  │              │  │              │    │
│  │  Entry: Long │  │  Entry: NO   │  │  Entry: Pull │  │  Entry: Long │    │
│  │  at deepest  │  │  TRADE       │  │  back entry  │  │  at floor    │    │
│  │              │  │              │  │              │  │              │    │
│  │  Win: ~80%   │  │  Win: N/A    │  │  Win: ~70%   │  │  Win: ~70%   │    │
│  │  highest R/R │  │  Wait for    │  │  macro align │  │  w/ structure│    │
│  └──────────────┘  └──────────────┘  └──────────────┘  └──────────────┘    │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 📱 Component Specifications

### 1. Header Bar

```css
.header {
  background: #0D1117;
  border-bottom: 1px solid #30363D;
  padding: 12px 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.logo {
  font-size: 18px;
  font-weight: 700;
  color: #58A6FF;
  display: flex;
  align-items: center;
  gap: 8px;
}

.status {
  display: flex;
  align-items: center;
  gap: 16px;
  color: #8B949E;
  font-size: 14px;
}

.status-dot {
  width: 8px;
  height: 8px;
  background: #238636;
  border-radius: 50%;
  animation: pulse 2s infinite;
}
```

### 2. Navigation Tabs

```css
.nav-tabs {
  display: flex;
  gap: 4px;
  padding: 0 24px;
  background: #0D1117;
  border-bottom: 1px solid #30363D;
}

.tab {
  padding: 12px 20px;
  color: #8B949E;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  border-bottom: 2px solid transparent;
  transition: all 0.2s;
}

.tab:hover {
  color: #FFFFFF;
}

.tab.active {
  color: #58A6FF;
  border-bottom-color: #58A6FF;
}

.tab-icon {
  margin-right: 8px;
}
```

### 3. Ticker Card

```css
.ticker-card {
  background: #161B22;
  border: 1px solid #30363D;
  border-radius: 12px;
  padding: 20px;
  min-width: 280px;
}

.ticker-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.ticker-name {
  font-size: 14px;
  font-weight: 600;
  color: #8B949E;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.ticker-agreement {
  background: #238636;
  color: white;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 11px;
  font-weight: 600;
}

.ticker-price {
  font-size: 32px;
  font-weight: 700;
  color: #FFFFFF;
  margin-bottom: 16px;
}

.data-row {
  display: flex;
  justify-content: space-between;
  padding: 6px 0;
  border-bottom: 1px solid #21262D;
}

.data-label {
  font-size: 12px;
  color: #8B949E;
  text-transform: uppercase;
}

.data-value {
  font-size: 14px;
  font-weight: 600;
}

.data-value.positive {
  color: #238636;
}

.data-value.negative {
  color: #DA3633;
}

.pattern-badge {
  margin-top: 12px;
  padding: 8px 12px;
  background: #F0883E;
  color: #0D1117;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 700;
  text-align: center;
  text-transform: uppercase;
}
```

### 4. Bias Meter

```css
.bias-meter {
  background: #161B22;
  border: 1px solid #30363D;
  border-radius: 12px;
  padding: 20px;
}

.bias-label {
  font-size: 12px;
  color: #8B949E;
  text-transform: uppercase;
  margin-bottom: 12px;
}

.bias-bar-container {
  position: relative;
  height: 8px;
  background: linear-gradient(90deg, #DA3633 0%, #F0883E 50%, #238636 100%);
  border-radius: 4px;
  margin-bottom: 8px;
}

.bias-marker {
  position: absolute;
  top: -4px;
  width: 16px;
  height: 16px;
  background: white;
  border: 2px solid #0D1117;
  border-radius: 50%;
  transform: translateX(-50%);
}

.bias-labels {
  display: flex;
  justify-content: space-between;
  font-size: 11px;
  color: #8B949E;
}

.bias-consensus {
  margin-top: 12px;
  font-size: 14px;
  font-weight: 600;
  color: #F0883E;
}
```

### 5. Pattern Card

```css
.pattern-card {
  background: #161B22;
  border: 1px solid #30363D;
  border-radius: 12px;
  padding: 16px;
  transition: all 0.2s;
}

.pattern-card:hover {
  border-color: #58A6FF;
  transform: translateY(-2px);
}

.pattern-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.pattern-icon {
  font-size: 20px;
}

.pattern-name {
  font-size: 14px;
  font-weight: 700;
  color: #FFFFFF;
}

.pattern-type {
  font-size: 10px;
  padding: 4px 8px;
  border-radius: 4px;
  font-weight: 600;
  text-transform: uppercase;
}

.pattern-type.bearish {
  background: #DA3633;
  color: white;
}

.pattern-type.bullish {
  background: #238636;
  color: white;
}

.pattern-type.neutral {
  background: #F0883E;
  color: #0D1117;
}

.pattern-visual {
  height: 60px;
  margin: 12px 0;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.gex-bar {
  height: 24px;
  border-radius: 4px;
}

.gex-bar.positive {
  background: linear-gradient(90deg, #F9C513, #F0883E);
}

.gex-bar.negative {
  background: linear-gradient(90deg, #8957E5, #6E40C9);
}

.pattern-action {
  font-size: 18px;
  font-weight: 700;
  text-align: center;
  margin: 12px 0;
}

.pattern-action.bearish {
  color: #DA3633;
}

.pattern-action.bullish {
  color: #238636;
}

.pattern-setup {
  font-size: 12px;
  color: #8B949E;
  line-height: 1.5;
}

.pattern-stats {
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid #30363D;
  font-size: 12px;
  color: #8B949E;
}

.pattern-stats strong {
  color: #FFFFFF;
}
```

### 6. AI Verdict Panel

```css
.ai-verdict {
  background: linear-gradient(135deg, #161B22 0%, #1C2128 100%);
  border: 1px solid #30363D;
  border-radius: 12px;
  padding: 24px;
}

.verdict-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
}

.verdict-icon {
  font-size: 24px;
}

.verdict-title {
  font-size: 18px;
  font-weight: 700;
}

.verdict-confidence {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
}

.confidence-bar {
  flex: 1;
  height: 12px;
  background: #21262D;
  border-radius: 6px;
  overflow: hidden;
}

.confidence-fill {
  height: 100%;
  background: linear-gradient(90deg, #238636, #3FB950);
  border-radius: 6px;
  transition: width 0.5s ease;
}

.confidence-text {
  font-size: 14px;
  font-weight: 700;
  color: #238636;
}

.verdict-description {
  font-size: 14px;
  color: #C9D1D9;
  line-height: 1.6;
  margin-bottom: 16px;
}

.key-levels {
  display: flex;
  gap: 16px;
  margin-bottom: 16px;
}

.key-level {
  text-align: center;
}

.key-level-label {
  font-size: 11px;
  color: #8B949E;
  text-transform: uppercase;
}

.key-level-value {
  font-size: 16px;
  font-weight: 700;
  color: #58A6FF;
}

.verdict-plan {
  background: #0D1117;
  border: 1px solid #30363D;
  border-radius: 8px;
  padding: 16px;
  font-size: 14px;
  color: #C9D1D9;
  line-height: 1.6;
}

.verdict-plan strong {
  color: #F0883E;
}
```

---

## 🔄 Responsive Breakpoints

| Breakpoint | Layout Changes |
|------------|----------------|
| **Desktop (1200px+)** | 3-column ticker cards, 4-column pattern grid |
| **Tablet (768-1199px)** | 2-column ticker cards, 2-column pattern grid |
| **Mobile (<768px)** | Single column, collapsible navigation |

---

## 🎬 Animations

```css
/* Pulse animation for live indicator */
@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

/* Card hover lift */
.card {
  transition: transform 0.2s, box-shadow 0.2s;
}

.card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
}

/* Confidence bar fill */
.confidence-fill {
  animation: fillBar 1s ease-out;
}

@keyframes fillBar {
  from { width: 0; }
}

/* Data update flash */
.data-value.updated {
  animation: flash 0.5s;
}

@keyframes flash {
  0%, 100% { background: transparent; }
  50% { background: rgba(88, 166, 255, 0.2); }
}
```

---

## 📊 Data Refresh Indicators

```
Last updated: 09:16:47 AM ET
Auto-refresh: ON (every 15s)

Manual controls:
[🔄 Refresh Now]  [⏸️ Pause]  [⚙️ Settings]
```

---

## 🔔 Alert Toast Notifications

```
┌────────────────────────────────────────┐
│  🚨 PATTERN DETECTED                   │
│  RUG PULL setup forming on SPY         │
│  $685 ceiling with -GEX below          │
│                              [View] [×]│
└────────────────────────────────────────┘
```

---

*UI Specification Version: 1.0*
*Created: 2026-02-23*
*Reference: BINARY Command Center Design*
