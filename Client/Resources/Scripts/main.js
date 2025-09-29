// Test to make sure JavaScript is running
console.log('=== JAVASCRIPT IS LOADING ===');
alert('MAIN.JS IS LOADING - If you see this, the script is working!');

// Global function for remove listing - defined at top level
window.handleRemoveListing = async function(e) {
  console.log('=== HANDLE REMOVE LISTING CALLED ===');
  
  if (e) {
    e.preventDefault();
    e.stopPropagation();
  }
  
  console.log('Remove my listing button clicked!');
  
  const passwordInput = document.getElementById('detailPasswordInput');
  const password = passwordInput ? passwordInput.value.trim() : '';
  
  console.log('Password value:', password);
  console.log('Current detail ID:', window.currentDetailId);
  
  if (!password) {
    alert('Please enter your listing password');
    return;
  }
  
  if (confirm('Are you sure you want to remove your listing? This action cannot be undone.')) {
    console.log('Proceeding with deletion...');
    
    try {
      const response = await fetch(`${window.location.origin}/api/ItemListing/${window.currentDetailId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ Password: password })
      });
      
      if (response.ok) {
        alert('Your listing has been removed');
        if (passwordInput) passwordInput.value = '';
        const modal = bootstrap.Modal.getInstance(document.getElementById('detailModal'));
        if (modal) modal.hide();
        location.reload();
      } else {
        alert('Invalid password or failed to remove listing');
      }
    } catch (error) {
      console.error('Error deleting listing:', error);
      alert('Error removing listing');
    }
  }
};

// Make sure the function is available immediately
console.log('handleRemoveListing function defined:', typeof window.handleRemoveListing);

// Add the missing handleOnLoad function
window.handleOnLoad = async function() {
  console.log('handleOnLoad called');
  // This function doesn't seem to do much, just a placeholder
};

// Basic functionality for the page to work
document.addEventListener('DOMContentLoaded', function() {
  console.log('DOM Content Loaded in main script');
  
  // Basic API configuration
  const API_CONFIG = {
    baseUrl: window.location.hostname === 'localhost' 
      ? 'http://localhost:5223' 
      : window.location.origin,
    endpoints: {
      listings: '/api/ItemListing',
      listingById: (id) => `/api/ItemListing/${id}`
    }
  };
  
  // Basic function to load listings
  async function readListings() {
    try {
      const response = await fetch(`${API_CONFIG.baseUrl}${API_CONFIG.endpoints.listings}`);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      return await response.json();
    } catch (err) {
      console.error('Failed to fetch listings', err);
      return [];
    }
  }
  
  // Basic function to apply filters
  async function applyFilters() {
    const raw = await readListings();
    const grid = document.getElementById('listingsGrid');
    const resultsCount = document.getElementById('resultsCount');
    
    if (grid) {
      grid.innerHTML = '';
      raw.forEach(listing => {
        const col = document.createElement('div');
        col.className = 'col';
        col.innerHTML = `
          <div class="card h-100 shadow-sm cursor-pointer" data-id="${listing.id}">
            <div class="card-img-top img-cover" style="background: #f8f9fa; display: flex; align-items: center; justify-content: center; color: #6c757d; font-size: 14px;">
              <div id="img-${listing.id}"></div>
            </div>
            <div class="card-body">
              <div class="d-flex justify-content-between align-items-start">
                <h3 class="h6 mb-1 clamp-2">${listing.title}</h3>
                <span class="badge text-bg-primary ms-2">${listing.category}</span>
              </div>
              <div class="text-success fw-semibold">$${Number(listing.price).toFixed(2)}</div>
              <div class="text-secondary small">${listing.condition}</div>
            </div>
          </div>
        `;
        
        // Add click handler to open detail modal
        col.querySelector('.card').addEventListener('click', async () => {
          console.log('Card clicked, opening detail for ID:', listing.id);
          window.currentDetailId = listing.id;
          await openDetail(listing.id);
        });
        
        grid.appendChild(col);
      });
    }
    
    if (resultsCount) {
      resultsCount.textContent = `${raw.length} result${raw.length !== 1 ? 's' : ''}`;
    }
  }
  
  // Basic openDetail function
  async function openDetail(id) {
    console.log('openDetail called with ID:', id);
    window.currentDetailId = id;
    
    const listings = await readListings();
    const listing = listings.find(l => l.id === id);
    if (!listing) {
      console.error('Listing not found for ID:', id);
      return;
    }
    
    // Populate modal elements
    const detailTitle = document.getElementById('detailTitle');
    const detailImage = document.getElementById('detailImage');
    const detailCategory = document.getElementById('detailCategory');
    const detailCondition = document.getElementById('detailCondition');
    const detailPrice = document.getElementById('detailPrice');
    const detailDescription = document.getElementById('detailDescription');
    const detailContact = document.getElementById('detailContact');
    
    if (detailTitle) detailTitle.textContent = listing.title;
    if (detailCategory) detailCategory.textContent = listing.category;
    if (detailCondition) detailCondition.textContent = listing.condition;
    if (detailPrice) detailPrice.textContent = `$${Number(listing.price).toFixed(2)}`;
    if (detailDescription) detailDescription.textContent = listing.description;
    if (detailContact) detailContact.textContent = listing.sellerContact;
    
    // Handle image
    if (detailImage) {
      const imageUrl = listing.itemPhoto || '';
      if (imageUrl && !imageUrl.includes('placeholder')) {
        detailImage.src = imageUrl;
      } else {
        detailImage.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAwIiBoZWlnaHQ9IjQwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjhmOWZhIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzZjNzU3ZCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPk5vIEltYWdlPC90ZXh0Pjwvc3ZnPg==';
      }
    }
    
    // Clear password input
    const passwordInput = document.getElementById('detailPasswordInput');
    if (passwordInput) passwordInput.value = '';
    
    // Show modal
    const modal = bootstrap.Modal.getOrCreateInstance(document.getElementById('detailModal'));
    modal.show();
  }
  
  // Load listings on page load
  applyFilters();
});