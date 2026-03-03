const { ethers } = require('ethers');
const crypto = require('crypto');

class WalletManager {
  constructor(db, encryptionKey) {
    this.db = db;
    this.encryptionKey = Buffer.from(encryptionKey, 'hex');
    this.algorithm = 'aes-256-gcm';
  }

  // Generate new wallet for user
  async generateWallet(userId) {
    const wallet = ethers.Wallet.createRandom();
    const encryptedPrivateKey = this.encrypt(wallet.privateKey);
    
    await this.db.run(
      `INSERT OR REPLACE INTO wallets (user_id, address, encrypted_key, created_at) 
       VALUES (?, ?, ?, datetime('now'))`,
      [userId, wallet.address, encryptedPrivateKey]
    );

    return {
      address: wallet.address,
      mnemonic: wallet.mnemonic.phrase // Show once, then never again
    };
  }

  // Get wallet for user
  async getWallet(userId) {
    const row = await this.db.get(
      'SELECT * FROM wallets WHERE user_id = ?',
      [userId]
    );
    
    if (!row) return null;

    const privateKey = this.decrypt(row.encrypted_key);
    const provider = new ethers.JsonRpcProvider(process.env.POLYGON_RPC_URL);
    
    return new ethers.Wallet(privateKey, provider);
  }

  // Get wallet address only (no private key)
  async getAddress(userId) {
    const row = await this.db.get(
      'SELECT address FROM wallets WHERE user_id = ?',
      [userId]
    );
    return row ? row.address : null;
  }

  // Encrypt private key using AES-256-GCM
  encrypt(text) {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(this.algorithm, this.encryptionKey, iv);
    
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    const authTag = cipher.getAuthTag();
    return iv.toString('hex') + ':' + authTag.toString('hex') + ':' + encrypted;
  }

  // Decrypt private key
  decrypt(encryptedData) {
    const parts = encryptedData.split(':');
    const iv = Buffer.from(parts[0], 'hex');
    const authTag = Buffer.from(parts[1], 'hex');
    const encrypted = parts[2];

    const decipher = crypto.createDecipheriv(this.algorithm, this.encryptionKey, iv);
    decipher.setAuthTag(authTag);

    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  }

  // Get USDC balance
  async getUSDCBalance(walletAddress) {
    const provider = new ethers.JsonRpcProvider(process.env.POLYGON_RPC_URL);
    const usdcContract = new ethers.Contract(
      '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174', // USDC on Polygon
      ['function balanceOf(address) view returns (uint256)',
       'function decimals() view returns (uint8)'],
      provider
    );

    const balance = await usdcContract.balanceOf(walletAddress);
    const decimals = await usdcContract.decimals();
    
    return ethers.formatUnits(balance, decimals);
  }

  // Get MATIC balance
  async getMATICBalance(walletAddress) {
    const provider = new ethers.JsonRpcProvider(process.env.POLYGON_RPC_URL);
    const balance = await provider.getBalance(walletAddress);
    return ethers.formatEther(balance);
  }

  // Withdraw USDC
  async withdrawUSDC(userId, amount, toAddress) {
    const wallet = await this.getWallet(userId);
    if (!wallet) throw new Error('Wallet not found');

    const usdcContract = new ethers.Contract(
      '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174',
      ['function transfer(address to, uint256 amount) returns (bool)',
       'function decimals() view returns (uint8)'],
      wallet
    );

    const decimals = await usdcContract.decimals();
    const amountWei = ethers.parseUnits(amount.toString(), decimals);

    const tx = await usdcContract.transfer(toAddress, amountWei);
    await tx.wait();

    return tx.hash;
  }
}

module.exports = WalletManager;
