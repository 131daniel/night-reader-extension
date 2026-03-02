// Runs at document_start, AFTER flash-guard.css has already darkened the page.
// flash-guard.css (pure CSS via * selector) covers ALL elements with #111 bg.
// This script quickly:
//   - Removes that CSS if dark mode is NOT on for this tab
//   - Narrows it to html,body with the exact theme colour if dark mode IS on
(() => {
  chrome.runtime.sendMessage({ action: 'getTabState' }, (response) => {
    // Find the <style> element Chrome injected for flash-guard.css
    // At document_start it's typically the first (or only) stylesheet
    const guardStyle = [...document.querySelectorAll('style')].find(
      el => el.textContent.includes('#111')
    );

    if (chrome.runtime.lastError || !response?.enabled) {
      // Not a dark-mode tab — remove the aggressive * selector immediately
      if (guardStyle) guardStyle.remove();
    } else {
      // Dark mode IS on — keep html,body dark with exact theme colour.
      // Remove the * rule (content.js will handle inner elements when it loads).
      if (guardStyle) {
        guardStyle.textContent = `html,body{background-color:${response.bg}!important;background-image:none!important}`;
      }
    }
  });
})();
