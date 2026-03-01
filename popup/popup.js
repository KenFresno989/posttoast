const toggle = document.getElementById('enableToggle');
const status = document.getElementById('status');

// Load current state
chrome.storage.sync.get(['posttoast_enabled'], (result) => {
  const enabled = result.posttoast_enabled !== false;
  toggle.checked = enabled;
  updateStatus(enabled);
});

// Handle toggle
toggle.addEventListener('change', () => {
  const enabled = toggle.checked;
  chrome.storage.sync.set({ posttoast_enabled: enabled });
  updateStatus(enabled);
});

function updateStatus(enabled) {
  status.textContent = enabled ? 'Active — scoring posts' : 'Paused';
  status.className = 'pt-status ' + (enabled ? 'pt-active' : 'pt-paused');
}
