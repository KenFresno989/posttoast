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

  function dumpDiagnostics(label) {
    console.log(`[PostToast DIAG] === ${label} ===`);
    console.log('[PostToast DIAG] Feed root:', PostToastExtractor._feedRoot?.tagName, PostToastExtractor._feedRoot?.className?.slice(0, 60));
    console.log('[PostToast DIAG] Root in DOM:', PostToastExtractor._feedRoot ? document.contains(PostToastExtractor._feedRoot) : 'null');
    console.log('[PostToast DIAG] Strategy:', PostToastExtractor.getLastStrategy());
    console.log('[PostToast DIAG] Observer._initialized:', PostToastObserver._initialized);
    const urn = document.querySelectorAll('[data-urn^="urn:li:activity"]').length;
    const css = document.querySelectorAll('.feed-shared-update-v2').length;
    const scaffold = document.querySelectorAll('.scaffold-finite-scroll__content').length;
    console.log(`[PostToast DIAG] DOM check: URN=${urn} CSS=${css} scaffold=${scaffold}`);
  }

  function startPostToast() {
    console.log('[PostToast] Starting PostToast observer...');
    
    try {
      let attempts = 0;
      // Wait for feed to load
      const checkFeed = setInterval(() => {
        attempts++;
        try {
          const posts = PostToastExtractor.getAllPosts();
          if (posts.length > 0) {
            console.log('[PostToast] Feed found, initializing observer. Posts found:', posts.length);
            clearInterval(checkFeed);
            PostToastObserver.init();
          } else if (attempts % 10 === 0) {
            // Log diagnostics every 5 seconds while waiting
            dumpDiagnostics(`Still waiting (attempt ${attempts})`);
          }
        } catch (err) {
          console.error('[PostToast] Error checking feed:', err);
        }
      }, 500);

      // Safety: stop checking after 30 seconds, try structural fallback
      setTimeout(() => {
        clearInterval(checkFeed);
        dumpDiagnostics('Timeout reached');
        // Last-ditch: try structural detection on document.body
        try {
          const structuralPosts = PostToastExtractor.detectPostsStructurally(document.body);
          if (structuralPosts.length > 0) {
            console.log('[PostToast] Late structural detection found', structuralPosts.length, 'posts. Starting observer.');
            PostToastObserver.init();
            return;
          }
        } catch (err) {
          console.error('[PostToast] Structural fallback error:', err);
        }
        console.log('[PostToast] Feed check timeout reached — no posts found on this page');
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
