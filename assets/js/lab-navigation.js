// Lab page navigation: keyboard arrows + sliding bookmark tabs
(function() {
  'use strict';

  function init() {
    const prevButton = document.querySelector('.page-nav--prev');
    const nextButton = document.querySelector('.page-nav--next');

    // Only set up if at least one nav button exists
    if (!prevButton && !nextButton) {
      return;
    }

    // Keyboard navigation
    document.addEventListener('keydown', function(e) {
      // leave browser shortcuts alone (Alt+Left is "back")
      if (e.defaultPrevented || e.altKey || e.ctrlKey || e.metaKey || e.shiftKey) {
        return;
      }

      // an open overlay owns the arrow keys (recipe viewer, lightbox)
      if (document.body.classList.contains('viewer-open')) {
        return;
      }
      const lightbox = document.getElementById('lightbox');
      if (lightbox && !lightbox.hidden) {
        return;
      }

      const activeElement = document.activeElement;
      if (activeElement &&
          (activeElement.tagName === 'INPUT' ||
           activeElement.tagName === 'TEXTAREA' ||
           activeElement.tagName === 'SELECT' ||
           activeElement.isContentEditable)) {
        return;
      }

      // arrows scroll the gallery strip when you're in it
      if (activeElement && activeElement.closest && activeElement.closest('.related-tray')) {
        return;
      }

      if (e.key === 'ArrowLeft' && prevButton) {
        e.preventDefault();
        window.location.href = prevButton.href;
      }
      
      if (e.key === 'ArrowRight' && nextButton) {
        e.preventDefault();
        window.location.href = nextButton.href;
      }
    });

    // Sliding bookmark tabs - follow viewport while staying within the card
    const container = document.querySelector('.lab-single-container');
    const card = container ? container.querySelector('.card') : null;
    if (!container || !card) return;

    const tabs = [prevButton, nextButton].filter(Boolean);
    const tabHeight = 60; // approximate tab height
    const padding = 40;   // margin from top/bottom of card

    function updateTabPositions() {
      const cardRect = card.getBoundingClientRect();
      const viewportMid = window.innerHeight / 2;

      // How far through the card the viewport center is (0 to 1)
      const progress = (viewportMid - cardRect.top) / cardRect.height;
      // Clamp between 0 and 1
      const clamped = Math.max(0, Math.min(1, progress));

      // Map to a pixel position within the card, with padding
      const minTop = padding;
      const maxTop = cardRect.height - tabHeight - padding;
      const top = minTop + clamped * (maxTop - minTop);

      tabs.forEach(function(tab) {
        tab.style.top = top + 'px';
      });
    }

    window.addEventListener('scroll', updateTabPositions, { passive: true });
    window.addEventListener('resize', updateTabPositions, { passive: true });
    updateTabPositions();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
