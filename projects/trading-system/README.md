# BINARY Trading System Quick Start

## System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    ⚡ BINARY TRADING SYSTEM                  │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐  │
│  │   Backend    │    │  WebSocket   │    │   Frontend   │  │
│  │   Engine     │───▶│   Server     │───▶│  Dashboard   │  │
│  │  (Python)    │    │  (Real-time) │    │  (HTML/JS)   │  │
│  └──────────────┘    └──────────────┘    └──────────────┘  │
│         │                                              │    │
│         ▼                                              ▼    │
│  ┌──────────────┐                              ┌──────────┐│
│  │ Data Sources │                              │  Trader  ││
│  │ - SpotGamma  │                              │  (You)   ││
│  │ - Polygon.io │                              └──────────┘│
│  │ - CheddarFlow│                                         │
│  └──────────────┘                                         │
└─────────────────────────────────────────────────────────────┘
```

---

## 🚀 Quick Start

### 1. Install Dependencies

```bash
cd backend
pip install -r requirements.txt
```

### 2. Configure API Keys (Optional for Demo)

Create `.env` file:
```bash
SPOT_GAMMA_API_KEY=your_key_here
POLYGON_API_KEY=your_key_here
```

### 3. Start the Backend Server

```bash
python trading_engine.py
```

Server starts on:
- WebSocket: `ws://localhost:8765`
- Updates every 15 seconds

### 4. Open the Dashboard

Open `frontend/index.html` in your browser:
```bash
# Mac
open frontend/index.html

# Linux
xdg-open frontend/index.html

# Windows
start frontend/index.html
```

Or serve via Python:
```bash
cd frontend
python -m http.server 8080
# Open http://localhost:8080
```

---

## 📊 Features

### Real-Time Analysis
- ✅ SPX, SPY, QQQ Trinity alignment
- ✅ GEX/VEX exposure tracking
- ✅ Pattern detection (8 patterns)
- ✅ King node identification
- ✅ Floor/Ceiling levels
- ✅ Confidence scoring

### Pattern Recognition
1. **RUG PULL** — Yellow above purple, no floor
2. **SLINGSHOT** — Inverse rug setup
3. **GATEKEEPER** — Large +GEX wall
4. **WHIPSAW** — Range-bound ping-pong
5. **BEACHBALL** — Deep -GEX reversal
6. **RAINBOW ROAD** — Avoid (no trade)
7. **TREND** — Stair-step to king
8. **FLOOR BOUNCE** — -GEX support

### Trade Recommendations
- 3:1 R/R minimum setups
- Entry/Stop/Target levels
- Position sizing guidance
- Trinity consensus scoring

---

## 🔌 Data Sources

### Current: Mock Data
System generates realistic GEX/VEX data for testing.

### Upgrade to Real Data

#### Option 1: SpotGamma
```python
# In trading_engine.py, use real API key
provider = SpotGammaProvider(api_key="your_key")
```

#### Option 2: Cheddar Flow
```python
# Add new provider class
class CheddarFlowProvider(DataProvider):
    BASE_URL = "https://api.cheddarflow.com"
    # ... implement methods
```

#### Option 3: Calculate from OI
```python
# Use Polygon options data to calculate GEX
# Formula: GEX = Gamma * OpenInterest * ContractMultiplier
```

---

## 🎯 Trading Rules (Built-in)

### The Ten Commandments
1. Protect capital at all costs
2. Only trade reversals at floors/ceilings
3. Only trade 3:1+ asymmetric R/R
4. Consider where price was delivered from
5. Be aware of broader market (Trinity)
6. Technical analysis before Heatseeker
7. Seek confluence between tools
8. Don't oversize
9. Go long on red, short on green
10. Don't let green trades go red

### Time Windows
- **AVOID:** 9:30-10:00 AM (traps)
- **PRIME:** 10:00-11:30 AM (direction clear)
- **CAUTION:** 11:30 AM-2:00 PM (chop)
- **GOOD:** 2:00-3:30 PM (drift)
- **CAUTION:** 3:30-4:00 PM (Power Hour)

---

## 🛠️ Customization

### Add New Patterns
```python
# In PatternDetector class
@staticmethod
def detect_my_pattern(gex_nodes, price):
    # Your logic
    return detected, confidence, entry, target
```

### Change Update Frequency
```python
# In main()
analysis_task = asyncio.create_task(
    engine.run_continuous(interval_seconds=5)  # Faster updates
)
```

### Add More Tickers
```python
# In analyze_trinity()
async def analyze_trinity(self):
    iwm = await self.analyze_ticker("IWM")  # Add Russell
    # Include in consensus calculation
```

---

## 📈 Performance Metrics

Expected Win Rates (from Heatseeker methodology):
- RUG PULL: ~70% when VIX rising
- SLINGSHOT: ~70% when VIX falling
- GATEKEEPER: ~65% first test
- FLOOR BOUNCE: ~70% with structure
- BEACHBALL: ~80% highest R/R

---

## 🔒 Risk Management

### Position Sizing
```python
# Built into engine
def calculate_position_size(account_balance, risk_pct, 
                           setup_confidence, distance_to_stop):
    # Kelly Criterion × 0.25 (conservative)
    # Confidence-adjusted
```

### Auto-Exits
- Stop loss hit
- Target reached
- Green trade going red
- Map reshuffle detected

---

## 🐛 Troubleshooting

### WebSocket Not Connecting
```bash
# Check if server is running
lsof -i :8765

# Restart server
python backend/trading_engine.py
```

### No Data Displaying
- Check browser console for errors
- Verify WebSocket connection status
- Try demo mode (auto-fallback)

### Pattern Detection Not Working
- Check GEX node values in console
- Verify price proximity to strikes
- Adjust detection thresholds

---

## 🚀 Deployment

### Local Network
```bash
# Allow other devices to connect
python -m websockets.server --host 0.0.0.0 --port 8765
```

### Cloud (AWS/GCP)
```bash
# Docker container
docker build -t trading-system .
docker run -p 8765:8765 -p 8080:8080 trading-system
```

---

## 📚 Documentation

- `TRADING_SYSTEM_DESIGN.md` — Architecture
- `HEATSEEKER_INTEGRATION.md` — GEX/VEX concepts
- `HEATSEEKER_ADVANCED_PATTERNS.md` — Trading rules
- `UI_SPECIFICATION.md` — Dashboard design

---

## 🎓 Learning Path

1. **Read** the Ten Commandments
2. **Study** pattern cards in dashboard
3. **Paper trade** with demo data
4. **Connect** real data source
5. **Trade live** with small size
6. **Scale up** as edge confirms

---

*System Version: 1.0*
*Ready for real-time trading*
