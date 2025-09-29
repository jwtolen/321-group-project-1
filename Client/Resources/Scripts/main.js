// Test to make sure JavaScript is running
console.log('=== JAVASCRIPT IS LOADING ===');

// Global function for remove listing - now handled in detail modal

// Add the missing handleOnLoad function
window.handleOnLoad = async function() {
  console.log('handleOnLoad called');
  // This function doesn't seem to do much, just a placeholder
};

// Basic functionality for the page to work
document.addEventListener('DOMContentLoaded', function() {
  console.log('DOM Content Loaded in main script');
  
  // API Configuration
  const API_CONFIG = {
    baseUrl: window.location.hostname === 'localhost' 
      ? 'http://localhost:5223' 
      : window.location.origin,
    endpoints: {
      listings: '/api/ItemListing',
      listingById: (id) => `/api/ItemListing/${id}`
    }
  };

  // DOM Elements
  const elements = {
    // Main UI
    grid: document.getElementById('listingsGrid'),
    resultsCount: document.getElementById('resultsCount'),
    adminPage: document.getElementById('adminPage'),
    
    // Filters
    searchInput: document.getElementById('searchInput'),
    categorySelect: document.getElementById('categorySelect'),
    universitySelect: document.getElementById('universitySelect'),
    universityDropdown: document.getElementById('universityDropdown'),
    universityText: document.getElementById('universityText'),
    universityDropdownMenu: document.getElementById('universityDropdownMenu'),
    conditionSelect: document.getElementById('conditionSelect'),
    priceMin: document.getElementById('priceMin'),
    priceMax: document.getElementById('priceMax'),
    sortSelect: document.getElementById('sortSelect'),
    resetFiltersBtn: document.getElementById('resetFiltersBtn'),
    
    // Post form
    postBtn: document.getElementById('postBtn'),
    postForm: document.getElementById('postForm'),
    titleInput: document.getElementById('titleInput'),
    priceInput: document.getElementById('priceInput'),
    categoryInput: document.getElementById('categoryInput'),
    conditionInput: document.getElementById('conditionInput'),
    contactInput: document.getElementById('contactInput'),
    descriptionInput: document.getElementById('descriptionInput'),
    imageInput: document.getElementById('imageInput'),
    imagePreview: document.getElementById('imagePreview'),
    sellerNameInput: document.getElementById('sellerNameInput'),
    sellerUniversityInput: document.getElementById('sellerUniversityInput'),
    sellerAvatarInput: document.getElementById('sellerAvatarInput'),
    sellerAvatarPreview: document.getElementById('sellerAvatarPreview'),
    postPasswordInput: document.getElementById('postPasswordInput'),
    
    // Detail modal
    detailModal: document.getElementById('detailModal'),
    
    
    // Detail modal self-deletion
    detailPasswordInput: document.getElementById('detailPasswordInput'),
    removeMyListingBtn: document.getElementById('removeMyListingBtn'),
    detailTitle: document.getElementById('detailTitle'),
    detailImage: document.getElementById('detailImage'),
    detailCategory: document.getElementById('detailCategory'),
    detailCondition: document.getElementById('detailCondition'),
    detailPrice: document.getElementById('detailPrice'),
    detailDescription: document.getElementById('detailDescription'),
    detailSellerAvatar: document.getElementById('detailSellerAvatar'),
    detailSellerName: document.getElementById('detailSellerName'),
    detailSellerMeta: document.getElementById('detailSellerMeta'),
    detailContact: document.getElementById('detailContact'),
    
    // Admin
    adminLoginBtn: document.getElementById('adminLoginBtn'),
    adminLoginBtnMobile: document.getElementById('adminLoginBtnMobile'),
    adminLoginModal: document.getElementById('adminLoginModal'),
    adminLoginSubmit: document.getElementById('adminLoginSubmit'),
    adminUsername: document.getElementById('adminUsername'),
    adminPassword: document.getElementById('adminPassword'),
    logoutBtn: document.getElementById('logoutBtn'),
    editListingModal: document.getElementById('editListingModal'),
    saveEditBtn: document.getElementById('saveEditBtn'),
    
    // Toast
    toastContainer: document.getElementById('toastContainer')
  };

  // State
  let isAdminLoggedIn = false;
  let currentDetailId = null;
  let currentEditId = null;
  
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

  // Utility Functions
  function formatPrice(value) {
    return `$${Number(value).toFixed(2)}`;
  }

  function setAvatarImage(imgEl, src, alt) {
    imgEl.src = src && src.length ? src : 'https://via.placeholder.com/80x80.png?text=User';
    imgEl.alt = alt || 'avatar';
  }

  // Image handling
  function dataUrlToImage(dataUrl) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = dataUrl;
    });
  }

  async function resizeDataUrl(dataUrl, maxW, maxH, quality = 0.8) {
    try {
      const img = await dataUrlToImage(dataUrl);
      const ratio = Math.min(maxW / img.width, maxH / img.height, 1);
      const w = Math.round(img.width * ratio);
      const h = Math.round(img.height * ratio);
      const canvas = document.createElement('canvas');
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, w, h);
      return canvas.toDataURL('image/jpeg', quality);
    } catch {
      return dataUrl;
    }
  }

  // UI Rendering
  function createCard(listing) {
    const col = document.createElement('div');
    col.className = 'col';
    
    const img = document.createElement('img');
    img.className = 'card-img-top img-cover';
    img.alt = listing.title;
    // Handle images with proper API data structure
    const imageUrl = listing.itemPhoto || '';
    const isPlaceholder = imageUrl.includes('via.placeholder.com') || imageUrl.includes('placeholder') || imageUrl === '';
    
    if (isPlaceholder) {
      img.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAwIiBoZWlnaHQ9IjQwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjhmOWZhIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzZjNzU3ZCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPk5vIEltYWdlPC90ZXh0Pjwvc3ZnPg==';
    } else {
      img.src = imageUrl;
      img.onerror = function() {
        this.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAwIiBoZWlnaHQ9IjQwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjhmOWZhIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzZjNzU3ZCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPk5vIEltYWdlPC90ZXh0Pjwvc3ZnPg==';
      };
    }
    
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
          <div class="text-success fw-semibold">${formatPrice(listing.price)}</div>
          <div class="text-secondary small">${listing.condition}</div>
        </div>
      </div>
    `;
    
    const imgContainer = col.querySelector(`#img-${listing.id}`);
    imgContainer.appendChild(img);
    
    col.querySelector('.card').addEventListener('click', async () => {
      console.log('=== CARD CLICKED ===');
      console.log('Listing ID:', listing.id);
      await openDetail(listing.id);
    });
    return col;
  }

  function render(list) {
    elements.grid.innerHTML = '';
    list.forEach(l => elements.grid.appendChild(createCard(l)));
    elements.resultsCount.textContent = `${list.length} result${list.length !== 1 ? 's' : ''}`;
  }

  // Filtering and Search
  async function applyFilters() {
    const raw = await readListings();
    const q = (elements.searchInput.value || '').trim().toLowerCase();
    const cat = elements.categorySelect.value;
    const uni = elements.universityText ? elements.universityText.textContent === 'All' ? '' : elements.universityText.textContent : '';
    const cond = elements.conditionSelect.value;
    const min = parseFloat(elements.priceMin.value);
    const max = parseFloat(elements.priceMax.value);
    const sort = elements.sortSelect.value;

    let res = raw.filter(l => {
      const matchesQ = !q || l.title.toLowerCase().includes(q) || l.description.toLowerCase().includes(q);
      const matchesCat = !cat || l.category === cat;
      const matchesUni = !uni || l.sellerUniversity === uni;
      const matchesCond = !cond || l.condition === cond;
      const price = parseFloat(l.price);
      const matchesMin = isNaN(min) || price >= min;
      const matchesMax = isNaN(max) || price <= max;
      return matchesQ && matchesCat && matchesUni && matchesCond && matchesMin && matchesMax;
    });

    if (sort === 'price_asc') res.sort((a, b) => parseFloat(a.price) - parseFloat(b.price));
    else if (sort === 'price_desc') res.sort((a, b) => parseFloat(b.price) - parseFloat(a.price));
    else res.sort((a, b) => (a.id < b.id ? 1 : -1));

    render(res);
  }

  async function resetFilters() {
    elements.searchInput.value = '';
    elements.categorySelect.value = '';
    if (elements.universityText) {
      elements.universityText.textContent = 'All';
    }
    elements.conditionSelect.value = '';
    elements.priceMin.value = '';
    elements.priceMax.value = '';
    elements.sortSelect.value = '';
    await applyFilters();
  }

  // Basic openDetail function
  async function openDetail(id) {
    console.log('openDetail called with ID:', id);
    currentDetailId = id;
    window.currentDetailId = id; // Keep this for backward compatibility
    
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
    const detailSellerAvatar = document.getElementById('detailSellerAvatar');
    const detailSellerName = document.getElementById('detailSellerName');
    const detailSellerMeta = document.getElementById('detailSellerMeta');
    
    if (detailTitle) detailTitle.textContent = listing.title;
    if (detailCategory) detailCategory.textContent = listing.category;
    if (detailCondition) detailCondition.textContent = listing.condition;
    if (detailPrice) detailPrice.textContent = `$${Number(listing.price).toFixed(2)}`;
    if (detailDescription) detailDescription.textContent = listing.description;
    if (detailContact) detailContact.textContent = listing.sellerContact;
    
    // Handle seller information
    if (detailSellerName) detailSellerName.textContent = listing.sellerName || 'Unknown Seller';
    if (detailSellerMeta) detailSellerMeta.textContent = listing.sellerUniversity || 'Unknown University';
    
    // Handle seller avatar
    if (detailSellerAvatar) {
      const sellerPhotoUrl = listing.sellerPhoto || '';
      if (sellerPhotoUrl && !sellerPhotoUrl.includes('placeholder')) {
        detailSellerAvatar.src = sellerPhotoUrl;
      } else {
        detailSellerAvatar.src = 'https://via.placeholder.com/80x80.png?text=User';
      }
    }
    
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
    
    // Show modal with proper aria-hidden management
    const modal = bootstrap.Modal.getOrCreateInstance(document.getElementById('detailModal'));
    
    // Ensure aria-hidden is properly managed
    document.getElementById('detailModal').removeAttribute('aria-hidden');
    
    modal.show();
    
    // Add event listeners for proper modal management
    document.getElementById('detailModal').addEventListener('shown.bs.modal', function() {
      this.removeAttribute('aria-hidden');
    });
    
    document.getElementById('detailModal').addEventListener('hidden.bs.modal', function() {
      this.setAttribute('aria-hidden', 'true');
    });
  }
  
  // Universities list
  const UNIVERSITIES = [
    'University of Alabama', 'Auburn University', 'University of Alabama at Birmingham',
    'University of Alabama in Huntsville', 'Alabama State University', 'Troy University',
    'Jacksonville State University', 'University of North Alabama', 'University of South Alabama',
    'Alabama A&M University', 'Samford University', 'Birmingham-Southern College',
    'Spring Hill College', 'Huntingdon College', 'Miles College', 'Stillman College',
    'Tuskegee University', 'University of Georgia', 'University of Florida',
    'University of Tennessee', 'Louisiana State University', 'University of Mississippi (Ole Miss)',
    'Mississippi State University', 'University of Kentucky', 'Vanderbilt University',
    'University of South Carolina', 'University of Arkansas', 'Texas A&M University',
    'University of Missouri'
  ];

  // University options population
  function populateUniversityOptions() {
    // Post form seller university
    const sellerUniversityInput = document.getElementById('sellerUniversityInput');
    if (sellerUniversityInput) {
      const sel = sellerUniversityInput;
      const prev = sel.value;
      sel.innerHTML = '<option value="" disabled selected>Choose...</option>';
      UNIVERSITIES.forEach(u => {
        const opt = document.createElement('option');
        opt.textContent = u;
        sel.appendChild(opt);
      });
      sel.value = prev;
    }
    
    // Custom dropdown for filters
    const universityDropdownMenu = document.getElementById('universityDropdownMenu');
    if (universityDropdownMenu) {
      universityDropdownMenu.innerHTML = '<li><a class="dropdown-item" href="#" data-value="">All</a></li>';
      UNIVERSITIES.forEach(u => {
        const li = document.createElement('li');
        const a = document.createElement('a');
        a.className = 'dropdown-item';
        a.href = '#';
        a.setAttribute('data-value', u);
        a.textContent = u;
        li.appendChild(a);
        universityDropdownMenu.appendChild(li);
      });
    }
  }

  // Handle custom university dropdown
  function setupUniversityDropdown() {
    const universityDropdownMenu = document.getElementById('universityDropdownMenu');
    if (universityDropdownMenu) {
      // Add click event listeners to dropdown items
      universityDropdownMenu.addEventListener('click', function(e) {
        e.preventDefault();
        if (e.target.classList.contains('dropdown-item')) {
          const value = e.target.getAttribute('data-value');
          const text = e.target.textContent;
          
          // Update the button text
          const universityText = document.getElementById('universityText');
          if (universityText) {
            universityText.textContent = text;
          }
          
          // Close the dropdown
          const universityDropdown = document.getElementById('universityDropdown');
          if (universityDropdown) {
            const dropdown = bootstrap.Dropdown.getInstance(universityDropdown);
          if (dropdown) {
            dropdown.hide();
            }
          }
          
          // Apply filters
          applyFilters();
        }
      });
    }
  }

  // Additional functions needed
  async function createListing(listing) {
    try {
      const response = await fetch(`${API_CONFIG.baseUrl}${API_CONFIG.endpoints.listings}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(listing)
      });
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      return true;
    } catch (err) {
      console.error('Failed to create listing', err);
      return false;
    }
  }

  function generateId() {
    return Math.floor(Math.random() * 1000000) + 1000;
  }

  // Toast notifications
  function showToast(message, type = 'primary') {
    const wrapper = document.createElement('div');
    wrapper.innerHTML = `
      <div class="toast align-items-center text-bg-${type} border-0" role="alert" aria-live="assertive" aria-atomic="true">
        <div class="d-flex">
          <div class="toast-body">${message}</div>
          <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
        </div>
      </div>
    `;
    const toastEl = wrapper.firstElementChild;
    elements.toastContainer.appendChild(toastEl);
    const toast = new bootstrap.Toast(toastEl, { delay: 2000 });
    toast.show();
    toastEl.addEventListener('hidden.bs.toast', () => toastEl.remove());
  }

  // Make functions globally accessible
  window.showToast = showToast;
  window.applyFilters = applyFilters;

  // Handle edit listing button in detail modal
  document.getElementById('editListingBtn').addEventListener('click', async () => {
    const password = document.getElementById('detailPasswordInput').value.trim();
    
    console.log('Edit button clicked, currentDetailId:', currentDetailId, 'password:', password);
    
    if (!password) {
      showToast('Please enter your listing password', 'warning');
      return;
    }
    
    try {
      // Verify password first
      console.log('Verifying password for ID:', currentDetailId);
      const response = await fetch(`${API_CONFIG.baseUrl}/api/ItemListing/verify-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ Id: currentDetailId, Password: password })
      });
      
      if (response.ok) {
        // Get listing data and populate edit form
        const listings = await readListings();
        const listing = listings.find(l => l.id === currentDetailId);
        
        if (listing) {
          // Populate edit form
          document.getElementById('editTitle').value = listing.title;
          document.getElementById('editPrice').value = listing.price;
          document.getElementById('editCategory').value = listing.category;
          document.getElementById('editCondition').value = listing.condition;
          document.getElementById('editSellerName').value = listing.sellerName || '';
          document.getElementById('editContact').value = listing.sellerContact;
          document.getElementById('editDescription').value = listing.description;
          
          // Populate existing images
          const editItemImagePreview = document.getElementById('editItemImagePreview');
          const editSellerImagePreview = document.getElementById('editSellerImagePreview');
          
          if (listing.itemPhoto && !listing.itemPhoto.includes('placeholder')) {
            editItemImagePreview.src = listing.itemPhoto;
            editItemImagePreview.classList.remove('d-none');
          } else {
            editItemImagePreview.classList.add('d-none');
          }
          
          if (listing.sellerPhoto && !listing.sellerPhoto.includes('placeholder')) {
            editSellerImagePreview.src = listing.sellerPhoto;
            editSellerImagePreview.classList.remove('d-none');
          } else {
            editSellerImagePreview.classList.add('d-none');
          }
          
          // Store current edit ID and password
          currentEditId = currentDetailId;
          window.currentEditPassword = password;
          
          // Close detail modal and open edit modal
          bootstrap.Modal.getInstance(elements.detailModal)?.hide();
          const editModal = bootstrap.Modal.getOrCreateInstance(elements.editListingModal);
          editModal.show();
        }
      } else {
        showToast('Invalid password', 'danger');
      }
    } catch (error) {
      console.error('Error verifying password:', error);
      showToast('An error occurred. Please try again.', 'danger');
    }
  });

  // Handle delete listing button in detail modal
  document.getElementById('removeMyListingBtn').addEventListener('click', async () => {
    const password = document.getElementById('detailPasswordInput').value.trim();
    
    console.log('Delete button clicked, currentDetailId:', currentDetailId, 'password:', password);
    
    if (!password) {
      showToast('Please enter your listing password', 'warning');
      return;
    }
    
    if (confirm('Are you sure you want to delete this listing? This action cannot be undone.')) {
      try {
        console.log('Deleting listing with ID:', currentDetailId);
        const response = await fetch(`${API_CONFIG.baseUrl}${API_CONFIG.endpoints.listingById(currentDetailId)}`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ Password: password })
        });
        
        if (response.ok) {
          showToast('Listing deleted successfully', 'success');
          bootstrap.Modal.getInstance(elements.detailModal)?.hide();
          await applyFilters(); // Refresh the listings
        } else {
          showToast('Invalid password or failed to delete listing', 'danger');
        }
      } catch (error) {
        console.error('Error deleting listing:', error);
        showToast('An error occurred. Please try again.', 'danger');
      }
    }
  });

  // Handle save edit button
  elements.saveEditBtn.addEventListener('click', async () => {
    if (!currentEditId || !window.currentEditPassword) {
      showToast('No listing selected for editing', 'danger');
      return;
    }
    
    // Get current images or new ones
    const editItemImagePreview = document.getElementById('editItemImagePreview');
    const editSellerImagePreview = document.getElementById('editSellerImagePreview');
    const editItemImageInput = document.getElementById('editItemImage');
    const editSellerImageInput = document.getElementById('editSellerImage');
    
    // Use new image if uploaded, otherwise keep existing
    let itemPhoto = editItemImagePreview.src;
    let sellerPhoto = editSellerImagePreview.src;
    
    // Process new images if uploaded
    if (editItemImageInput.files && editItemImageInput.files[0]) {
      try {
        const reader = new FileReader();
        const fileData = await new Promise((resolve) => {
          reader.onload = (e) => resolve(e.target.result);
          reader.readAsDataURL(editItemImageInput.files[0]);
        });
        itemPhoto = await resizeDataUrl(fileData, 1200, 1200, 0.8);
      } catch (error) {
        console.error('Error processing item image:', error);
      }
    }
    
    if (editSellerImageInput.files && editSellerImageInput.files[0]) {
      try {
        const reader = new FileReader();
        const fileData = await new Promise((resolve) => {
          reader.onload = (e) => resolve(e.target.result);
          reader.readAsDataURL(editSellerImageInput.files[0]);
        });
        sellerPhoto = await resizeDataUrl(fileData, 256, 256, 0.85);
      } catch (error) {
        console.error('Error processing seller image:', error);
      }
    }

    const editData = {
      id: currentEditId,
      title: document.getElementById('editTitle').value.trim(),
      price: document.getElementById('editPrice').value,
      category: document.getElementById('editCategory').value,
      condition: document.getElementById('editCondition').value,
      sellerContact: document.getElementById('editContact').value.trim(),
      description: document.getElementById('editDescription').value.trim(),
      itemPhoto: itemPhoto,
      sellerPhoto: sellerPhoto,
      postPassword: window.currentEditPassword
    };
    
    try {
      const response = await fetch(`${API_CONFIG.baseUrl}${API_CONFIG.endpoints.listingById(currentEditId)}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(editData)
      });
      
      if (response.ok) {
        showToast('Listing updated successfully', 'success');
        bootstrap.Modal.getInstance(elements.editListingModal)?.hide();
        await applyFilters(); // Refresh the listings
        currentEditId = null;
        window.currentEditPassword = null;
      } else {
        showToast('Failed to update listing', 'danger');
      }
    } catch (error) {
      console.error('Error updating listing:', error);
      showToast('An error occurred. Please try again.', 'danger');
    }
  });

  // Event Listeners
  // Search and filters
  elements.searchInput.addEventListener('input', async () => await applyFilters());
  [elements.categorySelect, elements.conditionSelect, elements.priceMin, elements.priceMax, elements.sortSelect]
    .forEach(el => el.addEventListener('change', async () => await applyFilters()));
  elements.resetFiltersBtn.addEventListener('click', async () => await resetFilters());

  // Post button (desktop and mobile)
  elements.postBtn.addEventListener('click', () => {
    const modal = bootstrap.Modal.getOrCreateInstance(document.getElementById('postOffcanvas'));
    modal.show();
  });

  // Mobile post button
  const postBtnMobile = document.getElementById('postBtnMobile');
  if (postBtnMobile) {
    postBtnMobile.addEventListener('click', () => {
      const modal = bootstrap.Modal.getOrCreateInstance(document.getElementById('postOffcanvas'));
      modal.show();
    });
  }

  // Image previews
  elements.imageInput.addEventListener('change', (e) => {
    const file = e.target.files?.[0];
    if (!file) {
      elements.imagePreview.classList.add('d-none');
      elements.imagePreview.src = '';
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      elements.imagePreview.src = reader.result;
      elements.imagePreview.classList.remove('d-none');
    };
    reader.readAsDataURL(file);
  });

  // Edit form image previews
  document.getElementById('editItemImage').addEventListener('change', (e) => {
    const file = e.target.files?.[0];
    const preview = document.getElementById('editItemImagePreview');
    if (!file) {
      preview.classList.add('d-none');
      preview.src = '';
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      preview.src = reader.result;
      preview.classList.remove('d-none');
    };
    reader.readAsDataURL(file);
  });

  document.getElementById('editSellerImage').addEventListener('change', (e) => {
    const file = e.target.files?.[0];
    const preview = document.getElementById('editSellerImagePreview');
    if (!file) {
      preview.classList.add('d-none');
      preview.src = '';
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      preview.src = reader.result;
      preview.classList.remove('d-none');
    };
    reader.readAsDataURL(file);
  });

  if (elements.sellerAvatarInput) {
    elements.sellerAvatarInput.addEventListener('change', (e) => {
      const file = e.target.files?.[0];
      if (!file) {
        elements.sellerAvatarPreview.classList.add('d-none');
        elements.sellerAvatarPreview.src = '';
        return;
      }
      const reader = new FileReader();
      reader.onload = () => {
        elements.sellerAvatarPreview.src = reader.result;
        elements.sellerAvatarPreview.classList.remove('d-none');
      };
      reader.readAsDataURL(file);
    });
  }

  // Post form submission
  elements.postForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const form = elements.postForm;
    form.classList.add('was-validated');
    if (!form.checkValidity()) return;

    // Compress images
    const rawItemImg = elements.imagePreview.src || '';
    const rawAvatar = elements.sellerAvatarPreview.src || '';
    const image = rawItemImg && rawItemImg.startsWith('data:') ? await resizeDataUrl(rawItemImg, 1200, 1200, 0.8) : rawItemImg;
    const avatar = rawAvatar && rawAvatar.startsWith('data:') ? await resizeDataUrl(rawAvatar, 256, 256, 0.85) : rawAvatar;

    const newListing = {
      id: generateId(),
      title: elements.titleInput.value.trim(),
      price: elements.priceInput.value,
      category: elements.categoryInput.value,
      condition: elements.conditionInput.value,
      sellerContact: elements.contactInput.value.trim(),
      description: elements.descriptionInput.value.trim(),
      itemPhoto: image,
      sellerPhoto: avatar,
      sellerUniversity: elements.sellerUniversityInput.value,
      postPassword: elements.postPasswordInput.value.trim()
    };
    
    const success = await createListing(newListing);
    if (!success) {
      showToast('Could not save listing. Please try again.', 'danger');
      return;
    }

    // Reset form and close
    form.reset();
    form.classList.remove('was-validated');
    elements.imagePreview.src = '';
    elements.imagePreview.classList.add('d-none');
    elements.sellerAvatarPreview.src = '';
    elements.sellerAvatarPreview.classList.add('d-none');
    bootstrap.Modal.getInstance(document.getElementById('postOffcanvas'))?.hide();
    showToast('Listing published', 'success');
    
    // Refresh the listings
    await applyFilters();
    populateUniversityOptions();
  });

  // Admin login event listeners
  elements.adminLoginBtn.addEventListener('click', () => {
    const modal = bootstrap.Modal.getOrCreateInstance(elements.adminLoginModal);
    modal.show();
  });

  if (elements.adminLoginBtnMobile) {
    elements.adminLoginBtnMobile.addEventListener('click', () => {
      const modal = bootstrap.Modal.getOrCreateInstance(elements.adminLoginModal);
      modal.show();
    });
  }

  // Initialize
  populateUniversityOptions();
  setupUniversityDropdown();
  
  // Load listings on page load
  applyFilters();
});