// Sidebar Controller for Mission Control
class SidebarController {
  constructor() {
    this.sidebar = document.querySelector('.sidebar');
    this.toggleBtn = document.querySelector('.sidebar-toggle');
    this.overlay = document.querySelector('.sidebar-overlay');
    this.mainContent = document.querySelector('.main-content');
    
    this.isCollapsed = localStorage.getItem('sidebarCollapsed') === 'true';
    this.isMobile = window.innerWidth <= 768;
    
    this.init();
  }
  
  init() {
    // Apply initial state
    if (this.isCollapsed && !this.isMobile) {
      this.collapse();
    }
    
    // Event listeners
    this.toggleBtn?.addEventListener('click', () => this.toggle());
    this.overlay?.addEventListener('click', () => this.closeMobile());
    
    // Keyboard shortcut (B key)
    document.addEventListener('keydown', (e) => {
      if (e.key === 'b' && !e.ctrlKey && !e.metaKey && !e.altKey) {
        // Don't trigger if typing in input
        if (document.activeElement.tagName !== 'INPUT' && 
            document.activeElement.tagName !== 'TEXTAREA') {
          this.toggle();
        }
      }
    });
    
    // Auto-hide on mobile
    if (this.isMobile) {
      this.setupAutoHide();
    }
    
    // Handle resize
    window.addEventListener('resize', () => {
      const wasMobile = this.isMobile;
      this.isMobile = window.innerWidth <= 768;
      
      if (wasMobile !== this.isMobile) {
        // Switching between mobile/desktop
        if (this.isMobile) {
          this.closeMobile();
          this.setupAutoHide();
        } else {
          this.overlay?.classList.remove('open');
          if (this.isCollapsed) {
            this.collapse();
          } else {
            this.expand();
          }
        }
      }
    });
  }
  
  toggle() {
    if (this.isMobile) {
      this.sidebar?.classList.contains('open') ? this.closeMobile() : this.openMobile();
    } else {
      this.isCollapsed ? this.expand() : this.collapse();
    }
  }
  
  collapse() {
    this.sidebar?.classList.add('collapsed');
    this.toggleBtn?.classList.add('collapsed');
    this.mainContent?.classList.add('sidebar-collapsed');
    this.isCollapsed = true;
    localStorage.setItem('sidebarCollapsed', 'true');
  }
  
  expand() {
    this.sidebar?.classList.remove('collapsed');
    this.toggleBtn?.classList.remove('collapsed');
    this.mainContent?.classList.remove('sidebar-collapsed');
    this.isCollapsed = false;
    localStorage.setItem('sidebarCollapsed', 'false');
  }
  
  openMobile() {
    this.sidebar?.classList.add('open');
    this.toggleBtn?.classList.add('open');
    this.overlay?.classList.add('open');
    document.body.style.overflow = 'hidden';
  }
  
  closeMobile() {
    this.sidebar?.classList.remove('open');
    this.toggleBtn?.classList.remove('open');
    this.overlay?.classList.remove('open');
    document.body.style.overflow = '';
  }
  
  setupAutoHide() {
    // Auto-hide sidebar when clicking outside on mobile
    document.addEventListener('click', (e) => {
      if (this.isMobile && 
          this.sidebar?.classList.contains('open') &&
          !this.sidebar.contains(e.target) &&
          !this.toggleBtn.contains(e.target)) {
        this.closeMobile();
      }
    });
    
    // Auto-hide on scroll (optional)
    let lastScrollY = window.scrollY;
    window.addEventListener('scroll', () => {
      if (this.isMobile && this.sidebar?.classList.contains('open')) {
        const currentScrollY = window.scrollY;
        if (Math.abs(currentScrollY - lastScrollY) > 50) {
          this.closeMobile();
        }
        lastScrollY = currentScrollY;
      }
    }, { passive: true });
  }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  window.sidebarController = new SidebarController();
});

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = SidebarController;
}
