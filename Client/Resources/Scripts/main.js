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
    
    // Detail modal
    detailModal: document.getElementById('detailModal'),
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

  async function deleteListing(id) {
    try {
      const response = await fetch(`${API_CONFIG.baseUrl}${API_CONFIG.endpoints.listingById(id)}`, {
        method: 'DELETE'
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
    currentDetailId = id;
    const listings = await readListings();
    const l = listings.find(x => x.id === id);
    if (!l) return;
    
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
    
    const modal = bootstrap.Modal.getOrCreateInstance(elements.detailModal);
    modal.show();
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
    document.getElementById('editTitle').value = listing.title;
    document.getElementById('editPrice').value = listing.price;
    document.getElementById('editCategory').value = listing.category;
    document.getElementById('editCondition').value = listing.condition;
    document.getElementById('editSellerName').value = listing.sellerContact;
    document.getElementById('editContact').value = listing.sellerContact;
    document.getElementById('editDescription').value = listing.description;
    
    const modal = bootstrap.Modal.getOrCreateInstance(elements.editListingModal);
    modal.show();
  };

  window.deleteAdminListing = async function(id) {
    if (confirm('Are you sure you want to delete this listing?')) {
      const success = await deleteListing(parseInt(id));
      if (success) {
        await loadAdminData();
        showToast('Listing deleted', 'danger');
        await applyFilters();
      } else {
        showToast('Failed to delete listing', 'danger');
      }
    }
  };

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
  if (elements.adminLoginBtnMobile) {
    elements.adminLoginBtnMobile.addEventListener('click', () => {
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

  // Edit listing
  elements.saveEditBtn.addEventListener('click', async () => {
    if (!currentEditId) return;
    
    // Get the original listing to preserve images
    const listings = await readListings();
    const originalListing = listings.find(l => l.id == currentEditId);
    
    // Create updated listing object
    const updatedListing = {
      id: parseInt(currentEditId),
      title: document.getElementById('editTitle').value,
      price: document.getElementById('editPrice').value,
      category: document.getElementById('editCategory').value,
      condition: document.getElementById('editCondition').value,
      sellerContact: document.getElementById('editContact').value,
      description: document.getElementById('editDescription').value,
      itemPhoto: originalListing?.itemPhoto || '', // Preserve existing item photo
      sellerPhoto: originalListing?.sellerPhoto || '', // Preserve existing seller photo
      sellerUniversity: originalListing?.sellerUniversity || 'University of Alabama' // Preserve existing university
    };
    
    const success = await updateListing(updatedListing);
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
      sellerUniversity: elements.sellerUniversityInput.value
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