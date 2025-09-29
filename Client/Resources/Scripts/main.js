// Global function for remove listing - defined at top level
window.handleRemoveListing = async function(e) {
  e.preventDefault();
  e.stopPropagation();
  console.log('Remove my listing button clicked!');
  
  const passwordInput = document.getElementById('detailPasswordInput');
  const password = passwordInput ? passwordInput.value.trim() : '';
  
  console.log('Password value:', password);
  console.log('Current detail ID:', window.currentDetailId);
  
  if (!password) {
    window.showToast('Please enter your listing password', 'warning');
    return;
  }
  
  if (confirm('Are you sure you want to remove your listing? This action cannot be undone.')) {
    console.log('Proceeding with deletion...');
    const success = await window.deleteListing(window.currentDetailId, password);
    console.log('Delete result:', success);
    
    if (success) {
      window.showToast('Your listing has been removed', 'success');
      if (passwordInput) passwordInput.value = '';
      const modal = bootstrap.Modal.getInstance(document.getElementById('detailModal'));
      if (modal) modal.hide();
      await window.applyFilters();
    } else {
      window.showToast('Invalid password or failed to remove listing', 'danger');
    }
  }
};

document.addEventListener('DOMContentLoaded', () => {
  // API Configuration
  const API_CONFIG = {
    baseUrl: window.location.hostname === 'localhost' 
      ? 'http://localhost:5223' 
      : window.location.origin, // Use current domain for production
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
    
    // Password prompt modal
    passwordPromptModal: document.getElementById('passwordPromptModal'),
    passwordPromptInput: document.getElementById('passwordPromptInput'),
    passwordPromptSubmit: document.getElementById('passwordPromptSubmit'),
    
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
  let currentAction = null; // 'edit' or 'delete'
  let currentListingId = null;
  
  // Make variables and functions globally accessible
  window.currentDetailId = currentDetailId;
  window.showToast = showToast;
  window.deleteListing = deleteListing;
  window.applyFilters = applyFilters;

  // Data Management
  window.handleOnLoad = async function() {
    let response = await fetch('https://randomuser.me/api/');
    console.log(response);
    let data = await response.json();
    console.log(data);
  }

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

  async function deleteListing(id, password = null) {
    try {
      const response = await fetch(`${API_CONFIG.baseUrl}${API_CONFIG.endpoints.listingById(id)}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json'
        },
        body: password ? JSON.stringify({ Password: password }) : undefined
      });
      
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      return true;
    } catch (err) {
      console.error('Failed to delete listing', err);
      return false;
    }
  }

  async function updateListing(listing) {
    try {
      // Add password if available
      if (window.currentEditPassword) {
        listing.postPassword = window.currentEditPassword;
        window.currentEditPassword = null; // Clear after use
      }
      
      const response = await fetch(`${API_CONFIG.baseUrl}${API_CONFIG.endpoints.listingById(listing.id)}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(listing)
      });
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      return true;
    } catch (err) {
      console.error('Failed to update listing', err);
      return false;
    }
  }

  // Password verification functions
  async function verifyPassword(listingId, password) {
    try {
      const response = await fetch(`${API_CONFIG.baseUrl}${API_CONFIG.endpoints.listings}/verify-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: listingId,
          password: password
        })
      });
      
      return response.ok;
    } catch (error) {
      console.error('Error verifying password:', error);
      return false;
    }
  }
  
  window.showPasswordPrompt = function(action, listingId) {
    currentAction = action;
    currentListingId = listingId;
    elements.passwordPromptInput.value = '';
    const modal = bootstrap.Modal.getOrCreateInstance(elements.passwordPromptModal);
    modal.show();
  }
  
  function editListing(id) {
    const listing = allListings.find(l => l.id === id);
    if (!listing) return;
    
    // Populate edit form
    document.getElementById('editTitle').value = listing.title || '';
    document.getElementById('editPrice').value = listing.price || '';
    document.getElementById('editCategory').value = listing.category || '';
    document.getElementById('editCondition').value = listing.condition || '';
    document.getElementById('editSellerName').value = listing.sellerContact || '';
    document.getElementById('editContact').value = listing.sellerContact || '';
    document.getElementById('editDescription').value = listing.description || '';
    
    currentEditId = id;
    const modal = bootstrap.Modal.getOrCreateInstance(elements.editListingModal);
    modal.show();
  }
  
  async function handlePasswordVerification() {
    const password = elements.passwordPromptInput.value.trim();
    if (!password) {
      elements.passwordPromptInput.classList.add('is-invalid');
      return;
    }
    
    const isValid = await verifyPassword(currentListingId, password);
    if (!isValid) {
      elements.passwordPromptInput.classList.add('is-invalid');
      showToast('Invalid password', 'danger');
      return;
    }
    
    // Hide modal and proceed with action
    const modal = bootstrap.Modal.getInstance(elements.passwordPromptModal);
    modal.hide();
    
    if (currentAction === 'edit') {
      // Store the password for the edit operation
      window.currentEditPassword = password;
      editListing(currentListingId);
    } else if (currentAction === 'delete') {
      const success = await deleteListing(currentListingId, password);
      if (success) {
        showToast('Listing deleted successfully', 'success');
        await loadListings();
      } else {
        showToast('Failed to delete listing', 'danger');
      }
    }
  }

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

  // University options population
  function populateUniversityOptions() {
    // Post form seller university
    if (elements.sellerUniversityInput) {
      const sel = elements.sellerUniversityInput;
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
    if (elements.universityDropdownMenu) {
      elements.universityDropdownMenu.innerHTML = '<li><a class="dropdown-item" href="#" data-value="">All</a></li>';
      UNIVERSITIES.forEach(u => {
        const li = document.createElement('li');
        const a = document.createElement('a');
        a.className = 'dropdown-item';
        a.href = '#';
        a.setAttribute('data-value', u);
        a.textContent = u;
        li.appendChild(a);
        elements.universityDropdownMenu.appendChild(li);
      });
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
          <div class="mt-2 d-flex gap-1">
            <button class="btn btn-sm btn-outline-primary" onclick="event.stopPropagation(); showPasswordPrompt('edit', ${listing.id})">
              <i class="bi bi-pencil"></i> Edit
            </button>
            <button class="btn btn-sm btn-outline-danger" onclick="event.stopPropagation(); showPasswordPrompt('delete', ${listing.id})">
              <i class="bi bi-trash"></i> Delete
            </button>
          </div>
        </div>
      </div>
    `;
    
    const imgContainer = col.querySelector(`#img-${listing.id}`);
    imgContainer.appendChild(img);
    
    col.querySelector('.card').addEventListener('click', async () => await openDetail(listing.id));
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

  // Detail Modal
  async function openDetail(id) {
    console.log('openDetail called with ID:', id);
    currentDetailId = id;
    window.currentDetailId = id;
    console.log('Set currentDetailId to:', id);
    console.log('window.currentDetailId is now:', window.currentDetailId);
    const listings = await readListings();
    const l = listings.find(x => x.id === id);
    if (!l) {
      console.error('Listing not found for ID:', id);
      return;
    }
    console.log('Found listing:', l);
    
    elements.detailTitle.textContent = l.title;
    
    // Handle item image with proper API data structure
    const imageUrl = l.itemPhoto || '';
    const isPlaceholder = imageUrl.includes('via.placeholder.com') || imageUrl.includes('placeholder') || imageUrl === '';
    
    if (isPlaceholder) {
      elements.detailImage.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAwIiBoZWlnaHQ9IjQwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjhmOWZhIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzZjNzU3ZCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPk5vIEltYWdlPC90ZXh0Pjwvc3ZnPg==';
    } else {
      elements.detailImage.src = imageUrl;
      elements.detailImage.onerror = function() {
        this.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAwIiBoZWlnaHQ9IjQwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjhmOWZhIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzZjNzU3ZCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPk5vIEltYWdlPC90ZXh0Pjwvc3ZnPg==';
      };
    }
    
    elements.detailCategory.textContent = l.category;
    elements.detailCondition.textContent = l.condition;
    elements.detailPrice.textContent = formatPrice(l.price);
    elements.detailDescription.textContent = l.description;
    
    // Handle seller information with correct API structure
    if (elements.detailSellerAvatar) {
      const sellerPhoto = l.sellerPhoto || '';
      const sellerName = l.sellerContact || 'Unknown Seller';
      setAvatarImage(elements.detailSellerAvatar, sellerPhoto, sellerName);
      elements.detailSellerName.textContent = sellerName;
      elements.detailSellerMeta.textContent = l.sellerUniversity || 'University of Alabama';
    }
    elements.detailContact.textContent = l.sellerContact;
    
    // Clear password input
    elements.detailPasswordInput.value = '';
    
    // Store the ID in the modal as a data attribute
    elements.detailModal.setAttribute('data-listing-id', id);
    console.log('Set modal data-listing-id to:', id);
    console.log('Modal data-listing-id is now:', elements.detailModal.getAttribute('data-listing-id'));
    
    const modal = bootstrap.Modal.getOrCreateInstance(elements.detailModal);
    console.log('About to show modal');
    modal.show();
    console.log('Modal shown');
  }

  // Admin Functions
  function showAdminPage() {
    elements.adminPage.classList.remove('d-none');
    document.querySelector('.container').classList.add('d-none');
    loadAdminData();
  }

  function showMainPage() {
    elements.adminPage.classList.add('d-none');
    document.querySelector('.container').classList.remove('d-none');
  }

  async function loadAdminData() {
    const listings = await readListings();
    
    // Update stats
    document.getElementById('totalListings').textContent = listings.length;
    document.getElementById('activeListings').textContent = listings.length;
    document.getElementById('totalUsers').textContent = new Set(listings.map(l => l.sellerContact)).size;
    document.getElementById('totalRevenue').textContent = '$' + listings.reduce((sum, l) => sum + parseFloat(l.price), 0).toFixed(2);
    
    // Populate admin table
    const tableBody = document.getElementById('adminListingsTable');
    tableBody.innerHTML = '';
    
    listings.forEach(listing => {
      const row = document.createElement('tr');
      row.innerHTML = `
        <td>${listing.title}</td>
        <td>${formatPrice(listing.price)}</td>
        <td><span class="badge text-bg-primary">${listing.category}</span></td>
        <td>${listing.sellerContact}</td>
        <td>${listing.sellerContact}</td>
        <td>
          <div class="btn-group" role="group">
            <button class="btn btn-sm btn-outline-primary" onclick="editAdminListing('${listing.id}')" title="Edit">
              <i class="bi bi-pencil"></i>
            </button>
            <button class="btn btn-sm btn-outline-danger" onclick="deleteAdminListing('${listing.id}')" title="Delete">
              <i class="bi bi-trash"></i>
            </button>
          </div>
        </td>
        <td>
          <small class="text-muted">${listing.postPassword || 'No password'}</small>
        </td>
      `;
      tableBody.appendChild(row);
    });
  }

  // Global admin functions
  window.editAdminListing = async function(id) {
    const listings = await readListings();
    const listing = listings.find(l => l.id == id); // Use == for type coercion
    if (!listing) return;
    
    currentEditId = id;
    
    // Populate edit form
    document.getElementById('editTitle').value = listing.title || '';
    document.getElementById('editPrice').value = listing.price || '';
    document.getElementById('editCategory').value = listing.category || '';
    document.getElementById('editCondition').value = listing.condition || '';
    // Extract name from email (everything before @)
    const sellerName = listing.sellerContact ? listing.sellerContact.split('@')[0] : '';
    document.getElementById('editSellerName').value = sellerName;
    document.getElementById('editContact').value = listing.sellerContact || '';
    document.getElementById('editDescription').value = listing.description || '';
    
    const modal = bootstrap.Modal.getOrCreateInstance(elements.editListingModal);
    modal.show();
  };

  window.deleteAdminListing = async function(id) {
    if (confirm('Are you sure you want to delete this listing?')) {
      try {
        const response = await fetch(`${API_CONFIG.baseUrl}${API_CONFIG.endpoints.listings}/admin/${id}`, {
          method: 'DELETE'
        });
        
        if (response.ok) {
          await loadAdminData();
          showToast('Listing deleted', 'danger');
          await applyFilters();
        } else {
          showToast('Failed to delete listing', 'danger');
        }
      } catch (error) {
        console.error('Error deleting listing:', error);
        showToast('Failed to delete listing', 'danger');
      }
    }
  };

  // Admin update function that bypasses password
  async function updateAdminListing(listing) {
    try {
      const response = await fetch(`${API_CONFIG.baseUrl}${API_CONFIG.endpoints.listings}/admin/${listing.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(listing)
      });
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      return true;
    } catch (err) {
      console.error('Failed to update listing', err);
      return false;
    }
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

  // Admin login (desktop and mobile)
  elements.adminLoginBtn.addEventListener('click', () => {
    const modal = bootstrap.Modal.getOrCreateInstance(elements.adminLoginModal);
    modal.show();
  });

  // Mobile admin login
  const adminLoginBtnMobile = document.getElementById('adminLoginBtnMobile');
  if (adminLoginBtnMobile) {
    adminLoginBtnMobile.addEventListener('click', () => {
      const modal = bootstrap.Modal.getOrCreateInstance(elements.adminLoginModal);
      modal.show();
    });
  }

  elements.adminLoginSubmit.addEventListener('click', () => {
    const username = elements.adminUsername.value;
    const password = elements.adminPassword.value;
    
    if (username === 'admin' && password === 'admin123') {
      isAdminLoggedIn = true;
      bootstrap.Modal.getInstance(elements.adminLoginModal)?.hide();
      showAdminPage();
      showToast('Admin login successful', 'success');
    } else {
      showToast('Invalid credentials', 'danger');
    }
  });

  elements.logoutBtn.addEventListener('click', () => {
    isAdminLoggedIn = false;
    showMainPage();
    showToast('Logged out successfully', 'info');
  });

  // Password prompt submit
  elements.passwordPromptSubmit.addEventListener('click', async () => {
    await handlePasswordVerification();
  });

  // Remove my listing button - use direct event listener
  function setupRemoveListingButton() {
    const removeBtn = document.getElementById('removeMyListingBtn');
    if (removeBtn) {
      // Remove any existing listeners
      removeBtn.removeEventListener('click', handleRemoveListing);
      // Add new listener
      removeBtn.addEventListener('click', handleRemoveListing);
      console.log('Remove listing button event listener attached');
    } else {
      console.log('Remove listing button not found, will retry...');
      // Retry after a short delay
      setTimeout(setupRemoveListingButton, 100);
    }
  }
  
  
  // Setup the button when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', setupRemoveListingButton);
  } else {
    setupRemoveListingButton();
  }

  // Edit listing
  elements.saveEditBtn.addEventListener('click', async () => {
    if (!currentEditId) return;
    
    // Get the original listing to preserve images
    const listings = await readListings();
    const originalListing = listings.find(l => l.id == currentEditId);
    
    // Get form values
    const sellerName = document.getElementById('editSellerName').value.trim();
    const contactEmail = document.getElementById('editContact').value.trim();
    
    // Validate required fields
    if (!contactEmail || !contactEmail.includes('@')) {
      showToast('Please enter a valid email address', 'danger');
      return;
    }
    
    // Create updated listing object
    const updatedListing = {
      id: parseInt(currentEditId),
      title: document.getElementById('editTitle').value.trim(),
      price: document.getElementById('editPrice').value,
      category: document.getElementById('editCategory').value,
      condition: document.getElementById('editCondition').value,
      sellerContact: contactEmail, // Use the email field directly
      description: document.getElementById('editDescription').value.trim(),
      itemPhoto: originalListing?.itemPhoto || '', // Preserve existing item photo
      sellerPhoto: originalListing?.sellerPhoto || '', // Preserve existing seller photo
      sellerUniversity: originalListing?.sellerUniversity || 'University of Alabama', // Preserve existing university
      postPassword: originalListing?.postPassword || '' // Preserve existing password
    };
    
    // Use admin update function if in admin mode, otherwise use regular update
    const success = isAdminLoggedIn ? 
      await updateAdminListing(updatedListing) : 
      await updateListing(updatedListing);
      
    if (success) {
      await loadAdminData();
      bootstrap.Modal.getInstance(elements.editListingModal)?.hide();
      showToast('Listing updated successfully', 'success');
      await applyFilters();
    } else {
      showToast('Failed to update listing', 'danger');
    }
  });

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
      price: elements.priceInput.value, // Keep as string to match API
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

  // Handle custom university dropdown
  function setupUniversityDropdown() {
    if (elements.universityDropdownMenu) {
      // Add click event listeners to dropdown items
      elements.universityDropdownMenu.addEventListener('click', function(e) {
        e.preventDefault();
        if (e.target.classList.contains('dropdown-item')) {
          const value = e.target.getAttribute('data-value');
          const text = e.target.textContent;
          
          // Update the button text
          if (elements.universityText) {
            elements.universityText.textContent = text;
          }
          
          // Close the dropdown
          const dropdown = bootstrap.Dropdown.getInstance(elements.universityDropdown);
          if (dropdown) {
            dropdown.hide();
          }
          
          // Apply filters
          applyFilters();
        }
      });
    }
  }

  // Initialize
  populateUniversityOptions();
  applyFilters();
  setupUniversityDropdown();
});