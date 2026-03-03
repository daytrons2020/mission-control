// BINARY GEX Server - Node.js/Express
// Adds GEX API endpoints and dashboard to the trading system

const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = 8081; // Different port from Python server

// Middleware
app.use(express.json());
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Serve static files from frontend directory
app.use(express.static(path.join(__dirname, 'frontend')));

// In-memory storage for live extension data
const liveDataStore = new Map();
const dataHistory = [];
const MAX_HISTORY = 1000;

// ===== API ENDPOINTS =====

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    service: 'BINARY GEX Server'
  });
});

// GEX data endpoint - returns mock GEX data for testing
app.get('/api/gex', (req, res) => {
  const { ticker = 'SPY', expiry = 'nearest' } = req.query;
  
  // Generate realistic GEX data
  const strikes = [];
  const currentPrice = ticker === 'SPY' ? 687.35 : ticker === 'QQQ' ? 607.87 : 6890.11;
  const baseStrike = Math.round(currentPrice / (ticker === 'SPX' ? 50 : 5)) * (ticker === 'SPX' ? 50 : 5);
  
  for (let i = -20; i <= 20; i++) {
    const strike = baseStrike + (i * (ticker === 'SPX' ? 50 : 5));
    const distance = Math.abs(strike - currentPrice);
    const gex = Math.exp(-distance / 30) * (Math.random() * 1000000 + 500000) * (i % 2 === 0 ? 1 : -1);
    
    strikes.push({
      strike,
      gex: Math.round(gex),
      callGex: gex > 0 ? Math.round(gex) : 0,
      putGex: gex < 0 ? Math.round(Math.abs(gex)) : 0,
      gamma: Math.abs(gex) / 1000000
    });
  }

  res.json({
    ticker: ticker.toUpperCase(),
    expiry,
    currentPrice: currentPrice.toFixed(2),
    timestamp: new Date().toISOString(),
    data: strikes,
    zeroGamma: baseStrike,
    maxPain: baseStrike + (Math.random() * 10 - 5)
  });
});

// Historical GEX data
app.get('/api/gex/historical', (req, res) => {
  const { ticker = 'SPY', days = 30 } = req.query;
  const history = [];
  
  for (let i = days; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    
    history.push({
      date: date.toISOString().split('T')[0],
      zeroGamma: ticker === 'SPY' ? 680 + Math.random() * 20 : ticker === 'QQQ' ? 600 + Math.random() * 20 : 6850 + Math.random() * 100,
      maxPain: ticker === 'SPY' ? 685 + Math.random() * 15 : ticker === 'QQQ' ? 605 + Math.random() * 15 : 6875 + Math.random() * 50,
      totalGex: (Math.random() * 20000000 - 10000000).toFixed(0)
    });
  }

  res.json({
    ticker: ticker.toUpperCase(),
    days: parseInt(days),
    data: history
  });
});

// Real-time price
app.get('/api/price', (req, res) => {
  const { ticker = 'SPY' } = req.query;
  
  const basePrices = {
    'SPY': 687.35,
    'SPX': 6890.11,
    'QQQ': 607.87
  };
  
  const basePrice = basePrices[ticker.toUpperCase()] || 450;
  
  res.json({
    ticker: ticker.toUpperCase(),
    price: (basePrice + (Math.random() * 2 - 1)).toFixed(2),
    change: (Math.random() * 10 - 5).toFixed(2),
    changePercent: (Math.random() * 2 - 1).toFixed(2),
    timestamp: new Date().toISOString()
  });
});

// ===== LIVE DATA RECEIVER FROM EXTENSION =====

// POST endpoint to receive live data from Chrome extension
app.post('/api/gex-data', (req, res) => {
  try {
    const data = req.body;
    
    // Validate required fields
    if (!data.ticker) {
      return res.status(400).json({ error: 'Missing ticker' });
    }

    // Add metadata
    const enrichedData = {
      ...data,
      receivedAt: new Date().toISOString(),
      id: Date.now() + Math.random().toString(36).substr(2, 9)
    };

    // Store latest data for this ticker
    liveDataStore.set(data.ticker.toUpperCase(), enrichedData);

    // Add to history
    dataHistory.push(enrichedData);
    if (dataHistory.length > MAX_HISTORY) {
      dataHistory.shift();
    }

    res.json({ 
      success: true, 
      message: 'Data received',
      ticker: data.ticker,
      timestamp: enrichedData.receivedAt
    });
  } catch (error) {
    console.error('Error processing gex-data:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET endpoint to retrieve latest live data for a ticker
app.get('/api/gex-data', (req, res) => {
  const { ticker } = req.query;
  
  if (ticker) {
    const data = liveDataStore.get(ticker.toUpperCase());
    if (!data) {
      return res.status(404).json({ error: 'No data for ticker: ' + ticker });
    }
    return res.json(data);
  }
  
  // Return all tickers if no specific ticker requested
  const allData = {};
  liveDataStore.forEach((value, key) => {
    allData[key] = value;
  });
  
  res.json({
    tickers: Object.keys(allData),
    count: liveDataStore.size,
    data: allData
  });
});

// GET endpoint for data history
app.get('/api/gex-data/history', (req, res) => {
  const { ticker, limit = 100 } = req.query;
  
  let filtered = dataHistory;
  if (ticker) {
    filtered = dataHistory.filter(d => d.ticker?.toUpperCase() === ticker.toUpperCase());
  }
  
  const limited = filtered.slice(-parseInt(limit));
  
  res.json({
    ticker: ticker || 'all',
    count: limited.length,
    data: limited
  });
});

// GET endpoint for connection status
app.get('/api/gex-data/status', (req, res) => {
  const tickers = Array.from(liveDataStore.keys());
  const lastUpdates = {};
  
  tickers.forEach(ticker => {
    const data = liveDataStore.get(ticker);
    lastUpdates[ticker] = {
      lastReceived: data.receivedAt,
      secondsAgo: Math.floor((Date.now() - new Date(data.receivedAt).getTime()) / 1000)
    };
  });
  
  res.json({
    status: 'active',
    connectedTickers: tickers,
    totalDataPoints: dataHistory.length,
    lastUpdates
  });
});

// ===== DASHBOARD =====

// Serve the GEX dashboard HTML
app.get('/gex-dashboard', (req, res) => {
  const dashboardPath = path.join(__dirname, 'frontend', 'gex-dashboard.html');
  if (fs.existsSync(dashboardPath)) {
    res.sendFile(dashboardPath);
  } else {
    res.sendFile(path.join(__dirname, 'frontend', 'index.html'));
  }
});

// Redirect root to main dashboard
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'frontend', 'index.html'));
});

// Start server
app.listen(PORT, () => {
  console.log(`✅ BINARY GEX Server running on port ${PORT}`);
  console.log('');
  console.log('📊 API Endpoints:');
  console.log(`   GET  http://localhost:${PORT}/api/health`);
  console.log(`   GET  http://localhost:${PORT}/api/gex?ticker=SPY`);
  console.log(`   GET  http://localhost:${PORT}/api/gex/historical?ticker=SPY&days=30`);
  console.log(`   GET  http://localhost:${PORT}/api/price?ticker=SPY`);
  console.log(`   POST http://localhost:${PORT}/api/gex-data          ← Extension sends data here`);
  console.log(`   GET  http://localhost:${PORT}/api/gex-data?ticker=SPY`);
  console.log(`   GET  http://localhost:${PORT}/api/gex-data/history`);
  console.log(`   GET  http://localhost:${PORT}/api/gex-data/status`);
  console.log(`   GET  http://localhost:${PORT}/gex-dashboard`);
  console.log('');
  console.log('🌐 Cloudflare URL: https://friday-gordon-cgi-elected.trycloudflare.com');
});
