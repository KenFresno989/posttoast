// Copyright (c) 2026 PostToast. All rights reserved.
/**
 * PostToast Content Script — Entry Point
 * Initializes PostToast on LinkedIn pages.
 */
(function() {
  'use strict';

  console.log('[PostToast] Content script loaded', {
    version: chrome.runtime.getManifest().version,
    url: window.location.href,
    timestamp: new Date().toISOString()
  });

  let enabled = true;
  const requiredModules = ['PostToastExtractor', 'PostToastObserver', 'PostToastBadge'];
  
  function checkDependencies() {
    const refs = {
      PostToastExtractor: typeof PostToastExtractor !== 'undefined',
      PostToastObserver: typeof PostToastObserver !== 'undefined',
      PostToastBadge: typeof PostToastBadge !== 'undefined'
    };
    const missing = Object.keys(refs).filter(k => !refs[k]);
    if (missing.length > 0) {
      console.warn('[PostToast] Missing dependencies:', missing);
      return false;
    }
    console.log('[PostToast] All dependencies loaded');
    return true;
  }

  function init() {
    // Wait for dependencies to load with retry logic
    if (!checkDependencies()) {
      console.log('[PostToast] Waiting for dependencies to load...');
      setTimeout(init, 100);
      return;
    }

    console.log('[PostToast] Initializing...');

    // Check if extension is enabled
    chrome.storage.sync.get(['posttoast_enabled'], (result) => {
      enabled = result.posttoast_enabled !== false; // default to true
      console.log('[PostToast] Extension enabled:', enabled);
      if (enabled) {
        startPostToast();
      }
    });

    // Listen for toggle from popup
    chrome.storage.onChanged.addListener((changes) => {
      if (changes.posttoast_enabled) {
        enabled = changes.posttoast_enabled.newValue;
        console.log('[PostToast] Toggle changed:', enabled);
        if (enabled) {
          startPostToast();
        } else {
          stopPostToast();
        }
      }
    });
  }

  // Start initialization when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  function startPostToast() {
    console.log('[PostToast] Starting PostToast observer...');
    
    try {
      // Wait for feed to load
      const checkFeed = setInterval(() => {
        try {
          const posts = PostToastExtractor.getAllPosts();
          if (posts.length > 0 || document.querySelector('main')) {
            console.log('[PostToast] Feed found, initializing observer. Posts found:', posts.length);
            clearInterval(checkFeed);
            PostToastObserver.init();
          }
        } catch (err) {
          console.error('[PostToast] Error checking feed:', err);
        }
      }, 500);

      // Safety: stop checking after 30 seconds
      setTimeout(() => {
        clearInterval(checkFeed);
        console.log('[PostToast] Feed check timeout reached');
      }, 30000);
    } catch (err) {
      console.error('[PostToast] Fatal error in startPostToast:', err);
    }
  }

  function stopPostToast() {
    console.log('[PostToast] Stopping PostToast...');
    try {
      PostToastObserver.destroy();
      // Remove all badges
      document.querySelectorAll('.pt-badge, .pt-breakdown').forEach(el => el.remove());
      document.querySelectorAll('[data-posttoast-scored]').forEach(el => {
        el.removeAttribute('data-posttoast-scored');
      });
      console.log('[PostToast] Stopped and cleaned up');
    } catch (err) {
      console.error('[PostToast] Error stopping:', err);
    }
  }
})();
