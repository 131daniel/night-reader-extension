// Runs at document_start, AFTER flash-guard.css has already darkened the page.
// flash-guard.css (pure CSS, injected by Chrome before any JS) ensures the
// background is dark from the very first frame — zero latency. This script:
//   - Removes the dark CSS if this tab doesn't have dark mode on
//   - Updates the colour to match the user's theme if dark mode IS on
(() => {
  chrome.runtime.sendMessage({ action: 'getTabState' }, (response) => {
    // Find the <style> element Chrome injected for flash-guard.css
    const guardStyle = [...document.querySelectorAll('style')].find(
      el => el.textContent.includes('#111')
    );

    if (chrome.runtime.lastError || !response?.enabled) {
      // Not a dark-mode tab — remove the injected CSS entirely
      if (guardStyle) guardStyle.remove();
    } else {
      // Dark mode IS on — swap to the exact theme background colour
      if (guardStyle) {
        guardStyle.textContent = `html,body{background-color:${response.bg}!important;background-image:none!important}`;
      }
    }
  });
})();
