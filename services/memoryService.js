/**
 * Memory Service for Mission Control
 * Fetches and manages memory documents from GitHub
 */

class MemoryService {
  constructor() {
    this.cacheKey = 'mc_memory_data';
    this.cacheTimestampKey = 'mc_memory_timestamp';
    this.refreshInterval = 5 * 60 * 1000; // 5 minutes
    this.documents = [];
    this.isLoading = false;
    
    // GitHub API base
    this.githubApiBase = 'https://api.github.com/repos/daytrons2020/mission-control/contents';
    this.githubRawBase = 'https://raw.githubusercontent.com/daytrons2020/mission-control/main';
    
    // Initialize
    this.init();
  }

  async init() {
    // Try to load from cache first
    const cached = this.getCachedData();
    if (cached && this.isCacheValid()) {
      this.documents = cached;
    } else {
      await this.fetchAllMemories();
    }
  }

  /**
   * Fetch all memory documents
   */
  async fetchAllMemories() {
    if (this.isLoading) return this.documents;
    
    this.isLoading = true;
    console.log('[MemoryService] Fetching memories...');
    
    try {
      const documents = [];
      
      // Fetch MEMORY.md (main memory)
      const mainMemory = await this.fetchDocument('MEMORY.md', 'curated');
      if (mainMemory) documents.push(mainMemory);
      
      // Fetch daily memory files
      const dailyMemories = await this.fetchMemoryDirectory();
      documents.push(...dailyMemories);
      
      // Sort by date (newest first)
      documents.sort((a, b) => new Date(b.date) - new Date(a.date));
      
      this.documents = documents;
      this.setCachedData(documents);
      
      console.log(`[MemoryService] Loaded ${documents.length} documents`);
      return documents;
      
    } catch (error) {
      console.error('[MemoryService] Error fetching memories:', error);
      // Return cached data if available
      return this.getCachedData() || [];
    } finally {
      this.isLoading = false;
    }
  }

  /**
   * Fetch a single document
   */
  async fetchDocument(path, category = 'general') {
    try {
      const response = await fetch(`${this.githubRawBase}/${path}`);
      if (!response.ok) return null;
      
      const content = await response.text();
      const filename = path.split('/').pop();
      
      // Parse document metadata
      const title = this.extractTitle(content, filename);
      const date = this.extractDate(content, filename);
      const tags = this.extractTags(content);
      const preview = this.generatePreview(content);
      
      return {
        id: path.replace(/[^a-zA-Z0-9]/g, '-'),
        path,
        filename,
        title,
        date,
        category,
        tags,
        preview,
        content,
        wordCount: content.split(/\s+/).length
      };
      
    } catch (error) {
      console.error(`[MemoryService] Error fetching ${path}:`, error);
      return null;
    }
  }

  /**
   * Fetch all files from memory/ directory
   */
  async fetchMemoryDirectory() {
    try {
      const response = await fetch(`${this.githubApiBase}/memory`);
      if (!response.ok) return [];
      
      const files = await response.json();
      const documents = [];
      
      for (const file of files) {
        if (file.type === 'file' && file.name.endsWith('.md')) {
          const doc = await this.fetchDocument(`memory/${file.name}`, 'daily');
          if (doc) documents.push(doc);
        }
      }
      
      return documents;
      
    } catch (error) {
      console.error('[MemoryService] Error fetching memory directory:', error);
      return [];
    }
  }

  /**
   * Extract title from markdown content
   */
  extractTitle(content, filename) {
    // Try to find H1
    const h1Match = content.match(/^#\s+(.+)$/m);
    if (h1Match) return h1Match[1].trim();
    
    // Try to find "## Daily Log" or similar
    const dailyMatch = content.match(/##\s+(.+?)\s*-\s*(.+?)$/m);
    if (dailyMatch) return `${dailyMatch[1]} - ${dailyMatch[2]}`;
    
    // Fallback to filename
    return filename.replace('.md', '').replace(/-/g, ' ').replace(/_/g, ' ');
  }

  /**
   * Extract date from content or filename
   */
  extractDate(content, filename) {
    // Try to find date in content
    const dateMatch = content.match(/\*\*Last Updated:\*\*\s*(.+)/i) ||
                      content.match(/(\d{4}-\d{2}-\d{2})/);
    
    if (dateMatch) {
      const date = new Date(dateMatch[1]);
      if (!isNaN(date)) return date.toISOString();
    }
    
    // Try to extract from filename (YYYY-MM-DD format)
    const filenameDate = filename.match(/(\d{4}-\d{2}-\d{2})/);
    if (filenameDate) {
      return new Date(filenameDate[1]).toISOString();
    }
    
    // Fallback to file modification time (not available, use now)
    return new Date().toISOString();
  }

  /**
   * Extract tags from content
   */
  extractTags(content) {
    const tags = [];
    
    // Look for common categories
    if (content.includes('Trading')) tags.push('trading');
    if (content.includes('Agent')) tags.push('agents');
    if (content.includes('Cron')) tags.push('system');
    if (content.includes('Project')) tags.push('projects');
    if (content.includes('Skill')) tags.push('skills');
    if (content.includes('Memory')) tags.push('memory');
    if (content.includes('Discord')) tags.push('discord');
    if (content.includes('Cost')) tags.push('costs');
    
    return tags;
  }

  /**
   * Generate preview snippet
   */
  generatePreview(content) {
    // Remove markdown syntax
    const plainText = content
      .replace(/#+\s+/g, '')
      .replace(/\*\*/g, '')
      .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
      .replace(/`{3}[\s\S]*?`{3}/g, '[code]')
      .replace(/`([^`]+)`/g, '$1');
    
    // Get first 150 chars
    return plainText.substring(0, 150).trim() + (plainText.length > 150 ? '...' : '');
  }

  /**
   * Search documents
   */
  search(query) {
    if (!query || query.trim() === '') return this.documents;
    
    const lowerQuery = query.toLowerCase();
    
    return this.documents.filter(doc => {
      return doc.title.toLowerCase().includes(lowerQuery) ||
             doc.content.toLowerCase().includes(lowerQuery) ||
             doc.tags.some(tag => tag.toLowerCase().includes(lowerQuery));
    }).map(doc => ({
      ...doc,
      // Add highlighted preview
      highlightedPreview: this.highlightText(doc.preview, query)
    }));
  }

  /**
   * Highlight search text
   */
  highlightText(text, query) {
    if (!query) return text;
    const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    return text.replace(regex, '<mark>$1</mark>');
  }

  /**
   * Filter by category
   */
  filterByCategory(category) {
    if (!category || category === 'all') return this.documents;
    return this.documents.filter(doc => doc.category === category || doc.tags.includes(category));
  }

  /**
   * Filter by date range
   */
  filterByDateRange(startDate, endDate) {
    return this.documents.filter(doc => {
      const docDate = new Date(doc.date);
      return docDate >= new Date(startDate) && docDate <= new Date(endDate);
    });
  }

  /**
   * Sort documents
   */
  sort(documents, sortBy = 'date-desc') {
    const sorted = [...documents];
    
    switch (sortBy) {
      case 'date-desc':
        sorted.sort((a, b) => new Date(b.date) - new Date(a.date));
        break;
      case 'date-asc':
        sorted.sort((a, b) => new Date(a.date) - new Date(b.date));
        break;
      case 'title-asc':
        sorted.sort((a, b) => a.title.localeCompare(b.title));
        break;
      case 'title-desc':
        sorted.sort((a, b) => b.title.localeCompare(a.title));
        break;
    }
    
    return sorted;
  }

  /**
   * Get unique categories
   */
  getCategories() {
    const categories = new Set(this.documents.map(doc => doc.category));
    return ['all', ...Array.from(categories)];
  }

  /**
   * Get unique tags
   */
  getAllTags() {
    const tags = new Set();
    this.documents.forEach(doc => doc.tags.forEach(tag => tags.add(tag)));
    return Array.from(tags);
  }

  /**
   * Get document by ID
   */
  getDocumentById(id) {
    return this.documents.find(doc => doc.id === id);
  }

  /**
   * Get cached data
   */
  getCachedData() {
    try {
      const cached = localStorage.getItem(this.cacheKey);
      return cached ? JSON.parse(cached) : null;
    } catch (error) {
      return null;
    }
  }

  /**
   * Set cached data
   */
  setCachedData(data) {
    try {
      localStorage.setItem(this.cacheKey, JSON.stringify(data));
      localStorage.setItem(this.cacheTimestampKey, Date.now().toString());
    } catch (error) {
      console.error('[MemoryService] Error caching data:', error);
    }
  }

  /**
   * Check if cache is valid
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
   * Refresh data
   */
  async refresh() {
    return await this.fetchAllMemories();
  }

  /**
   * Get loading state
   */
  isCurrentlyLoading() {
    return this.isLoading;
  }
}

// Create global instance
window.memoryService = new MemoryService();
