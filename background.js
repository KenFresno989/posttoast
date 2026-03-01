// PostToast Background Service Worker
// Minimal for MVP — handles install event and future extensibility

chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === 'install') {
    chrome.storage.sync.set({ posttoast_enabled: true });
  }
});
