# BINARY Trading System Backend
# Real-time GEX/VEX Data Pipeline

import asyncio
import json
import websockets
from datetime import datetime, timedelta
from dataclasses import dataclass, asdict
from typing import Dict, List, Optional, Callable
import aiohttp
import numpy as np
from enum import Enum
import logging
import os

# Import real data provider
from data_provider import YahooFinanceProvider, PolygonRealTimeProvider, RealTimeDataProvider

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class PatternType(Enum):
    RUG_PULL = "rug_pull"
    SLINGSHOT = "slingshot"
    GATEKEEPER = "gatekeeper"
    WHIPSAW = "whipsaw"
    BEACHBALL = "beachball"
    RAINBOW_ROAD = "rainbow_road"
    TREND = "trend"
    FLOOR_BOUNCE = "floor_bounce"
    NONE = "none"

class Direction(Enum):
    BULLISH = "bullish"
    BEARISH = "bearish"
    NEUTRAL = "neutral"

@dataclass
class GEXNode:
    strike: float
    value: float  # Positive = +GEX (yellow), Negative = -GEX (purple)
    abs_value: float
    expiration: str
    
@dataclass
class VEXNode:
    strike: float
    value: float
    abs_value: float
    expiration: str

@dataclass
class TickerData:
    symbol: str
    price: float
    king_strike: float
    king_value: float
    gex_nodes: List[GEXNode]
    vex_nodes: List[VEXNode]
    floor: float
    ceiling: float
    gex_total: float
    vex_total: float
    range_points: float
    pattern: PatternType
    pattern_confidence: float
    timestamp: datetime
    
@dataclass
class TrinityAnalysis:
    spx: TickerData
    spy: TickerData
    qqq: TickerData
    consensus_direction: Direction
    consensus_score: float  # -1.0 to 1.0
    alignment_count: int  # 0-3
    key_levels: Dict[str, Dict[str, float]]
    recommended_play: Optional[Dict]
    
class DataProvider:
    """Base class for GEX/VEX data providers"""
    
    def __init__(self, api_key: Optional[str] = None):
        self.api_key = api_key
        self.session: Optional[aiohttp.ClientSession] = None
        
    async def __aenter__(self):
        self.session = aiohttp.ClientSession()
        return self
        
    async def __aexit__(self, exc_type, exc_val, exc_tb):
        if self.session:
            await self.session.close()
            
    async def fetch_gex_data(self, symbol: str) -> Dict:
        """Fetch GEX data for symbol - override in subclass"""
        raise NotImplementedError
        
    async def fetch_vex_data(self, symbol: str) -> Dict:
        """Fetch VEX data for symbol - override in subclass"""
        raise NotImplementedError

class SpotGammaProvider(DataProvider):
    """SpotGamma API integration"""
    
    BASE_URL = "https://api.spotgamma.com/v1"
    
    async def fetch_gex_data(self, symbol: str) -> Dict:
        """Fetch GEX exposure data"""
        url = f"{self.BASE_URL}/gex/{symbol}"
        headers = {"Authorization": f"Bearer {self.api_key}"}
        
        try:
            async with self.session.get(url, headers=headers) as resp:
                if resp.status == 200:
                    return await resp.json()
                else:
                    logger.error(f"SpotGamma GEX error: {resp.status}")
                    return self._mock_gex_data(symbol)
        except Exception as e:
            logger.error(f"SpotGamma fetch error: {e}")
            return self._mock_gex_data(symbol)
    
    async def fetch_vex_data(self, symbol: str) -> Dict:
        """Fetch VEX (vanna) exposure data"""
        url = f"{self.BASE_URL}/vex/{symbol}"
        headers = {"Authorization": f"Bearer {self.api_key}"}
        
        try:
            async with self.session.get(url, headers=headers) as resp:
                if resp.status == 200:
                    return await resp.json()
                else:
                    logger.error(f"SpotGamma VEX error: {resp.status}")
                    return self._mock_vex_data(symbol)
        except Exception as e:
            logger.error(f"SpotGamma fetch error: {e}")
            return self._mock_vex_data(symbol)
    
    def _mock_gex_data(self, symbol: str) -> Dict:
        """Generate realistic mock GEX data for testing"""
        base_price = {"SPX": 6128, "SPY": 685, "QQQ": 528}.get(symbol, 100)
        
        # Generate strike ladder
        strikes = [base_price + (i * 5) for i in range(-20, 21)]
        
        nodes = []
        for strike in strikes:
            # Create realistic GEX distribution
            distance = abs(strike - base_price)
            if distance < 10:
                value = np.random.choice([-1, 1]) * (1000000 - distance * 50000)
            else:
                value = np.random.choice([-1, 1]) * (500000 - distance * 10000)
            
            nodes.append({
                "strike": strike,
                "value": max(-2000000, min(2000000, value)),
                "expiration": "0DTE"
            })
        
        return {
            "symbol": symbol,
            "spot_price": base_price,
            "nodes": nodes,
            "timestamp": datetime.now().isoformat()
        }
    
    def _mock_vex_data(self, symbol: str) -> Dict:
        """Generate realistic mock VEX data for testing"""
        base_price = {"SPX": 6128, "SPY": 685, "QQQ": 528}.get(symbol, 100)
        
        strikes = [base_price + (i * 5) for i in range(-20, 21)]
        
        nodes = []
        for strike in strikes:
            distance = strike - base_price
            # VEX typically skewed
            if distance < 0:
                value = -500000 - abs(distance) * 20000  # Negative VEX below
            else:
                value = 300000 - distance * 15000  # Positive VEX above
            
            nodes.append({
                "strike": strike,
                "value": max(-2000000, min(1000000, value)),
                "expiration": "7DTE"
            })
        
        return {
            "symbol": symbol,
            "spot_price": base_price,
            "nodes": nodes,
            "timestamp": datetime.now().isoformat()
        }

class PolygonProvider(DataProvider):
    """Polygon.io for price data"""
    
    BASE_URL = "https://api.polygon.io/v2"
    
    async def get_current_price(self, symbol: str) -> float:
        """Get real-time price quote"""
        url = f"{self.BASE_URL}/last/trade/{symbol}"
        params = {"apiKey": self.api_key}
        
        try:
            async with self.session.get(url, params=params) as resp:
                if resp.status == 200:
                    data = await resp.json()
                    return data["results"]["p"]
        except Exception as e:
            logger.error(f"Polygon price error: {e}")
        
        # Fallback mock prices
        return {"SPX": 6128.40, "SPY": 685.37, "QQQ": 527.85}.get(symbol, 100)

class PatternDetector:
    """Detect Heatseeker patterns from GEX/VEX data"""
    
    @staticmethod
    def detect_rug_pull(gex_nodes: List[GEXNode], price: float) -> tuple:
        """
        Detect RUG PULL: +GEX (yellow) above -GEX (purple) with no floor
        Returns: (detected: bool, confidence: float, entry: float, target: float)
        """
        # Sort by strike
        sorted_nodes = sorted(gex_nodes, key=lambda x: x.strike)
        
        # Find nodes around current price
        above_price = [n for n in sorted_nodes if n.strike > price]
        below_price = [n for n in sorted_nodes if n.strike < price]
        
        if not above_price or not below_price:
            return False, 0, 0, 0
        
        # Check for +GEX ceiling and -GEX below it
        ceiling = min(above_price, key=lambda x: x.strike)
        floor_candidates = [n for n in below_price if n.value < 0]
        
        if ceiling.value > 0 and floor_candidates:
            # Check if there's a -GEX node right below ceiling
            purple_below = [n for n in above_price if n.value < 0]
            
            if purple_below:
                confidence = min(abs(ceiling.value), abs(purple_below[0].value)) / 1000000
                confidence = min(0.9, confidence)
                
                entry = ceiling.strike
                target = floor_candidates[0].strike if floor_candidates else price - 20
                
                return True, confidence, entry, target
        
        return False, 0, 0, 0
    
    @staticmethod
    def detect_gatekeeper(gex_nodes: List[GEXNode], price: float) -> tuple:
        """
        Detect GATEKEEPER: Large +GEX between price and king node
        """
        sorted_nodes = sorted(gex_nodes, key=lambda x: x.abs_value, reverse=True)
        
        if len(sorted_nodes) < 2:
            return False, 0, 0, 0
        
        king = sorted_nodes[0]
        gatekeeper = sorted_nodes[1]
        
        # Gatekeeper between price and king
        if price < gatekeeper.strike < king.strike or price > gatekeeper.strike > king.strike:
            if gatekeeper.abs_value > king.abs_value * 0.5:
                confidence = gatekeeper.abs_value / king.abs_value
                return True, min(0.85, confidence), gatekeeper.strike, king.strike
        
        return False, 0, 0, 0
    
    @staticmethod
    def detect_floor_bounce(gex_nodes: List[GEXNode], price: float) -> tuple:
        """
        Detect FLOOR BOUNCE: Price approaching major -GEX floor
        """
        floors = [n for n in gex_nodes if n.value < 0 and n.strike < price]
        
        if not floors:
            return False, 0, 0, 0
        
        nearest_floor = max(floors, key=lambda x: x.strike)
        distance = price - nearest_floor.strike
        
        if distance <= 10 and nearest_floor.abs_value > 500000:
            confidence = nearest_floor.abs_value / 2000000
            confidence = min(0.8, confidence * (1 - distance/20))
            
            return True, confidence, nearest_floor.strike, price + 20
        
        return False, 0, 0, 0
    
    @staticmethod
    def detect_whipsaw(gex_nodes: List[GEXNode], price: float) -> tuple:
        """
        Detect WHIPSAW: Two high-value nodes with range between
        """
        sorted_nodes = sorted(gex_nodes, key=lambda x: x.abs_value, reverse=True)
        
        if len(sorted_nodes) < 2:
            return False, 0, 0, 0
        
        top1 = sorted_nodes[0]
        top2 = sorted_nodes[1]
        
        range_size = abs(top1.strike - top2.strike)
        
        # Range between 10-50 points
        if 10 <= range_size <= 50:
            middle_nodes = [n for n in gex_nodes 
                          if min(top1.strike, top2.strike) < n.strike < max(top1.strike, top2.strike)]
            
            if len(middle_nodes) <= 3:  # Few nodes in middle
                confidence = 0.6
                return True, confidence, min(top1.strike, top2.strike), max(top1.strike, top2.strike)
        
        return False, 0, 0, 0
    
    @staticmethod
    def detect_trend(gex_nodes: List[GEXNode], price: float) -> tuple:
        """
        Detect TREND: King node far from spot with clear directional skew
        """
        sorted_nodes = sorted(gex_nodes, key=lambda x: x.abs_value, reverse=True)
        king = sorted_nodes[0]
        
        distance = abs(king.strike - price)
        
        if distance > price * 0.01:  # >1% away
            # Check for directional skew
            above = [n for n in gex_nodes if n.strike > price]
            below = [n for n in gex_nodes if n.strike < price]
            
            above_sum = sum(n.value for n in above)
            below_sum = sum(n.value for n in below)
            
            # Clear skew
            if abs(above_sum - below_sum) > 1000000:
                confidence = 0.7
                direction = "bullish" if king.strike > price else "bearish"
                return True, confidence, price, king.strike
        
        return False, 0, 0, 0
    
    @staticmethod
    def detect_rainbow_road(gex_nodes: List[GEXNode], price: float) -> tuple:
        """
        Detect RAINBOW ROAD: Multiple prominent nodes spread across wide range
        """
        significant = [n for n in gex_nodes if n.abs_value > 500000]
        
        if len(significant) >= 4:
            strikes = [n.strike for n in significant]
            spread = max(strikes) - min(strikes)
            
            if spread > 80:  # Wide spread
                return True, 0.95, 0, 0  # High confidence to AVOID
        
        return False, 0, 0, 0
    
    @classmethod
    def analyze(cls, gex_nodes: List[GEXNode], vex_nodes: List[VEXNode], price: float) -> tuple:
        """Run all pattern detectors and return best match"""
        
        patterns = [
            (PatternType.RUG_PULL, cls.detect_rug_pull),
            (PatternType.GATEKEEPER, cls.detect_gatekeeper),
            (PatternType.FLOOR_BOUNCE, cls.detect_floor_bounce),
            (PatternType.WHIPSAW, cls.detect_whipsaw),
            (PatternType.TREND, cls.detect_trend),
            (PatternType.RAINBOW_ROAD, cls.detect_rainbow_road),
        ]
        
        best_pattern = PatternType.NONE
        best_confidence = 0
        best_entry = 0
        best_target = 0
        
        for pattern_type, detector in patterns:
            detected, confidence, entry, target = detector(gex_nodes, price)
            
            if detected and confidence > best_confidence:
                best_pattern = pattern_type
                best_confidence = confidence
                best_entry = entry
                best_target = target
        
        return best_pattern, best_confidence, best_entry, best_target

class TradingEngine:
    """Main trading analysis engine"""
    
    def __init__(self, provider: DataProvider):
        self.provider = provider
        self.price_provider: Optional[RealTimeDataProvider] = None
        self.subscribers: List[Callable] = []
        self.running = False
        
    def subscribe(self, callback: Callable):
        """Subscribe to analysis updates"""
        self.subscribers.append(callback)
        
    async def analyze_ticker(self, symbol: str) -> TickerData:
        """Analyze single ticker with real prices"""
        # Fetch GEX/VEX data
        gex_data = await self.provider.fetch_gex_data(symbol)
        vex_data = await self.provider.fetch_vex_data(symbol)
        
        # Get REAL price from Yahoo Finance or Polygon
        if self.price_provider:
            real_price = await self.price_provider.get_price(symbol)
            if real_price:
                price = real_price
                logger.info(f"Using real price for {symbol}: {price}")
            else:
                price = gex_data.get("spot_price", 100)
                logger.warning(f"Using fallback price for {symbol}: {price}")
        else:
            price = gex_data.get("spot_price", 100)
        
        # Parse GEX nodes
        gex_nodes = [
            GEXNode(
                strike=n["strike"],
                value=n["value"],
                abs_value=abs(n["value"]),
                expiration=n.get("expiration", "0DTE")
            )
            for n in gex_data.get("nodes", [])
        ]
        
        # Parse VEX nodes
        vex_nodes = [
            VEXNode(
                strike=n["strike"],
                value=n["value"],
                abs_value=abs(n["value"]),
                expiration=n.get("expiration", "7DTE")
            )
            for n in vex_data.get("nodes", [])
        ]
        
        # Find king node
        king = max(gex_nodes, key=lambda x: x.abs_value)
        
        # Find floor/ceiling
        floors = [n for n in gex_nodes if n.value < 0 and n.strike < price]
        ceilings = [n for n in gex_nodes if n.value > 0 and n.strike > price]
        
        floor = max(floors, key=lambda x: x.strike).strike if floors else price - 50
        ceiling = min(ceilings, key=lambda x: x.strike).strike if ceilings else price + 50
        
        # Detect pattern
        pattern, confidence, entry, target = PatternDetector.analyze(gex_nodes, vex_nodes, price)
        
        return TickerData(
            symbol=symbol,
            price=price,
            king_strike=king.strike,
            king_value=king.abs_value,
            gex_nodes=gex_nodes,
            vex_nodes=vex_nodes,
            floor=floor,
            ceiling=ceiling,
            gex_total=sum(n.value for n in gex_nodes),
            vex_total=sum(n.value for n in vex_nodes),
            range_points=ceiling - floor,
            pattern=pattern,
            pattern_confidence=confidence,
            timestamp=datetime.now()
        )
    
    async def analyze_trinity(self) -> TrinityAnalysis:
        """Analyze SPX, SPY, QQQ together"""
        spx = await self.analyze_ticker("SPX")
        spy = await self.analyze_ticker("SPY")
        qqq = await self.analyze_ticker("QQQ")
        
        # Calculate consensus
        tickers = [spx, spy, qqq]
        bullish_count = sum(1 for t in tickers if t.gex_total > 0)
        bearish_count = 3 - bullish_count
        
        if bullish_count == 3:
            consensus = Direction.BULLISH
            score = 1.0
        elif bearish_count == 3:
            consensus = Direction.BEARISH
            score = -1.0
        elif bullish_count == 2:
            consensus = Direction.BULLISH
            score = 0.5
        elif bearish_count == 2:
            consensus = Direction.BEARISH
            score = -0.5
        else:
            consensus = Direction.NEUTRAL
            score = 0.0
        
        alignment = max(bullish_count, bearish_count)
        
        # Build key levels
        key_levels = {
            "ceiling": {"SPX": spx.ceiling, "SPY": spy.ceiling, "QQQ": qqq.ceiling},
            "king_floor": {"SPX": spx.king_strike, "SPY": spy.king_strike, "QQQ": qqq.king_strike},
            "floor": {"SPX": spx.floor, "SPY": spy.floor, "QQQ": qqq.floor},
        }
        
        # Generate recommended play
        recommended_play = self._generate_play(spx, spy, qqq, consensus)
        
        return TrinityAnalysis(
            spx=spx,
            spy=spy,
            qqq=qqq,
            consensus_direction=consensus,
            consensus_score=score,
            alignment_count=alignment,
            key_levels=key_levels,
            recommended_play=recommended_play
        )
    
    def _generate_play(self, spx: TickerData, spy: TickerData, qqq: TickerData, 
                       consensus: Direction) -> Optional[Dict]:
        """Generate recommended trade setup"""
        
        # Check for rainbow road - avoid trading
        if any(t.pattern == PatternType.RAINBOW_ROAD for t in [spx, spy, qqq]):
            return {
                "name": "NO TRADE",
                "description": "Rainbow Road detected - wait for clarity",
                "probability": 0,
                "structure": "Cash"
            }
        
        # All 3 pinned at king
        if all(abs(t.price - t.king_strike) < 5 for t in [spx, spy, qqq]):
            return {
                "name": "Sell the Range",
                "description": "Trinity 3/3 aligned on PIN regime. High-confidence premium sell.",
                "probability": 0.55,
                "structure": "Iron Condor",
                "strikes": {
                    "SPX": spx.king_strike,
                    "SPY": spy.king_strike,
                    "QQQ": qqq.king_strike
                }
            }
        
        # Gatekeeper pattern
        if all(t.pattern == PatternType.GATEKEEPER for t in [spx, spy, qqq]):
            return {
                "name": "Fade the Gatekeeper",
                "description": "All 3 showing gatekeeper resistance. Fade approaches.",
                "probability": 0.65,
                "structure": "Credit Spread",
                "direction": "bearish" if consensus == Direction.BEARISH else "neutral"
            }
        
        # Rug pull detected
        if any(t.pattern == PatternType.RUG_PULL for t in [spx, spy, qqq]):
            return {
                "name": "Rug Pull Short",
                "description": "Negative GEX acceleration setup detected.",
                "probability": 0.70,
                "structure": "Put Debit Spread",
                "direction": "bearish"
            }
        
        return None
    
    async def run_continuous(self, interval_seconds: int = 15):
        """Run continuous analysis loop"""
        self.running = True
        
        while self.running:
            try:
                analysis = await self.analyze_trinity()
                
                # Notify subscribers
                for callback in self.subscribers:
                    try:
                        callback(analysis)
                    except Exception as e:
                        logger.error(f"Subscriber error: {e}")
                
                await asyncio.sleep(interval_seconds)
                
            except Exception as e:
                logger.error(f"Analysis error: {e}")
                await asyncio.sleep(5)
    
    def stop(self):
        """Stop the engine"""
        self.running = False

# WebSocket Server for real-time updates
class WebSocketServer:
    """WebSocket server to push real-time data to frontend"""
    
    def __init__(self, engine: TradingEngine, host: str = "0.0.0.0", port: int = 8765):
        self.engine = engine
        self.host = host
        self.port = port
        self.clients: set = set()
        
    async def register(self, websocket):
        self.clients.add(websocket)
        logger.info(f"Client connected. Total: {len(self.clients)}")
        
    async def unregister(self, websocket):
        self.clients.discard(websocket)
        logger.info(f"Client disconnected. Total: {len(self.clients)}")
        
    async def broadcast(self, message: str):
        if self.clients:
            await asyncio.gather(
                *[client.send(message) for client in self.clients],
                return_exceptions=True
            )
    
    def on_analysis(self, analysis: TrinityAnalysis):
        """Callback for new analysis"""
        # Convert to JSON-serializable format
        data = {
            "timestamp": datetime.now().isoformat(),
            "consensus": {
                "direction": analysis.consensus_direction.value,
                "score": analysis.consensus_score,
                "alignment": analysis.alignment_count
            },
            "tickers": {
                "SPX": self._ticker_to_dict(analysis.spx),
                "SPY": self._ticker_to_dict(analysis.spy),
                "QQQ": self._ticker_to_dict(analysis.qqq)
            },
            "key_levels": analysis.key_levels,
            "recommended_play": analysis.recommended_play
        }
        
        # Schedule broadcast
        asyncio.create_task(self.broadcast(json.dumps(data)))
    
    def _ticker_to_dict(self, ticker: TickerData) -> Dict:
        return {
            "symbol": ticker.symbol,
            "price": float(ticker.price),
            "king_strike": float(ticker.king_strike),
            "king_value": float(ticker.king_value),
            "floor": float(ticker.floor),
            "ceiling": float(ticker.ceiling),
            "gex_total": float(ticker.gex_total),
            "vex_total": float(ticker.vex_total),
            "range_points": float(ticker.range_points),
            "pattern": ticker.pattern.value,
            "pattern_confidence": float(ticker.pattern_confidence),
            "top_gex_nodes": [
                {"strike": float(n.strike), "value": float(n.value)}
                for n in sorted(ticker.gex_nodes, key=lambda x: x.abs_value, reverse=True)[:5]
            ]
        }
    
    async def handler(self, websocket, path):
        await self.register(websocket)
        try:
            async for message in websocket:
                # Handle client messages if needed
                pass
        finally:
            await self.unregister(websocket)
    
    async def start(self):
        """Start WebSocket server"""
        self.engine.subscribe(self.on_analysis)
        
        async with websockets.serve(self.handler, self.host, self.port):
            logger.info(f"WebSocket server started on ws://{self.host}:{self.port}")
            await asyncio.Future()  # Run forever

# Main entry point
async def main():
    """Start the BINARY trading system with real data"""
    
    # Get API keys from environment
    polygon_key = os.getenv("POLYGON_API_KEY")
    
    # Use real-time data provider
    # Tries Polygon first (if key available), falls back to Yahoo Finance
    async with RealTimeDataProvider(polygon_key) as price_provider:
        
        # Initialize main provider with real prices
        provider = SpotGammaProvider(api_key=os.getenv("SPOT_GAMMA_API_KEY"))
        
        async with provider:
            engine = TradingEngine(provider)
            
            # Override mock prices with real prices
            engine.price_provider = price_provider
            
            ws_server = WebSocketServer(engine)
            
            # Start continuous analysis
            analysis_task = asyncio.create_task(engine.run_continuous(interval_seconds=15))
            
            # Start WebSocket server
            try:
                await ws_server.start()
            except asyncio.CancelledError:
                engine.stop()
                analysis_task.cancel()

if __name__ == "__main__":
    asyncio.run(main())
