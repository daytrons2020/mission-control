const { ethers } = require('ethers');

// Polymarket Contract Addresses (Polygon Mainnet)
const ADDRESSES = {
  CTF_EXCHANGE: '0x4bFb41d5B3570DeFd03C39a9A4D8dE6Bd8B8982E',
  USDC: '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174',
  CONDITIONAL_TOKENS: '0x4D97DCd97eC945f40cF65F87097CCe65Ea7C793b'
};

// Minimal ABI for trading
const CTF_EXCHANGE_ABI = [
  // Trade execution
  'function trade(tuple(bytes32 marketId, uint256 amount, uint256 price, bool side)[] orders) external returns (bool)',
  
  // Get orderbook
  'function getOrderbook(bytes32 marketId) external view returns (tuple(uint256 price, uint256 amount)[] bids, tuple(uint256 price, uint256 amount)[] asks)',
  
  // Events
  'event OrderFilled(bytes32 indexed marketId, address indexed maker, address indexed taker, bool side, uint256 price, uint256 amount)'
];

const USDC_ABI = [
  'function approve(address spender, uint256 amount) external returns (bool)',
  'function allowance(address owner, address spender) external view returns (uint256)',
  'function balanceOf(address account) external view returns (uint256)',
  'function decimals() external view returns (uint8)',
  'function transfer(address to, uint256 amount) external returns (bool)'
];

const CONDITIONAL_TOKENS_ABI = [
  'function setApprovalForAll(address operator, bool approved) external',
  'function isApprovedForAll(address account, address operator) external view returns (bool)',
  'function balanceOf(address account, uint256 id) external view returns (uint256)'
];

class PolymarketTrader {
  constructor(providerOrWallet) {
    this.provider = providerOrWallet.provider || providerOrWallet;
    this.wallet = providerOrWallet._isSigner ? providerOrWallet : null;
    
    this.ctfExchange = new ethers.Contract(
      ADDRESSES.CTF_EXCHANGE,
      CTF_EXCHANGE_ABI,
      this.wallet || this.provider
    );
    
    this.usdc = new ethers.Contract(
      ADDRESSES.USDC,
      USDC_ABI,
      this.wallet || this.provider
    );
    
    this.conditionalTokens = new ethers.Contract(
      ADDRESSES.CONDITIONAL_TOKENS,
      CONDITIONAL_TOKENS_ABI,
      this.wallet || this.provider
    );
  }

  // Check and set approvals
  async ensureApprovals() {
    if (!this.wallet) throw new Error('Wallet required for approvals');
    
    const address = await this.wallet.getAddress();
    
    // Check USDC allowance
    const usdcAllowance = await this.usdc.allowance(address, ADDRESSES.CTF_EXCHANGE);
    if (usdcAllowance === 0n) {
      console.log('Approving USDC for CTF Exchange...');
      const tx = await this.usdc.approve(ADDRESSES.CTF_EXCHANGE, ethers.MaxUint256);
      await tx.wait();
      console.log('USDC approved');
    }
    
    // Check ConditionalTokens approval
    const isApproved = await this.conditionalTokens.isApprovedForAll(address, ADDRESSES.CTF_EXCHANGE);
    if (!isApproved) {
      console.log('Approving ConditionalTokens...');
      const tx = await this.conditionalTokens.setApprovalForAll(ADDRESSES.CTF_EXCHANGE, true);
      await tx.wait();
      console.log('ConditionalTokens approved');
    }
    
    return true;
  }

  // Execute a trade
  async executeTrade(marketId, outcomeId, amount, price, side) {
    if (!this.wallet) throw new Error('Wallet required for trading');
    
    // Ensure approvals first
    await this.ensureApprovals();
    
    // Convert parameters
    const amountWei = ethers.parseUnits(amount.toString(), 6); // USDC has 6 decimals
    const priceWei = ethers.parseUnits(price.toString(), 6);
    const isBuy = side === 'BUY';
    
    // Build order
    const orders = [{
      marketId: marketId,
      amount: amountWei,
      price: priceWei,
      side: isBuy
    }];
    
    console.log('Executing trade:', { marketId, amount, price, side });
    
    // Execute trade
    const tx = await this.ctfExchange.trade(orders);
    console.log('Transaction sent:', tx.hash);
    
    const receipt = await tx.wait();
    console.log('Transaction confirmed:', receipt.hash);
    
    return {
      hash: tx.hash,
      gasUsed: receipt.gasUsed.toString(),
      status: receipt.status,
      blockNumber: receipt.blockNumber
    };
  }

  // Get orderbook for a market
  async getOrderbook(marketId) {
    const orderbook = await this.ctfExchange.getOrderbook(marketId);
    
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

  // Get USDC balance
  async getUSDCBalance(address) {
    const balance = await this.usdc.balanceOf(address);
    const decimals = await this.usdc.decimals();
    return ethers.formatUnits(balance, decimals);
  }

  // Check if wallet has sufficient balance and approvals
  async checkTradeReadiness(address, amount) {
    const [balance, allowance, isApproved] = await Promise.all([
      this.usdc.balanceOf(address),
      this.usdc.allowance(address, ADDRESSES.CTF_EXCHANGE),
      this.conditionalTokens.isApprovedForAll(address, ADDRESSES.CTF_EXCHANGE)
    ]);
    
    const amountWei = ethers.parseUnits(amount.toString(), 6);
    
    return {
      hasBalance: balance >= amountWei,
      hasAllowance: allowance >= amountWei,
      hasTokenApproval: isApproved,
      ready: balance >= amountWei && allowance >= amountWei && isApproved
    };
  }
}

module.exports = { PolymarketTrader, ADDRESSES };
