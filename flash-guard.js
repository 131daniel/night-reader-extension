// Runs at document_start — before ANY page content renders.
// Optimistically sets dark background FIRST, then checks if this tab
// actually has dark mode on. If not, removes it in ~2ms (imperceptible).
(() => {
  // Immediately darken — this is synchronous and happens before first paint
  document.documentElement.style.setProperty('background-color', '#111', 'important');
  document.documentElement.style.setProperty('background-image', 'none', 'important');

  // Ask background if dark mode is active for this tab
  chrome.runtime.sendMessage({ action: 'getTabState' }, (response) => {
    if (chrome.runtime.lastError || !response?.enabled) {
      // Not a dark-mode tab — undo the guard instantly
      document.documentElement.style.removeProperty('background-color');
      document.documentElement.style.removeProperty('background-image');
    } else {
      // Dark mode IS on — set the exact theme background colour
      document.documentElement.style.setProperty('background-color', response.bg, 'important');
    }
  });
})();
