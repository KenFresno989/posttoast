// Copyright (c) 2026 PostToast. All rights reserved.
/**
 * PostToast Content Script — Entry Point
 * Initializes PostToast on LinkedIn pages.
 */
(function() {
  'use strict';

  let enabled = true;

  // Check if extension is enabled
  chrome.storage.sync.get(['posttoast_enabled'], (result) => {
    enabled = result.posttoast_enabled !== false; // default to true
    if (enabled) {
      startPostToast();
    }
  });

  // Listen for toggle from popup
  chrome.storage.onChanged.addListener((changes) => {
    if (changes.posttoast_enabled) {
      enabled = changes.posttoast_enabled.newValue;
      if (enabled) {
        startPostToast();
      } else {
        stopPostToast();
      }
    }
  });

  function startPostToast() {
    // Wait for feed to load
    const checkFeed = setInterval(() => {
      const posts = PostToastExtractor.getAllPosts();
      if (posts.length > 0 || document.querySelector('main')) {
        clearInterval(checkFeed);
        PostToastObserver.init();
      }
    }, 500);

    // Safety: stop checking after 30 seconds
    setTimeout(() => clearInterval(checkFeed), 30000);
  }

  function stopPostToast() {
    PostToastObserver.destroy();
    // Remove all badges
    document.querySelectorAll('.pt-badge, .pt-breakdown').forEach(el => el.remove());
    document.querySelectorAll('[data-posttoast-scored]').forEach(el => {
      el.removeAttribute('data-posttoast-scored');
    });
  }
})();
