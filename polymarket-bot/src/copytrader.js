const { PolymarketCLOB } = require('./clob');

class CopyTrader {
  constructor(db, walletManager) {
    this.db = db;
    this.walletManager = walletManager;
    this.activeMonitors = new Map();
    this.clobClients = new Map(); // userId -> PolymarketCLOB
  }

  // Get or create CLOB client for user
  async getClobClient(userId) {
    if (this.clobClients.has(userId)) {
      return this.clobClients.get(userId);
    }

    const wallet = await this.walletManager.getWallet(userId);
    if (!wallet) throw new Error('Wallet not found');

    const clob = new PolymarketCLOB(wallet);
    
    // Try to get stored credentials or generate new ones
    const credentials = await this.db.get(
      'SELECT api_key, secret, passphrase FROM api_credentials WHERE user_id = ?',
      [userId]
    );

    if (credentials) {
      clob.setCredentials(credentials.api_key, credentials.secret, credentials.passphrase);
    } else {
      // Generate new credentials
      const creds = await clob.generateApiCredentials();
      await this.db.run(
        'INSERT INTO api_credentials (user_id, api_key, secret, passphrase, created_at) VALUES (?, ?, ?, ?, datetime("now"))',
        [userId, creds.apiKey, creds.secret, creds.passphrase]
      );
    }

    this.clobClients.set(userId, clob);
    return clob;
  }

  // Add wallet to copy list
  async addCopyTarget(userId, targetWallet, settings = {}) {
    const defaultSettings = {
      copyRatio: 1.0,        // 1:1 copy ratio
      maxPositionSize: 50,   // Max $ per trade
      minPositionSize: 1,    // Min $ per trade
      slippageTolerance: 2,  // 2% slippage
      enabled: true
    };

    const finalSettings = { ...defaultSettings, ...settings };

    await this.db.run(
      `INSERT OR REPLACE INTO copy_targets 
       (user_id, target_wallet, copy_ratio, max_position, min_position, slippage, enabled, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now'))`,
      [userId, targetWallet.toLowerCase(), finalSettings.copyRatio, 
       finalSettings.maxPositionSize, finalSettings.minPositionSize, 
       finalSettings.slippageTolerance, finalSettings.enabled]
    );

    // Start monitoring if not already
    if (!this.activeMonitors.has(targetWallet.toLowerCase())) {
      this.startMonitoring(targetWallet.toLowerCase());
    }

    return finalSettings;
  }

  // Remove wallet from copy list
  async removeCopyTarget(userId, targetWallet) {
    await this.db.run(
      'DELETE FROM copy_targets WHERE user_id = ? AND target_wallet = ?',
      [userId, targetWallet.toLowerCase()]
    );

    // Check if anyone else is monitoring this wallet
    const stillWatching = await this.db.get(
      'SELECT COUNT(*) as count FROM copy_targets WHERE target_wallet = ?',
      [targetWallet.toLowerCase()]
    );

    if (stillWatching.count === 0) {
      this.stopMonitoring(targetWallet.toLowerCase());
    }
  }

  // Get user's copy targets
  async getCopyTargets(userId) {
    return await this.db.all(
      `SELECT target_wallet, copy_ratio, max_position, min_position, 
              slippage, enabled, created_at
       FROM copy_targets WHERE user_id = ?`,
      [userId]
    );
  }

  // Start monitoring a wallet
  startMonitoring(walletAddress) {
    if (this.activeMonitors.has(walletAddress)) return;

    console.log(`Starting monitor for ${walletAddress}`);
    
    // Poll every 10 seconds for new trades
    const interval = setInterval(async () => {
      await this.checkForNewTrades(walletAddress);
    }, 10000);

    this.activeMonitors.set(walletAddress, interval);
  }

  // Stop monitoring a wallet
  stopMonitoring(walletAddress) {
    const interval = this.activeMonitors.get(walletAddress);
    if (interval) {
      clearInterval(interval);
      this.activeMonitors.delete(walletAddress);
      console.log(`Stopped monitor for ${walletAddress}`);
    }
  }

  // Check for new trades from monitored wallet
  async checkForNewTrades(walletAddress) {
    try {
      // Get last checked trade timestamp
      const lastCheck = await this.db.get(
        'SELECT last_trade_timestamp FROM monitor_state WHERE wallet = ?',
        [walletAddress]
      );

      // Use first user's CLOB client to check trades (any will work for reading)
      const sampleUser = await this.db.get(
        'SELECT user_id FROM copy_targets WHERE target_wallet = ? LIMIT 1',
        [walletAddress.toLowerCase()]
      );
      
      if (!sampleUser) return;

      const clob = await this.getClobClient(sampleUser.user_id);
      const trades = await clob.getUserTrades(walletAddress);
      
      if (!trades || trades.length === 0) return;

      const lastTimestamp = lastCheck ? parseInt(lastCheck.last_trade_timestamp) : 0;
      const newTrades = trades.filter(t => parseInt(t.timestamp) > lastTimestamp);

      if (newTrades.length > 0) {
        // Update last checked
        const newestTimestamp = Math.max(...trades.map(t => parseInt(t.timestamp)));
        await this.db.run(
          `INSERT OR REPLACE INTO monitor_state (wallet, last_trade_timestamp, last_check) 
           VALUES (?, ?, datetime('now'))`,
          [walletAddress, newestTimestamp.toString()]
        );

        // Process new trades (oldest first)
        for (const trade of newTrades.reverse()) {
          await this.processCopyTrade(walletAddress, trade);
        }
      }
    } catch (error) {
      console.error(`Error checking trades for ${walletAddress}:`, error);
    }
  }

  // Process copy trade for all users following this wallet
  async processCopyTrade(targetWallet, trade) {
    const followers = await this.db.all(
      `SELECT user_id, copy_ratio, max_position, min_position, slippage, enabled
       FROM copy_targets WHERE target_wallet = ? AND enabled = 1`,
      [targetWallet.toLowerCase()]
    );

    for (const follower of followers) {
      try {
        await this.executeCopyTrade(follower, trade);
      } catch (error) {
        console.error(`Copy trade failed for user ${follower.user_id}:`, error);
      }
    }
  }

  // Execute the actual copy trade
  async executeCopyTrade(follower, trade) {
    const { user_id, copy_ratio, max_position, min_position } = follower;

    // Check daily limits
    const dailyStats = await this.getDailyStats(user_id);
    if (dailyStats.trades >= parseInt(process.env.MAX_DAILY_TRADES || 50)) {
      throw new Error('Daily trade limit reached');
    }
    if (dailyStats.loss >= parseFloat(process.env.MAX_DAILY_LOSS || 50)) {
      throw new Error('Daily loss limit reached');
    }

    // Calculate position size
    const originalSize = parseFloat(trade.size || trade.amount || 0);
    let copySize = originalSize * copy_ratio;

    // Apply min/max limits
    copySize = Math.max(min_position, Math.min(max_position, copySize));

    // Check balance
    const clob = await this.getClobClient(user_id);
    const balance = await clob.getBalance(await this.walletManager.getAddress(user_id));
    const availableBalance = parseFloat(balance?.available || 0);
    
    if (availableBalance < copySize) {
      throw new Error('Insufficient balance');
    }

    // Get orderbook to determine price
    const orderbook = await clob.getOrderbook(trade.token_id || trade.asset_id);
    const price = trade.side === 'BUY' 
      ? parseFloat(orderbook.asks?.[0]?.price || trade.price)
      : parseFloat(orderbook.bids?.[0]?.price || trade.price);

    // Place order via CLOB
    const result = await clob.placeOrder(
      trade.token_id || trade.asset_id,
      trade.side,
      price,
      copySize
    );

    // Log the trade
    await this.db.run(
      `INSERT INTO trades 
       (user_id, market_id, token_id, amount, price, side, 
        copied_from, order_id, status, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))`,
      [user_id, trade.market_id || trade.condition_id, trade.token_id || trade.asset_id, 
       copySize, price, trade.side, follower.target_wallet, 
       result.orderId || result.id, 'placed']
    );

    console.log(`Copy trade placed: ${result.orderId || result.id}`);
    return result;
  }

  // Get daily trading stats
  async getDailyStats(userId) {
    const today = new Date().toISOString().split('T')[0];
    
    const stats = await this.db.get(
      `SELECT 
        COUNT(*) as trades,
        COALESCE(SUM(CASE WHEN side = 'SELL' THEN amount * price ELSE 0 END), 0) -
        COALESCE(SUM(CASE WHEN side = 'BUY' THEN amount * price ELSE 0 END), 0) as pnl
       FROM trades 
       WHERE user_id = ? AND date(created_at) = ?`,
      [userId, today]
    );

    return {
      trades: stats.trades || 0,
      pnl: stats.pnl || 0,
      loss: Math.min(0, stats.pnl || 0) * -1
    };
  }

  // Stop all monitoring
  stopAll() {
    for (const [wallet, interval] of this.activeMonitors) {
      clearInterval(interval);
    }
    this.activeMonitors.clear();
  }
}

module.exports = CopyTrader;
