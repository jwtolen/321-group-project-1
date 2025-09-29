// Simple test script
console.log('=== TEST SCRIPT LOADING ===');
alert('Test script is loading!');

// Define the function
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

console.log('handleRemoveListing function defined:', typeof window.handleRemoveListing);
