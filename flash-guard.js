// Runs at document_start, AFTER flash-guard.css has already darkened the page.
// Uses sessionStorage (synchronous, per-tab) to decide INSTANTLY whether to
// keep or remove the dark CSS — no async background round-trip needed.
(() => {
  const isDark = sessionStorage.getItem('night-reader') === '1';

  if (!isDark) {
    // Not a dark-mode tab — remove the flash-guard CSS immediately (sync, pre-paint)
    const guardStyle = [...document.querySelectorAll('style')].find(
      el => el.textContent.includes('#111')
    );
    if (guardStyle) guardStyle.remove();
    return;
  }

  // Dark mode IS on — ask background for the exact theme colour
  chrome.runtime.sendMessage({ action: 'getTabState' }, (response) => {
    if (chrome.runtime.lastError || !response?.enabled) return;
    const guardStyle = [...document.querySelectorAll('style')].find(
      el => el.textContent.includes('#111')
    );
    if (guardStyle) {
      guardStyle.textContent = `html,body,*{background-color:${response.bg}!important;background-image:none!important}`;
    }
  });
})();
