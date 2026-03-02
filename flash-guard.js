// Runs at document_start — before ANY page content renders.
// Injects a <style> tag that covers both <html> AND <body>.
// Key insight: <body> doesn't exist yet at document_start, but a CSS rule
// targeting "body" will apply the instant the parser creates it — no flash.
(() => {
  const guard = document.createElement('style');
  guard.id = 'night-reader-flash-guard';
  guard.textContent = 'html,body{background-color:#111!important;background-image:none!important}';
  document.documentElement.appendChild(guard);

  // Ask background if dark mode is active for this tab
  chrome.runtime.sendMessage({ action: 'getTabState' }, (response) => {
    if (chrome.runtime.lastError || !response?.enabled) {
      // Not a dark-mode tab — remove the guard
      guard.remove();
    } else {
      // Dark mode IS on — switch to the exact theme background colour
      guard.textContent = `html,body{background-color:${response.bg}!important;background-image:none!important}`;
    }
  });
})();
