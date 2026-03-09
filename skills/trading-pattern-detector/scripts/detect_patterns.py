#!/usr/bin/env python3
"""
BINARY Trading Pattern Detector
Detects 8 GEX/VEX patterns: RUG PULL, SLINGSHOT, GATEKEEPER, WHIPSAW, 
BEACHBALL, RAINBOW ROAD, TREND, FLOOR BOUNCE

Usage:
    python detect_patterns.py --input gex_data.json
    cat gex_data.json | python detect_patterns.py
    python detect_patterns.py --input '{"price": 6128, "gex_nodes": [...]}'
"""

import json
import sys
import argparse
from dataclasses import dataclass, asdict
from typing import List, Optional, Dict, Any
from enum import Enum
from datetime import datetime


class PatternType(Enum):
    """The 8 BINARY trading patterns"""
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
    """Trade direction"""
    BULLISH = "bullish"
    BEARISH = "bearish"
    NEUTRAL = "neutral"


@dataclass
class GEXNode:
    """Gamma Exposure node"""
    strike: float
    value: float  # Positive = +GEX (yellow), Negative = -GEX (purple)
    
    @property
    def abs_value(self) -> float:
        return abs(self.value)


@dataclass
class VEXNode:
    """Vanna Exposure node"""
    strike: float
    value: float
    
    @property
    def abs_value(self) -> float:
        return abs(self.value)


@dataclass
class PatternResult:
    """Complete pattern detection result"""
    pattern: PatternType
    confidence: float
    direction: Direction
    entry: float
    stop: float
    target: float
    risk_reward: float
    king_strike: float
    floor: float
    ceiling: float
    symbol: str = ""
    timestamp: str = ""
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary for JSON serialization"""
        return {
            "pattern": self.pattern.value,
            "confidence": round(self.confidence, 2),
            "direction": self.direction.value,
            "entry": round(self.entry, 2),
            "stop": round(self.stop, 2),
            "target": round(self.target, 2),
            "risk_reward": round(self.risk_reward, 2),
            "king_strike": round(self.king_strike, 2),
            "floor": round(self.floor, 2),
            "ceiling": round(self.ceiling, 2),
            "symbol": self.symbol,
            "timestamp": self.timestamp or datetime.now().isoformat()
        }


class PatternDetector:
    """Detect BINARY trading patterns from GEX/VEX data"""
    
    # Thresholds
    SIGNIFICANT_GEX = 500000  # Minimum GEX value to be significant
    HIGH_GEX = 1000000        # High-value GEX threshold
    MAX_CONFIDENCE = 0.95     # Cap confidence at this level
    
    @classmethod
    def detect_rug_pull(cls, gex_nodes: List[GEXNode], price: float) -> tuple:
        """
        RUG PULL: +GEX (yellow) above -GEX (purple) with no floor
        Bearish setup - price likely to drop through purple
        
        Detection:
        - Find +GEX ceiling above current price
        - Check for -GEX (purple) right below the ceiling
        - Verify no strong floor support below
        
        Returns: (detected, confidence, entry, target, stop)
        """
        sorted_nodes = sorted(gex_nodes, key=lambda x: x.strike)
        
        above_price = [n for n in sorted_nodes if n.strike > price]
        below_price = [n for n in sorted_nodes if n.strike < price]
        
        if not above_price or not below_price:
            return False, 0, 0, 0, 0
        
        # Find +GEX ceiling (yellow above price)
        yellow_above = [n for n in above_price if n.value > cls.SIGNIFICANT_GEX]
        if not yellow_above:
            return False, 0, 0, 0, 0
        
        ceiling = min(yellow_above, key=lambda x: x.strike)
        
        # Find -GEX (purple) between price and ceiling
        purple_between = [n for n in above_price 
                         if n.value < -cls.SIGNIFICANT_GEX 
                         and n.strike < ceiling.strike]
        
        if not purple_between:
            return False, 0, 0, 0, 0
        
        # Check for weak floor below
        floors_below = [n for n in below_price if n.value < -cls.SIGNIFICANT_GEX]
        
        # Calculate confidence based on GEX values
        confidence = min(abs(ceiling.value), abs(purple_between[0].value)) / cls.HIGH_GEX
        confidence = min(cls.MAX_CONFIDENCE, confidence)
        
        # Entry at ceiling, target at nearest floor or 20 points down
        entry = ceiling.strike
        if floors_below:
            target = max(floors_below, key=lambda x: x.strike).strike
        else:
            target = price - 20
        
        stop = ceiling.strike + 15  # Stop above ceiling
        
        return True, confidence, entry, target, stop
    
    @classmethod
    def detect_slingshot(cls, gex_nodes: List[GEXNode], price: float) -> tuple:
        """
        SLINGSHOT: Inverse rug setup - floor below, ceiling above
        Bullish setup - price likely to bounce off floor toward ceiling
        
        Detection:
        - Strong -GEX floor below current price
        - +GEX ceiling above floor
        - Price near the floor level
        """
        sorted_nodes = sorted(gex_nodes, key=lambda x: x.strike)
        
        below_price = [n for n in sorted_nodes if n.strike < price]
        above_price = [n for n in sorted_nodes if n.strike > price]
        
        if not below_price or not above_price:
            return False, 0, 0, 0, 0
        
        # Find strong -GEX floor
        floors = [n for n in below_price if n.value < -cls.SIGNIFICANT_GEX]
        if not floors:
            return False, 0, 0, 0, 0
        
        nearest_floor = max(floors, key=lambda x: x.strike)
        distance_to_floor = price - nearest_floor.strike
        
        # Price should be near floor (within 15 points)
        if distance_to_floor > 15:
            return False, 0, 0, 0, 0
        
        # Find +GEX ceiling above
        ceilings = [n for n in above_price if n.value > cls.SIGNIFICANT_GEX]
        if not ceilings:
            return False, 0, 0, 0, 0
        
        nearest_ceiling = min(ceilings, key=lambda x: x.strike)
        
        # Calculate confidence
        confidence = min(abs(nearest_floor.value), abs(nearest_ceiling.value)) / cls.HIGH_GEX
        confidence = min(cls.MAX_CONFIDENCE - 0.1, confidence)  # Slightly lower max
        
        entry = nearest_floor.strike
        target = nearest_ceiling.strike
        stop = nearest_floor.strike - 10
        
        return True, confidence, entry, target, stop
    
    @classmethod
    def detect_gatekeeper(cls, gex_nodes: List[GEXNode], price: float) -> tuple:
        """
        GATEKEEPER: Large +GEX wall between price and king node
        Neutral setup - fade the gatekeeper
        
        Detection:
        - King node is highest abs GEX
        - Gatekeeper is second highest, between price and king
        - Gatekeeper value > 50% of king value
        """
        sorted_nodes = sorted(gex_nodes, key=lambda x: x.abs_value, reverse=True)
        
        if len(sorted_nodes) < 2:
            return False, 0, 0, 0, 0
        
        king = sorted_nodes[0]
        
        # Find gatekeeper candidates between price and king
        for node in sorted_nodes[1:]:
            # Check if node is between price and king
            is_between = (price < node.strike < king.strike) or (price > node.strike > king.strike)
            
            if is_between and node.abs_value > king.abs_value * 0.5:
                confidence = node.abs_value / king.abs_value
                confidence = min(0.85, confidence)
                
                entry = node.strike
                target = king.strike
                stop = node.strike + (10 if king.strike > node.strike else -10)
                
                return True, confidence, entry, target, stop
        
        return False, 0, 0, 0, 0
    
    @classmethod
    def detect_whipsaw(cls, gex_nodes: List[GEXNode], price: float) -> tuple:
        """
        WHIPSAW: Range-bound with two high-value nodes
        Neutral setup - sell the range
        
        Detection:
        - Two high-value nodes forming a range
        - Range size between 10-50 points
        - Few nodes in the middle (clean range)
        """
        sorted_nodes = sorted(gex_nodes, key=lambda x: x.abs_value, reverse=True)
        
        if len(sorted_nodes) < 2:
            return False, 0, 0, 0, 0
        
        top1 = sorted_nodes[0]
        top2 = sorted_nodes[1]
        
        # Both must be significant
        if top1.abs_value < cls.SIGNIFICANT_GEX or top2.abs_value < cls.SIGNIFICANT_GEX:
            return False, 0, 0, 0, 0
        
        range_size = abs(top1.strike - top2.strike)
        
        # Range between 10-50 points
        if not (10 <= range_size <= 50):
            return False, 0, 0, 0, 0
        
        # Check for few nodes in middle
        lower_strike = min(top1.strike, top2.strike)
        upper_strike = max(top1.strike, top2.strike)
        
        middle_nodes = [n for n in gex_nodes 
                       if lower_strike < n.strike < upper_strike 
                       and n.abs_value > cls.SIGNIFICANT_GEX * 0.5]
        
        if len(middle_nodes) > 3:
            return False, 0, 0, 0, 0
        
        confidence = 0.6
        entry = (top1.strike + top2.strike) / 2  # Middle of range
        target = lower_strike if price > entry else upper_strike
        stop = upper_strike if price > entry else lower_strike
        
        return True, confidence, entry, target, stop
    
    @classmethod
    def detect_beachball(cls, gex_nodes: List[GEXNode], price: float) -> tuple:
        """
        BEACHBALL: Deep -GEX reversal zone
        Bullish setup - price bounces off deep negative GEX
        
        Detection:
        - Very deep -GEX node (> 1.5M)
        - Price approaching or at the node
        - Strong reversal potential
        """
        deep_floors = [n for n in gex_nodes 
                      if n.value < -1500000 and n.strike <= price]
        
        if not deep_floors:
            return False, 0, 0, 0, 0
        
        deepest = max(deep_floors, key=lambda x: x.abs_value)
        distance = price - deepest.strike
        
        # Price should be near the deep floor
        if distance > 20:
            return False, 0, 0, 0, 0
        
        confidence = min(0.75, abs(deepest.value) / 2000000)
        
        entry = deepest.strike
        target = price + 30  # Bounce target
        stop = deepest.strike - 15
        
        return True, confidence, entry, target, stop
    
    @classmethod
    def detect_floor_bounce(cls, gex_nodes: List[GEXNode], price: float) -> tuple:
        """
        FLOOR BOUNCE: Price approaching major -GEX support
        Bullish setup - bounce off support
        
        Detection:
        - -GEX floor below current price
        - Price within 10 points of floor
        - Floor has significant value (> 500K)
        """
        floors = [n for n in gex_nodes 
                 if n.value < -cls.SIGNIFICANT_GEX and n.strike < price]
        
        if not floors:
            return False, 0, 0, 0, 0
        
        nearest_floor = max(floors, key=lambda x: x.strike)
        distance = price - nearest_floor.strike
        
        if distance > 10:
            return False, 0, 0, 0, 0
        
        confidence = nearest_floor.abs_value / 2000000
        confidence = min(0.8, confidence * (1 - distance / 20))
        
        entry = nearest_floor.strike
        target = price + 20
        stop = nearest_floor.strike - 10
        
        return True, confidence, entry, target, stop
    
    @classmethod
    def detect_trend(cls, gex_nodes: List[GEXNode], price: float) -> tuple:
        """
        TREND: King node far from spot with clear directional skew
        Directional setup - follow the trend to king
        
        Detection:
        - King node > 1% away from current price
        - Clear directional skew in GEX distribution
        """
        sorted_nodes = sorted(gex_nodes, key=lambda x: x.abs_value, reverse=True)
        king = sorted_nodes[0]
        
        distance = abs(king.strike - price)
        distance_pct = distance / price
        
        if distance_pct < 0.01:  # Less than 1% away
            return False, 0, 0, 0, 0
        
        # Check for directional skew
        above = [n for n in gex_nodes if n.strike > price]
        below = [n for n in gex_nodes if n.strike < price]
        
        above_sum = sum(n.value for n in above)
        below_sum = sum(n.value for n in below)
        
        # Need clear skew
        skew = abs(above_sum - below_sum)
        if skew < 1000000:
            return False, 0, 0, 0, 0
        
        confidence = 0.7
        
        if king.strike > price:
            direction = Direction.BULLISH
            entry = price
            target = king.strike
            stop = price - (distance * 0.3)
        else:
            direction = Direction.BEARISH
            entry = price
            target = king.strike
            stop = price + (distance * 0.3)
        
        return True, confidence, entry, target, stop
    
    @classmethod
    def detect_rainbow_road(cls, gex_nodes: List[GEXNode], price: float) -> tuple:
        """
        RAINBOW ROAD: Multiple prominent nodes spread across wide range
        AVOID - No clear setup, too much noise
        
        Detection:
        - 4+ significant nodes (> 500K)
        - Spread > 80 points
        - Indicates choppy, unclear price action
        """
        significant = [n for n in gex_nodes if n.abs_value > cls.SIGNIFICANT_GEX]
        
        if len(significant) < 4:
            return False, 0, 0, 0, 0
        
        strikes = [n.strike for n in significant]
        spread = max(strikes) - min(strikes)
        
        if spread < 80:
            return False, 0, 0, 0, 0
        
        # High confidence to AVOID
        return True, 0.95, 0, 0, 0
    
    @classmethod
    def analyze(cls, gex_nodes: List[GEXNode], vex_nodes: List[VEXNode], 
                price: float, symbol: str = "") -> PatternResult:
        """
        Run all pattern detectors and return best match
        
        Priority order:
        1. RAINBOW_ROAD (avoid signal - highest priority)
        2. RUG_PULL / SLINGSHOT (high conviction directional)
        3. GATEKEEPER / WHIPSAW (neutral setups)
        4. BEACHBALL / FLOOR_BOUNCE (bounce plays)
        5. TREND (directional follow-through)
        """
        
        # Find king, floor, ceiling
        king = max(gex_nodes, key=lambda x: x.abs_value)
        
        floors = [n for n in gex_nodes if n.value < 0 and n.strike < price]
        ceilings = [n for n in gex_nodes if n.value > 0 and n.strike > price]
        
        floor = max(floors, key=lambda x: x.strike).strike if floors else price - 50
        ceiling = min(ceilings, key=lambda x: x.strike).strike if ceilings else price + 50
        
        # Run all detectors
        patterns = [
            (PatternType.RAINBOW_ROAD, cls.detect_rainbow_road, Direction.NEUTRAL),
            (PatternType.RUG_PULL, cls.detect_rug_pull, Direction.BEARISH),
            (PatternType.SLINGSHOT, cls.detect_slingshot, Direction.BULLISH),
            (PatternType.GATEKEEPER, cls.detect_gatekeeper, Direction.NEUTRAL),
            (PatternType.WHIPSAW, cls.detect_whipsaw, Direction.NEUTRAL),
            (PatternType.BEACHBALL, cls.detect_beachball, Direction.BULLISH),
            (PatternType.FLOOR_BOUNCE, cls.detect_floor_bounce, Direction.BULLISH),
            (PatternType.TREND, cls.detect_trend, None),  # Direction determined by detector
        ]
        
        best_pattern = PatternType.NONE
        best_confidence = 0
        best_entry = price
        best_target = price
        best_stop = price
        best_direction = Direction.NEUTRAL
        
        for pattern_type, detector, default_direction in patterns:
            detected, confidence, entry, target, stop = detector(gex_nodes, price)
            
            if detected and confidence > best_confidence:
                best_pattern = pattern_type
                best_confidence = confidence
                best_entry = entry
                best_target = target
                best_stop = stop
                
                # Determine direction
                if pattern_type == PatternType.TREND:
                    # Trend detector returns direction in target logic
                    best_direction = Direction.BULLISH if target > price else Direction.BEARISH
                elif pattern_type == PatternType.RAINBOW_ROAD:
                    best_direction = Direction.NEUTRAL
                else:
                    best_direction = default_direction
        
        # Calculate risk/reward
        risk = abs(best_entry - best_stop)
        reward = abs(best_target - best_entry)
        risk_reward = reward / risk if risk > 0 else 0
        
        return PatternResult(
            pattern=best_pattern,
            confidence=best_confidence,
            direction=best_direction,
            entry=best_entry,
            stop=best_stop,
            target=best_target,
            risk_reward=risk_reward,
            king_strike=king.strike,
            floor=floor,
            ceiling=ceiling,
            symbol=symbol,
            timestamp=datetime.now().isoformat()
        )


def parse_input(data: Dict[str, Any]) -> tuple:
    """Parse JSON input into GEX/VEX nodes and price"""
    
    price = float(data.get("price", 0))
    symbol = data.get("symbol", "")
    
    # Parse GEX nodes
    gex_nodes = []
    for node_data in data.get("gex_nodes", []):
        gex_nodes.append(GEXNode(
            strike=float(node_data["strike"]),
            value=float(node_data["value"])
        ))
    
    # Parse VEX nodes
    vex_nodes = []
    for node_data in data.get("vex_nodes", []):
        vex_nodes.append(VEXNode(
            strike=float(node_data["strike"]),
            value=float(node_data["value"])
        ))
    
    return gex_nodes, vex_nodes, price, symbol


def main():
    parser = argparse.ArgumentParser(
        description="BINARY Trading Pattern Detector",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  python detect_patterns.py --input data.json
  cat data.json | python detect_patterns.py
  python detect_patterns.py --input '{"price": 6128, "gex_nodes": [{"strike": 6100, "value": 1000000}]}'
        """
    )
    parser.add_argument(
        "--input", "-i",
        help="JSON file path or JSON string (use - for stdin)"
    )
    parser.add_argument(
        "--pretty", "-p",
        action="store_true",
        help="Pretty print JSON output"
    )
    
    args = parser.parse_args()
    
    # Read input
    if args.input is None or args.input == "-":
        # Read from stdin
        input_data = sys.stdin.read()
    elif args.input.startswith("{"):
        # Direct JSON string
        input_data = args.input
    else:
        # Read from file
        try:
            with open(args.input, "r") as f:
                input_data = f.read()
        except FileNotFoundError:
            print(f"Error: File not found: {args.input}", file=sys.stderr)
            sys.exit(1)
        except Exception as e:
            print(f"Error reading file: {e}", file=sys.stderr)
            sys.exit(1)
    
    # Parse JSON
    try:
        data = json.loads(input_data)
    except json.JSONDecodeError as e:
        print(f"Error parsing JSON: {e}", file=sys.stderr)
        sys.exit(1)
    
    # Parse input data
    try:
        gex_nodes, vex_nodes, price, symbol = parse_input(data)
    except (KeyError, ValueError) as e:
        print(f"Error parsing input data: {e}", file=sys.stderr)
        sys.exit(1)
    
    if not gex_nodes:
        print("Error: No GEX nodes provided", file=sys.stderr)
        sys.exit(1)
    
    if price <= 0:
        print("Error: Invalid price", file=sys.stderr)
        sys.exit(1)
    
    # Run pattern detection
    result = PatternDetector.analyze(gex_nodes, vex_nodes, price, symbol)
    
    # Output result
    output = result.to_dict()
    if args.pretty:
        print(json.dumps(output, indent=2))
    else:
        print(json.dumps(output))


if __name__ == "__main__":
    main()
