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
    this.geographyData = null;
    
    this.init();
  }
  
  async init() {
    // Set up event listeners first
    this.setupGeographicControls();
    this.setupNavigation();
    
    // Parse URL parameters after everything is setup
    this.parseUrlHash();
    
    // Give DOM elements a moment to be ready, then re-parse URL
    setTimeout(() => {
      this.parseUrlHash();
    }, 100);
    
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
    console.log('URL search params:', window.location.search); // Debug
    if (urlParams.get('geo')) {
      this.geoParams.level = urlParams.get('geo');
      // Decode URL-encoded values (e.g., "Fairfax+City" becomes "Fairfax City")
      this.geoParams.cbsa = urlParams.get('cbsa') ? decodeURIComponent(urlParams.get('cbsa').replace(/\+/g, ' ')) : null;
      this.geoParams.locality = urlParams.get('locality') ? decodeURIComponent(urlParams.get('locality').replace(/\+/g, ' ')) : null;
      console.log('Parsed geo params:', this.geoParams); // Debug
      this.updateGeographicControls();
    }
  }
  
  setupGeographicControls() {
    // Set initial values from hardcoded dropdowns
    const cbsaDropdown = document.getElementById('cbsa-dropdown');
    const localityDropdown = document.getElementById('locality-dropdown');
    
    if (cbsaDropdown) {
      this.geoParams.cbsa = cbsaDropdown.getAttribute('data-value');
    }
    if (localityDropdown) {
      this.geoParams.locality = localityDropdown.getAttribute('data-value');
    }
    
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
    
    // Update selectors and custom dropdowns
    if (this.geoParams.cbsa) {
      const cbsaSelect = document.getElementById('cbsa_selector');
      if (cbsaSelect) {
        cbsaSelect.value = this.geoParams.cbsa;
      }
      
      // Update custom CBSA dropdown display
      const cbsaDropdown = document.getElementById('cbsa-dropdown');
      if (cbsaDropdown) {
        const cbsaSelected = cbsaDropdown.querySelector('.dropdown-selected');
        const cbsaOptions = cbsaDropdown.querySelectorAll('.dropdown-option');
        
        // Update selected display text
        if (cbsaSelected) {
          cbsaSelected.textContent = this.geoParams.cbsa;
        }
        
        // Update dropdown data-value
        cbsaDropdown.setAttribute('data-value', this.geoParams.cbsa);
        
        // Update active option
        cbsaOptions.forEach(option => {
          option.classList.remove('active');
          if (option.getAttribute('data-value') === this.geoParams.cbsa) {
            option.classList.add('active');
          }
        });
      }
    }
    
    if (this.geoParams.locality) {
      const localitySelect = document.getElementById('locality_selector');
      if (localitySelect) {
        localitySelect.value = this.geoParams.locality;
      }
      
      // Update custom locality dropdown display
      const localityDropdown = document.getElementById('locality-dropdown');
      console.log('Updating locality dropdown for:', this.geoParams.locality); // Debug
      console.log('Found locality dropdown:', !!localityDropdown); // Debug
      
      if (localityDropdown) {
        const localitySelected = localityDropdown.querySelector('.dropdown-selected');
        const localityOptions = localityDropdown.querySelectorAll('.dropdown-option');
        
        console.log('Found locality selected element:', !!localitySelected); // Debug
        console.log('Found locality options:', localityOptions.length); // Debug
        
        // Update selected display text
        if (localitySelected) {
          localitySelected.textContent = this.geoParams.locality;
          console.log('Updated locality display to:', this.geoParams.locality); // Debug
        }
        
        // Update dropdown data-value
        localityDropdown.setAttribute('data-value', this.geoParams.locality);
        
        // Update active option
        let foundMatch = false;
        localityOptions.forEach(option => {
          option.classList.remove('active');
          const optionValue = option.getAttribute('data-value');
          if (optionValue === this.geoParams.locality) {
            option.classList.add('active');
            foundMatch = true;
            console.log('Found matching option for:', this.geoParams.locality); // Debug
          }
        });
        
        if (!foundMatch) {
          console.log('No matching option found for:', this.geoParams.locality); // Debug
          console.log('Available options:', Array.from(localityOptions).map(o => o.getAttribute('data-value'))); // Debug
        }
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
      'intro-page': 'Welcome - Sourcebook',
      // Demographics
      'demographics-total-population': 'Total Population',
      'demographics-population-change': 'Population Change',
      'demographics-race-ethnicity': 'Race and Ethnicity',
      'demographics-age': 'Age',
      'demographics-household-type': 'Household Type',
      'demographics-household-size': 'Household Size',
      // Economics
      'economics-household-income': 'Household Income',
      'economics-poverty': 'Poverty',
      'economics-employment': 'Employment',
      // Inventory
      'inventory-housing-production': 'Housing Production',
      'inventory-housing-type': 'Housing Type',
      'inventory-housing-age': 'Housing Age',
      'inventory-housing-characteristics': 'Housing Characteristics',
      'inventory-overcrowding': 'Overcrowding',
      // Homeownership
      'homeownership-rate': 'Homeownership Rate',
      'homeownership-sales': 'Home Sales',
      'homeownership-hpi': 'House Price Index',
      'homeownership-mortgages': 'Mortgages',
      // Rental
      'rental-rent': 'Rent',
      'rental-vacancy': 'Rental Vacancy',
      'rental-assisted': 'Assisted Rentals',
      // Affordability
      'affordability-cost-burden': 'Housing Cost Burden',
      'affordability-gap': 'Rental Housing Gap',
      'affordability-ami': 'HUD AMI Limits',
      // Instability
      'instability-homelessness': 'Homelessness',
      // Economic Impact Calculators
      'calculators-new-construction': 'New Construction Calculator',
      'calculators-renovation': 'Renovation Calculator'
    };
    
    return titleMap[subpageId] || 'Sourcebook';
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