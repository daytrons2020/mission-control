# Polymarket Trading Bot

A Telegram-based automated trading bot for Polymarket prediction markets.

## Features
- In-bot wallet generation and management
- Copy trading from whale wallets
- Sniper mode for new markets
- Risk management and stop losses
- Real-time P&L tracking

## Setup

1. Create a Telegram bot via @BotFather
2. Copy `.env.example` to `.env` and fill in your credentials
3. Run `npm install`
4. Run `npm start`

## Commands
- `/start` - Initialize bot and generate wallet
- `/deposit` - Show deposit address
- `/balance` - Check USDC and MATIC balance
- `/withdraw <amount> <address>` - Withdraw funds
- `/copy add <wallet>` - Add wallet to copy
- `/copy list` - List copied wallets
- `/copy remove <wallet>` - Remove wallet from copy list
- `/settings` - Configure trading parameters
- `/status` - Show current positions and P&L
- `/history` - Show recent trades
- `/sniper on/off` - Toggle sniper mode
- `/kill` - Emergency stop all trading

## Architecture

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│  Telegram   │───▶│  Bot Core   │───▶│  In-Bot     │
│  Interface  │◀───│  (Node.js)  │◀───│  Wallet     │
└─────────────┘    └──────┬──────┘    └─────────────┘
                          │
         ┌────────────────┼────────────────┐
         ▼                ▼                ▼
   ┌──────────┐    ┌──────────┐    ┌──────────┐
   │  Wallet  │    │  Trade   │    │   Risk   │
   │  Monitor │    │  Engine  │    │  Manager │
   └──────────┘    └──────────┘    └──────────┘
```

## Security Notes
- Private keys are encrypted at rest
- Withdrawal whitelist for security
- Emergency kill switch
- Daily loss limits
