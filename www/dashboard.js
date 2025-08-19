// Sourcebook Dashboard Navigation and URL Management
class SourcebookDashboard {
  constructor() {
    this.currentSection = null;
    this.currentSubpage = null;
    this.geoParams = {
      level: 'state',
      cbsa: null,
      locality: null
    };
    
    this.init();
  }
  
  init() {
    // Initialize from URL hash or default
    this.parseUrlHash();
    
    // Set up event listeners
    this.setupGeographicControls();
    this.setupNavigation();
    
    // Handle browser back/forward
    window.addEventListener('popstate', () => {
      this.parseUrlHash();
    });
    
    // Initialize first page
    if (this.currentSubpage) {
      this.showSubpage(this.currentSubpage, false);
    } else {
      this.showSubpage('intro-page', false);
    }
  }
  
  parseUrlHash() {
    const hash = window.location.hash.replace('#', '');
    if (hash && hash.includes('-')) {
      const parts = hash.split('-');
      this.currentSection = parts[0];
      this.currentSubpage = hash;
    }
    
    // Parse URL parameters for geographic settings
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('geo')) {
      this.geoParams.level = urlParams.get('geo');
      this.geoParams.cbsa = urlParams.get('cbsa');
      this.geoParams.locality = urlParams.get('locality');
      this.updateGeographicControls();
    }
  }
  
  setupGeographicControls() {
    // Custom toggle buttons
    const geoToggleButtons = document.querySelectorAll('.geo-toggle-btn');
    console.log('Found geo toggle buttons:', geoToggleButtons.length); // Debug
    geoToggleButtons.forEach(button => {
      button.addEventListener('click', (e) => {
        e.preventDefault();
        
        // Remove active class from all buttons
        geoToggleButtons.forEach(btn => btn.classList.remove('active'));
        
        // Add active class to clicked button
        e.target.classList.add('active');
        
        // Update the hidden input for Shiny compatibility
        const hiddenInput = document.getElementById('geo_level');
        const value = e.target.getAttribute('data-value');
        if (hiddenInput) {
          hiddenInput.value = value;
        }
        
        // Update internal state
        this.geoParams.level = value;
        this.updateCurrentIframe();
        this.updateUrl();
        
        // Show/hide appropriate selector containers
        this.updateSelectorVisibility();
        
        // Trigger Shiny input change
        this.triggerShinyInputs();
      });
    });
    
    // CBSA selector
    const cbsaSelect = document.getElementById('cbsa_selector');
    if (cbsaSelect) {
      cbsaSelect.addEventListener('change', (e) => {
        this.geoParams.cbsa = e.target.value;
        this.updateCurrentIframe();
        this.updateUrl();
      });
    }
    
    // Locality selector
    const localitySelect = document.getElementById('locality_selector');
    if (localitySelect) {
      localitySelect.addEventListener('change', (e) => {
        this.geoParams.locality = e.target.value;
        this.updateCurrentIframe();
        this.updateUrl();
      });
    }
    
    // Setup custom dropdowns
    this.setupCustomDropdowns();
  }
  
  setupNavigation() {
    // Navigation links
    document.addEventListener('click', (e) => {
      if (e.target.matches('[data-subpage]')) {
        e.preventDefault();
        const subpage = e.target.getAttribute('data-subpage');
        this.showSubpage(subpage, true);
      }
    });
  }
  
  showSubpage(subpageId, updateHistory = true) {
    // Hide all content pages
    const pages = document.querySelectorAll('.content-page');
    pages.forEach(page => {
      page.classList.remove('active');
      page.style.display = 'none';
    });
    
    // Show target page
    const targetPage = document.getElementById(subpageId);
    if (targetPage) {
      targetPage.classList.add('active');
      targetPage.style.display = 'block';
      
      // Update navigation state
      this.updateNavigationState(subpageId);
      
      // Update iframe with geographic parameters
      this.updateCurrentIframe();
      
      // Update URL
      this.currentSubpage = subpageId;
      if (updateHistory) {
        this.updateUrl();
      }
      
      // Update page title
      this.updatePageTitle(subpageId);
    }
  }
  
  updateNavigationState(activeSubpage) {
    // Remove active states
    const navLinks = document.querySelectorAll('.accordion-body a');
    navLinks.forEach(link => link.classList.remove('active'));
    
    // Only add active state if not on intro page
    if (activeSubpage !== 'intro-page') {
      const activeLink = document.querySelector(`[data-subpage="${activeSubpage}"]`);
      if (activeLink) {
        activeLink.classList.add('active');
        
        // Expand parent accordion
        const accordionButton = activeLink.closest('.accordion-item').querySelector('.accordion-button');
        if (accordionButton && accordionButton.classList.contains('collapsed')) {
          accordionButton.click();
        }
      }
    }
  }
  
  updateCurrentIframe() {
    const activePage = document.querySelector('.content-page.active');
    if (!activePage) return;
    
    const iframe = activePage.querySelector('iframe');
    if (!iframe) return;
    
    const baseUrl = iframe.getAttribute('data-base-url');
    if (!baseUrl) return;
    
    const geoQuery = this.buildGeoQuery();
    iframe.src = baseUrl + geoQuery;
    
    // Show loading state
    this.showLoading(iframe);
  }
  
  buildGeoQuery() {
    const params = new URLSearchParams();
    params.set('geo', this.geoParams.level);
    
    if (this.geoParams.level === 'cbsa' && this.geoParams.cbsa) {
      params.set('cbsa', this.geoParams.cbsa);
    } else if (this.geoParams.level === 'locality' && this.geoParams.locality) {
      params.set('locality', this.geoParams.locality);
    }
    
    return '?' + params.toString();
  }
  
  updateGeographicControls() {
    // Update custom toggle buttons
    const geoToggleButtons = document.querySelectorAll('.geo-toggle-btn');
    geoToggleButtons.forEach(btn => {
      btn.classList.remove('active');
      if (btn.getAttribute('data-value') === this.geoParams.level) {
        btn.classList.add('active');
      }
    });
    
    // Update hidden input
    const hiddenInput = document.getElementById('geo_level');
    if (hiddenInput) {
      hiddenInput.value = this.geoParams.level;
    }
    
    // Update selector visibility
    this.updateSelectorVisibility();
    
    // Update selectors
    if (this.geoParams.cbsa) {
      const cbsaSelect = document.getElementById('cbsa_selector');
      if (cbsaSelect) {
        cbsaSelect.value = this.geoParams.cbsa;
      }
    }
    
    if (this.geoParams.locality) {
      const localitySelect = document.getElementById('locality_selector');
      if (localitySelect) {
        localitySelect.value = this.geoParams.locality;
      }
    }
    
    // Trigger conditional panel updates
    this.triggerShinyInputs();
  }
  
  triggerShinyInputs() {
    // Trigger Shiny input change events if they exist
    if (window.Shiny) {
      window.Shiny.setInputValue('geo_level', this.geoParams.level);
      if (this.geoParams.cbsa) {
        window.Shiny.setInputValue('cbsa_selector', this.geoParams.cbsa);
      }
      if (this.geoParams.locality) {
        window.Shiny.setInputValue('locality_selector', this.geoParams.locality);
      }
    }
  }
  
  setupCustomDropdowns() {
    console.log('Setting up custom dropdowns'); // Debug
    const dropdowns = document.querySelectorAll('.custom-dropdown');
    console.log('Found dropdowns:', dropdowns.length); // Debug
    
    dropdowns.forEach(dropdown => {
      const selected = dropdown.querySelector('.dropdown-selected');
      const options = dropdown.querySelector('.dropdown-options');
      const optionElements = dropdown.querySelectorAll('.dropdown-option');
      const hiddenInput = dropdown.parentElement.querySelector('input[type="hidden"]');
      
      console.log('Setting up dropdown:', dropdown.id, 'with', optionElements.length, 'options'); // Debug
      
      // Toggle dropdown open/close - attach to the whole dropdown container
      dropdown.addEventListener('click', (e) => {
        // Don't toggle if clicking on an option
        if (e.target.classList.contains('dropdown-option')) {
          return;
        }
        
        e.stopPropagation();
        console.log('Dropdown clicked:', dropdown.id); // Debug
        
        // Close other dropdowns
        dropdowns.forEach(other => {
          if (other !== dropdown) {
            other.classList.remove('open');
          }
        });
        
        // Toggle current dropdown
        dropdown.classList.toggle('open');
        console.log('Dropdown open state:', dropdown.classList.contains('open')); // Debug
      });
      
      // Handle option selection
      optionElements.forEach(option => {
        option.addEventListener('click', (e) => {
          e.stopPropagation();
          console.log('Option clicked:', option.textContent); // Debug
          
          const value = option.getAttribute('data-value');
          const text = option.textContent;
          
          // Update selected display
          selected.textContent = text;
          dropdown.setAttribute('data-value', value);
          
          // Update hidden input
          if (hiddenInput) {
            hiddenInput.value = value;
          }
          
          // Update active state
          optionElements.forEach(opt => opt.classList.remove('active'));
          option.classList.add('active');
          
          // Close dropdown
          dropdown.classList.remove('open');
          
          // Update internal parameters and iframe
          if (dropdown.id === 'cbsa-dropdown') {
            this.geoParams.cbsa = value;
          } else if (dropdown.id === 'locality-dropdown') {
            this.geoParams.locality = value;
          }
          
          this.updateCurrentIframe();
          this.updateUrl();
        });
      });
    });
    
    // Close dropdowns when clicking outside
    document.addEventListener('click', () => {
      dropdowns.forEach(dropdown => {
        dropdown.classList.remove('open');
      });
    });
  }

  updateSelectorVisibility() {
    const cbsaContainer = document.getElementById('cbsa-selector-container');
    const localityContainer = document.getElementById('locality-selector-container');
    
    console.log('Updating selector visibility for level:', this.geoParams.level); // Debug
    console.log('CBSA container found:', !!cbsaContainer); // Debug
    console.log('Locality container found:', !!localityContainer); // Debug
    
    // Hide all selectors first
    if (cbsaContainer) cbsaContainer.style.display = 'none';
    if (localityContainer) localityContainer.style.display = 'none';
    
    // Show appropriate selector based on geographic level
    if (this.geoParams.level === 'cbsa' && cbsaContainer) {
      cbsaContainer.style.display = 'block';
      console.log('Showing CBSA container'); // Debug
    } else if (this.geoParams.level === 'locality' && localityContainer) {
      localityContainer.style.display = 'block';
      console.log('Showing locality container'); // Debug
    }
  }
  
  updateUrl() {
    const params = new URLSearchParams();
    params.set('geo', this.geoParams.level);
    
    if (this.geoParams.level === 'cbsa' && this.geoParams.cbsa) {
      params.set('cbsa', this.geoParams.cbsa);
    } else if (this.geoParams.level === 'locality' && this.geoParams.locality) {
      params.set('locality', this.geoParams.locality);
    }
    
    const newUrl = `${window.location.pathname}?${params.toString()}#${this.currentSubpage}`;
    window.history.pushState(null, '', newUrl);
  }
  
  updatePageTitle(subpageId) {
    const pageTitle = this.getSubpageTitle(subpageId);
    document.title = `${pageTitle} - Sourcebook`;
  }
  
  getSubpageTitle(subpageId) {
    const titleMap = {
      'demographics-total-population': 'Total Population',
      'demographics-population-change': 'Population Change',
      'demographics-race-ethnicity': 'Race and Ethnicity',
      'demographics-age': 'Age',
      'demographics-household-type': 'Household Type',
      'demographics-household-size': 'Household Size',
      'inventory-housing-production': 'Housing Production',
      'inventory-housing-type': 'Housing Type',
      'inventory-housing-age': 'Housing Age',
      'inventory-housing-characteristics': 'Housing Characteristics',
      'inventory-overcrowding': 'Overcrowding'
    };
    
    return titleMap[subpageId] || 'Sourcebook';
  }
  
  showLoading(iframe) {
    const container = iframe.parentElement;
    const loadingDiv = container.querySelector('.loading-overlay');
    
    if (loadingDiv) {
      loadingDiv.style.display = 'flex';
    }
    
    // Hide loading after iframe loads
    iframe.addEventListener('load', () => {
      if (loadingDiv) {
        loadingDiv.style.display = 'none';
      }
    }, { once: true });
  }
}

// Mobile sidebar toggle
function toggleSidebar() {
  const sidebar = document.querySelector('.sidebar');
  if (sidebar) {
    sidebar.classList.toggle('show');
  }
}

// Initialize dashboard when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  // Wait a bit for all elements to be rendered, especially Shiny elements
  setTimeout(() => {
    if (!window.sourcebookDashboard) {
      window.sourcebookDashboard = new SourcebookDashboard();
      console.log('SourcebookDashboard initialized'); // Debug
    }
  }, 500);
  
  // Add mobile menu button if needed
  if (window.innerWidth <= 768) {
    const menuButton = document.createElement('button');
    menuButton.className = 'btn btn-primary d-md-none position-fixed';
    menuButton.style.cssText = 'top: 1rem; left: 1rem; z-index: 1060;';
    menuButton.innerHTML = '☰ Menu';
    menuButton.onclick = toggleSidebar;
    document.body.appendChild(menuButton);
  }
});