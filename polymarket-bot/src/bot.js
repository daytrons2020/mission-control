const TelegramBot = require('node-telegram-bot-api');
const sqlite3 = require('sqlite3').verbose();
const { open } = require('sqlite');
require('dotenv').config();

const WalletManager = require('./wallet');
const CopyTrader = require('./copytrader');
const SniperMode = require('./sniper');
const { DepositManager, SUPPORTED_CHAINS } = require('./deposits');

class PolymarketBot {
  constructor() {
    this.bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN, { polling: true });
    this.db = null;
    this.walletManager = null;
    this.polymarketAPI = null;
    this.copyTrader = null;
    this.sniper = null;
  }

  async init() {
    // Initialize database
    this.db = await open({
      filename: './bot.db',
      driver: sqlite3.Database
    });

    await this.setupDatabase();

    // Initialize components
    this.walletManager = new WalletManager(this.db, process.env.ENCRYPTION_KEY);
    this.copyTrader = new CopyTrader(this.db, this.walletManager);
    this.sniper = new SniperMode(this.db, this.walletManager);
    this.depositManager = new DepositManager(this.db);

    // Setup command handlers
    this.setupCommands();

    console.log('Bot initialized successfully');
  }

  async setupDatabase() {
    // Wallets table
    await this.db.exec(`
      CREATE TABLE IF NOT EXISTS wallets (
        user_id TEXT PRIMARY KEY,
        address TEXT NOT NULL,
        encrypted_key TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Copy targets table
    await this.db.exec(`
      CREATE TABLE IF NOT EXISTS copy_targets (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id TEXT NOT NULL,
        target_wallet TEXT NOT NULL,
        copy_ratio REAL DEFAULT 1.0,
        max_position REAL DEFAULT 50,
        min_position REAL DEFAULT 1,
        slippage REAL DEFAULT 2,
        enabled INTEGER DEFAULT 1,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id, target_wallet)
      )
    `);

    // Monitor state table
    await this.db.exec(`
      CREATE TABLE IF NOT EXISTS monitor_state (
        wallet TEXT PRIMARY KEY,
        last_trade_timestamp TEXT,
        last_check DATETIME
      )
    `);

    // Trades table
    await this.db.exec(`
      CREATE TABLE IF NOT EXISTS trades (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id TEXT NOT NULL,
        market_id TEXT,
        token_id TEXT,
        amount REAL NOT NULL,
        price REAL NOT NULL,
        side TEXT NOT NULL,
        copied_from TEXT,
        order_id TEXT,
        tx_hash TEXT,
        status TEXT DEFAULT 'pending',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Sniper settings table
    await this.db.exec(`
      CREATE TABLE IF NOT EXISTS sniper_settings (
        user_id TEXT PRIMARY KEY,
        enabled INTEGER DEFAULT 0,
        max_price REAL DEFAULT 0.1,
        time_window INTEGER DEFAULT 30,
        min_liquidity REAL DEFAULT 1000,
        max_market_cap REAL DEFAULT 100000,
        auto_buy INTEGER DEFAULT 0,
        buy_amount REAL DEFAULT 10,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Sniper trades table
    await this.db.exec(`
      CREATE TABLE IF NOT EXISTS sniper_trades (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id TEXT NOT NULL,
        market_id TEXT NOT NULL,
        token_id TEXT,
        price REAL,
        liquidity REAL,
        auto_executed INTEGER DEFAULT 0,
        order_id TEXT,
        status TEXT DEFAULT 'detected',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        executed_at DATETIME
      )
    `);

    // Pending withdrawals table
    await this.db.exec(`
      CREATE TABLE IF NOT EXISTS pending_withdrawals (
        user_id TEXT PRIMARY KEY,
        amount REAL NOT NULL,
        to_address TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);
    await this.db.exec(`
      CREATE TABLE IF NOT EXISTS user_settings (
        user_id TEXT PRIMARY KEY,
        daily_trade_limit INTEGER DEFAULT 50,
        daily_loss_limit REAL DEFAULT 50,
        default_slippage REAL DEFAULT 2,
        withdrawal_whitelist TEXT,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // API credentials table
    await this.db.exec(`
      CREATE TABLE IF NOT EXISTS api_credentials (
        user_id TEXT PRIMARY KEY,
        api_key TEXT NOT NULL,
        secret TEXT NOT NULL,
        passphrase TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Deposit addresses table for multi-chain deposits
    await this.db.exec(`
      CREATE TABLE IF NOT EXISTS deposit_addresses (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id TEXT NOT NULL,
        chain TEXT NOT NULL,
        address TEXT NOT NULL,
        memo TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id, chain)
      )
    `);
  }

  setupCommands() {
    // Set up menu button with web app
    this.bot.setMyCommands([
      { command: 'start', description: '🚀 Start the bot' },
      { command: 'deposit', description: '💰 Deposit funds' },
      { command: 'balance', description: '💳 Check balance' },
      { command: 'copy', description: '👥 Copy trading' },
      { command: 'sniper', description: '🎯 Sniper mode' },
      { command: 'status', description: '📈 Bot status' },
      { command: 'help', description: '❓ Help & commands' }
    ]);

    // Dashboard command - opens web app
    this.bot.onText(/\/dashboard/, async (msg) => {
      const chatId = msg.chat.id;
      const userId = msg.from.id.toString();

      try {
        const address = await this.walletManager.getAddress(userId);
        if (!address) {
          return await this.bot.sendMessage(chatId, '❌ No wallet found. Use /start first.');
        }

        // Create a unique dashboard URL with user token
        // Note: Telegram requires HTTPS for web apps
        const dashboardUrl = process.env.DASHBOARD_URL || 'https://example.com/dashboard';
        
        // For now, send a link instead of web app if not HTTPS
        if (!dashboardUrl.startsWith('https://')) {
          return await this.bot.sendMessage(chatId,
            `📊 *Dashboard*\n\n` +
            `Your dashboard URL:\n` +
            `${dashboardUrl}?user=${userId}\n\n` +
            `Open in browser to manage your trades.`,
            { parse_mode: 'Markdown' }
          );
        }
        
        const token = Buffer.from(`${userId}:${Date.now()}`).toString('base64');
        const fullUrl = `${dashboardUrl}?token=${token}&user=${userId}`;

        await this.bot.sendMessage(chatId,
          `📊 *Dashboard*\n\n` +
          `Click the button below to open your trading dashboard:\n\n` +
          `• View balances\n` +
          `• Manage copy trades\n` +
          `• Deposit/Withdraw\n` +
          `• Track P&L`,
          {
            parse_mode: 'Markdown',
            reply_markup: {
              inline_keyboard: [[
                { text: '📊 Open Dashboard', web_app: { url: fullUrl } }
              ], [
                { text: '💰 Deposit', callback_data: 'deposit_menu' },
                { text: '💳 Balance', callback_data: 'balance_check' }
              ], [
                { text: '👥 Copy Trading', callback_data: 'copy_menu' },
                { text: '🎯 Sniper', callback_data: 'sniper_menu' }
              ]]
            }
          }
        );
      } catch (error) {
        console.error('Dashboard error:', error);
        await this.bot.sendMessage(chatId, '❌ Error opening dashboard');
      }
    });

    // Start command
    this.bot.onText(/\/start/, async (msg) => {
      const chatId = msg.chat.id;
      const userId = msg.from.id.toString();

      try {
        // Check if wallet exists
        let address = await this.walletManager.getAddress(userId);
        
        if (!address) {
          const wallet = await this.walletManager.generateWallet(userId);
          address = wallet.address;
          
          await this.bot.sendMessage(chatId, 
            `🎯 *Welcome to PolyGun Clone Bot!*\n\n` +
            `Your trading wallet has been generated:\n` +
            `\`\`\`\n${address}\n\`\`\`\n\n` +
            `⚠️ *IMPORTANT:* Save this mnemonic phrase (shown once):\n` +
            `\`\`\`\n${wallet.mnemonic}\n\`\`\`\n\n` +
            `Use /dashboard to open your trading dashboard.`,
            { parse_mode: 'Markdown' }
          );
        } else {
          await this.bot.sendMessage(chatId,
            `👋 Welcome back!\n\n` +
            `Your wallet: \`${address}\`\n\n` +
            `Use /dashboard to manage your trades.`,
            { parse_mode: 'Markdown' }
          );
        }
      } catch (error) {
        console.error('Start error:', error);
        await this.bot.sendMessage(chatId, '❌ Error initializing wallet');
      }
    });

    // Deposit command - show options
    this.bot.onText(/\/deposit$/, async (msg) => {
      const chatId = msg.chat.id;
      const userId = msg.from.id.toString();

      try {
        const address = await this.walletManager.getAddress(userId);
        if (!address) {
          return await this.bot.sendMessage(chatId, '❌ No wallet found. Use /start first.');
        }

        const chains = Object.keys(SUPPORTED_CHAINS).join(', ');

        await this.bot.sendMessage(chatId,
          `💰 *Deposit Options*

` +
          `*Direct USDC (Polygon):*
` +
          `\`\`\`\n${address}\n\`\`\`\n\n` +
          `*Or deposit other crypto (auto-converted to USDC):*
` +
          `${chains}\n\n` +
          `Use \`/deposit <chain>\` for specific instructions.\n` +
          `Example: \`/deposit BTC\``,
          { parse_mode: 'Markdown' }
        );
      } catch (error) {
        console.error('Deposit error:', error);
        await this.bot.sendMessage(chatId, '❌ Error getting deposit info');
      }
    });

    // Deposit specific chain
    this.bot.onText(/\/deposit\s+(\w+)/, async (msg, match) => {
      const chatId = msg.chat.id;
      const userId = msg.from.id.toString();
      const chain = match[1].toUpperCase();

      try {
        if (chain === 'USDC' || chain === 'POLYGON') {
          // Show direct USDC deposit
          const address = await this.walletManager.getAddress(userId);
          return await this.bot.sendMessage(chatId,
            `💰 *Deposit USDC (Polygon)*\n\n` +
            `Send USDC to:\n` +
            `\`\`\`\n${address}\n\`\`\`\n\n` +
            `⚠️ *Must be Polygon network (ERC-20)*\n` +
            `Also send 0.5 MATIC for gas fees.`,
            { parse_mode: 'Markdown' }
          );
        }

        // Multi-chain deposit
        const instructions = await this.depositManager.getDepositInstructions(userId, chain);
        await this.bot.sendMessage(chatId, instructions, { parse_mode: 'Markdown' });

      } catch (error) {
        console.error('Deposit chain error:', error);
        await this.bot.sendMessage(chatId, `❌ ${error.message}`);
      }
    });

    // Balance command
    this.bot.onText(/\/balance/, async (msg) => {
      const chatId = msg.chat.id;
      const userId = msg.from.id.toString();

      try {
        const address = await this.walletManager.getAddress(userId);
        if (!address) {
          return await this.bot.sendMessage(chatId, '❌ No wallet found. Use /start first.');
        }

        const [usdcBalance, maticBalance] = await Promise.all([
          this.walletManager.getUSDCBalance(address),
          this.walletManager.getMATICBalance(address)
        ]);

        await this.bot.sendMessage(chatId,
          `💳 *Wallet Balance*\n\n` +
          `Address: \`${address}\`\n\n` +
          `USDC: ${parseFloat(usdcBalance).toFixed(2)}\n` +
          `MATIC: ${parseFloat(maticBalance).toFixed(4)}`,
          { parse_mode: 'Markdown' }
        );
      } catch (error) {
        console.error('Balance error:', error);
        await this.bot.sendMessage(chatId, '❌ Error fetching balance');
      }
    });

    // Withdraw command
    this.bot.onText(/\/withdraw\s+([\d.]+)\s+(0x[a-fA-F0-9]{40})/, async (msg, match) => {
      const chatId = msg.chat.id;
      const userId = msg.from.id.toString();
      const amount = parseFloat(match[1]);
      const toAddress = match[2];

      try {
        // Check balance first
        const address = await this.walletManager.getAddress(userId);
        const balance = await this.walletManager.getUSDCBalance(address);
        
        if (parseFloat(balance) < amount) {
          return await this.bot.sendMessage(chatId, 
            `❌ Insufficient balance.\nAvailable: ${parseFloat(balance).toFixed(2)} USDC\nRequested: ${amount} USDC`);
        }

        // Confirm withdrawal
        await this.bot.sendMessage(chatId,
          `⚠️ *Confirm Withdrawal*\n\n` +
          `Amount: ${amount} USDC\n` +
          `To: \`${toAddress}\`\n` +
          `Network: Polygon\n\n` +
          `Reply with "confirm" to proceed or ignore to cancel.`,
          { parse_mode: 'Markdown' }
        );

        // Store pending withdrawal
        await this.db.run(
          `INSERT OR REPLACE INTO pending_withdrawals (user_id, amount, to_address, created_at)
           VALUES (?, ?, ?, datetime('now'))`,
          [userId, amount, toAddress]
        );

      } catch (error) {
        console.error('Withdraw error:', error);
        await this.bot.sendMessage(chatId, '❌ Error processing withdrawal request');
      }
    });

    // Handle withdrawal confirmation
    this.bot.onText(/confirm/i, async (msg) => {
      const chatId = msg.chat.id;
      const userId = msg.from.id.toString();

      try {
        // Check for pending withdrawal
        const pending = await this.db.get(
          'SELECT * FROM pending_withdrawals WHERE user_id = ?',
          [userId]
        );

        if (!pending) return; // No pending withdrawal

        // Execute withdrawal
        const txHash = await this.walletManager.withdrawUSDC(
          userId, 
          pending.amount, 
          pending.to_address
        );

        // Clear pending
        await this.db.run(
          'DELETE FROM pending_withdrawals WHERE user_id = ?',
          [userId]
        );

        await this.bot.sendMessage(chatId,
          `✅ *Withdrawal Submitted*\n\n` +
          `Amount: ${pending.amount} USDC\n` +
          `To: \`${pending.to_address}\`\n` +
          `Tx: \`${txHash}\`\n\n` +
          `[View on Polygonscan](https://polygonscan.com/tx/${txHash})`,
          { parse_mode: 'Markdown' }
        );

      } catch (error) {
        console.error('Withdraw confirm error:', error);
        await this.bot.sendMessage(chatId, `❌ Withdrawal failed: ${error.message}`);
      }
    });

    // Copy add command
    this.bot.onText(/\/copy add (.+)/, async (msg, match) => {
      const chatId = msg.chat.id;
      const userId = msg.from.id.toString();
      const targetWallet = match[1].trim();

      try {
        // Validate address
        if (!targetWallet.match(/^0x[a-fA-F0-9]{40}$/)) {
          return await this.bot.sendMessage(chatId, '❌ Invalid wallet address');
        }

        await this.copyTrader.addCopyTarget(userId, targetWallet);
        
        await this.bot.sendMessage(chatId,
          `✅ Now copying: \`${targetWallet}\`\n\n` +
          `Use /copy list to see all targets.`,
          { parse_mode: 'Markdown' }
        );
      } catch (error) {
        console.error('Copy add error:', error);
        await this.bot.sendMessage(chatId, '❌ Error adding copy target');
      }
    });

    // Copy list command
    this.bot.onText(/\/copy list/, async (msg) => {
      const chatId = msg.chat.id;
      const userId = msg.from.id.toString();

      try {
        const targets = await this.copyTrader.getCopyTargets(userId);
        
        if (targets.length === 0) {
          return await this.bot.sendMessage(chatId, 
            '📋 No copy targets set.\n\nUse `/copy add <wallet>` to start copying.'
          );
        }

        let message = '📋 *Your Copy Targets*\n\n';
        for (const target of targets) {
          const status = target.enabled ? '🟢' : '🔴';
          message += `${status} \`${target.target_wallet}\`\n`;
          message += `   Ratio: ${target.copy_ratio}x | Max: $${target.max_position}\n\n`;
        }

        await this.bot.sendMessage(chatId, message, { parse_mode: 'Markdown' });
      } catch (error) {
        console.error('Copy list error:', error);
        await this.bot.sendMessage(chatId, '❌ Error fetching copy targets');
      }
    });

    // Copy remove command
    this.bot.onText(/\/copy remove (.+)/, async (msg, match) => {
      const chatId = msg.chat.id;
      const userId = msg.from.id.toString();
      const targetWallet = match[1].trim();

      try {
        await this.copyTrader.removeCopyTarget(userId, targetWallet);
        await this.bot.sendMessage(chatId, `✅ Stopped copying: \`${targetWallet}\``, 
          { parse_mode: 'Markdown' });
      } catch (error) {
        console.error('Copy remove error:', error);
        await this.bot.sendMessage(chatId, '❌ Error removing copy target');
      }
    });

    // Sniper on/off
    this.bot.onText(/\/sniper (on|off)/, async (msg, match) => {
      const chatId = msg.chat.id;
      const userId = msg.from.id.toString();
      const enabled = match[1] === 'on';

      try {
        await this.sniper.setEnabled(userId, enabled);
        await this.bot.sendMessage(chatId, 
          enabled ? '🎯 Sniper mode *ENABLED*' : '🛑 Sniper mode *DISABLED*',
          { parse_mode: 'Markdown' }
        );
      } catch (error) {
        console.error('Sniper toggle error:', error);
        await this.bot.sendMessage(chatId, '❌ Error toggling sniper mode');
      }
    });

    // Status command
    this.bot.onText(/\/status/, async (msg) => {
      const chatId = msg.chat.id;
      const userId = msg.from.id.toString();

      try {
        const address = await this.walletManager.getAddress(userId);
        const [usdcBalance, targets, sniperSettings] = await Promise.all([
          address ? this.walletManager.getUSDCBalance(address) : '0',
          this.copyTrader.getCopyTargets(userId),
          this.sniper.getSettings(userId)
        ]);

        const message = 
          `📊 *Bot Status*\n\n` +
          `💰 Balance: ${parseFloat(usdcBalance).toFixed(2)} USDC\n` +
          `👥 Copy Targets: ${targets.filter(t => t.enabled).length} active\n` +
          `🎯 Sniper: ${sniperSettings.enabled ? 'ON' : 'OFF'}\n\n` +
          `Use /history for recent trades`;

        await this.bot.sendMessage(chatId, message, { parse_mode: 'Markdown' });
      } catch (error) {
        console.error('Status error:', error);
        await this.bot.sendMessage(chatId, '❌ Error fetching status');
      }
    });

    // Kill switch
    this.bot.onText(/\/kill/, async (msg) => {
      const chatId = msg.chat.id;
      const userId = msg.from.id.toString();

      try {
        // Disable all copy targets
        const targets = await this.copyTrader.getCopyTargets(userId);
        for (const target of targets) {
          await this.db.run(
            'UPDATE copy_targets SET enabled = 0 WHERE user_id = ? AND target_wallet = ?',
            [userId, target.target_wallet]
          );
        }

        // Disable sniper
        await this.sniper.setEnabled(userId, false);

        await this.bot.sendMessage(chatId,
          `🛑 *EMERGENCY STOP ACTIVATED*\n\n` +
          `All copy trading and sniper mode have been disabled.\n` +
          `Your funds are safe in your wallet.`,
          { parse_mode: 'Markdown' }
        );
      } catch (error) {
        console.error('Kill error:', error);
        await this.bot.sendMessage(chatId, '❌ Error during emergency stop');
      }
    });

    // Help command
    this.bot.onText(/\/help/, async (msg) => {
      const chatId = msg.chat.id;
      
      await this.bot.sendMessage(chatId,
        `🎯 *PolyGun Clone Bot*\n\n` +
        `*Main Commands:*\n` +
        `/start - Initialize wallet\n` +
        `/deposit - Deposit funds\n` +
        `/balance - Check balance\n\n` +
        `*Trading:*\n` +
        `/copy add <wallet> - Copy a wallet\n` +
        `/copy list - List copy targets\n` +
        `/sniper on/off - Toggle sniper mode\n\n` +
        `*Info:*\n` +
        `/status - Bot status\n` +
        `/history - Recent trades\n` +
        `/kill - Emergency stop\n\n` +
        `*Note:* Web dashboard requires HTTPS setup.`,
        { parse_mode: 'Markdown' }
      );
    });
  }

  async start() {
    await this.init();
    console.log('Bot is running...');
  }

  async stop() {
    this.copyTrader.stopAll();
    this.sniper.stop();
    await this.db.close();
    console.log('Bot stopped');
  }
}

// Start the bot
const bot = new PolymarketBot();
bot.start().catch(console.error);

// Graceful shutdown
process.on('SIGINT', () => bot.stop().then(() => process.exit(0)));
process.on('SIGTERM', () => bot.stop().then(() => process.exit(0)));
