const { request, gql } = require('graphql-request');
const { ethers } = require('ethers');

class PolymarketAPI {
  constructor() {
    this.graphUrl = process.env.POLYMARKET_GRAPH_URL || 'https://api.thegraph.com/subgraphs/name/polymarket/matic-markets';
    this.rpcUrl = process.env.POLYGON_RPC_URL;
    this.provider = new ethers.JsonRpcProvider(this.rpcUrl);
    
    // CTF Exchange contract (Polymarket's main trading contract)
    this.ctfExchangeAddress = '0x4bFb41d5B3570DeFd03C39a9A4D8dE6Bd8B8982E';
    this.ctfExchangeAbi = [
      'function trade(tuple(bytes32 marketId, uint256 amount, uint256 price, bool side)[] orders) external',
      'function getOrderbook(bytes32 marketId) external view returns (tuple(uint256 price, uint256 amount)[] bids, tuple(uint256 price, uint256 amount)[] asks)'
    ];
  }

  // Get active markets
  async getActiveMarkets(limit = 20) {
    const query = gql`
      query {
        markets(
          where: { active: true, closed: false }
          first: ${limit}
          orderBy: volume
          orderDirection: desc
        ) {
          id
          question
          slug
          volume
          liquidity
          outcomes {
            id
            name
            price
          }
          endDate
        }
      }
    `;

    const data = await request(this.graphUrl, query);
    return data.markets;
  }

  // Get market by ID
  async getMarket(marketId) {
    const query = gql`
      query {
        market(id: "${marketId}") {
          id
          question
          slug
          description
          volume
          liquidity
          active
          closed
          outcomes {
            id
            name
            price
          }
          endDate
        }
      }
    `;

    const data = await request(this.graphUrl, query);
    return data.market;
  }

  // Get recent trades for a wallet
  async getWalletTrades(walletAddress, limit = 50) {
    const query = gql`
      query {
        trades(
          where: { user: "${walletAddress.toLowerCase()}" }
          first: ${limit}
          orderBy: timestamp
          orderDirection: desc
        ) {
          id
          market {
            id
            question
          }
          outcome {
            name
          }
          amount
          price
          side
          timestamp
        }
      }
    `;

    const data = await request(this.graphUrl, query);
    return data.trades;
  }

  // Get wallet P&L
  async getWalletPnL(walletAddress) {
    const trades = await this.getWalletTrades(walletAddress, 1000);
    
    let totalInvested = 0;
    let totalReturned = 0;
    
    for (const trade of trades) {
      const amount = parseFloat(trade.amount);
      const price = parseFloat(trade.price);
      
      if (trade.side === 'BUY') {
        totalInvested += amount * price;
      } else {
        totalReturned += amount * price;
      }
    }

    return {
      totalInvested,
      totalReturned,
      pnl: totalReturned - totalInvested,
      pnlPercent: totalInvested > 0 ? ((totalReturned - totalInvested) / totalInvested) * 100 : 0,
      tradeCount: trades.length
    };
  }

  // Execute trade
  async executeTrade(wallet, marketId, outcomeId, amount, price, side) {
    const ctfExchange = new ethers.Contract(
      this.ctfExchangeAddress,
      this.ctfExchangeAbi,
      wallet
    );

    // Convert to contract parameters
    const amountWei = ethers.parseUnits(amount.toString(), 6); // USDC has 6 decimals
    const priceWei = ethers.parseUnits(price.toString(), 6);

    const orders = [{
      marketId: marketId,
      amount: amountWei,
      price: priceWei,
      side: side === 'BUY'
    }];

    const tx = await ctfExchange.trade(orders);
    const receipt = await tx.wait();

    return {
      hash: tx.hash,
      gasUsed: receipt.gasUsed.toString(),
      status: receipt.status
    };
  }

  // Get orderbook for a market
  async getOrderbook(marketId) {
    const ctfExchange = new ethers.Contract(
      this.ctfExchangeAddress,
      this.ctfExchangeAbi,
      this.provider
    );

    const orderbook = await ctfExchange.getOrderbook(marketId);
    
    return {
      bids: orderbook.bids.map(b => ({
        price: ethers.formatUnits(b.price, 6),
        amount: ethers.formatUnits(b.amount, 6)
      })),
      asks: orderbook.asks.map(a => ({
        price: ethers.formatUnits(a.price, 6),
        amount: ethers.formatUnits(a.amount, 6)
      }))
    };
  }

  // Get new markets (for sniper)
  async getNewMarkets(minutesAgo = 30) {
    const timestamp = Math.floor(Date.now() / 1000) - (minutesAgo * 60);
    
    const query = gql`
      query {
        markets(
          where: { createdAt_gt: ${timestamp}, active: true, closed: false }
          orderBy: createdAt
          orderDirection: desc
        ) {
          id
          question
          slug
          volume
          liquidity
          createdAt
          outcomes {
            id
            name
            price
          }
        }
      }
    `;

    const data = await request(this.graphUrl, query);
    return data.markets;
  }
}

module.exports = PolymarketAPI;
