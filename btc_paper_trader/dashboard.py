"""
Performance Dashboard for the Bitcoin Paper Trading Bot.
Provides real-time monitoring of trading performance.
"""

import os
import json
import logging
from datetime import datetime, timedelta
from typing import Dict, List, Any, Optional
from dataclasses import dataclass
from collections import defaultdict

import pandas as pd
import numpy as np
from flask import Flask, render_template_string, jsonify
from flask_socketio import SocketIO, emit

from config import config

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Flask app
app = Flask(__name__)
app.config['SECRET_KEY'] = 'paper-trading-bot-secret'
socketio = SocketIO(app, cors_allowed_origins="*")


# HTML Template for the dashboard
DASHBOARD_TEMPLATE = """
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Bitcoin Paper Trading Bot - Dashboard</title>
    <script src="https://cdn.socket.io/4.5.4/socket.io.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: #0a0e27;
            color: #fff;
            min-height: 100vh;
        }
        
        .header {
            background: linear-gradient(135deg, #1a1f3a 0%, #0a0e27 100%);
            padding: 20px 40px;
            border-bottom: 1px solid #2a3050;
        }
        
        .header h1 {
            font-size: 24px;
            color: #00d4ff;
        }
        
        .header .subtitle {
            color: #8b92b9;
            font-size: 14px;
            margin-top: 5px;
        }
        
        .container {
            padding: 30px 40px;
            max-width: 1400px;
            margin: 0 auto;
        }
        
        .stats-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 20px;
            margin-bottom: 30px;
        }
        
        .stat-card {
            background: linear-gradient(135deg, #1a1f3a 0%, #151929 100%);
            border-radius: 12px;
            padding: 20px;
            border: 1px solid #2a3050;
            transition: transform 0.2s, box-shadow 0.2s;
        }
        
        .stat-card:hover {
            transform: translateY(-2px);
            box-shadow: 0 10px 30px rgba(0, 212, 255, 0.1);
        }
        
        .stat-card .label {
            color: #8b92b9;
            font-size: 12px;
            text-transform: uppercase;
            letter-spacing: 1px;
            margin-bottom: 8px;
        }
        
        .stat-card .value {
            font-size: 28px;
            font-weight: 700;
            color: #fff;
        }
        
        .stat-card .value.positive {
            color: #00d4aa;
        }
        
        .stat-card .value.negative {
            color: #ff4757;
        }
        
        .stat-card .change {
            font-size: 12px;
            margin-top: 5px;
        }
        
        .chart-container {
            background: linear-gradient(135deg, #1a1f3a 0%, #151929 100%);
            border-radius: 12px;
            padding: 20px;
            border: 1px solid #2a3050;
            margin-bottom: 20px;
        }
        
        .chart-container h3 {
            color: #00d4ff;
            margin-bottom: 15px;
            font-size: 16px;
        }
        
        .trades-table {
            background: linear-gradient(135deg, #1a1f3a 0%, #151929 100%);
            border-radius: 12px;
            border: 1px solid #2a3050;
            overflow: hidden;
        }
        
        .trades-table h3 {
            padding: 20px;
            color: #00d4ff;
            font-size: 16px;
            border-bottom: 1px solid #2a3050;
        }
        
        .trades-table table {
            width: 100%;
            border-collapse: collapse;
        }
        
        .trades-table th {
            background: #0f1322;
            color: #8b92b9;
            font-size: 12px;
            text-transform: uppercase;
            letter-spacing: 1px;
            padding: 12px 20px;
            text-align: left;
        }
        
        .trades-table td {
            padding: 12px 20px;
            border-bottom: 1px solid #2a3050;
            font-size: 14px;
        }
        
        .trades-table tr:hover {
            background: #1e2440;
        }
        
        .badge {
            padding: 4px 10px;
            border-radius: 4px;
            font-size: 11px;
            font-weight: 600;
        }
        
        .badge.buy {
            background: rgba(0, 212, 170, 0.2);
            color: #00d4aa;
        }
        
        .badge.sell {
            background: rgba(255, 71, 87, 0.2);
            color: #ff4757;
        }
        
        .badge.profit {
            background: rgba(0, 212, 170, 0.2);
            color: #00d4aa;
        }
        
        .badge.loss {
            background: rgba(255, 71, 87, 0.2);
            color: #ff4757;
        }
        
        .status-indicator {
            display: inline-flex;
            align-items: center;
            gap: 8px;
            padding: 8px 16px;
            background: rgba(0, 212, 170, 0.1);
            border-radius: 20px;
            font-size: 12px;
        }
        
        .status-indicator .dot {
            width: 8px;
            height: 8px;
            background: #00d4aa;
            border-radius: 50%;
            animation: pulse 2s infinite;
        }
        
        @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.5; }
        }
        
        .grid-2 {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 20px;
        }
        
        @media (max-width: 768px) {
            .grid-2 {
                grid-template-columns: 1fr;
            }
            
            .stats-grid {
                grid-template-columns: 1fr;
            }
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>📈 Bitcoin Paper Trading Bot</h1>
        <div class="subtitle">
            <span class="status-indicator">
                <span class="dot"></span>
                Live Monitoring
            </span>
            <span style="margin-left: 20px;">{{ symbol }} | {{ timeframe }}</span>
        </div>
    </div>
    
    <div class="container">
        <div class="stats-grid">
            <div class="stat-card">
                <div class="label">Current Balance</div>
                <div class="value" id="current-balance">$10,000.00</div>
                <div class="change" id="balance-change">+0.00%</div>
            </div>
            
            <div class="stat-card">
                <div class="label">Total P&L</div>
                <div class="value" id="total-pnl">$0.00</div>
                <div class="change" id="pnl-percent">0.00%</div>
            </div>
            
            <div class="stat-card">
                <div class="label">Win Rate</div>
                <div class="value" id="win-rate">0%</div>
                <div class="change" id="trades-count">0 trades</div>
            </div>
            
            <div class="stat-card">
                <div class="label">Max Drawdown</div>
                <div class="value negative" id="max-drawdown">0.00%</div>
                <div class="change">Peak to trough</div>
            </div>
            
            <div class="stat-card">
                <div class="label">Profit Factor</div>
                <div class="value" id="profit-factor">0.00</div>
                <div class="change">Gross Profit / Loss</div>
            </div>
            
            <div class="stat-card">
                <div class="label">Sharpe Ratio</div>
                <div class="value" id="sharpe-ratio">0.00</div>
                <div class="change">Risk-adjusted return</div>
            </div>
        </div>
        
        <div class="grid-2">
            <div class="chart-container">
                <h3>📊 Equity Curve</h3>
                <canvas id="equity-chart"></canvas>
            </div>
            
            <div class="chart-container">
                <h3>📉 Drawdown</h3>
                <canvas id="drawdown-chart"></canvas>
            </div>
        </div>
        
        <div class="trades-table">
            <h3>📝 Recent Trades</h3>
            <table>
                <thead>
                    <tr>
                        <th>Time</th>
                        <th>Side</th>
                        <th>Entry Price</th>
                        <th>Exit Price</th>
                        <th>P&L</th>
                        <th>Exit Reason</th>
                    </tr>
                </thead>
                <tbody id="trades-body">
                    <tr>
                        <td colspan="6" style="text-align: center; color: #8b92b9;">No trades yet</td>
                    </tr>
                </tbody>
            </table>
        </div>
    </div>
    
    <script>
        const socket = io();
        let equityChart, drawdownChart;
        
        // Initialize charts
        function initCharts() {
            const equityCtx = document.getElementById('equity-chart').getContext('2d');
            equityChart = new Chart(equityCtx, {
                type: 'line',
                data: {
                    labels: [],
                    datasets: [{
                        label: 'Equity',
                        data: [],
                        borderColor: '#00d4ff',
                        backgroundColor: 'rgba(0, 212, 255, 0.1)',
                        fill: true,
                        tension: 0.4
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: true,
                    plugins: {
                        legend: { display: false }
                    },
                    scales: {
                        x: {
                            grid: { color: '#2a3050' },
                            ticks: { color: '#8b92b9' }
                        },
                        y: {
                            grid: { color: '#2a3050' },
                            ticks: { color: '#8b92b9' }
                        }
                    }
                }
            });
            
            const drawdownCtx = document.getElementById('drawdown-chart').getContext('2d');
            drawdownChart = new Chart(drawdownCtx, {
                type: 'line',
                data: {
                    labels: [],
                    datasets: [{
                        label: 'Drawdown %',
                        data: [],
                        borderColor: '#ff4757',
                        backgroundColor: 'rgba(255, 71, 87, 0.1)',
                        fill: true,
                        tension: 0.4
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: true,
                    plugins: {
                        legend: { display: false }
                    },
                    scales: {
                        x: {
                            grid: { color: '#2a3050' },
                            ticks: { color: '#8b92b9' }
                        },
                        y: {
                            grid: { color: '#2a3050' },
                            ticks: { color: '#8b92b9' }
                        }
                    }
                }
            });
        }
        
        // Update dashboard with new data
        function updateDashboard(data) {
            // Update stats
            document.getElementById('current-balance').textContent = 
                '$' + data.balance.toLocaleString('en-US', {minimumFractionDigits: 2});
            
            const pnlElement = document.getElementById('total-pnl');
            pnlElement.textContent = (data.total_pnl >= 0 ? '+' : '') + 
                '$' + Math.abs(data.total_pnl).toLocaleString('en-US', {minimumFractionDigits: 2});
            pnlElement.className = 'value ' + (data.total_pnl >= 0 ? 'positive' : 'negative');
            
            document.getElementById('pnl-percent').textContent = 
                (data.total_return >= 0 ? '+' : '') + data.total_return.toFixed(2) + '%';
            
            document.getElementById('win-rate').textContent = data.win_rate.toFixed(1) + '%';
            document.getElementById('trades-count').textContent = data.total_trades + ' trades';
            
            document.getElementById('max-drawdown').textContent = data.max_drawdown.toFixed(2) + '%';
            document.getElementById('profit-factor').textContent = data.profit_factor.toFixed(2);
            document.getElementById('sharpe-ratio').textContent = data.sharpe_ratio.toFixed(2);
            
            // Update charts
            if (data.equity_curve && data.equity_curve.length > 0) {
                equityChart.data.labels = data.equity_curve.map(p => 
                    new Date(p.timestamp).toLocaleDateString());
                equityChart.data.datasets[0].data = data.equity_curve.map(p => p.equity);
                equityChart.update();
                
                drawdownChart.data.labels = data.equity_curve.map(p => 
                    new Date(p.timestamp).toLocaleDateString());
                drawdownChart.data.datasets[0].data = data.equity_curve.map(p => p.drawdown * 100);
                drawdownChart.update();
            }
            
            // Update trades table
            if (data.trades && data.trades.length > 0) {
                const tbody = document.getElementById('trades-body');
                tbody.innerHTML = data.trades.slice(-10).reverse().map(trade => `
                    <tr>
                        <td>${new Date(trade.exit_time).toLocaleString()}</td>
                        <td><span class="badge ${trade.side.toLowerCase()}">${trade.side}</span></td>
                        <td>$${trade.entry_price.toFixed(2)}</td>
                        <td>$${trade.exit_price.toFixed(2)}</td>
                        <td><span class="badge ${trade.pnl >= 0 ? 'profit' : 'loss'}">
                            ${trade.pnl >= 0 ? '+' : ''}$${Math.abs(trade.pnl).toFixed(2)}
                        </span></td>
                        <td>${trade.exit_reason}</td>
                    </tr>
                `).join('');
            }
        }
        
        // Socket events
        socket.on('connect', function() {
            console.log('Connected to dashboard server');
        });
        
        socket.on('update', function(data) {
            updateDashboard(data);
        });
        
        // Initialize
        initCharts();
        
        // Request initial data
        fetch('/api/stats')
            .then(res => res.json())
            .then(data => updateDashboard(data));
    </script>
</body>
</html>
"""


class Dashboard:
    """
    Performance Dashboard for monitoring trading bot.
    
    Features:
    - Real-time statistics via WebSocket
    - Equity curve visualization
    - Trade history table
    - Key performance metrics
    """
    
    def __init__(self):
        self.trades_file = None
        self.equity_curve = []
        self.last_update = None
    
    def find_latest_trades_file(self) -> Optional[str]:
        """Find the most recent trades file."""
        trades_dir = 'data/trades'
        if not os.path.exists(trades_dir):
            return None
        
        files = [f for f in os.listdir(trades_dir) if f.startswith('trades_') and f.endswith('.json')]
        if not files:
            return None
        
        files.sort(reverse=True)
        return os.path.join(trades_dir, files[0])
    
    def load_trades(self) -> List[Dict]:
        """Load trades from file."""
        trades_file = self.find_latest_trades_file()
        if not trades_file:
            return []
        
        try:
            with open(trades_file, 'r') as f:
                return json.load(f)
        except Exception as e:
            logger.error(f"Error loading trades: {e}")
            return []
    
    def load_backtest_results(self) -> Optional[Dict]:
        """Load backtest results if available."""
        historical_dir = 'data/historical'
        if not os.path.exists(historical_dir):
            return None
        
        files = [f for f in os.listdir(historical_dir) if f.startswith('backtest_') and f.endswith('.json')]
        if not files:
            return None
        
        files.sort(reverse=True)
        latest_file = os.path.join(historical_dir, files[0])
        
        try:
            with open(latest_file, 'r') as f:
                return json.load(f)
        except Exception as e:
            logger.error(f"Error loading backtest results: {e}")
            return None
    
    def calculate_stats(self) -> Dict[str, Any]:
        """Calculate current statistics."""
        trades = self.load_trades()
        backtest = self.load_backtest_results()
        
        if backtest and not trades:
            # Use backtest data
            metrics = backtest.get('metrics', {})
            return {
                'balance': metrics.get('final_balance', config.trading.initial_balance),
                'total_pnl': metrics.get('total_pnl', 0),
                'total_return': metrics.get('total_return_percent', 0),
                'win_rate': metrics.get('win_rate', 0),
                'total_trades': metrics.get('total_trades', 0),
                'max_drawdown': metrics.get('max_drawdown_percent', 0),
                'profit_factor': metrics.get('profit_factor', 0),
                'sharpe_ratio': metrics.get('sharpe_ratio', 0),
                'trades': backtest.get('trades', []),
                'equity_curve': backtest.get('equity_curve', [])
            }
        
        if not trades:
            return {
                'balance': config.trading.initial_balance,
                'total_pnl': 0,
                'total_return': 0,
                'win_rate': 0,
                'total_trades': 0,
                'max_drawdown': 0,
                'profit_factor': 0,
                'sharpe_ratio': 0,
                'trades': [],
                'equity_curve': []
            }
        
        # Calculate from live trades
        winning_trades = [t for t in trades if t.get('pnl', 0) > 0]
        losing_trades = [t for t in trades if t.get('pnl', 0) <= 0]
        
        total_pnl = sum(t.get('pnl', 0) for t in trades)
        balance = config.trading.initial_balance + total_pnl
        
        gross_profit = sum(t.get('pnl', 0) for t in winning_trades)
        gross_loss = abs(sum(t.get('pnl', 0) for t in losing_trades))
        
        return {
            'balance': balance,
            'total_pnl': total_pnl,
            'total_return': (total_pnl / config.trading.initial_balance) * 100,
            'win_rate': (len(winning_trades) / len(trades) * 100) if trades else 0,
            'total_trades': len(trades),
            'max_drawdown': 0,  # Would need equity curve for accurate calculation
            'profit_factor': gross_profit / gross_loss if gross_loss > 0 else 0,
            'sharpe_ratio': 0,  # Would need returns series
            'trades': trades,
            'equity_curve': []
        }


dashboard = Dashboard()


@app.route('/')
def index():
    """Render dashboard."""
    return render_template_string(
        DASHBOARD_TEMPLATE,
        symbol=config.trading.symbol,
        timeframe=config.trading.timeframe
    )


@app.route('/api/stats')
def get_stats():
    """Get current statistics."""
    return jsonify(dashboard.calculate_stats())


@socketio.on('connect')
def handle_connect():
    """Handle client connection."""
    logger.info('Client connected to dashboard')
    emit('update', dashboard.calculate_stats())


def broadcast_update():
    """Broadcast update to all connected clients."""
    stats = dashboard.calculate_stats()
    socketio.emit('update', stats)


def run_dashboard():
    """Run the dashboard server."""
    logger.info(f"Starting dashboard on http://{config.dashboard.host}:{config.dashboard.port}")
    socketio.run(
        app,
        host=config.dashboard.host,
        port=config.dashboard.port,
        debug=False,
        use_reloader=False
    )


if __name__ == '__main__':
    run_dashboard()
