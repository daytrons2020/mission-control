const { PolymarketCLOB } = require('./clob');

class SniperMode {
  constructor(db, walletManager) {
    this.db = db;
    this.walletManager = walletManager;
    this.isRunning = false;
    this.interval = null;
    this.clobClients = new Map();
  }

  // Get or create CLOB client for user
  async getClobClient(userId) {
    if (this.clobClients.has(userId)) {
      return this.clobClients.get(userId);
    }

    const wallet = await this.walletManager.getWallet(userId);
    if (!wallet) throw new Error('Wallet not found');

    const clob = new PolymarketCLOB(wallet);
    
    const credentials = await this.db.get(
      'SELECT api_key, secret, passphrase FROM api_credentials WHERE user_id = ?',
      [userId]
    );

    if (credentials) {
      clob.setCredentials(credentials.api_key, credentials.secret, credentials.passphrase);
    } else {
      const creds = await clob.generateApiCredentials();
      await this.db.run(
        'INSERT INTO api_credentials (user_id, api_key, secret, passphrase, created_at) VALUES (?, ?, ?, ?, datetime("now"))',
        [userId, creds.apiKey, creds.secret, creds.passphrase]
      );
    }

    this.clobClients.set(userId, clob);
    return clob;
  }

  // Enable/disable sniper mode
  async setEnabled(userId, enabled) {
    await this.db.run(
      `INSERT OR REPLACE INTO sniper_settings (user_id, enabled, updated_at)
       VALUES (?, ?, datetime('now'))`,
      [userId, enabled]
    );

    if (enabled) {
      this.start();
    } else {
      this.stop();
    }

    return enabled;
  }

  // Update sniper settings
  async updateSettings(userId, settings) {
    const {
      maxPrice = 0.1,
      timeWindow = 30,
      minLiquidity = 1000,
      maxMarketCap = 100000,
      autoBuy = false,
      buyAmount = 10
    } = settings;

    await this.db.run(
      `INSERT OR REPLACE INTO sniper_settings 
       (user_id, enabled, max_price, time_window, min_liquidity, max_market_cap, auto_buy, buy_amount, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))`,
      [userId, true, maxPrice, timeWindow, minLiquidity, maxMarketCap, autoBuy, buyAmount]
    );

    return settings;
  }

  // Get sniper settings
  async getSettings(userId) {
    const settings = await this.db.get(
      `SELECT enabled, max_price, time_window, min_liquidity, 
              max_market_cap, auto_buy, buy_amount
       FROM sniper_settings WHERE user_id = ?`,
      [userId]
    );

    return settings || {
      enabled: false,
      max_price: 0.1,
      time_window: 30,
      min_liquidity: 1000,
      max_market_cap: 100000,
      auto_buy: false,
      buy_amount: 10
    };
  }

  // Start sniper
  start() {
    if (this.isRunning) return;
    
    console.log('Sniper mode started');
    this.isRunning = true;
    
    // Check for new markets every 30 seconds
    this.interval = setInterval(() => {
      this.scanForOpportunities();
    }, 30000);
  }

  // Stop sniper
  stop() {
    if (!this.isRunning) return;
    
    console.log('Sniper mode stopped');
    this.isRunning = false;
    
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = null;
    }
  }

  // Scan for sniper opportunities
  async scanForOpportunities() {
    try {
      // Get users with sniper enabled
      const sniperUsers = await this.db.all(
        'SELECT * FROM sniper_settings WHERE enabled = 1'
      );

      if (sniperUsers.length === 0) return;

      // Use first user's CLOB to get markets
      const clob = await this.getClobClient(sniperUsers[0].user_id);
      const markets = await clob.getMarkets(true, false);
      
      // Filter for recently created markets (last 30 min)
      const thirtyMinAgo = Math.floor(Date.now() / 1000) - 1800;
      const newMarkets = markets.filter(m => m.created_at > thirtyMinAgo);

      for (const market of newMarkets) {
        for (const user of sniperUsers) {
          try {
            await this.evaluateMarket(user, market);
          } catch (error) {
            console.error(`Sniper error for user ${user.user_id}:`, error);
          }
        }
      }
    } catch (error) {
      console.error('Sniper scan error:', error);
    }
  }

  // Evaluate if a market matches sniper criteria
  async evaluateMarket(userSettings, market) {
    const {
      user_id,
      max_price,
      min_liquidity,
      auto_buy,
      buy_amount
    } = userSettings;

    // Check if already processed
    const processed = await this.db.get(
      'SELECT 1 FROM sniper_trades WHERE user_id = ? AND market_id = ?',
      [user_id, market.condition_id]
    );
    if (processed) return;

    // Get first token from market
    const token = market.tokens?.[0];
    if (!token) return;

    const price = parseFloat(token.price || 0);
    const liquidity = parseFloat(market.volume || 0);

    // Check filters
    if (price > max_price) return;
    if (liquidity < min_liquidity) return;

    // Market matches criteria
    console.log(`Sniper match: ${market.question} at ${price}`);

    // Log opportunity
    await this.db.run(
      `INSERT INTO sniper_trades (user_id, market_id, token_id, price, 
                                  liquidity, auto_executed, created_at)
       VALUES (?, ?, ?, ?, ?, ?, datetime('now'))`,
      [user_id, market.condition_id, token.token_id, price, liquidity, auto_buy]
    );

    // Auto-execute if enabled
    if (auto_buy) {
      await this.executeSniperTrade(user_id, token.token_id, buy_amount, price);
    }

    return {
      market,
      token,
      price,
      executed: auto_buy
    };
  }

  // Execute sniper trade
  async executeSniperTrade(userId, tokenId, amount, price) {
    const clob = await this.getClobClient(userId);
    
    // Check balance
    const address = await this.walletManager.getAddress(userId);
    const balance = await clob.getBalance(address);
    const availableBalance = parseFloat(balance?.available || 0);
    
    if (availableBalance < amount) {
      throw new Error('Insufficient balance');
    }

    // Execute with slight price premium for faster fill
    const executionPrice = price * 1.02; // 2% premium

    const result = await clob.placeOrder(tokenId, 'BUY', executionPrice, amount);

    // Update sniper trade record
    await this.db.run(
      `UPDATE sniper_trades 
       SET order_id = ?, status = 'executed', executed_at = datetime('now')
       WHERE user_id = ? AND token_id = ?`,
      [result.orderId || result.id, userId, tokenId]
    );

    console.log(`Sniper trade placed: ${result.orderId || result.id}`);
    return result;
  }
}

module.exports = SniperMode;
