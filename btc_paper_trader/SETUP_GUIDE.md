# Binance Testnet Setup Guide

This guide will walk you through setting up a Binance Testnet account and obtaining API keys for paper trading.

## What is Binance Testnet?

Binance Testnet is a sandbox environment that simulates the real Binance exchange. It uses fake/test funds, allowing you to test trading strategies without risking real money.

## Step 1: Create a Binance Account (Optional)

While not strictly required for Testnet, having a real Binance account can be helpful for:
- Understanding the platform
- Accessing additional resources
- Eventually moving to live trading

Visit: https://www.binance.com to create an account.

## Step 2: Access Binance Testnet

1. Go to https://testnet.binance.vision/
2. Click on "Generate HMAC_SHA256 Key"
3. Log in with your Binance account or create a Testnet-specific account

## Step 3: Generate API Keys

1. Once logged in to the Testnet portal, click "Generate New Key"
2. Give your key a descriptive name (e.g., "PaperTradingBot")
3. **Important**: Enable the following permissions:
   - ✅ Enable Reading (for market data)
   - ✅ Enable Spot & Margin Trading (for paper trading)
   - ❌ Enable Withdrawals (not needed for paper trading)
4. Click "Create"
5. **Save your API Key and Secret immediately** - the secret will only be shown once!

## Step 4: Get Testnet Funds

1. On the Testnet portal, look for "Deposit" or "Faucet"
2. Select the asset you want (e.g., USDT, BTC)
3. Enter the amount of test funds you need
4. Click "Submit" or "Request Funds"
5. Funds should appear in your Testnet account within minutes

### Available Test Assets

Common test assets available on Binance Testnet:
- **USDT** - Recommended base currency for trading
- **BTC** - For BTC/USDT trading pairs
- **ETH** - For ETH/USDT trading pairs
- **BNB** - For BNB pairs and fee discounts

**Recommended starting allocation:**
- 10,000 USDT (test)
- 0.5 BTC (test)

## Step 5: Configure Your Bot

1. Copy the `.env.example` file to `.env`:
   ```bash
   cp .env.example .env
   ```

2. Edit the `.env` file and add your credentials:
   ```bash
   # Binance Testnet API Credentials
   BINANCE_TESTNET_API_KEY=your_api_key_here
   BINANCE_TESTNET_SECRET_KEY=your_secret_key_here
   
   # Trading Pair
   TRADING_SYMBOL=BTCUSDT
   
   # Risk Management
   RISK_PER_TRADE=0.01  # 1% risk per trade
   
   # Strategy Parameters
   EMA_FAST=9
   EMA_SLOW=21
   RSI_PERIOD=14
   RSI_OVERBOUGHT=70
   RSI_OVERSOLD=30
   ATR_PERIOD=14
   ATR_MULTIPLIER_SL=1.5
   ATR_MULTIPLIER_TP=3.0
   ```

3. Replace `your_api_key_here` and `your_secret_key_here` with your actual Testnet credentials.

## Step 6: Verify Connection

Run the connection test to verify your API keys work:

```bash
python test_connection.py
```

You should see output confirming:
- API connection successful
- Account balance (test funds)
- Server time synchronization

## Step 7: Start Paper Trading

Once everything is configured:

```bash
# Start the paper trading bot
python bot.py

# Or start with the dashboard
python dashboard.py
```

## Troubleshooting

### API Key Issues

**Error: "Invalid API Key"**
- Ensure you're using Testnet keys, not live Binance keys
- Check that the keys are copied correctly (no extra spaces)
- Verify the keys haven't been deleted or expired

**Error: "Timestamp is outside the recvWindow"**
- Your system clock may be out of sync
- Run: `sudo ntpdate -s time.google.com` (Linux/Mac)
- Or enable time sync in Windows settings

### Connection Issues

**Error: "Connection refused" or timeout**
- Check your internet connection
- Verify Binance Testnet is operational: https://testnet.binance.vision/status
- Check if your firewall is blocking the connection

### Insufficient Funds

**Error: "Account has insufficient balance"**
- Request more test funds from the Testnet faucet
- Check that you're trading on the Testnet, not mainnet
- Verify the correct trading pair is configured

## Security Best Practices

1. **Never share your API keys** - Treat them like passwords
2. **Use Testnet keys only** - Never use live trading keys for testing
3. **Store keys securely** - Use environment variables, never hardcode in scripts
4. **Rotate keys regularly** - Generate new keys periodically
5. **Limit permissions** - Only enable permissions you actually need
6. **Monitor usage** - Check API key usage in the Testnet portal

## Next Steps

1. ✅ Complete this setup guide
2. ✅ Run the backtester to validate your strategy
3. ✅ Start paper trading with the bot
4. ✅ Monitor performance via the dashboard
5. ⏳ After consistent profitability, consider live trading (with caution!)

## Additional Resources

- [Binance Testnet Portal](https://testnet.binance.vision/)
- [Binance API Documentation](https://binance-docs.github.io/apidocs/spot/en/)
- [python-binance Documentation](https://python-binance.readthedocs.io/)
- [Binance API Telegram Group](https://t.me/binance_api_english)

## Support

If you encounter issues:
1. Check the troubleshooting section above
2. Review the logs in `logs/bot.log`
3. Consult the Binance API documentation
4. Open an issue in the project repository
