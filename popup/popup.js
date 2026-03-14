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

// Dynamically load version from manifest
document.getElementById('version').textContent = 'v' + chrome.runtime.getManifest().version;

// Feedback Form Logic
const feedbackToggle = document.getElementById('feedbackToggle');
const feedbackForm = document.getElementById('feedbackForm');
const feedbackText = document.getElementById('feedbackText');
const feedbackSubmit = document.getElementById('feedbackSubmit');
const feedbackCopy = document.getElementById('feedbackCopy');
const feedbackThanks = document.getElementById('feedbackThanks');
const categoryBtns = document.querySelectorAll('.pt-category-btn');

let selectedCategory = null;

// Toggle feedback form
feedbackToggle.addEventListener('click', () => {
  const isVisible = feedbackForm.style.display !== 'none';
  feedbackForm.style.display = isVisible ? 'none' : 'block';
  feedbackThanks.style.display = 'none';
  if (!isVisible) {
    feedbackText.value = '';
    selectedCategory = null;
    categoryBtns.forEach(btn => btn.classList.remove('pt-active'));
  }
});

// Category selection
categoryBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    categoryBtns.forEach(b => b.classList.remove('pt-active'));
    btn.classList.add('pt-active');
    selectedCategory = btn.dataset.category;
  });
});

// Helper: Build feedback email content
function buildFeedbackContent() {
  const message = feedbackText.value.trim();
  const category = selectedCategory || 'General Feedback';
  const version = chrome.runtime.getManifest().version;
  const browser = navigator.userAgent;
  
  // Get current domain safely
  let domain = 'N/A';
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (tabs[0]?.url) {
      try {
        domain = new URL(tabs[0].url).hostname;
      } catch (e) {
        domain = 'N/A';
      }
    }
  });
  
  const body = `${message}\n\n---\nExtension Version: ${version}\nBrowser: ${browser}\nCurrent Domain: ${domain}`;
  const subject = `[PostToast ${category}] User Feedback`;
  
  return { subject, body };
}

// Submit via mailto
feedbackSubmit.addEventListener('click', () => {
  const message = feedbackText.value.trim();
  if (!message) {
    alert('Please enter your feedback message.');
    return;
  }
  
  const { subject, body } = buildFeedbackContent();
  const mailto = `mailto:posttoastapp@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  
  window.open(mailto, '_blank');
  
  // Show thanks
  feedbackThanks.style.display = 'block';
  setTimeout(() => {
    feedbackForm.style.display = 'none';
    feedbackThanks.style.display = 'none';
  }, 2000);
});

// Copy to clipboard
feedbackCopy.addEventListener('click', () => {
  const message = feedbackText.value.trim();
  if (!message) {
    alert('Please enter your feedback message.');
    return;
  }
  
  const { subject, body } = buildFeedbackContent();
  const fullText = `To: posttoastapp@gmail.com\nSubject: ${subject}\n\n${body}`;
  
  // Try clipboard API
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(fullText).then(() => {
      const originalText = feedbackCopy.textContent;
      feedbackCopy.textContent = 'Copied! ✓';
      setTimeout(() => {
        feedbackCopy.textContent = originalText;
      }, 2000);
    }).catch(() => {
      fallbackCopy(fullText);
    });
  } else {
    fallbackCopy(fullText);
  }
});

// Fallback copy method
function fallbackCopy(text) {
  const textarea = document.createElement('textarea');
  textarea.value = text;
  textarea.style.position = 'fixed';
  textarea.style.opacity = '0';
  document.body.appendChild(textarea);
  textarea.select();
  try {
    document.execCommand('copy');
    const originalText = feedbackCopy.textContent;
    feedbackCopy.textContent = 'Copied! ✓';
    setTimeout(() => {
      feedbackCopy.textContent = originalText;
    }, 2000);
  } catch (err) {
    alert('Failed to copy. Please copy manually.');
  }
  document.body.removeChild(textarea);
}
