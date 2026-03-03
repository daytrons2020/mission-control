const axios = require('axios');
const { ethers } = require('ethers');

// Polymarket CLOB API (Central Limit Order Book)
const CLOB_API_URL = 'https://clob.polymarket.com';

// Contract addresses
const ADDRESSES = {
  CTF_EXCHANGE: '0x4bFb41d5B3570DeFd03C39a9A4D8dE6Bd8B8982E',
  USDC: '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174',
  CONDITIONAL_TOKENS: '0x4D97DCd97eC945f40cF65F87097CCe65Ea7C793b'
};

class PolymarketCLOB {
  constructor(wallet) {
    this.wallet = wallet;
    this.apiUrl = CLOB_API_URL;
    this.apiKey = null;
    this.apiSecret = null;
    this.passphrase = null;
  }

  // Generate API credentials (requires signing a message)
  async generateApiCredentials() {
    if (!this.wallet) throw new Error('Wallet required');
    
    const address = await this.wallet.getAddress();
    const timestamp = Math.floor(Date.now() / 1000);
    
    // Sign authentication message
    const message = `This message attests that I control the given wallet.\n\nNonce: ${timestamp}`;
    const signature = await this.wallet.signMessage(message);
    
    // Create API key via CLOB
    const response = await axios.post(`${this.apiUrl}/auth/api-key`, {
      address: address.toLowerCase(),
      signature: signature,
      timestamp: timestamp
    });
    
    this.apiKey = response.data.apiKey;
    this.apiSecret = response.data.secret;
    this.passphrase = response.data.passphrase;
    
    return {
      apiKey: this.apiKey,
      secret: this.apiSecret,
      passphrase: this.passphrase
    };
  }

  // Set existing API credentials
  setCredentials(apiKey, secret, passphrase) {
    this.apiKey = apiKey;
    this.apiSecret = secret;
    this.passphrase = passphrase;
  }

  // Create signature for API requests
  createSignature(timestamp, method, requestPath, body = '') {
    if (!this.apiSecret) throw new Error('API secret not set');
    
    const message = timestamp + method.toUpperCase() + requestPath + body;
    const hmac = require('crypto').createHmac('sha256', this.apiSecret);
    hmac.update(message);
    return hmac.digest('base64');
  }

  // Make authenticated API request
  async apiRequest(method, endpoint, data = null) {
    if (!this.apiKey) throw new Error('API credentials not set');
    
    const timestamp = Math.floor(Date.now() / 1000).toString();
    const body = data ? JSON.stringify(data) : '';
    const signature = this.createSignature(timestamp, method, endpoint, body);
    
    const headers = {
      'POLYMARKET-API-KEY': this.apiKey,
      'POLYMARKET-SIGNATURE': signature,
      'POLYMARKET-TIMESTAMP': timestamp,
      'POLYMARKET-PASSPHRASE': this.passphrase,
      'Content-Type': 'application/json'
    };
    
    const config = {
      method,
      url: `${this.apiUrl}${endpoint}`,
      headers,
      data: data || undefined
    };
    
    const response = await axios(config);
    return response.data;
  }

  // Get markets
  async getMarkets(active = true, closed = false) {
    return await this.apiRequest('GET', `/markets?active=${active}&closed=${closed}`);
  }

  // Get market by condition ID
  async getMarket(conditionId) {
    return await this.apiRequest('GET', `/markets/${conditionId}`);
  }

  // Get orderbook for a token
  async getOrderbook(tokenId) {
    return await this.apiRequest('GET', `/book/${tokenId}`);
  }

  // Get trades for a user
  async getUserTrades(address) {
    return await this.apiRequest('GET', `/trades?address=${address.toLowerCase()}`);
  }

  // Create and submit order
  async placeOrder(tokenId, side, price, size) {
    if (!this.wallet) throw new Error('Wallet required');
    
    const address = await this.wallet.getAddress();
    const timestamp = Math.floor(Date.now() / 1000);
    const expiration = timestamp + 86400; // 24 hours
    
    // Build order
    const order = {
      salt: Math.floor(Math.random() * 1000000000),
      maker: address,
      signer: address,
      taker: '0x0000000000000000000000000000000000000000', // Open to any taker
      tokenId: tokenId,
      makerAmount: side === 'BUY' 
        ? ethers.parseUnits((size * price).toString(), 6).toString()
        : ethers.parseUnits(size.toString(), 6).toString(),
      takerAmount: side === 'BUY'
        ? ethers.parseUnits(size.toString(), 6).toString()
        : ethers.parseUnits((size * price).toString(), 6).toString(),
      expiration: expiration,
      nonce: timestamp,
      feeRateBps: 0,
      side: side === 'BUY' ? 0 : 1,
      signatureType: 0 // EOA
    };
    
    // Sign order (EIP-712)
    const domain = {
      name: 'Polymarket CTF Exchange',
      version: '1',
      chainId: 137, // Polygon
      verifyingContract: ADDRESSES.CTF_EXCHANGE
    };
    
    const types = {
      Order: [
        { name: 'salt', type: 'uint256' },
        { name: 'maker', type: 'address' },
        { name: 'signer', type: 'address' },
        { name: 'taker', type: 'address' },
        { name: 'tokenId', type: 'uint256' },
        { name: 'makerAmount', type: 'uint256' },
        { name: 'takerAmount', type: 'uint256' },
        { name: 'expiration', type: 'uint256' },
        { name: 'nonce', type: 'uint256' },
        { name: 'feeRateBps', type: 'uint256' },
        { name: 'side', type: 'uint8' },
        { name: 'signatureType', type: 'uint8' }
      ]
    };
    
    const signature = await this.wallet.signTypedData(domain, types, order);
    
    // Submit to CLOB
    const orderData = {
      ...order,
      signature: signature,
      makerAmount: order.makerAmount.toString(),
      takerAmount: order.takerAmount.toString()
    };
    
    return await this.apiRequest('POST', '/order', orderData);
  }

  // Cancel order
  async cancelOrder(orderId) {
    return await this.apiRequest('DELETE', `/order/${orderId}`);
  }

  // Get open orders
  async getOpenOrders(address) {
    return await this.apiRequest('GET', `/orders?address=${address.toLowerCase()}`);
  }

  // Get balance
  async getBalance(address) {
    return await this.apiRequest('GET', `/balance/${address.toLowerCase()}`);
  }
}

module.exports = { PolymarketCLOB, ADDRESSES };
