/**
 * Data Service for Mission Control Dashboard
 * Manages caching, auto-refresh, and data synchronization
 */

class MissionControlDataService {
  constructor() {
    this.cacheKey = 'mc_dashboard_data';
    this.cacheTimestampKey = 'mc_dashboard_timestamp';
    this.refreshInterval = 5 * 60 * 1000; // 5 minutes
    this.isLoading = false;
    this.lastError = null;
    
    // Start auto-refresh
    this.startAutoRefresh();
  }

  /**
   * Get dashboard data (from cache or fetch fresh)
   */
  async getDashboardData(forceRefresh = false) {
    // Check cache first
    if (!forceRefresh) {
      const cached = this.getCachedData();
      if (cached && this.isCacheValid()) {
        console.log('[DataService] Using cached data');
        return cached;
      }
    }
    
    // Fetch fresh data
    return await this.fetchFreshData();
  }

  /**
   * Fetch fresh data from GitHub
   */
  async fetchFreshData() {
    if (this.isLoading) {
      console.log('[DataService] Already loading, waiting...');
      return this.getCachedData();
    }
    
    this.isLoading = true;
    this.lastError = null;
    
    try {
      console.log('[DataService] Fetching fresh data from GitHub...');
      
      // Use the GitHub service
      if (!window.GitHubService) {
        throw new Error('GitHubService not loaded');
      }
      
      const data = await window.GitHubService.fetchDashboardData();
      
      // Cache the data
      this.setCachedData(data);
      
      console.log('[DataService] Data refreshed successfully');
      return data;
      
    } catch (error) {
      console.error('[DataService] Error fetching data:', error);
      this.lastError = error.message;
      
      // Return cached data as fallback
      const cached = this.getCachedData();
      if (cached) {
        console.log('[DataService] Returning stale cached data');
        return { ...cached, _stale: true, _error: error.message };
      }
      
      throw error;
    } finally {
      this.isLoading = false;
    }
  }

  /**
   * Get cached data from localStorage
   */
  getCachedData() {
    try {
      const cached = localStorage.getItem(this.cacheKey);
      return cached ? JSON.parse(cached) : null;
    } catch (error) {
      console.error('[DataService] Error reading cache:', error);
      return null;
    }
  }

  /**
   * Set cached data in localStorage
   */
  setCachedData(data) {
    try {
      localStorage.setItem(this.cacheKey, JSON.stringify(data));
      localStorage.setItem(this.cacheTimestampKey, Date.now().toString());
    } catch (error) {
      console.error('[DataService] Error writing cache:', error);
    }
  }

  /**
   * Check if cache is still valid (within refresh interval)
   */
  isCacheValid() {
    try {
      const timestamp = localStorage.getItem(this.cacheTimestampKey);
      if (!timestamp) return false;
      
      const age = Date.now() - parseInt(timestamp);
      return age < this.refreshInterval;
    } catch (error) {
      return false;
    }
  }

  /**
   * Get cache age in minutes
   */
  getCacheAge() {
    try {
      const timestamp = localStorage.getItem(this.cacheTimestampKey);
      if (!timestamp) return null;
      
      const ageMs = Date.now() - parseInt(timestamp);
      return Math.round(ageMs / 60000); // Convert to minutes
    } catch (error) {
      return null;
    }
  }

  /**
   * Start auto-refresh interval
   */
  startAutoRefresh() {
    console.log('[DataService] Starting auto-refresh (every 5 minutes)');
    
    // Initial load
    this.fetchFreshData().catch(console.error);
    
    // Set up interval
    setInterval(() => {
      console.log('[DataService] Auto-refresh triggered');
      this.fetchFreshData().catch(console.error);
    }, this.refreshInterval);
  }

  /**
   * Force immediate refresh
   */
  async refresh() {
    console.log('[DataService] Manual refresh requested');
    return await this.fetchFreshData();
  }

  /**
   * Clear cached data
   */
  clearCache() {
    localStorage.removeItem(this.cacheKey);
    localStorage.removeItem(this.cacheTimestampKey);
    console.log('[DataService] Cache cleared');
  }

  /**
   * Get current loading state
   */
  isCurrentlyLoading() {
    return this.isLoading;
  }

  /**
   * Get last error message
   */
  getLastError() {
    return this.lastError;
  }
}

// Create global instance
window.mcDataService = new MissionControlDataService();
