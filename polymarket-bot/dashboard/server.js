const express = require('express');
const path = require('path');
const https = require('https');
const fs = require('fs');
const sqlite3 = require('sqlite3').verbose();
const { open } = require('sqlite');

const app = express();
const PORT = process.env.DASHBOARD_PORT || 3000;
const HTTPS_PORT = process.env.DASHBOARD_HTTPS_PORT || 3443;

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, 'web')));

// Database connection
let db;
async function initDb() {
  db = await open({
    filename: path.join(__dirname, '..', 'bot.db'),
    driver: sqlite3.Database
  });
}

// API Routes

// Get user wallet info
app.get('/api/wallet/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    
    const wallet = await db.get(
      'SELECT address, created_at FROM wallets WHERE user_id = ?',
      [userId]
    );
    
    if (!wallet) {
      return res.status(404).json({ error: 'Wallet not found' });
    }
    
    res.json({
      address: wallet.address,
      createdAt: wallet.created_at
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get copy targets
app.get('/api/copy-targets/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    
    const targets = await db.all(
      `SELECT target_wallet, copy_ratio, max_position, min_position, 
              slippage, enabled, created_at
       FROM copy_targets WHERE user_id = ?`,
      [userId]
    );
    
    res.json(targets);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Add copy target
app.post('/api/copy-targets/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { targetWallet, copyRatio, maxPosition, minPosition } = req.body;
    
    await db.run(
      `INSERT OR REPLACE INTO copy_targets 
       (user_id, target_wallet, copy_ratio, max_position, min_position, enabled, created_at)
       VALUES (?, ?, ?, ?, ?, 1, datetime('now'))`,
      [userId, targetWallet.toLowerCase(), copyRatio || 1.0, maxPosition || 50, minPosition || 1]
    );
    
    res.json({ success: true, message: 'Copy target added' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Remove copy target
app.delete('/api/copy-targets/:userId/:targetWallet', async (req, res) => {
  try {
    const { userId, targetWallet } = req.params;
    
    await db.run(
      'DELETE FROM copy_targets WHERE user_id = ? AND target_wallet = ?',
      [userId, targetWallet.toLowerCase()]
    );
    
    res.json({ success: true, message: 'Copy target removed' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get trade history
app.get('/api/trades/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const limit = parseInt(req.query.limit) || 50;
    
    const trades = await db.all(
      `SELECT * FROM trades 
       WHERE user_id = ? 
       ORDER BY created_at DESC 
       LIMIT ?`,
      [userId, limit]
    );
    
    res.json(trades);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get sniper settings
app.get('/api/sniper/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    
    const settings = await db.get(
      `SELECT enabled, max_price, time_window, min_liquidity, 
              max_market_cap, auto_buy, buy_amount
       FROM sniper_settings WHERE user_id = ?`,
      [userId]
    );
    
    res.json(settings || {
      enabled: false,
      max_price: 0.1,
      time_window: 30,
      min_liquidity: 1000,
      max_market_cap: 100000,
      auto_buy: false,
      buy_amount: 10
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update sniper settings
app.post('/api/sniper/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { enabled, maxPrice, timeWindow, minLiquidity, autoBuy, buyAmount } = req.body;
    
    await db.run(
      `INSERT OR REPLACE INTO sniper_settings 
       (user_id, enabled, max_price, time_window, min_liquidity, auto_buy, buy_amount, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now'))`,
      [userId, enabled ? 1 : 0, maxPrice, timeWindow, minLiquidity, autoBuy ? 1 : 0, buyAmount]
    );
    
    res.json({ success: true, message: 'Sniper settings updated' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Serve the main dashboard page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'web', 'index.html'));
});

// Start server
async function start() {
  await initDb();
  
  // Try to start HTTPS server with self-signed cert
  try {
    const keyPath = path.join(__dirname, 'ssl', 'key.pem');
    const certPath = path.join(__dirname, 'ssl', 'cert.pem');
    
    if (fs.existsSync(keyPath) && fs.existsSync(certPath)) {
      const httpsOptions = {
        key: fs.readFileSync(keyPath),
        cert: fs.readFileSync(certPath)
      };
      
      https.createServer(httpsOptions, app).listen(HTTPS_PORT, () => {
        console.log(`Dashboard HTTPS server running on port ${HTTPS_PORT}`);
      });
    } else {
      console.log('SSL certificates not found, running HTTP only');
    }
  } catch (error) {
    console.log('HTTPS setup failed:', error.message);
  }
  
  // Always start HTTP server
  app.listen(PORT, () => {
    console.log(`Dashboard HTTP server running on port ${PORT}`);
    console.log(`Open: http://localhost:${PORT}`);
  });
}

start().catch(console.error);
